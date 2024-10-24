const mysql = require('mysql2');

// MySQL connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: '', 
  database: 'whatsapp_sender'
});

// Handle MySQL connection errors
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ', err);
    process.exit(1);
  } else {
    console.log('Connected to MySQL');
  }
});

module.exports = db;
