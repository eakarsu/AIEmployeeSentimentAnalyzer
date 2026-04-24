const express = require('express');
const db = require('../db');
const { analyzeWithAI, analysisPrompts } = require('../services/openrouter');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM team_morale ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM team_morale WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/', async (req, res) => {
  try {
    const { team_name, department, morale_score, participation_rate, highlights, concerns, survey_date } = req.body;
    const result = await db.query(
      `INSERT INTO team_morale (team_name, department, morale_score, participation_rate, highlights, concerns, survey_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [team_name, department, morale_score, participation_rate, highlights, concerns, survey_date || new Date()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { team_name, department, morale_score, participation_rate, highlights, concerns, survey_date } = req.body;
    const result = await db.query(
      `UPDATE team_morale SET team_name=$1, department=$2, morale_score=$3, participation_rate=$4, highlights=$5, concerns=$6, survey_date=$7 WHERE id=$8 RETURNING *`,
      [team_name, department, morale_score, participation_rate, highlights, concerns, survey_date, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM team_morale WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', item: result.rows[0] });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/:id/analyze', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM team_morale WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const item = result.rows[0];
    const { prompt, context } = analysisPrompts.teamMorale(item);
    const analysis = await analyzeWithAI(prompt, context);
    await db.query('UPDATE team_morale SET ai_analysis = $1 WHERE id = $2', [JSON.stringify(analysis), req.params.id]);
    res.json({ ...item, ai_analysis: analysis });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

module.exports = router;
