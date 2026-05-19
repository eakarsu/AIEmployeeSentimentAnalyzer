const express = require('express');
const db = require('../db');
const { analyzeWithAI, analysisPrompts } = require('../services/openrouter');
const { aiRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// GET /api/surveys
router.get('/', async (req, res) => {
  try {
    const { department, sentiment_label } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

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

    const whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';

    const countResult = await db.query(`SELECT COUNT(*) FROM employee_surveys${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    const dataParams = [...params, limit, offset];
    const dataResult = await db.query(
      `SELECT * FROM employee_surveys${whereClause} ORDER BY created_at DESC LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams
    );

    res.json({
      data: dataResult.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
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
router.post('/:id/analyze', aiRateLimiter, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM employee_surveys WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const survey = result.rows[0];
    const { prompt, context } = analysisPrompts.surveys(survey);
    const analysis = await analyzeWithAI(prompt, context);

    await db.query('UPDATE employee_surveys SET ai_analysis = $1 WHERE id = $2', [analysis, req.params.id]);

    // Persist to unified ai_results cache (non-blocking)
    db.query(
      `INSERT INTO ai_results (user_id, feature, entity_type, entity_id, prompt_summary, result, model)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [req.user?.id || null, 'surveys', 'employee_surveys', req.params.id, 'Survey sentiment analysis', analysis, analysis?._ai_model || 'anthropic/claude-3-5-sonnet-20241022']
    ).catch(err => console.error('[ai_results persist]', err.message));

    res.json({ ...survey, ai_analysis: analysis });
  } catch (err) {
    console.error('Error analyzing survey:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
