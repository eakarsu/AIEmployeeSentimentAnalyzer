const express = require('express');
const db = require('../db');
const { analyzeWithAI, analysisPrompts } = require('../services/openrouter');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM department_analytics ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM department_analytics WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { department, period, avg_sentiment, total_responses, positive_pct, neutral_pct, negative_pct, key_themes, ai_insights } = req.body;
    const result = await db.query(
      `INSERT INTO department_analytics (department, period, avg_sentiment, total_responses, positive_pct, neutral_pct, negative_pct, key_themes, ai_insights)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [department, period, avg_sentiment, total_responses, positive_pct, neutral_pct, negative_pct, key_themes, ai_insights]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { department, period, avg_sentiment, total_responses, positive_pct, neutral_pct, negative_pct, key_themes, ai_insights } = req.body;
    const result = await db.query(
      `UPDATE department_analytics SET department=$1, period=$2, avg_sentiment=$3, total_responses=$4, positive_pct=$5, neutral_pct=$6, negative_pct=$7, key_themes=$8, ai_insights=$9 WHERE id=$10 RETURNING *`,
      [department, period, avg_sentiment, total_responses, positive_pct, neutral_pct, negative_pct, key_themes, ai_insights, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM department_analytics WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', item: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/analyze', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM department_analytics WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const item = result.rows[0];
    const { prompt, context } = analysisPrompts.departmentAnalytics(item);
    const analysis = await analyzeWithAI(prompt, context);
    await db.query('UPDATE department_analytics SET ai_insights = $1 WHERE id = $2', [JSON.stringify(analysis), req.params.id]);
    res.json({ ...item, ai_insights: analysis });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
