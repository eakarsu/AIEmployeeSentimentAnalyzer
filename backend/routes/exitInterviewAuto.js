// Exit-interview automation: structured AI-led exit conversations.
const express = require('express');
const db = require('../db');
const { analyzeWithAI } = require('../services/openrouter');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

// POST /api/exit-interview-auto/conduct { employee_id, transcript }
router.post('/conduct', aiRateLimiter, async (req, res) => {
  try {
    const { employee_id, transcript } = req.body || {};
    if (!employee_id || !transcript) return res.status(400).json({ error: 'employee_id + transcript required' });
    const system = 'Given an exit-interview transcript, produce structured findings. JSON {"reason":"...","themes":["..."],"recommended_actions":["..."],"retention_lessons":["..."]}.';
    let parsed;
    try {
      const raw = await analyzeWithAI(system, transcript.slice(0, 8000));
      try { parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] || raw); } catch { parsed = { raw }; }
    } catch (e) {
      return res.status(503).json({ error: 'LLM unavailable', detail: e.message });
    }
    try {
      await db.query(
        `INSERT INTO exit_interviews (employee_id, payload, source, created_at) VALUES ($1,$2,'agentic',NOW())`,
        [employee_id, JSON.stringify(parsed)]
      );
    } catch {}
    return res.json({ employee_id, findings: parsed });
  } catch (e) {
    return res.status(500).json({ error: 'conduct failed' });
  }
});

module.exports = router;
