const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT n.*, u.username as creator_name
      FROM news n
      LEFT JOIN users u ON n.created_by = u.id
      WHERE n.is_active = true
      ORDER BY n.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM news WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

router.post('/', authenticateToken, isAdmin, async (req, res) => {
  const { type, title, content, url, image_url } = req.body;

  if (!type || !title) {
    return res.status(400).json({ error: 'Type and title are required' });
  }

  if (type !== 'meta' && type !== 'patch_notes') {
    return res.status(400).json({ error: 'Type must be either "meta" or "patch_notes"' });
  }

  try {
    const result = await pool.query(`
      INSERT INTO news (type, title, content, url, image_url, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [type, title, content, url, image_url, req.user.id]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({ error: 'Failed to create news' });
  }
});

router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { type, title, content, url, image_url, is_active } = req.body;

  try {
    const result = await pool.query(`
      UPDATE news
      SET type = COALESCE($1, type),
          title = COALESCE($2, title),
          content = COALESCE($3, content),
          url = COALESCE($4, url),
          image_url = COALESCE($5, image_url),
          is_active = COALESCE($6, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `, [type, title, content, url, image_url, is_active, req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({ error: 'Failed to update news' });
  }
});

router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM news WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }

    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ error: 'Failed to delete news' });
  }
});

module.exports = router;
