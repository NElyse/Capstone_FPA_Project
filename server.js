require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json()); // Middleware for JSON requests
app.use(cors()); // Allow cross-origin requests from your React frontend

// Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

// Root Route
app.get('/', (req, res) => {
  res.send('Flood Prediction and Alert System API');
});

// API Route to fetch flood data

app.get('/api/flooddata', (req, res) => {
  const query = 'SELECT id, water_level, rainfall, flood_risk, recorded_at FROM flood_data ORDER BY id DESC';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching flood data:', err);
      res.status(500).send('Error fetching data');
    } else {
      res.json(results); // Return all rows
    }
  });
});

app.get('/api/floodstatus', (req, res) => {
  const query = 'SELECT id, risk_level, location, timestamp FROM flood_status ORDER BY timestamp DESC';
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching latest flood status:', err);
      return res.status(500).send('Error fetching data');
    }

    if (!result || result.length === 0) {
      return res.status(404).send('No flood status found');
    }

    res.json(result[0]);
  });
});


// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
