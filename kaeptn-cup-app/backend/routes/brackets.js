const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get all brackets
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, t.name as tournament_name, t.status as tournament_status
      FROM brackets b
      JOIN tournaments t ON b.tournament_id = t.id
      WHERE b.is_active = true
      ORDER BY t.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching brackets:', error);
    res.status(500).json({ error: 'Failed to fetch brackets' });
  }
});

// Get bracket by tournament ID
router.get('/tournament/:tournamentId', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, t.name as tournament_name, t.status as tournament_status
      FROM brackets b
      JOIN tournaments t ON b.tournament_id = t.id
      WHERE b.tournament_id = $1 AND b.is_active = true
    `, [req.params.tournamentId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bracket not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching bracket:', error);
    res.status(500).json({ error: 'Failed to fetch bracket' });
  }
});

// Create or update bracket for a tournament
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  const { tournament_id, challonge_url } = req.body;

  if (!tournament_id || !challonge_url) {
    return res.status(400).json({ error: 'Tournament ID and Challonge URL are required' });
  }

  try {
    // Check if tournament exists
    const tournament = await pool.query(
      'SELECT * FROM tournaments WHERE id = $1',
      [tournament_id]
    );

    if (tournament.rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Check if bracket already exists
    const existing = await pool.query(
      'SELECT * FROM brackets WHERE tournament_id = $1',
      [tournament_id]
    );

    let result;
    if (existing.rows.length > 0) {
      // Update existing bracket
      result = await pool.query(`
        UPDATE brackets 
        SET challonge_url = $1, updated_at = NOW()
        WHERE tournament_id = $2
        RETURNING *
      `, [challonge_url, tournament_id]);
    } else {
      // Create new bracket
      result = await pool.query(`
        INSERT INTO brackets (tournament_id, challonge_url)
        VALUES ($1, $2)
        RETURNING *
      `, [tournament_id, challonge_url]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error saving bracket:', error);
    res.status(500).json({ error: 'Failed to save bracket' });
  }
});

// Delete bracket
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE brackets SET is_active = false WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bracket not found' });
    }

    res.json({ message: 'Bracket deleted successfully' });
  } catch (error) {
    console.error('Error deleting bracket:', error);
    res.status(500).json({ error: 'Failed to delete bracket' });
  }
});

module.exports = router;
