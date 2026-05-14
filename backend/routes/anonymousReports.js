const express = require('express');
const db = require('../db');
const { analyzeWithAI, analysisPrompts } = require('../services/openrouter');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

async function sendCriticalAlert(report, analysis) {
  try {
    // Create an alert record in a simple alerts log table (graceful if table doesn't exist)
    try {
      await db.query(
        `INSERT INTO critical_alerts (report_id, department, severity, analysis_summary, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [report.id, report.department, 'Critical', JSON.stringify(analysis)]
      );
    } catch (dbErr) {
      // Table might not exist yet; log but don't fail
      console.warn('Could not insert critical alert record:', dbErr.message);
    }

    // Send email via nodemailer if SMTP is configured
    const smtpHost = process.env.SMTP_HOST;
    const hrEmail = process.env.HR_MANAGER_EMAIL;
    if (!smtpHost || !hrEmail) {
      console.log('SMTP not configured; skipping critical alert email.');
      return;
    }

    let nodemailer;
    try { nodemailer = require('nodemailer'); } catch { return; }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: hrEmail,
      subject: `[CRITICAL ALERT] Anonymous Report - ${report.department}`,
      text: `A critical anonymous report has been detected and requires immediate attention.\n\nDepartment: ${report.department}\nCategory: ${report.category}\nReport ID: ${report.id}\n\nAI Analysis Summary:\n${analysis.summary || JSON.stringify(analysis)}\n\nRecommended Actions:\n${Array.isArray(analysis.recommended_actions) ? analysis.recommended_actions.join('\n') : 'See full report'}\n\nPlease review immediately in the HR dashboard.`
    });

    console.log(`Critical alert email sent to ${hrEmail} for report ID ${report.id}`);
  } catch (err) {
    console.error('Failed to send critical alert:', err.message);
  }
}

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM anonymous_reports ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

// GET /api/anonymous-reports/critical - list all critical reports
router.get('/critical', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM anonymous_reports WHERE LOWER(severity) = 'critical' ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM anonymous_reports WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/', async (req, res) => {
  try {
    const { department, category, report_text, severity, status, submitted_date } = req.body;
    const result = await db.query(
      `INSERT INTO anonymous_reports (department, category, report_text, severity, status, submitted_date)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [department, category, report_text, severity || 'Medium', status || 'Open', submitted_date || new Date()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { department, category, report_text, severity, status, submitted_date } = req.body;
    const result = await db.query(
      `UPDATE anonymous_reports SET department=$1, category=$2, report_text=$3, severity=$4, status=$5, submitted_date=$6 WHERE id=$7 RETURNING *`,
      [department, category, report_text, severity, status, submitted_date, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM anonymous_reports WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', item: result.rows[0] });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/:id/analyze', aiRateLimiter, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM anonymous_reports WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const item = result.rows[0];
    const { prompt, context } = analysisPrompts.anonymousReports(item);
    const analysis = await analyzeWithAI(prompt, context);
    await db.query('UPDATE anonymous_reports SET ai_analysis = $1 WHERE id = $2', [analysis, req.params.id]);

    // Check severity from AI response and escalate if critical
    const urgency = analysis.urgency || analysis.severity_assessment || '';
    if (typeof urgency === 'string' && urgency.toLowerCase() === 'critical') {
      // Fire-and-forget escalation
      sendCriticalAlert(item, analysis).catch(e => console.error('Alert error:', e.message));
    }

    res.json({ ...item, ai_analysis: analysis });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

module.exports = router;
