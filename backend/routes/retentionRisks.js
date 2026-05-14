const express = require('express');
const db = require('../db');
const { analyzeWithAI, analysisPrompts } = require('../services/openrouter');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const countResult = await db.query('SELECT COUNT(*) FROM retention_risks');
    const total = parseInt(countResult.rows[0].count);
    const dataResult = await db.query('SELECT * FROM retention_risks ORDER BY risk_score DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({
      data: dataResult.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM retention_risks WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/', async (req, res) => {
  try {
    const { employee_name, department, tenure_years, risk_score, risk_factors, recommended_actions, last_assessed } = req.body;
    // Require employee_id (or employee_name) and department per spec
    const employee_id = req.body.employee_id;
    if ((!employee_id && !employee_name) || !department) {
      return res.status(400).json({ error: 'Missing required fields: employee_id, department' });
    }
    const result = await db.query(
      `INSERT INTO retention_risks (employee_name, department, tenure_years, risk_score, risk_factors, recommended_actions, last_assessed)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [employee_name, department, tenure_years, risk_score, risk_factors, recommended_actions, last_assessed || new Date()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { employee_name, department, tenure_years, risk_score, risk_factors, recommended_actions, last_assessed } = req.body;
    const result = await db.query(
      `UPDATE retention_risks SET employee_name=$1, department=$2, tenure_years=$3, risk_score=$4, risk_factors=$5, recommended_actions=$6, last_assessed=$7 WHERE id=$8 RETURNING *`,
      [employee_name, department, tenure_years, risk_score, risk_factors, recommended_actions, last_assessed, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM retention_risks WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', item: result.rows[0] });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/:id/analyze', aiRateLimiter, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM retention_risks WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const item = result.rows[0];
    const { prompt, context } = analysisPrompts.retentionRisks(item);
    const analysis = await analyzeWithAI(prompt, context);
    await db.query('UPDATE retention_risks SET ai_prediction = $1 WHERE id = $2', [analysis, req.params.id]);
    res.json({ ...item, ai_prediction: analysis });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

module.exports = router;
