const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { generateBracket } = require('../utils/bracketGenerator');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, u.username as creator_name,
        (SELECT COUNT(*) FROM tournament_participants WHERE tournament_id = t.id) as participant_count
      FROM tournaments t
      LEFT JOIN users u ON t.created_by = u.id
      ORDER BY t.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tournament = await pool.query(
      'SELECT * FROM tournaments WHERE id = $1',
      [req.params.id]
    );

    if (tournament.rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const participants = await pool.query(`
      SELECT tp.*, u.username, u.elo_rating
      FROM tournament_participants tp
      JOIN users u ON tp.user_id = u.id
      WHERE tp.tournament_id = $1
      ORDER BY tp.seed
    `, [req.params.id]);

    res.json({
      ...tournament.rows[0],
      participants: participants.rows
    });
  } catch (error) {
    console.error('Error fetching tournament:', error);
    res.status(500).json({ error: 'Failed to fetch tournament' });
  }
});

router.post('/', authenticateToken, isAdmin, async (req, res) => {
  const { name, description, tournament_type, max_participants, start_date, entry_fee, paypal_email, max_rank } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO tournaments (name, description, tournament_type, max_participants, start_date, entry_fee, paypal_email, max_rank, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [name, description, tournament_type, max_participants, start_date, entry_fee, paypal_email, max_rank, req.user.id]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating tournament:', error);
    res.status(500).json({ error: 'Failed to create tournament' });
  }
});

router.post('/:id/register', authenticateToken, async (req, res) => {
  const tournamentId = req.params.id;
  const userId = req.user.id;

  try {
    const tournament = await pool.query(
      'SELECT * FROM tournaments WHERE id = $1',
      [tournamentId]
    );

    if (tournament.rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.rows[0].status !== 'pending') {
      return res.status(400).json({ error: 'Tournament registration is closed' });
    }

    if (!tournament.rows[0].is_registration_open) {
      return res.status(400).json({ error: 'Registration is closed for this tournament' });
    }

    const user = await pool.query(
      'SELECT rank FROM users WHERE id = $1',
      [userId]
    );

    if (tournament.rows[0].max_rank && user.rows[0].rank) {
      if (user.rows[0].rank > tournament.rows[0].max_rank) {
        return res.status(400).json({ 
          error: `Your rank (${user.rows[0].rank}) is too high for this tournament. Maximum allowed rank: ${tournament.rows[0].max_rank}` 
        });
      }
    }

    const participantCount = await pool.query(
      'SELECT COUNT(*) FROM tournament_participants WHERE tournament_id = $1',
      [tournamentId]
    );

    if (parseInt(participantCount.rows[0].count) >= tournament.rows[0].max_participants) {
      return res.status(400).json({ error: 'Tournament is full' });
    }

    const existingParticipant = await pool.query(
      'SELECT * FROM tournament_participants WHERE tournament_id = $1 AND user_id = $2',
      [tournamentId, userId]
    );

    if (existingParticipant.rows.length > 0) {
      return res.status(400).json({ error: 'Already registered for this tournament' });
    }

    const seed = parseInt(participantCount.rows[0].count) + 1;

    const result = await pool.query(`
      INSERT INTO tournament_participants (tournament_id, user_id, seed)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [tournamentId, userId, seed]);

    await pool.query(
      'UPDATE tournaments SET current_participants = current_participants + 1 WHERE id = $1',
      [tournamentId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error registering for tournament:', error);
    res.status(500).json({ error: 'Failed to register for tournament' });
  }
});

router.post('/:id/start', authenticateToken, isAdmin, async (req, res) => {
  const tournamentId = req.params.id;

  try {
    const tournament = await pool.query(
      'SELECT * FROM tournaments WHERE id = $1',
      [tournamentId]
    );

    if (tournament.rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.rows[0].status !== 'pending') {
      return res.status(400).json({ error: 'Tournament already started' });
    }

    const participants = await pool.query(
      'SELECT * FROM tournament_participants WHERE tournament_id = $1 ORDER BY seed',
      [tournamentId]
    );

    if (participants.rows.length < 2) {
      return res.status(400).json({ error: 'Not enough participants' });
    }

    const matches = generateBracket(
      tournament.rows[0].tournament_type,
      participants.rows,
      tournamentId
    );

    for (const match of matches) {
      await pool.query(`
        INSERT INTO matches (tournament_id, round, match_number, bracket_type, player1_id, player2_id, status, winner_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        match.tournament_id,
        match.round,
        match.match_number,
        match.bracket_type,
        match.player1_id,
        match.player2_id,
        match.status,
        match.winner_id || null
      ]);
    }

    await pool.query(
      'UPDATE tournaments SET status = $1 WHERE id = $2',
      ['in_progress', tournamentId]
    );

    res.json({ message: 'Tournament started successfully' });
  } catch (error) {
    console.error('Error starting tournament:', error);
    res.status(500).json({ error: 'Failed to start tournament' });
  }
});

router.delete('/:id/unregister', authenticateToken, async (req, res) => {
  const tournamentId = req.params.id;
  const userId = req.user.id;

  try {
    const tournament = await pool.query(
      'SELECT * FROM tournaments WHERE id = $1',
      [tournamentId]
    );

    if (tournament.rows[0].status !== 'pending') {
      return res.status(400).json({ error: 'Cannot unregister from started tournament' });
    }

    const result = await pool.query(
      'DELETE FROM tournament_participants WHERE tournament_id = $1 AND user_id = $2 RETURNING *',
      [tournamentId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not registered for this tournament' });
    }

    await pool.query(
      'UPDATE tournaments SET current_participants = current_participants - 1 WHERE id = $1',
      [tournamentId]
    );

    res.json({ message: 'Successfully unregistered from tournament' });
  } catch (error) {
    console.error('Error unregistering:', error);
    res.status(500).json({ error: 'Failed to unregister' });
  }
});

router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  const tournamentId = req.params.id;

  try {
    const result = await pool.query(
      'DELETE FROM tournaments WHERE id = $1 RETURNING *',
      [tournamentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    res.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    console.error('Error deleting tournament:', error);
    res.status(500).json({ error: 'Failed to delete tournament' });
  }
});

router.patch('/:id/toggle-registration', authenticateToken, isAdmin, async (req, res) => {
  const tournamentId = req.params.id;

  try {
    const tournament = await pool.query(
      'SELECT * FROM tournaments WHERE id = $1',
      [tournamentId]
    );

    if (tournament.rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const newState = !tournament.rows[0].is_registration_open;

    const result = await pool.query(
      'UPDATE tournaments SET is_registration_open = $1 WHERE id = $2 RETURNING *',
      [newState, tournamentId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error toggling registration:', error);
    res.status(500).json({ error: 'Failed to toggle registration' });
  }
});

module.exports = router;
