const express = require('express');
const db = require('../db');
const { analyzeWithAI, analysisPrompts } = require('../services/openrouter');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM exit_interviews ORDER BY exit_date DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM exit_interviews WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/', async (req, res) => {
  try {
    const { employee_name, department, exit_date, tenure_years, exit_reason, feedback, preventable } = req.body;
    const result = await db.query(
      `INSERT INTO exit_interviews (employee_name, department, exit_date, tenure_years, exit_reason, feedback, preventable)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [employee_name, department, exit_date, tenure_years, exit_reason, feedback, preventable || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { employee_name, department, exit_date, tenure_years, exit_reason, feedback, preventable } = req.body;
    const result = await db.query(
      `UPDATE exit_interviews SET employee_name=$1, department=$2, exit_date=$3, tenure_years=$4, exit_reason=$5, feedback=$6, preventable=$7 WHERE id=$8 RETURNING *`,
      [employee_name, department, exit_date, tenure_years, exit_reason, feedback, preventable, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM exit_interviews WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', item: result.rows[0] });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/:id/analyze', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM exit_interviews WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const item = result.rows[0];
    const { prompt, context } = analysisPrompts.exitInterviews(item);
    const analysis = await analyzeWithAI(prompt, context);
    await db.query('UPDATE exit_interviews SET ai_analysis = $1 WHERE id = $2', [JSON.stringify(analysis), req.params.id]);
    res.json({ ...item, ai_analysis: analysis });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

module.exports = router;
