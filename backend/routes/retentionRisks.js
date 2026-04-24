const express = require('express');
const db = require('../db');
const { analyzeWithAI, analysisPrompts } = require('../services/openrouter');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM retention_risks ORDER BY risk_score DESC');
    res.json(result.rows);
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

router.post('/:id/analyze', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM retention_risks WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const item = result.rows[0];
    const { prompt, context } = analysisPrompts.retentionRisks(item);
    const analysis = await analyzeWithAI(prompt, context);
    await db.query('UPDATE retention_risks SET ai_prediction = $1 WHERE id = $2', [JSON.stringify(analysis), req.params.id]);
    res.json({ ...item, ai_prediction: analysis });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

module.exports = router;
