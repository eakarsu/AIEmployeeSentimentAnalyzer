const express = require('express');
const db = require('../db');
const { analyzeWithAI, analysisPrompts } = require('../services/openrouter');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM leadership_ratings ORDER BY rating_date DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM leadership_ratings WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/', async (req, res) => {
  try {
    const { leader_name, department, rated_by, communication_score, vision_score, support_score, overall_score, comments, rating_date } = req.body;
    const result = await db.query(
      `INSERT INTO leadership_ratings (leader_name, department, rated_by, communication_score, vision_score, support_score, overall_score, comments, rating_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [leader_name, department, rated_by, communication_score, vision_score, support_score, overall_score, comments, rating_date || new Date()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { leader_name, department, rated_by, communication_score, vision_score, support_score, overall_score, comments, rating_date } = req.body;
    const result = await db.query(
      `UPDATE leadership_ratings SET leader_name=$1, department=$2, rated_by=$3, communication_score=$4, vision_score=$5, support_score=$6, overall_score=$7, comments=$8, rating_date=$9 WHERE id=$10 RETURNING *`,
      [leader_name, department, rated_by, communication_score, vision_score, support_score, overall_score, comments, rating_date, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM leadership_ratings WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', item: result.rows[0] });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/:id/analyze', aiRateLimiter, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM leadership_ratings WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const item = result.rows[0];
    const { prompt, context } = analysisPrompts.leadershipRatings(item);
    const analysis = await analyzeWithAI(prompt, context);
    await db.query('UPDATE leadership_ratings SET ai_analysis = $1 WHERE id = $2', [analysis, req.params.id]);
    res.json({ ...item, ai_analysis: analysis });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

module.exports = router;
