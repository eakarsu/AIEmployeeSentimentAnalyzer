import { useEffect, useState } from 'react'

export default function RetaliationRiskSentinel() {
  const [data, setData] = useState(null)
  useEffect(() => { fetch('/api/retaliation-risk-sentinel').then(r => r.json()).then(setData).catch(() => setData(null)) }, [])
  return <div><h1>Retaliation Risk Sentinel</h1><p>Monitor anonymous report follow-up signals for retaliation risk.</p><div className="stats-grid">{data && Object.entries(data.summary).map(([k,v]) => <div className="stat-card" key={k}><span>{k.replaceAll('_',' ')}</span><strong>{v}</strong></div>)}</div><div className="card">{(data?.cases || []).map(c => <div key={c.case_id} style={{padding:12,borderBottom:'1px solid #e5e7eb'}}><strong>{c.case_id}</strong><div>{c.team} - {c.signal} - {c.risk} - {c.action}</div></div>)}</div></div>
}
