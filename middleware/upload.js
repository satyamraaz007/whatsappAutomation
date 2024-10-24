const multer = require('multer');
const path = require('path');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// File filter to accept only .xlsx and .csv files
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ['.xlsx', '.csv'];
  const extname = allowedFileTypes.includes(path.extname(file.originalname).toLowerCase()); // Check file extension
  const mimetype = file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                   file.mimetype === 'text/csv'; // Check MIME types

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only .xlsx and .csv files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

module.exports = upload;
