const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',       // your MySQL host
  user: process.env.DB_USER || 'root',            // your MySQL user
  password: process.env.DB_PASS || '',             // your MySQL password
  database: process.env.DB_NAME || 'fda_db',       // your MySQL database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Export the promise-based pool for easier async/await or .then usage
module.exports = pool.promise();
