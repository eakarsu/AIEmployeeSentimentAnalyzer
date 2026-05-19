// Anonymous voice hotline: speech-to-text + sentiment.
const express = require('express');
const db = require('../db');
const { analyzeWithAI } = require('../services/openrouter');
const router = express.Router();

async function whisper(base64, mimeType = 'audio/webm') {
  // TODO: configure credentials — OPENAI_API_KEY
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const buf = Buffer.from(base64, 'base64');
  const form = new FormData();
  form.append('file', new Blob([buf], { type: mimeType }), 'rec.webm');
  form.append('model', 'whisper-1');
  const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });
  if (!r.ok) return null;
  const j = await r.json();
  return j.text || null;
}

// POST /api/voice-hotline/submit { audio_base64?, transcript?, mimeType?, category? }
router.post('/submit', async (req, res) => {
  try {
    const { audio_base64, transcript, mimeType, category } = req.body || {};
    let text = transcript;
    if (!text && audio_base64) {
      text = await whisper(audio_base64, mimeType);
      if (!text) return res.status(503).json({ error: 'OPENAI_API_KEY missing' });
    }
    if (!text) return res.status(400).json({ error: 'transcript or audio_base64 required' });

    let sentiment = null;
    try {
      const raw = await analyzeWithAI('Classify sentiment & extract themes. JSON {"sentiment":-1..1,"themes":["..."],"severity":"low|med|high"}.', text);
      try { sentiment = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] || raw); } catch { sentiment = { raw }; }
    } catch {}

    let id = null;
    try {
      const r = await db.query(
        `INSERT INTO anonymous_reports (category, content, sentiment, severity, source, created_at)
         VALUES ($1,$2,$3,$4,'voice_hotline',NOW()) RETURNING id`,
        [category || null, text, sentiment?.sentiment || null, sentiment?.severity || null]
      );
      id = r.rows[0].id;
    } catch {}
    return res.json({ id, transcript_excerpt: text.slice(0, 400), sentiment });
  } catch (e) {
    return res.status(500).json({ error: 'submit failed' });
  }
});

module.exports = router;
