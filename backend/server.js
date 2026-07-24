require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('./db');
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Security: helmet
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS allowlist from env (comma-separated)
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

app.use('/api', (req, res, next) => {
  const governed = ['/auth', '/health', '/listening', '/ai'].some((prefix) => req.path === prefix || req.path.startsWith(`${prefix}/`));
  const legacyEnabled = process.env.NODE_ENV !== 'production' && process.env.ENABLE_LEGACY_UNSCOPED_ROUTES === 'true';
  if (governed || legacyEnabled) return next();
  return res.status(404).json({ error: 'Legacy individually identifying route is quarantined' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/listening', require('./routes/listeningWorkflow'));

// Legacy routes expose individually identifiable text and are development-only.
// They are quarantined until their schemas and queries are tenant-scoped.
if (process.env.NODE_ENV !== 'production' && process.env.ENABLE_LEGACY_UNSCOPED_ROUTES === 'true') {
  app.use('/api/surveys', require('./routes/surveys'));
  app.use('/api/department-analytics', require('./routes/departmentAnalytics'));
  app.use('/api/pulse-checks', require('./routes/pulseChecks'));
  app.use('/api/feedback-analysis', require('./routes/feedbackAnalysis'));
  app.use('/api/retention-risks', require('./routes/retentionRisks'));
  app.use('/api/engagement-scores', require('./routes/engagementScores'));
  app.use('/api/team-morale', require('./routes/teamMorale'));
  app.use('/api/exit-interviews', require('./routes/exitInterviews'));
  app.use('/api/anonymous-reports', require('./routes/anonymousReports'));
  app.use('/api/performance-reviews', require('./routes/performanceReviews'));
  app.use('/api/onboarding-feedback', require('./routes/onboardingFeedback'));
  app.use('/api/benefits-satisfaction', require('./routes/benefitsSatisfaction'));
  app.use('/api/work-life-balance', require('./routes/workLifeBalance'));
  app.use('/api/leadership-ratings', require('./routes/leadershipRatings'));
  app.use('/api/culture-index', require('./routes/cultureIndex'));
}

app.use('/api/ai', auth, require('./routes/aiNew'));
app.use('/api/realtime-pulse', require('./routes/realtimePulse'));
app.use('/api/agentic-hr', require('./routes/agenticHrPartner'));
app.use('/api/voice-hotline', require('./routes/voiceHotline'));
app.use('/api/di-metrics', require('./routes/diMetrics'));
app.use('/api/predictive-turnover', require('./routes/predictiveTurnover'));
app.use('/api/exit-interview-auto', require('./routes/exitInterviewAuto'));
app.use('/api/skip-level', require('./routes/skipLevelReport'));
app.use('/api/retaliation-risk-sentinel', require('./routes/retaliationRiskSentinel'));

// AI results history (paginated)
app.get('/api/ai-results', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const { feature, entity_type, entity_id } = req.query;

    const params = [];
    const conds = [];
    if (feature) { params.push(feature); conds.push(`feature = $${params.length}`); }
    if (entity_type) { params.push(entity_type); conds.push(`entity_type = $${params.length}`); }
    if (entity_id) { params.push(entity_id); conds.push(`entity_id = $${params.length}`); }
    const where = conds.length ? ` WHERE ${conds.join(' AND ')}` : '';

    const countRes = await db.query(`SELECT COUNT(*) FROM ai_results${where}`, params);
    const total = parseInt(countRes.rows[0].count);

    params.push(limit, offset);
    const result = await db.query(
      `SELECT * FROM ai_results${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


// Custom Views (mounted BEFORE 404/listen)
app.use('/api/custom-views', require('./routes/customViews'));

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
