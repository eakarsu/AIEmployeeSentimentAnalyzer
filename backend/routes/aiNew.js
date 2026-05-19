const express = require('express');
const db = require('../db');
const { analyzeWithAI } = require('../services/openrouter');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

// POST /api/ai/cross-module-correlation
// Accepts { department }, fetches data from retention risk + engagement + pulse check + exit interview,
// uses AI to identify correlated risk patterns and return composite "at-risk" score
router.post('/cross-module-correlation', aiRateLimiter, async (req, res) => {
  try {
    if (!requireKey(res)) return;
    const { department } = req.body;
    if (!department) {
      return res.status(400).json({ error: 'department is required' });
    }

    const [retentionResult, engagementResult, pulseResult, exitResult] = await Promise.all([
      db.query('SELECT * FROM retention_risks WHERE department = $1 ORDER BY created_at DESC LIMIT 20', [department]),
      db.query('SELECT * FROM engagement_scores WHERE department = $1 ORDER BY created_at DESC LIMIT 20', [department]),
      db.query('SELECT * FROM pulse_checks WHERE department = $1 ORDER BY created_at DESC LIMIT 20', [department]),
      db.query('SELECT * FROM exit_interviews WHERE department = $1 ORDER BY created_at DESC LIMIT 20', [department]),
    ]);

    const context = {
      department,
      retention_risks: retentionResult.rows,
      engagement_scores: engagementResult.rows,
      pulse_checks: pulseResult.rows,
      exit_interviews: exitResult.rows,
    };

    const prompt = `You are an expert HR analytics AI. Analyze the cross-module data for the ${department} department. Identify correlated risk patterns across retention risks, engagement scores, pulse checks, and exit interviews. Return a JSON object with fields: at_risk_score (0-100), risk_level (low/medium/high/critical), correlated_patterns (array of { pattern, modules_involved, severity }), top_concerns (array), root_cause_hypothesis (string), recommended_interventions (array of { action, priority, timeline }), summary.`;

    const analysis = await analyzeWithAI(prompt, context);
    res.json({ department, correlation_analysis: analysis });
  } catch (err) {
    console.error('cross-module-correlation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/ai/sentiment-trend
// Accepts { metric_type, date_range }, fetches historical data,
// returns time-series trend analysis with inflection points
router.post('/sentiment-trend', aiRateLimiter, async (req, res) => {
  try {
    if (!requireKey(res)) return;
    const { metric_type, date_range } = req.body;
    if (!metric_type) {
      return res.status(400).json({ error: 'metric_type is required' });
    }

    const tableMap = {
      surveys: { table: 'employee_surveys', scoreCol: 'sentiment_score', dateCol: 'survey_date' },
      engagement: { table: 'engagement_scores', scoreCol: 'score', dateCol: 'assessed_date' },
      pulse: { table: 'pulse_checks', scoreCol: 'energy_level', dateCol: 'check_date' },
      morale: { table: 'team_morale', scoreCol: 'morale_score', dateCol: 'survey_date' },
      culture: { table: 'culture_index', scoreCol: 'score', dateCol: 'survey_date' },
    };

    const config = tableMap[metric_type];
    if (!config) {
      return res.status(400).json({ error: `metric_type must be one of: ${Object.keys(tableMap).join(', ')}` });
    }

    let query = `SELECT ${config.dateCol} as date, AVG(${config.scoreCol}) as avg_score, COUNT(*) as count FROM ${config.table}`;
    const params = [];

    if (date_range && date_range.start && date_range.end) {
      params.push(date_range.start, date_range.end);
      query += ` WHERE ${config.dateCol} BETWEEN $1 AND $2`;
    }

    query += ` GROUP BY ${config.dateCol} ORDER BY ${config.dateCol} ASC`;

    const result = await db.query(query, params);

    const prompt = `You are an HR analytics expert. Analyze this time-series sentiment data for metric type "${metric_type}" over the period ${date_range ? `${date_range.start} to ${date_range.end}` : 'all time'}. Identify trends, inflection points, and patterns. Return a JSON object with fields: overall_trend (improving/declining/stable), trend_strength (weak/moderate/strong), inflection_points (array of { date, description, direction }), period_analysis (array of { period, avg_score, interpretation }), seasonal_patterns (array), anomalies (array), forecast_next_period, summary, recommendations (array).`;

    const analysis = await analyzeWithAI(prompt, { metric_type, date_range, time_series: result.rows });
    res.json({ metric_type, date_range, time_series: result.rows, trend_analysis: analysis });
  } catch (err) {
    console.error('sentiment-trend error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/ai/intervention-planner
// Accepts { department, identified_issues[] },
// uses AI to generate specific HR intervention plan with timeline and success metrics
router.post('/intervention-planner', aiRateLimiter, async (req, res) => {
  try {
    if (!requireKey(res)) return;
    const { department, identified_issues } = req.body;
    if (!department || !identified_issues) {
      return res.status(400).json({ error: 'department and identified_issues are required' });
    }
    if (!Array.isArray(identified_issues) || identified_issues.length === 0) {
      return res.status(400).json({ error: 'identified_issues must be a non-empty array' });
    }

    const prompt = `You are an expert HR intervention specialist. Create a detailed, actionable HR intervention plan for the ${department} department addressing the following identified issues. Return a JSON object with fields: intervention_plan (array of { intervention_name, target_issue, description, owner, timeline_weeks, priority (high/medium/low), resources_required, success_metrics (array), expected_outcome }), overall_timeline_weeks, total_interventions, quick_wins (array of intervention names), long_term_initiatives (array of intervention names), dependencies (array), risk_mitigation (array), success_measurement_framework, summary.`;

    const context = { department, identified_issues };
    const analysis = await analyzeWithAI(prompt, context);
    res.json({ department, identified_issues, intervention_plan: analysis });
  } catch (err) {
    console.error('intervention-planner error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/ai/sentiment-analysis
// Accepts { texts: [string, ...], department (optional) }
// Returns per-text sentiment + overall aggregate analysis
router.post('/sentiment-analysis', aiRateLimiter, async (req, res) => {
  try {
    const { texts, department } = req.body;
    if (!Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({ error: 'texts must be a non-empty array' });
    }
    if (texts.length > 200) {
      return res.status(400).json({ error: 'texts is limited to 200 entries per call' });
    }

    const prompt = `You are an expert organizational psychologist performing sentiment analysis on employee comments. Return a JSON object with fields: per_text (array of { index, sentiment (positive/neutral/negative/mixed), polarity_score (-1.0 to 1.0), emotion_tags (array), themes (array), risk_flags (array) }), aggregate { positive_pct, neutral_pct, negative_pct, dominant_themes (array), top_emotions (array), risk_level (low/medium/high/critical), trend_signal }, summary, recommended_actions (array).`;

    const context = {
      department: department || null,
      sample_size: texts.length,
      texts: texts.map((t, i) => ({ index: i, text: String(t).slice(0, 2000) })),
    };

    const analysis = await analyzeWithAI(prompt, context);
    res.json({ department: department || null, sample_size: texts.length, analysis });
  } catch (err) {
    console.error('sentiment-analysis error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/ai/retention-predict
// Accepts { department }, joins retention_risks + engagement_scores + pulse_checks
// Returns AI churn predictions per high-risk segment
router.post('/retention-predict', aiRateLimiter, async (req, res) => {
  try {
    const { department } = req.body;
    if (!department) {
      return res.status(400).json({ error: 'department is required' });
    }

    const [retention, engagement, pulse] = await Promise.all([
      db.query('SELECT * FROM retention_risks WHERE department = $1 ORDER BY created_at DESC LIMIT 50', [department]),
      db.query('SELECT * FROM engagement_scores WHERE department = $1 ORDER BY created_at DESC LIMIT 50', [department]),
      db.query('SELECT * FROM pulse_checks WHERE department = $1 ORDER BY created_at DESC LIMIT 50', [department]),
    ]);

    const prompt = `You are an HR analytics scientist. Using the retention, engagement, and pulse data provided, predict the 90-day churn risk for the department. Return a JSON object with fields: department, risk_level (low/medium/high/critical), confidence_score (0-100), high_risk_segments (array of { segment, churn_probability_pct, drivers (array) }), at_risk_employee_count, recommended_interventions (array), early_warning_signals (array), summary.`;

    const context = {
      department,
      retention_records: retention.rows,
      engagement_records: engagement.rows,
      pulse_records: pulse.rows,
    };

    const analysis = await analyzeWithAI(prompt, context);
    res.json({ department, predictions: analysis });
  } catch (err) {
    console.error('retention-predict error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper: returns 503 when no API key configured
function requireKey(res) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key || key === 'your_openrouter_api_key_here') {
    res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured' });
    return false;
  }
  return true;
}

// POST /api/ai/eNPS-improve
// Reads recent eNPS-style scores from engagement_scores and returns ranked
// improvement recommendations.
router.post('/eNPS-improve', aiRateLimiter, async (req, res) => {
  try {
    if (!requireKey(res)) return;
    const { department, lookback_days } = req.body || {};
    const days = Number.isFinite(lookback_days) && lookback_days > 0 ? lookback_days : 90;

    let query = `SELECT * FROM engagement_scores WHERE assessed_date >= NOW() - ($1 || ' days')::interval`;
    const params = [String(days)];
    if (department) {
      params.push(department);
      query += ` AND department = $${params.length}`;
    }
    query += ` ORDER BY assessed_date DESC LIMIT 200`;

    let rows = [];
    try { const r = await db.query(query, params); rows = r.rows; } catch (_) { rows = []; }

    const prompt = `You are an organizational engagement strategist. Given recent engagement / eNPS-style scores, return ranked improvement recommendations. Return JSON with fields: current_enps_estimate (-100 to 100), category (detractor-heavy/passive/promoter-heavy), top_drivers (array of { driver, contribution_pct }), recommendations (array of { action, target_segment, expected_lift, priority (high/medium/low), timeline_weeks, owner_role }), quick_wins (array), strategic_initiatives (array), risk_if_no_action (string), summary.`;

    const context = { department: department || null, lookback_days: days, sample_size: rows.length, scores: rows };
    const analysis = await analyzeWithAI(prompt, context);
    res.json({ department: department || null, lookback_days: days, sample_size: rows.length, analysis });
  } catch (err) {
    console.error('eNPS-improve error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/ai/leadership-feedback-extract
// Summarizes leadership_ratings themes per leader.
router.post('/leadership-feedback-extract', aiRateLimiter, async (req, res) => {
  try {
    if (!requireKey(res)) return;
    const { leader_name, department } = req.body || {};

    const conds = [];
    const params = [];
    if (leader_name) { params.push(leader_name); conds.push(`leader_name = $${params.length}`); }
    if (department) { params.push(department); conds.push(`department = $${params.length}`); }
    const where = conds.length ? ` WHERE ${conds.join(' AND ')}` : '';

    let rows = [];
    try {
      const r = await db.query(`SELECT * FROM leadership_ratings${where} ORDER BY created_at DESC LIMIT 100`, params);
      rows = r.rows;
    } catch (_) { rows = []; }

    const prompt = `You are an HR analyst summarizing leadership feedback for executives. Return JSON with fields: per_leader (array of { leader_name, themes (array), strengths (array), development_areas (array), team_sentiment (positive/mixed/negative), confidence }), org_level_themes (array), coaching_priorities (array), summary.`;

    const context = { leader_name: leader_name || null, department: department || null, sample_size: rows.length, ratings: rows };
    const analysis = await analyzeWithAI(prompt, context);
    res.json({ leader_name: leader_name || null, department: department || null, sample_size: rows.length, analysis });
  } catch (err) {
    console.error('leadership-feedback-extract error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/ai/culture-health-score
// Aggregates culture_index rows into a composite dashboard metric.
router.post('/culture-health-score', aiRateLimiter, async (req, res) => {
  try {
    if (!requireKey(res)) return;
    const { department, lookback_days } = req.body || {};
    const days = Number.isFinite(lookback_days) && lookback_days > 0 ? lookback_days : 180;

    let query = `SELECT * FROM culture_index WHERE survey_date >= NOW() - ($1 || ' days')::interval`;
    const params = [String(days)];
    if (department) {
      params.push(department);
      query += ` AND department = $${params.length}`;
    }
    query += ` ORDER BY survey_date DESC LIMIT 200`;

    let rows = [];
    try { const r = await db.query(query, params); rows = r.rows; } catch (_) { rows = []; }

    const prompt = `You are a culture analytics expert. Compute a composite culture health score (0-100) and dashboard breakdown from the provided culture_index rows. Return JSON with fields: composite_score (0-100), grade (A/B/C/D/F), pillar_scores (array of { pillar, score, trend (up/flat/down) }), critical_gaps (array), positive_pillars (array), benchmark_comparison (string), recommendations (array of { initiative, priority, timeline_weeks }), summary.`;

    const context = { department: department || null, lookback_days: days, sample_size: rows.length, culture_rows: rows };
    const analysis = await analyzeWithAI(prompt, context);
    res.json({ department: department || null, lookback_days: days, sample_size: rows.length, analysis });
  } catch (err) {
    console.error('culture-health-score error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
