require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Tournament API is running' });
});

const authRoutes = require('./routes/auth');
const tournamentRoutes = require('./routes/tournaments');
const matchRoutes = require('./routes/matches');
const rankingRoutes = require('./routes/rankings');
const twitchRoutes = require('./routes/twitch');
const newsRoutes = require('./routes/news');
const bracketRoutes = require('./routes/brackets');

app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/rankings', rankingRoutes);
app.use('/api/twitch', twitchRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/brackets', bracketRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Tournament API Server running on http://0.0.0.0:${PORT}`);
});

module.exports = { pool };
