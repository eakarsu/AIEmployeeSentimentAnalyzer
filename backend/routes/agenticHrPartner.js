// Agentic HR partner: NL question over the data: "High turnover in
// engineering — why?" investigator.
const express = require('express');
const db = require('../db');
const { analyzeWithAI } = require('../services/openrouter');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

// POST /api/agentic-hr/ask { question, department? }
router.post('/ask', aiRateLimiter, async (req, res) => {
  try {
    const { question, department } = req.body || {};
    if (!question) return res.status(400).json({ error: 'question required' });

    const ret = await db.query(`SELECT * FROM retention_risks ${department ? 'WHERE department = $1' : ''} LIMIT 100`, department ? [department] : []).catch(() => ({ rows: [] }));
    const eng = await db.query(`SELECT * FROM engagement_scores ${department ? 'WHERE department = $1' : ''} LIMIT 100`, department ? [department] : []).catch(() => ({ rows: [] }));
    const exit = await db.query(`SELECT * FROM exit_interviews ${department ? 'WHERE department = $1' : ''} LIMIT 100`, department ? [department] : []).catch(() => ({ rows: [] }));

    const system = 'You are an HRBP analyst. Answer the question using the supplied data. Output JSON {"answer":"...","drivers":["..."],"recommended_actions":["..."]}.';
    let parsed;
    try {
      const raw = await analyzeWithAI(system, `Question: ${question}\nDept: ${department || 'all'}\nData: ${JSON.stringify({ retention: ret.rows, engagement: eng.rows, exits: exit.rows }).slice(0, 7000)}`);
      try { parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] || raw); } catch { parsed = { raw }; }
    } catch (e) {
      return res.status(503).json({ error: 'LLM unavailable', detail: e.message });
    }
    return res.json({ question, department: department || null, analysis: parsed });
  } catch (e) {
    return res.status(500).json({ error: 'ask failed' });
  }
});

module.exports = router;
