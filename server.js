const express = require('express');
const bodyParser = require('body-parser');
const whatsappRoutes = require('./routes/whatsappRoutes');
const client = require('./whatsappClient/whatsappClient'); // Import WhatsApp client to initialize it
const cors = require("cors");
const path = require('path');


const app = express();
app.use(cors());
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api', whatsappRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
