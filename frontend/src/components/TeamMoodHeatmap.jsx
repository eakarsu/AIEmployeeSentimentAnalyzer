import { useEffect, useState } from 'react';
import api from '../api';

function color(v) {
  // 1 (red) -> 5 (yellow) -> 10 (green)
  const t = Math.max(0, Math.min(1, (v - 1) / 9));
  const r = Math.round(239 * (1 - t) + 34 * t);
  const g = Math.round(68 * (1 - t) + 197 * t);
  const b = Math.round(68 * (1 - t) + 94 * t);
  return `rgb(${r},${g},${b})`;
}

export default function TeamMoodHeatmap() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [weeks, setWeeks] = useState(8);

  useEffect(() => {
    let alive = true;
    api.get('/custom-views/mood-heatmap', { params: { weeks } })
      .then((r) => { if (alive) setData(r.data); })
      .catch((e) => { if (alive) setError(e.response?.data?.error || e.message); });
    return () => { alive = false; };
  }, [weeks]);

  if (error) return <div style={{ padding: 12, color: '#fca5a5' }}>Error: {error}</div>;
  if (!data) return <div style={{ padding: 12, color: '#94a3b8' }}>Loading heatmap...</div>;

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, color: '#e2e8f0' }}>Team Mood Heatmap (team x week)</h3>
        <select value={weeks} onChange={(e) => setWeeks(Number(e.target.value))} style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 6, padding: '4px 8px' }}>
          <option value={4}>4 weeks</option>
          <option value={8}>8 weeks</option>
          <option value={12}>12 weeks</option>
          <option value={16}>16 weeks</option>
        </select>
      </div>
      <div data-testid="heatmap-grid" style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 3, color: '#e2e8f0', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', color: '#94a3b8', padding: '4px 8px' }}>Team</th>
              {data.weeks.map((w) => (
                <th key={w} style={{ color: '#94a3b8', padding: '4px 4px', fontWeight: 500, fontSize: 10 }}>{w.slice(5)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.matrix.map((row) => (
              <tr key={row.team}>
                <td style={{ padding: '4px 8px', color: '#cbd5e1' }}>{row.team}</td>
                {row.cells.map((v, ci) => (
                  <td key={ci} title={`${row.team} ${data.weeks[ci]}: ${v}`} style={{ background: color(v), width: 36, height: 22, textAlign: 'center', borderRadius: 4, color: '#0f172a', fontWeight: 600, fontSize: 11 }}>{v.toFixed(1)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, color: '#94a3b8', fontSize: 12 }}>
        <span>Low</span>
        <span style={{ display: 'inline-block', width: 200, height: 10, borderRadius: 5, background: 'linear-gradient(to right, rgb(239,68,68), rgb(250,204,21), rgb(34,197,94))' }} />
        <span>High</span>
        <span style={{ marginLeft: 16 }}>{data.legend?.label}</span>
      </div>
    </div>
  );
}
