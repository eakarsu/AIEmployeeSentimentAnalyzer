import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { departments } from '../features';
import AIAnalysisDisplay from '../components/AIAnalysisDisplay';

// Calls POST /api/ai/intervention-planner. Issues are entered one per line.
export default function InterventionPlannerPage() {
  const navigate = useNavigate();
  const [department, setDepartment] = useState('');
  const [issuesBlob, setIssuesBlob] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); setResult(null);
    if (!department) { setError('Department is required.'); return; }
    const issues = issuesBlob.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    if (issues.length === 0) { setError('Enter at least one identified issue (one per line).'); return; }
    setLoading(true);
    try {
      const res = await api.post('/ai/intervention-planner', { department, identified_issues: issues });
      setResult(res.data);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error || err.message || 'Request failed';
      setError(status === 503 ? `AI unavailable (503): ${msg}` : msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="feature-page">
      <div className="feature-page-header">
        <div className="back-section">
          <button className="btn-back" onClick={() => navigate('/')}>← Back</button>
          <h1>🛠️ Intervention Planner</h1>
        </div>
      </div>
      <div className="data-table-container" style={{ padding: '24px' }}>
        <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
          Build an actionable HR intervention plan with timeline, owners, and success metrics for identified issues.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Department</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} required>
              <option value="">Select...</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Identified issues (one per line)</label>
            <textarea rows={6} value={issuesBlob} onChange={(e) => setIssuesBlob(e.target.value)} placeholder={'Low manager 1:1 frequency\nHigh attrition in mid-tenure cohort'} required />
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn-save" disabled={loading}>{loading ? 'Planning...' : '🧭 Generate Plan'}</button>
          </div>
        </form>
        {error && (
          <div className="ai-analysis-container" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', marginTop: '20px' }}>
            <div className="ai-analysis-header"><div className="ai-icon" style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}>⚠</div>Error</div>
            <div className="ai-section-content">{error}</div>
          </div>
        )}
        {result && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '12px', color: '#94a3b8' }}>Department: <strong>{result.department}</strong></div>
            <AIAnalysisDisplay data={result.intervention_plan} />
          </div>
        )}
      </div>
    </div>
  );
}
