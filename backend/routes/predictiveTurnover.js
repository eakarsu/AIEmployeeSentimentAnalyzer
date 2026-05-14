// Predictive turnover: 3-month resignation likelihood per person. v0 uses
// simple feature weights over retention_risk + engagement + tenure.
const express = require('express');
const db = require('../db');
const router = express.Router();

function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }

// GET /api/predictive-turnover/all?top_n=50
router.get('/all', async (req, res) => {
  try {
    const topN = Math.min(parseInt(req.query.top_n) || 50, 500);
    const r = await db.query(
      `SELECT rr.employee_id, rr.risk_score as retention_risk, es.score as engagement_score,
              ep.tenure_months, ep.department
       FROM retention_risks rr
       LEFT JOIN engagement_scores es ON es.employee_id = rr.employee_id
       LEFT JOIN employee_profiles ep ON ep.id = rr.employee_id
       LIMIT 5000`
    ).catch(() => ({ rows: [] }));
    const scored = r.rows.map(row => {
      const z = -1.5
        + 0.04 * (Number(row.retention_risk) || 0)
        - 0.02 * (Number(row.engagement_score) || 0)
        + (Number(row.tenure_months) < 6 ? 0.5 : 0)
        + (Number(row.tenure_months) > 60 ? -0.3 : 0);
      const p = sigmoid(z);
      return { employee_id: row.employee_id, department: row.department, p_resign_90d: Math.round(p * 1000) / 1000 };
    }).sort((a, b) => b.p_resign_90d - a.p_resign_90d).slice(0, topN);
    return res.json({ top_n: topN, predictions: scored });
  } catch (e) {
    return res.status(500).json({ error: 'predict failed' });
  }
});

module.exports = router;
