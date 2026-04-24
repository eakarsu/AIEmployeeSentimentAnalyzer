require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
