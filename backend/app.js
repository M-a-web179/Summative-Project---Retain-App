const express = require('express');
const cors = require('cors');
const pool = require('./db/pool');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');

const app = express();

app.use(cors());          
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    console.error('Health check failed:', err.message);
    res.status(500).json({ status: 'error', database: 'unreachable' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;