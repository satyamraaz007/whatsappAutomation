const WhatsAppNumber = require("../models/whatsappNumber");
const xlsx = require("xlsx");
const path = require("path");
const { search } = require("../routes/numberRoutes");

// Add numbers from Excel or CSV file
exports.addNumbersFromFile = async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from token
    const { columnName } = req.body;

    // Validation
    if (!columnName) {
      return res.status(400).json({ message: "columnName is required" });
    }
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "File is required" });
    }

    // Read the Excel file
    const filePath = path.resolve(req.file.path);
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Parse the file to get the specified column
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    const headers = data[0];
    const whatsappNumberIndex = headers.indexOf(columnName);

    if (whatsappNumberIndex === -1) {
      return res
        .status(400)
        .json({ message: `${columnName} column is not valid` });
    }

    const fileNumbers = data
      .slice(1)
      .map((row) => {
        const number = row[whatsappNumberIndex];
        return number ? number.toString().split("@")[0] : null; // Remove suffix like @c.us
      })
      .filter(Boolean); // Remove empty or invalid rows

    if (fileNumbers.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid numbers found in the file" });
    }

    // Process each number from the file
    for (const number of fileNumbers) {
      const existingNumber = await WhatsAppNumber.findByNumberAndUser({
        number,
        user_id: userId,
      });

      if (existingNumber) {
        // If the number exists, update its status to ACTIVE
        await WhatsAppNumber.updateStatusByNumber({
          number,
          status: "ACTIVE",
          user_id: userId,
        });
      } else {
        // If the number does not exist, insert it with status ACTIVE
        await WhatsAppNumber.add({
          number,
          status: "ACTIVE",
          user_id: userId,
        });
      }
    }

    // Deactivate numbers not in the file for this user
    const existingNumbers = await WhatsAppNumber.getAllForUser(userId);
    for (const existing of existingNumbers) {
      if (!fileNumbers.includes(existing.phone_number)) {
        await WhatsAppNumber.updateStatusByNumber({
          number: existing.phone_number,
          status: "DEACTIVE",
          user_id: userId,
        });
      }
    }

    res.status(201).json({ message: "Numbers processed successfully" });
  } catch (err) {
    console.error("Error processing numbers:", err.message);
    res
      .status(500)
      .json({ error: "Error processing numbers", details: err.message });
  }
};

// Get all WhatsApp numbers
// exports.getAllNumbers = (req, res) => {
//   WhatsAppNumber.getAll()
//     .then(numbers => res.json(numbers))
//     .catch(err => res.status(500).json({ error: 'Error fetching numbers', details: err }));
// };

// Get all WhatsApp numbers for the authenticated user
exports.getAllNumbers = (req, res) => {
  const userId = req.user.id;

  WhatsAppNumber.getAllForUser(userId)
    .then((numbers) => res.json(numbers))
    .catch((err) =>
      res.status(500).json({ error: "Error fetching numbers", details: err })
    );
};

// Get all WhatsApp numbers for the authenticated user with pagination
exports.getAllNumbersWithPagination = (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page, 10) || 1; // Default to page 1 if not specified
  const limit = 25; // 25 numbers per page
  const offset = (page - 1) * limit;

  WhatsAppNumber.getAllForUserWithPagination(userId, limit, offset)
    .then((numbers) => {
      res.json({
        page,
        limit,
        total: numbers.total,
        data: numbers.rows,
      });
    })
    .catch((err) =>
      res.status(500).json({ error: "Error fetching numbers", details: err })
    );
};

// Add WhatsApp number for the authenticated user
exports.addNumber = async (req, res) => {
  try {
    const { number, status } = req.body;
    const userId = req.user?.id; // Extract user ID from token

    // Validate request body
    if (!number || !status) {
      return res
        .status(400)
        .json({ message: "Number and status are required" });
    }

    // Fetch all numbers for this user
    const numbers = await WhatsAppNumber.getAllForUser(userId);

    // Check if the number already exists
    const exists = numbers.some((n) => n.phone_number === number);

    if (exists) {
      return res.status(409).json({ message: "Number already exists" });
    }

    // Add the new number
    await WhatsAppNumber.add({
      number,
      status,
      user_id: userId,
    });

    res.status(201).json({ message: "Number added successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error adding number", details: err.message });
  }
};

// search a phone number
exports.searchPhoneNumber = (req, res) => {
  const userId = req.user.id;
  const { phone_number } = req.body;

  if (!phone_number) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  WhatsAppNumber.findByNumberAndUser({ number: phone_number, user_id: userId })
    .then((number) => {
      if (!number) {
        return res.status(404).json({ message: "Phone number not found" });
      }
      res.json({
        id: number.id,
        phone_number: number.phone_number,
        status: number.status,
        created_at: number.created_at,
        updated_at: number.updated_at,
        user_id: number.user_id,
      });
    })
    .catch((err) =>
      res.status(500).json({ error: "Error searching phone number", details: err })
    );
};

// Update an existing WhatsApp number
exports.updateNumber = (req, res) => {
  const { id } = req.params;
  const { number, status } = req.body;

  if (!number || !status) {
    return res.status(400).json({ message: "Number and status are required" });
  }

  WhatsAppNumber.update(id, { number, status })
    .then(() => res.json({ message: "Number updated successfully" }))
    .catch((err) =>
      res.status(500).json({ error: "Error updating number", details: err })
    );
};

// Delete a specific WhatsApp number for the logged-in user
exports.deleteNumber = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  WhatsAppNumber.findByIdAndUser({ id, user_id: userId })
    .then((number) => {
      if (!number) {
        return res.status(404).json({ message: "Number not found or not authorized" });
      }
      return WhatsAppNumber.delete(id);
    })
    .then(() => res.json({ message: "Number deleted successfully" }))
    .catch((err) =>
      res.status(500).json({ error: "Error deleting number", details: err })
    );
};

// Delete all WhatsApp numbers of a specific user
exports.deleteAllNumbers = (req, res) => {
  const userId = req.user.id; // Ensure `req.user` is populated by middleware

  WhatsAppNumber.deleteAllForUser(userId)
    .then(() => res.json({ message: "All numbers deleted successfully" }))
    .catch((err) =>
      res.status(500).json({ error: "Error deleting numbers", details: err })
    );
};


// Update the status of all numbers to ACTIVE or DEACTIVE
exports.updateAllNumbersStatus = (req, res) => {
  const userId = req.user.id; // Extract user ID from the token
  const { status } = req.body; // Status can be 'ACTIVE' or 'DEACTIVE'

  if (!status || !["ACTIVE", "DEACTIVE"].includes(status)) {
    return res
      .status(400)
      .json({ message: "Valid status is required (ACTIVE or DEACTIVE)" });
  }

  // Update the status of all numbers for the user
  WhatsAppNumber.updateAllStatus(userId, status)
    .then(() =>
      res
        .status(200)
        .json({ message: `All numbers status updated to ${status}` })
    )
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        error: "Error updating status for all numbers",
        details: err.message,
      });
    });
};
