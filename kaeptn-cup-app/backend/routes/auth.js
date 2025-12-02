const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, email, password, inviteCode, rank } = req.body;

  try {
    if (!rank || rank < 13 || rank > 26) {
      return res.status(400).json({ error: 'Rank must be between 13 and 26' });
    }

    const codeCheck = await pool.query(
      'SELECT * FROM invitation_codes WHERE code = $1 AND is_used = FALSE',
      [inviteCode]
    );

    if (codeCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or already used invitation code' });
    }

    const userCheck = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userInviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, invite_code, invited_by, rank)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, email, invite_code, elo_rating, rank`,
      [username, email, passwordHash, userInviteCode, codeCheck.rows[0].created_by, rank]
    );

    await pool.query(
      'UPDATE invitation_codes SET is_used = TRUE, used_by = $1, used_at = NOW() WHERE code = $2',
      [result.rows[0].id, inviteCode]
    );

    await pool.query(
      'INSERT INTO rankings (user_id) VALUES ($1)',
      [result.rows[0].id]
    );

    const token = jwt.sign(
      { id: result.rows[0].id, username: result.rows[0].username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, is_admin: user.is_admin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        invite_code: user.invite_code,
        elo_rating: user.elo_rating,
        is_admin: user.is_admin,
        rank: user.rank
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/create-invite', async (req, res) => {
  const { adminKey, createdBy } = req.body;

  if (adminKey !== (process.env.ADMIN_KEY || 'admin-secret-key')) {
    return res.status(403).json({ error: 'Invalid admin key' });
  }

  try {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const result = await pool.query(
      'INSERT INTO invitation_codes (code, created_by) VALUES ($1, $2) RETURNING *',
      [code, createdBy || null]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Invite creation error:', error);
    res.status(500).json({ error: 'Failed to create invitation code' });
  }
});

router.patch('/update-rank', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { rank } = req.body;

  try {
    if (!rank || rank < 13 || rank > 26) {
      return res.status(400).json({ error: 'Rank must be between 13 and 26' });
    }

    const result = await pool.query(
      'UPDATE users SET rank = $1 WHERE id = $2 RETURNING id, username, email, invite_code, elo_rating, rank, is_admin',
      [rank, userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update rank error:', error);
    res.status(500).json({ error: 'Failed to update rank' });
  }
});

router.delete('/delete-account', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    await pool.query('BEGIN');

    await pool.query('DELETE FROM match_participants WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM tournament_participants WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM rankings WHERE user_id = $1', [userId]);
    await pool.query('UPDATE invitation_codes SET used_by = NULL WHERE used_by = $1', [userId]);
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    await pool.query('COMMIT');

    res.json({ message: 'Account and all associated data have been permanently deleted' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Account deletion error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

router.get('/users', authenticateToken, async (req, res) => {
  try {
    const userCheck = await pool.query('SELECT is_admin FROM users WHERE id = $1', [req.user.id]);
    if (!userCheck.rows[0] || !userCheck.rows[0].is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const result = await pool.query(
      `SELECT id, username, email, rank, elo_rating, created_at, is_admin 
       FROM users 
       ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

router.post('/reset-password', authenticateToken, async (req, res) => {
  const { userId, newPassword } = req.body;

  try {
    const adminCheck = await pool.query('SELECT is_admin FROM users WHERE id = $1', [req.user.id]);
    if (!adminCheck.rows[0] || !adminCheck.rows[0].is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [passwordHash, userId]
    );

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;
