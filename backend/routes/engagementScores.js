const express = require('express');
const db = require('../db');
const { analyzeWithAI, analysisPrompts } = require('../services/openrouter');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM engagement_scores ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM engagement_scores WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/', async (req, res) => {
  try {
    const { employee_name, department, score, category, factors, trend, assessed_date } = req.body;
    const result = await db.query(
      `INSERT INTO engagement_scores (employee_name, department, score, category, factors, trend, assessed_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [employee_name, department, score, category, factors, trend, assessed_date || new Date()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { employee_name, department, score, category, factors, trend, assessed_date } = req.body;
    const result = await db.query(
      `UPDATE engagement_scores SET employee_name=$1, department=$2, score=$3, category=$4, factors=$5, trend=$6, assessed_date=$7 WHERE id=$8 RETURNING *`,
      [employee_name, department, score, category, factors, trend, assessed_date, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM engagement_scores WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', item: result.rows[0] });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/:id/analyze', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM engagement_scores WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const item = result.rows[0];
    const { prompt, context } = analysisPrompts.engagementScores(item);
    const analysis = await analyzeWithAI(prompt, context);
    await db.query('UPDATE engagement_scores SET ai_recommendations = $1 WHERE id = $2', [JSON.stringify(analysis), req.params.id]);
    res.json({ ...item, ai_recommendations: analysis });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

module.exports = router;
