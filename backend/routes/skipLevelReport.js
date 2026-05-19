// Skip-level reporting: anonymised manager feedback aggregated upward.
const express = require('express');
const db = require('../db');
const router = express.Router();

const K_MIN = Math.max(parseInt(process.env.K_ANONYMITY_MIN) || 5, 3);

// GET /api/skip-level/:manager_id — aggregate scores about the manager's manager
router.get('/:manager_id', async (req, res) => {
  try {
    const { manager_id } = req.params;
    const r = await db.query(
      `SELECT lr.skip_level_manager_id, COUNT(*) as n, AVG(lr.score) as avg_score, ARRAY_AGG(DISTINCT lr.theme) as themes
       FROM leadership_ratings lr
       WHERE lr.manager_id = $1
       GROUP BY lr.skip_level_manager_id
       HAVING COUNT(*) >= $2`,
      [manager_id, K_MIN]
    ).catch(() => ({ rows: [] }));
    return res.json({ manager_id, k_min: K_MIN, results: r.rows });
  } catch (e) {
    return res.status(500).json({ error: 'aggregate failed' });
  }
});

module.exports = router;
