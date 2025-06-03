require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json()); // Middleware for JSON requests
app.use(cors()); // Allow cross-origin requests

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

// Flood Data API
app.get('/api/flooddata', (req, res) => {
  const query = 'SELECT id, water_level, rainfall, flood_risk, recorded_at FROM flood_data ORDER BY id DESC';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching flood data:', err);
      res.status(500).send('Error fetching data');
    } else {
      res.json(results);
    }
  });
});

// Flood Status API
app.get('/api/floodstatus', (req, res) => {
  const query = 'SELECT id, risk_level, location, timestamp FROM flood_status ORDER BY timestamp DESC';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching flood status data:', err);
      return res.status(500).json({ error: 'Error fetching data' });
    }
    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'No flood status records found' });
    }
    res.status(200).json(results);
  });
});

// Register API
app.post('/api/register', async (req, res) => {
  const { fullNames, email, username, phone, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (full_names, email, username, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)';

    db.query(sql, [fullNames, email, username, phone, hashedPassword, role || 'user'], (err, results) => {
      if (err) {
        console.error('Registration error:', err);
        return res.status(500).json({ error: 'Registration failed' });
      }
      res.status(201).json({ message: 'User registered successfully' });
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login API
app.post('/api/login', (req, res) => {
  const { identifier, password } = req.body;

  const query = 'SELECT * FROM users WHERE username = ? OR email = ? OR phone = ? LIMIT 1';

  db.query(query, [identifier, identifier, identifier], async (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid username/email/phone or password' });
    }

    const user = results[0];

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: 'Invalid username/email/phone or password' });
    }

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

app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Email not found' });
    }

    // Normally, you would generate a token and send an email here.
    // For now, just simulate success:
    console.log(`Password reset requested for: ${email}`);
    res.status(200).json({ message: 'Reset link would be sent' });
  });
});


app.use(express.json())
// PUT /api/users/:id for Updating
app.put('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const { full_names, email, username, phone } = req.body;

  const query = `
    UPDATE users
    SET full_names = ?, email = ?, username = ?, phone = ?
    WHERE id = ?
  `;
  db.query(query, [full_names, email, username, phone, userId], (err, result) => {
    if (err) {
      console.error('Database update error:', err);
      return res.status(500).json({ error: 'Database update error' });
    }

    // Return updated user data
    const selectQuery = `
      SELECT id, full_names, email, username, phone, role
      FROM users
      WHERE id = ?
    `;
    db.query(selectQuery, [userId], (err2, results) => {
      if (err2) {
        console.error('Error fetching updated user:', err2);
        return res.status(500).json({ error: 'Error fetching updated user' });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found after update' });
      }
      res.json({ user: results[0] });
    });
  });
});



/**
 * POST /api/forgot-password
 *  1) Check if email exists
 *  2) Generate a random token
 *  3) Store token and expiration in password_resets
 *  4) Send email containing a link to reset
 */
app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // 1) Look up user by email
  const findUserQuery = 'SELECT id, full_names FROM users WHERE email = ? LIMIT 1';
  db.query(findUserQuery, [email], (err, users) => {
    if (err) {
      console.error('DB error when finding user:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    if (users.length === 0) {
      // It's a good practice not to reveal whether the email exists or not.
      return res.status(200).json({ message: 'If that email is registered, you will receive a reset link.' });
    }

    const user = users[0];
    const userId = user.id;

    // 2) Generate secure random token (e.g., 32 bytes → hex string)
    const token = crypto.randomBytes(32).toString('hex');

    // 3) Compute expiration (e.g., 1 hour from now)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour in the future

    // Insert (or replace) into password_resets
    const insertResetQuery = `INSERT INTO password_resets (user_id, token, expires_at)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)
    `;
    db.query(insertResetQuery, [userId, token, expiresAt], (err2) => {
      if (err2) {
        console.error('DB error when inserting reset token:', err2);
        return res.status(500).json({ error: 'Server error' });
      }

      // 4) Send email via Nodemailer
      // Configure your SMTP transporter (for example, using Gmail SMTP)
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,       // e.g. 'smtp.gmail.com'
        port: process.env.SMTP_PORT || 587,
        secure: false,                     // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,     // your SMTP username
          pass: process.env.SMTP_PASS      // your SMTP password or app password
        },
      });

      // Construct a reset link. 
      // In a real app, direct them to a client-side route like /reset-password/<token>
      const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

      const mailOptions = {
        from: `"Flood Alert App" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Password Reset Instructions',
        html: `
          <p>Hi ${user.full_names},</p>
          <p>You requested a password reset. Click the link below to set a new password (valid for 1 hour):</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>If you did not request this, you can ignore this email.</p>
          <br/>
          <p>– Flood Prediction and Alert System Team</p>
        `
      };

      transporter.sendMail(mailOptions, (mailErr, info) => {
        if (mailErr) {
          console.error('Error sending reset email:', mailErr);
          // Even if email fails, don’t reveal sensitive info to the client
          return res.status(500).json({ error: 'Failed to send reset email' });
        }
        console.log('Password reset email sent:', info.response);
        res.status(200).json({ message: 'If that email is registered, you will receive a reset link.' });
      });
    });
  });
});

/**
 * (Optional) GET /api/reset-password/:token
 *   Verify token is valid and not expired. Return 200 or 400 accordingly.
 */
app.get('/api/reset-password/:token', (req, res) => {
  const { token } = req.params;
  const query = 'SELECT user_id, expires_at FROM password_resets WHERE token = ? LIMIT 1';
  db.query(query, [token], (err, rows) => {
    if (err) {
      console.error('DB error verifying token:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token.' });
    }
    const record = rows[0];
    if (new Date(record.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Token has expired.' });
    }
    // Token is valid—front-end can now show a “Reset Password” form
    res.status(200).json({ userId: record.user_id });
  });
});

/**
 * (Optional) POST /api/reset-password/:token
 *   Accepts a new password and updates the user’s password_hash in DB.
 */
app.post('/api/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: 'New password is required.' });
  }

  // 1) Verify token and get user_id
  const selectQuery = 'SELECT user_id, expires_at FROM password_resets WHERE token = ? LIMIT 1';
  db.query(selectQuery, [token], async (err, rows) => {
    if (err) {
      console.error('DB error on token lookup:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token.' });
    }
    const record = rows[0];
    if (new Date(record.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Token has expired.' });
    }

    const userId = record.user_id;
    // 2) Hash the new password
    const hashed = await bcrypt.hash(newPassword, 10);

    // 3) Update the user’s password in the users table
    const updateUserQuery = 'UPDATE users SET password_hash = ? WHERE id = ?';
    db.query(updateUserQuery, [hashed, userId], (updateErr) => {
      if (updateErr) {
        console.error('Error updating user password:', updateErr);
        return res.status(500).json({ error: 'Server error' });
      }

      // 4) Delete the reset token (so it can’t be reused)
      const deleteTokenQuery = 'DELETE FROM password_resets WHERE token = ?';
      db.query(deleteTokenQuery, [token], (delErr) => {
        if (delErr) {
          console.error('Error deleting reset token:', delErr);
          // Not a fatal error for the user
        }
        res.status(200).json({ message: 'Password has been reset successfully.' });
      });
    });
  });
});



// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
