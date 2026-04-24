const express = require('express');
const db = require('../db');
const { analyzeWithAI, analysisPrompts } = require('../services/openrouter');

const router = express.Router();

// GET /api/surveys
router.get('/', async (req, res) => {
  try {
    const { department, sentiment_label } = req.query;
    let query = 'SELECT * FROM employee_surveys';
    const params = [];
    const conditions = [];

    if (department) {
      params.push(department);
      conditions.push(`department = $${params.length}`);
    }
    if (sentiment_label) {
      params.push(sentiment_label);
      conditions.push(`sentiment_label = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching surveys:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/surveys/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM employee_surveys WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching survey:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/surveys
router.post('/', async (req, res) => {
  try {
    const { employee_name, department, survey_date, question, response, sentiment_score, sentiment_label, ai_analysis } = req.body;
    const result = await db.query(
      `INSERT INTO employee_surveys (employee_name, department, survey_date, question, response, sentiment_score, sentiment_label, ai_analysis)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [employee_name, department, survey_date || new Date(), question, response, sentiment_score, sentiment_label, ai_analysis]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating survey:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/surveys/:id
router.put('/:id', async (req, res) => {
  try {
    const { employee_name, department, survey_date, question, response, sentiment_score, sentiment_label, ai_analysis } = req.body;
    const result = await db.query(
      `UPDATE employee_surveys SET employee_name = $1, department = $2, survey_date = $3, question = $4, response = $5, sentiment_score = $6, sentiment_label = $7, ai_analysis = $8
       WHERE id = $9 RETURNING *`,
      [employee_name, department, survey_date, question, response, sentiment_score, sentiment_label, ai_analysis, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating survey:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/surveys/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM employee_surveys WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    res.json({ message: 'Survey deleted', item: result.rows[0] });
  } catch (err) {
    console.error('Error deleting survey:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/surveys/:id/analyze
router.post('/:id/analyze', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM employee_surveys WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const survey = result.rows[0];
    const { prompt, context } = analysisPrompts.surveys(survey);
    const analysis = await analyzeWithAI(prompt, context);

    await db.query('UPDATE employee_surveys SET ai_analysis = $1 WHERE id = $2', [JSON.stringify(analysis), req.params.id]);

    res.json({ ...survey, ai_analysis: analysis });
  } catch (err) {
    console.error('Error analyzing survey:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
