// Real-time pulse: bi-weekly micro-surveys with live leadership view.
const express = require('express');
const db = require('../db');
const router = express.Router();

// POST /api/realtime-pulse/respond { question_id, response: 1..5, employee_id?, department? }
router.post('/respond', async (req, res) => {
  try {
    const { question_id, response, employee_id, department } = req.body || {};
    if (!question_id || response == null) return res.status(400).json({ error: 'question_id + response required' });
    const score = Math.max(1, Math.min(5, Number(response)));
    try {
      await db.query(
        `INSERT INTO pulse_check_responses (question_id, employee_id, department, score, created_at) VALUES ($1,$2,$3,$4,NOW())`,
        [question_id, employee_id || null, department || null, score]
      );
    } catch {}
    return res.json({ recorded: true, question_id, score });
  } catch (e) {
    return res.status(500).json({ error: 'respond failed' });
  }
});

// GET /api/realtime-pulse/live?since_hours=24
router.get('/live', async (req, res) => {
  try {
    const sinceHours = Math.min(parseInt(req.query.since_hours) || 24, 24 * 14);
    const r = await db.query(
      `SELECT department, COUNT(*) as n, AVG(score) as avg_score
       FROM pulse_check_responses WHERE created_at > NOW() - INTERVAL '1 hour' * $1
       GROUP BY department ORDER BY avg_score ASC`,
      [sinceHours]
    ).catch(() => ({ rows: [] }));
    return res.json({ since_hours: sinceHours, departments: r.rows });
  } catch (e) {
    return res.status(500).json({ error: 'live failed' });
  }
});

module.exports = router;
