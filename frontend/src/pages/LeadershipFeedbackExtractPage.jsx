import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { departments } from '../features';
import AIAnalysisDisplay from '../components/AIAnalysisDisplay';

export default function LeadershipFeedbackExtractPage() {
  const navigate = useNavigate();
  const [leaderName, setLeaderName] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await api.post('/ai/leadership-feedback-extract', {
        leader_name: leaderName || undefined,
        department: department || undefined,
      });
      setResult(res.data);
    } catch (err) {
      if (err.response?.status === 503) {
        setError(err.response.data?.error || 'AI service unavailable.');
      } else {
        setError(err.response?.data?.error || err.message || 'Request failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feature-page">
      <div className="feature-page-header">
        <div className="back-section">
          <button className="btn-back" onClick={() => navigate('/')}>← Back</button>
          <h1>👔 Leadership Feedback Extract</h1>
        </div>
      </div>

      <div className="data-table-container" style={{ padding: '24px' }}>
        <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
          Summarize leadership_ratings into per-leader themes, strengths, and development areas.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Leader Name (optional)</label>
            <input
              type="text"
              value={leaderName}
              onChange={(e) => setLeaderName(e.target.value)}
              placeholder="e.g. Jane Doe"
            />
          </div>

          <div className="form-group">
            <label>Department (optional)</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="">All departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, marginRight: 8, display: 'inline-block' }} />
                  Extracting...
                </>
              ) : '🤖 Extract Themes'}
            </button>
          </div>
        </form>

        {error && (
          <div className="ai-analysis-container" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', marginTop: '20px' }}>
            <div className="ai-analysis-header">
              <div className="ai-icon" style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}>⚠</div>
              Error
            </div>
            <div className="ai-section-content">{error}</div>
          </div>
        )}

        {result && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '12px', color: '#94a3b8' }}>
              Sample size: <strong>{result.sample_size}</strong>
              {result.leader_name ? <> — Leader: <strong>{result.leader_name}</strong></> : null}
              {result.department ? <> — Department: <strong>{result.department}</strong></> : null}
            </div>
            <AIAnalysisDisplay data={result.analysis} />
          </div>
        )}
      </div>
    </div>
  );
}
