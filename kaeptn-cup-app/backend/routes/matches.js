const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.get('/tournament/:tournamentId', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*,
        u1.username as player1_name,
        u2.username as player2_name,
        w.username as winner_name
      FROM matches m
      LEFT JOIN users u1 ON m.player1_id = u1.id
      LEFT JOIN users u2 ON m.player2_id = u2.id
      LEFT JOIN users w ON m.winner_id = w.id
      WHERE m.tournament_id = $1
      ORDER BY m.round, m.match_number
    `, [req.params.tournamentId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

router.put('/:id/report', authenticateToken, async (req, res) => {
  const { player1_score, player2_score, winner_id } = req.body;
  const matchId = req.params.id;

  try {
    const match = await pool.query(
      'SELECT * FROM matches WHERE id = $1',
      [matchId]
    );

    if (match.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.rows[0].status === 'completed') {
      return res.status(400).json({ error: 'Match already completed' });
    }

    await pool.query(`
      UPDATE matches
      SET player1_score = $1, player2_score = $2, winner_id = $3, status = 'completed', completed_at = NOW()
      WHERE id = $4
    `, [player1_score, player2_score, winner_id, matchId]);

    const loserId = winner_id === match.rows[0].player1_id 
      ? match.rows[0].player2_id 
      : match.rows[0].player1_id;

    if (match.rows[0].bracket_type === 'winners' || match.rows[0].bracket_type === 'finals') {
      const nextRound = match.rows[0].round + 1;
      const nextMatch = await pool.query(`
        SELECT * FROM matches
        WHERE tournament_id = $1 AND round = $2 AND bracket_type = $3
        AND (player1_id IS NULL OR player2_id IS NULL)
        ORDER BY match_number
        LIMIT 1
      `, [match.rows[0].tournament_id, nextRound, match.rows[0].bracket_type]);

      if (nextMatch.rows.length > 0) {
        const updateField = nextMatch.rows[0].player1_id === null ? 'player1_id' : 'player2_id';
        await pool.query(`
          UPDATE matches SET ${updateField} = $1 WHERE id = $2
        `, [winner_id, nextMatch.rows[0].id]);
      }
    }

    await pool.query(
      'UPDATE rankings SET total_matches = total_matches + 1, matches_won = matches_won + 1 WHERE user_id = $1',
      [winner_id]
    );
    await pool.query(
      'UPDATE rankings SET total_matches = total_matches + 1 WHERE user_id = $1',
      [loserId]
    );

    const tournament = await pool.query(
      'SELECT * FROM tournaments WHERE id = $1',
      [match.rows[0].tournament_id]
    );

    if (match.rows[0].bracket_type === 'finals') {
      await pool.query(
        'UPDATE tournaments SET status = $1, end_date = NOW() WHERE id = $2',
        ['completed', match.rows[0].tournament_id]
      );

      await pool.query(
        'UPDATE tournament_participants SET status = $1, final_position = 1, points_earned = 100 WHERE tournament_id = $2 AND user_id = $3',
        ['winner', match.rows[0].tournament_id, winner_id]
      );

      await pool.query(
        'UPDATE tournament_participants SET final_position = 2, points_earned = 75 WHERE tournament_id = $1 AND user_id = $2',
        [match.rows[0].tournament_id, loserId]
      );

      await pool.query(
        'UPDATE rankings SET total_tournaments = total_tournaments + 1, tournaments_won = tournaments_won + 1, total_points = total_points + 100 WHERE user_id = $1',
        [winner_id]
      );
      await pool.query(
        'UPDATE rankings SET total_tournaments = total_tournaments + 1, total_points = total_points + 75 WHERE user_id = $1',
        [loserId]
      );
    }

    res.json({ message: 'Match result reported successfully' });
  } catch (error) {
    console.error('Error reporting match:', error);
    res.status(500).json({ error: 'Failed to report match result' });
  }
});

module.exports = router;
