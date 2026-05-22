import { useEffect, useState } from 'react';
import api from '../api';

const COLORS = ['#8b5cf6', '#22d3ee', '#f59e0b', '#34d399', '#fb7185', '#facc15', '#06b6d4', '#a78bfa'];

export default function SentimentTrendChart() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [weeks, setWeeks] = useState(12);

  useEffect(() => {
    let alive = true;
    api.get('/custom-views/sentiment-trend', { params: { weeks } })
      .then((r) => { if (alive) setData(r.data); })
      .catch((e) => { if (alive) setError(e.response?.data?.error || e.message); });
    return () => { alive = false; };
  }, [weeks]);

  if (error) return <div style={{ padding: 12, color: '#fca5a5' }}>Error: {error}</div>;
  if (!data) return <div style={{ padding: 12, color: '#94a3b8' }}>Loading sentiment trend...</div>;

  const W = 720, H = 280, P = 36;
  const pts = data.trend || [];
  const xs = pts.length;
  const maxY = 10, minY = 0;
  const x = (i) => P + (i * (W - P * 2)) / Math.max(1, xs - 1);
  const y = (v) => H - P - ((v - minY) / (maxY - minY)) * (H - P * 2);

  const overallPath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p.overall).toFixed(1)}`).join(' ');
  const depts = data.departments || [];

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 style={{ margin: 0, color: '#e2e8f0' }}>Sentiment Trend (overall + per department)</h3>
        <select value={weeks} onChange={(e) => setWeeks(Number(e.target.value))} style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 6, padding: '4px 8px' }}>
          <option value={4}>4 weeks</option>
          <option value={8}>8 weeks</option>
          <option value={12}>12 weeks</option>
          <option value={26}>26 weeks</option>
        </select>
      </div>
      <div data-testid="sentiment-trend-summary" style={{ display: 'flex', gap: 16, marginBottom: 12, color: '#cbd5e1', fontSize: 13 }}>
        <div>Latest: <strong style={{ color: '#a7f3d0' }}>{data.summary?.latest}</strong></div>
        <div>First: <strong>{data.summary?.first}</strong></div>
        <div>Delta: <strong style={{ color: (data.summary?.delta ?? 0) >= 0 ? '#a7f3d0' : '#fca5a5' }}>{data.summary?.delta}</strong></div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
        {[0, 2.5, 5, 7.5, 10].map((g) => (
          <g key={g}>
            <line x1={P} x2={W - P} y1={y(g)} y2={y(g)} stroke="#1e293b" />
            <text x={6} y={y(g) + 4} fill="#64748b" fontSize="10">{g}</text>
          </g>
        ))}
        {depts.map((d, di) => {
          const path = pts.map((p, i) => {
            const v = p.perDepartment?.[d];
            if (v == null) return null;
            return `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`;
          }).filter(Boolean).join(' ');
          return <path key={d} d={path} fill="none" stroke={COLORS[di % COLORS.length]} strokeWidth={1.5} opacity={0.65} />;
        })}
        <path d={overallPath} fill="none" stroke="#e2e8f0" strokeWidth={2.5} />
        {pts.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.overall)} r={3} fill="#e2e8f0" />
        ))}
        {pts.map((p, i) => (
          (i === 0 || i === pts.length - 1 || i % Math.max(1, Math.floor(pts.length / 6)) === 0) &&
          <text key={`l${i}`} x={x(i)} y={H - 8} fill="#94a3b8" fontSize="9" textAnchor="middle">{p.week}</text>
        ))}
      </svg>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
        <span style={{ color: '#e2e8f0', fontSize: 12 }}>● Overall</span>
        {depts.map((d, di) => (
          <span key={d} style={{ color: COLORS[di % COLORS.length], fontSize: 12 }}>● {d}</span>
        ))}
      </div>
    </div>
  );
}
