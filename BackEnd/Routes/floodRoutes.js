const express = require('express');
const router = express.Router();
const db = require('../db');

// Get Flood Data
router.get('/selectFloodData', (req, res) => {
  const query = 'SELECT id, water_level, rainfall, flood_risk, recorded_at FROM flood_data ORDER BY id DESC';
  db.query(query, (err, results) => {
    if (err) return res.status(500).send('Error fetching data');
    res.json(results);
  });
});

// Get Flood Status
router.get('/selectFloodStatus', (req, res) => {
  const query = 'SELECT id, risk_level, location, timestamp FROM flood_status ORDER BY timestamp DESC';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching data' });
    if (!results.length) return res.status(404).json({ message: 'No flood status records found' });
    res.status(200).json(results);
  });
});

module.exports = router;
