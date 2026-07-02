const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents'); // ADD THIS

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes); // ADD THIS

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FinScan backend is running' });
});

module.exports = app;