const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

router.get('/streams', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM twitch_streams
      WHERE is_active = true
      ORDER BY order_position
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching streams:', error);
    res.status(500).json({ error: 'Failed to fetch streams' });
  }
});

router.post('/streams', async (req, res) => {
  const { channel_name, display_name, order_position } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO twitch_streams (channel_name, display_name, order_position)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [channel_name, display_name || channel_name, order_position || 0]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding stream:', error);
    res.status(500).json({ error: 'Failed to add stream' });
  }
});

module.exports = router;
