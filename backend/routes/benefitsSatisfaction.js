const express = require('express');
const db = require('../db');
const { analyzeWithAI, analysisPrompts } = require('../services/openrouter');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM benefits_satisfaction ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM benefits_satisfaction WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/', async (req, res) => {
  try {
    const { employee_name, department, benefit_type, satisfaction_score, comments, survey_date } = req.body;
    const result = await db.query(
      `INSERT INTO benefits_satisfaction (employee_name, department, benefit_type, satisfaction_score, comments, survey_date)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [employee_name, department, benefit_type, satisfaction_score, comments, survey_date || new Date()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { employee_name, department, benefit_type, satisfaction_score, comments, survey_date } = req.body;
    const result = await db.query(
      `UPDATE benefits_satisfaction SET employee_name=$1, department=$2, benefit_type=$3, satisfaction_score=$4, comments=$5, survey_date=$6 WHERE id=$7 RETURNING *`,
      [employee_name, department, benefit_type, satisfaction_score, comments, survey_date, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM benefits_satisfaction WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', item: result.rows[0] });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/:id/analyze', aiRateLimiter, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM benefits_satisfaction WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const item = result.rows[0];
    const { prompt, context } = analysisPrompts.benefitsSatisfaction(item);
    const analysis = await analyzeWithAI(prompt, context);
    await db.query('UPDATE benefits_satisfaction SET ai_analysis = $1 WHERE id = $2', [analysis, req.params.id]);
    res.json({ ...item, ai_analysis: analysis });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

module.exports = router;
