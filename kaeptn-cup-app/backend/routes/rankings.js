const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, u.username, u.email
      FROM rankings r
      JOIN users u ON r.user_id = u.id
      ORDER BY r.total_points DESC, r.elo_rating DESC
      LIMIT 100
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching rankings:', error);
    res.status(500).json({ error: 'Failed to fetch rankings' });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, u.username, u.email,
        (SELECT COUNT(*) + 1 FROM rankings r2 WHERE r2.total_points > r.total_points) as rank
      FROM rankings r
      JOIN users u ON r.user_id = u.id
      WHERE r.user_id = $1
    `, [req.params.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User ranking not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user ranking:', error);
    res.status(500).json({ error: 'Failed to fetch user ranking' });
  }
});

module.exports = router;
