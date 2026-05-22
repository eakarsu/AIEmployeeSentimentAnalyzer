import { useEffect, useState } from 'react';
import api from '../api';

export default function HRSentimentReport() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('last_30_days');

  const load = (p = period) => {
    setReport(null);
    api.get('/custom-views/hr-report', { params: { period: p } })
      .then((r) => setReport(r.data))
      .catch((e) => setError(e.response?.data?.error || e.message));
  };

  useEffect(() => { load(period); /* eslint-disable-next-line */ }, [period]);

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w || !report) return;
    w.document.write(`<html><head><title>${report.title}</title>
      <style>body{font-family:system-ui;padding:32px;color:#0f172a}h1{margin:0}h2{margin-top:24px;border-bottom:1px solid #ccc;padding-bottom:4px}
      .meta{color:#64748b;font-size:13px;margin-bottom:16px}.item{padding:6px 0;border-bottom:1px dashed #e2e8f0}.label{display:inline-block;width:240px;color:#475569}</style></head><body>`);
    w.document.write(`<h1>${report.title}</h1><div class="meta">Period: ${report.period} • Generated: ${report.generatedAt}</div>`);
    w.document.write(`<p>${report.executiveSummary}</p>`);
    report.sections.forEach((s) => {
      w.document.write(`<h2>${s.heading}</h2>`);
      s.items.forEach((it) => {
        w.document.write(`<div class="item"><span class="label">${it.label}</span> ${it.value}</div>`);
      });
    });
    w.document.write(`</body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 250);
  };

  if (error) return <div style={{ padding: 12, color: '#fca5a5' }}>Error: {error}</div>;
  if (!report) return <div style={{ padding: 12, color: '#94a3b8' }}>Loading report...</div>;

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, color: '#e2e8f0' }}>{report.title}</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 6, padding: '4px 8px' }}>
            <option value="last_30_days">Last 30 days</option>
            <option value="last_quarter">Last quarter</option>
            <option value="ytd">YTD</option>
          </select>
          <button data-testid="hr-report-print" onClick={handlePrint} style={{ background: '#8b5cf6', color: 'white', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}>Print / Save as PDF</button>
        </div>
      </div>
      <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 12 }}>Period: {report.period} • Generated: {report.generatedAt}</div>
      <p style={{ color: '#cbd5e1', lineHeight: 1.6 }}>{report.executiveSummary}</p>
      {report.sections.map((s) => (
        <div key={s.heading} style={{ marginTop: 16 }}>
          <h4 style={{ color: '#e2e8f0', margin: '0 0 8px', borderBottom: '1px solid #334155', paddingBottom: 4 }}>{s.heading}</h4>
          {s.items.map((it, i) => (
            <div key={i} style={{ display: 'flex', padding: '6px 0', borderBottom: '1px dashed #1e293b' }}>
              <div style={{ width: 220, color: '#94a3b8' }}>{it.label}</div>
              <div style={{ color: '#e2e8f0', flex: 1 }}>{it.value}</div>
            </div>
          ))}
        </div>
      ))}
      <div style={{ marginTop: 12, color: '#64748b', fontSize: 11 }}>Filename: {report.filename}</div>
    </div>
  );
}
