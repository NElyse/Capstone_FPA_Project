const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const db = require('./config/db');

const UserLoginRoutes = require('./Routes/userLoginRoutes');
// const floodRoutes = require('./routes/floodRoutes');
// const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Route Mounting
app.use('/api/userLoginRoutes', UserLoginRoutes);
// app.use('/api/flood', floodRoutes);
// app.use('/api/users', userRoutes);

// Serve React build (optional)
app.use(express.static(path.join(__dirname, '../Front_End/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../Front_End/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
