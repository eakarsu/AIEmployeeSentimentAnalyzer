// === Batch 03 Gaps & Frontend Mounts ===
// Auto-generated frontend page (lean v0). Wires Custom Feature Suggestions
// and Gap endpoints (AI counterparts + non-AI features) to backend routes.
import React, { useState } from 'react';

const API_BASE = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) || 'http://localhost:4000/api';

const FEATURES = [
  { kind: 'cfs', slug: 'cf-real-time-pulse', label: 'Real-time pulse', desc: 'Bi-weekly micro-surveys with live leadership view', endpoint: '/cf-real-time-pulse' },
  { kind: 'cfs', slug: 'cf-agentic-hr-partner', label: 'Agentic HR partner', desc: '"High turnover in engineering — why?" investigator', endpoint: '/cf-agentic-hr-partner' },
  { kind: 'cfs', slug: 'cf-anonymous-voice-hotline', label: 'Anonymous voice hotline', desc: 'Speech-to-text + sentiment', endpoint: '/cf-anonymous-voice-hotline' },
  { kind: 'cfs', slug: 'cf-d-i-metrics', label: 'D&I metrics', desc: 'Demographic-cut sentiment with k-anonymity', endpoint: '/cf-d-i-metrics' },
  { kind: 'cfs', slug: 'cf-predictive-turnover', label: 'Predictive turnover', desc: '3-month resignation likelihood per person', endpoint: '/cf-predictive-turnover' },
  { kind: 'cfs', slug: 'cf-exit-interview-automation', label: 'Exit-interview automation', desc: 'Structured AI-led exit conversations', endpoint: '/cf-exit-interview-automation' },
  { kind: 'cfs', slug: 'cf-skip-level-reporting', label: 'Skip-level reporting', desc: 'Anonymised manager feedback', endpoint: '/cf-skip-level-reporting' },
  { kind: 'gap-ai', slug: 'gap-ai-no-diversity-demographic-aware-sentiment-cut-privacy-pres', label: 'No diversity / demographic-aware sentiment cut (privacy-pres', desc: 'No diversity / demographic-aware sentiment cut (privacy-preserving)', endpoint: '/gap-no-diversity-demographic-aware-sentiment-cut-privacy-pres' },
  { kind: 'gap-ai', slug: 'gap-ai-no-voice-audio-sentiment-ingest', label: 'No voice/audio sentiment ingest', desc: 'No voice/audio sentiment ingest', endpoint: '/gap-no-voice-audio-sentiment-ingest' },
  { kind: 'gap-ai', slug: 'gap-ai-no-skip-level-themed-reporting', label: 'No skip-level themed reporting', desc: 'No skip-level themed reporting', endpoint: '/gap-no-skip-level-themed-reporting' },
  { kind: 'gap-non', slug: 'gap-non-no-notifications-alerting-subsystem', label: 'No notifications/alerting subsystem', desc: 'No notifications/alerting subsystem', endpoint: '/gap-no-notifications-alerting-subsystem' },
  { kind: 'gap-non', slug: 'gap-non-no-search-endpoint', label: 'No search endpoint', desc: 'No search endpoint', endpoint: '/gap-no-search-endpoint' },
  { kind: 'gap-non', slug: 'gap-non-no-file-upload-module', label: 'No file-upload module', desc: 'No file-upload module', endpoint: '/gap-no-file-upload-module' },
  { kind: 'gap-non', slug: 'gap-non-limited-results-visualisation-endpoints-no-charting-payload', label: 'Limited results-visualisation endpoints (no charting payload', desc: 'Limited results-visualisation endpoints (no charting payloads beyond raw scores)', endpoint: '/gap-limited-results-visualisation-endpoints-no-charting-payload' },
  { kind: 'gap-non', slug: 'gap-non-no-action-planning-workflow-no-follow-up-task-model', label: 'No action-planning workflow (no follow-up task model)', desc: 'No action-planning workflow (no follow-up task model)', endpoint: '/gap-no-action-planning-workflow-no-follow-up-task-model' },
];

function authHeaders() {
  const t = (typeof window !== 'undefined') ? localStorage.getItem('token') : null;
  return { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) };
}

export default function Batch03Features() {
  const [active, setActive] = useState(FEATURES[0]?.slug);
  const [input, setInput] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const current = FEATURES.find(f => f.slug === active) || FEATURES[0];

  async function run() {
    if (!current) return;
    setLoading(true); setError(null);
    try {
      let parsed;
      try { parsed = input ? JSON.parse(input) : {}; } catch { parsed = { input }; }
      const r = await fetch(`${API_BASE}${current.endpoint}`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(parsed)
      });
      let body; try { body = await r.json(); } catch { body = { raw: await r.text() }; }
      if (!r.ok) setError(body.error || `HTTP ${r.status}`);
      setResults(prev => ({ ...prev, [current.slug]: body }));
    } catch (e) {
      setError(String(e.message || e));
    } finally { setLoading(false); }
  }

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ marginTop: 0 }}>Batch 03 Features <small style={{ color: '#64748b', fontWeight: 400 }}>(AIEmployeeSentimentAnalyzer)</small></h2>
      <p style={{ color: '#475569', maxWidth: 720 }}>
        Audit-driven AI counterparts, non-AI feature gaps, and custom feature suggestions.
        Backend endpoints prefixed <code>/api/cf-*</code> (custom features) and <code>/api/gap-*</code> (gap fills).
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '12px 0' }}>
        {FEATURES.map(f => (
          <button key={f.slug} onClick={() => setActive(f.slug)}
            style={{ padding: '6px 10px', borderRadius: 4, border: '1px solid #cbd5e1',
                     background: active === f.slug ? '#1e40af' : '#f8fafc',
                     color: active === f.slug ? 'white' : '#0f172a', cursor: 'pointer', fontSize: 12 }}>
            <span style={{ opacity: 0.7, marginRight: 4 }}>[{f.kind}]</span>{f.label}
          </button>
        ))}
      </div>
      {current && (
        <div style={{ marginTop: 16, padding: 16, background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
          <div style={{ marginBottom: 8 }}>
            <strong>{current.label}</strong>
            <div style={{ color: '#475569', fontSize: 13 }}>{current.desc}</div>
            <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>POST <code>{current.endpoint}</code></div>
          </div>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            placeholder='Optional JSON input (e.g. {"query":"..."})'
            style={{ width: '100%', minHeight: 80, padding: 8, fontFamily: 'monospace', fontSize: 12, border: '1px solid #cbd5e1', borderRadius: 4 }} />
          <div style={{ marginTop: 8 }}>
            <button onClick={run} disabled={loading}
              style={{ padding: '8px 16px', background: '#1e40af', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Running…' : 'Run'}
            </button>
          </div>
          {error && (<div style={{ marginTop: 12, padding: 10, background: '#fee2e2', color: '#991b1b', borderRadius: 4, fontSize: 13 }}>{error}</div>)}
          {results[current.slug] && (
            <pre style={{ marginTop: 12, padding: 10, background: '#0b1020', color: '#cbd5e1', borderRadius: 4, overflow: 'auto', maxHeight: 360, fontSize: 12 }}>
              {typeof results[current.slug] === 'string' ? results[current.slug] : JSON.stringify(results[current.slug], null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
