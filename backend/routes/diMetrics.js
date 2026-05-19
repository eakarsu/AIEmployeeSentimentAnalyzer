// D&I metrics: demographic-cut sentiment with k-anonymity.
const express = require('express');
const db = require('../db');
const router = express.Router();

const K_MIN = Math.max(parseInt(process.env.K_ANONYMITY_MIN) || 5, 3);

// GET /api/di-metrics/cut?dimension=gender|ethnicity|age_band
router.get('/cut', async (req, res) => {
  try {
    const { dimension = 'gender' } = req.query;
    const allowed = ['gender', 'ethnicity', 'age_band'];
    if (!allowed.includes(dimension)) return res.status(400).json({ error: `dimension must be one of ${allowed.join(',')}` });
    const r = await db.query(
      `SELECT ed.${dimension} as cut, COUNT(*) as n, AVG(es.score) as avg_score
       FROM employee_demographics ed
       LEFT JOIN engagement_scores es ON es.employee_id = ed.employee_id
       GROUP BY ed.${dimension}
       HAVING COUNT(*) >= $1`,
      [K_MIN]
    ).catch(() => ({ rows: [] }));
    return res.json({ dimension, k_min: K_MIN, cuts: r.rows });
  } catch (e) {
    return res.status(500).json({ error: 'cut failed', detail: e.message });
  }
});

module.exports = router;
