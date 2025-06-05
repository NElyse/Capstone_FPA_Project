require('dotenv').config();
const express = require('express');
const path = require('path');            // <-- Added missing import
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

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

// Get Flood Data
app.get('/api/flooddata', (req, res) => {
  const query = 'SELECT id, water_level, rainfall, flood_risk, recorded_at FROM flood_data ORDER BY id DESC';
  db.query(query, (err, results) => {
    if (err) return res.status(500).send('Error fetching data');
    res.json(results);
  });
});

// Get Flood Status
app.get('/api/floodstatus', (req, res) => {
  const query = 'SELECT id, risk_level, location, timestamp FROM flood_status ORDER BY timestamp DESC';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching data' });
    if (!results.length) return res.status(404).json({ message: 'No flood status records found' });
    res.status(200).json(results);
  });
});

app.post('/api/register', async (req, res) => {
  const { fullNames, email, username, phone, password, role } = req.body;

  try {
    // Check uniqueness
    const checkSql = 'SELECT * FROM users WHERE email = ? OR username = ? OR phone = ?';
    db.query(checkSql, [email, username, phone], async (err, results) => {
      if (err) return res.status(500).json({ error: 'Server error' });

      if (results.length > 0) {
        const conflict = results[0];
        if (conflict.email === email) return res.status(400).json({ error: 'Email already exists.' });
        if (conflict.username === username) return res.status(400).json({ error: 'Username already taken.' });
        if (conflict.phone === phone) return res.status(400).json({ error: 'Phone number already registered.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const insertSql = 'INSERT INTO users (full_names, email, username, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)';
      db.query(insertSql, [fullNames, email, username, phone, hashedPassword, role || 'user'], (err) => {
        if (err) return res.status(500).json({ error: 'Registration failed' });
        res.status(201).json({ message: 'User registered successfully' });
      });
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});


// Login User
app.post('/api/login', (req, res) => {
  const { identifier, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ? OR email = ? OR phone = ? LIMIT 1';

  db.query(query, [identifier, identifier, identifier], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (!results.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    res.json({
      token: 'fake-jwt-token',
      user: {
        id: user.id,
        full_names: user.full_names,
        email: user.email,
        username: user.username,
        phone: user.phone,
        role: user.role,
      }
    });
  });
});




app.put('/api/users/:id', async (req, res) => {
  const userId = req.params.id;
  const { full_names, email, username, phone } = req.body;

  const fields = [];
  const values = [];

  if (full_names) fields.push('full_names = ?'), values.push(full_names);
  if (email) fields.push('email = ?'), values.push(email);
  if (username) fields.push('username = ?'), values.push(username);
  if (phone) fields.push('phone = ?'), values.push(phone);

  fields.push('updated_at = NOW()');

  if (!fields.length) return res.status(400).json({ error: 'No fields provided to update' });

  const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
  values.push(userId);

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: 'Update failed' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });

    // Fetch updated user
    db.query('SELECT id, full_names, email, username, phone, role FROM users WHERE id = ?', [userId], (err2, rows) => {
      if (err2 || !rows.length) return res.status(500).json({ error: 'Failed to fetch updated user' });
      res.json({ user: rows[0] });
    });
  });
});



// Forgot Password
app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  db.query('SELECT id, full_names FROM users WHERE email = ? LIMIT 1', [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });

   if (!results.length) {
  return res.status(404).json({ error: 'User not found' });
}

    const user = results[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

    const insertQuery = `
      INSERT INTO password_resets (user_id, token, expires_at)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE token=VALUES(token), expires_at=VALUES(expires_at)
    `;
    db.query(insertQuery, [user.id, token, expiresAt], (insertErr) => {
      if (insertErr) return res.status(500).json({ error: 'Error saving token' });

      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: `"Flood Alert App" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Password Reset Instructions',
        html: `
          <p>Hi ${user.full_names},</p>
          <p>You requested a password reset. Click below to set a new password:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>This link will expire in 1 hour.</p>
          <br/>
          <p>– Flood Prediction and Alert System Team</p>
        `
      };

      transporter.sendMail(mailOptions, (mailErr) => {
        if (mailErr) return res.status(500).json({ error: 'Failed to send email' });
        res.status(200).json({ message: 'The reset link has been sent. Check your Email.' });

      });
    });
  });
});

// Validate Reset Token
app.get('/api/reset-password/:token', (req, res) => {
  const { token } = req.params;
  db.query('SELECT user_id, expires_at FROM password_resets WHERE token = ? LIMIT 1', [token], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (!rows.length) return res.status(400).json({ error: 'Invalid or expired token' });

    const record = rows[0];
    if (new Date(record.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Token has expired' });
    }

    res.status(200).json({ userId: record.user_id });
  });
});

// Reset Password
app.post('/api/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  if (!newPassword) return res.status(400).json({ error: 'New password is required' });

  db.query('SELECT user_id, expires_at FROM password_resets WHERE token = ? LIMIT 1', [token], async (err, rows) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (!rows.length || new Date(rows[0].expires_at) < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    const userId = rows[0].user_id;

    db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashed, userId], (updateErr) => {
      if (updateErr) return res.status(500).json({ error: 'Error updating password' });

      db.query('DELETE FROM password_resets WHERE token = ?', [token], () => {
        res.status(200).json({ message: 'Password has been reset successfully.' });
      });
    });
  });
});

// Serve React static files from build
app.use(express.static(path.join(__dirname, 'build')));

// React Router will handle all front-end routes (like /reset-password/:token)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
