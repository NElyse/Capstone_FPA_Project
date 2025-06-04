const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
// import your db connection here
const db = require('./db'); // adjust path as needed

// POST /api/forgot-password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  db.query('SELECT id, full_names FROM users WHERE email = ? LIMIT 1', [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    if (!results.length) {
      return res.status(200).json({ message: 'If registered, a reset link has been sent.' });
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
        res.status(200).json({ message: 'Reset link sent if email is registered.' });
      });
    });
  });
});

// GET /api/reset-password/:token
router.get('/reset-password/:token', (req, res) => {
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

// POST /api/reset-password/:token
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

module.exports = router;
