// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const router = express.Router();

module.exports = (db) => {

  
  // Register
  router.post('/register', async (req, res) => {
    const { fullNames, email, username, phone, password, role } = req.body;
    try {
      const checkSql = 'SELECT * FROM users WHERE email = ? OR username = ? OR phone = ?';
      db.query(checkSql, [email, username, phone], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        if (results.length > 0) {
          const conflict = results[0];
          if (conflict.email === email) return res.status(400).json({ error: 'Email already exists.' });
          if (conflict.username === username) return res.status(400).json({ error: 'Username already taken.' });
          if (conflict.phone === phone) return res.status(400).json({ error: 'Phone already registered.' });
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

  // Login
  router.post('/userLogin', (req, res) => {
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




// Forgot Password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  db.query('SELECT id, full_names FROM users WHERE email = ? LIMIT 1', [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!results.length) return res.status(404).json({ error: 'User not found' });

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
        `
      };

      transporter.sendMail(mailOptions, (mailErr) => {
        if (mailErr) return res.status(500).json({ error: 'Failed to send email' });
        res.status(200).json({ message: 'Please check your email for the reset token.' });
      });
    });
  });
});

// Validate Token
router.get('/reset-password/:token', (req, res) => {
  const { token } = req.params;
  db.query('SELECT user_id, expires_at FROM password_resets WHERE token = ? LIMIT 1', [token], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (!rows.length || new Date(rows[0].expires_at) < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    res.status(200).json({ userId: rows[0].user_id });
  });
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
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


router.put('/users/:id', (req, res) => {
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

    db.query('SELECT id, full_names, email, username, phone, role FROM users WHERE id = ?', [userId], (err2, rows) => {
      if (err2 || !rows.length) return res.status(500).json({ error: 'Failed to fetch updated user' });
      res.json({ user: rows[0] });
    });
  });
});

  return router;
};
