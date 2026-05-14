import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { departments } from '../features';
import AIAnalysisDisplay from '../components/AIAnalysisDisplay';

export default function ENPSImprovePage() {
  const navigate = useNavigate();
  const [department, setDepartment] = useState('');
  const [lookbackDays, setLookbackDays] = useState(90);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await api.post('/ai/eNPS-improve', {
        department: department || undefined,
        lookback_days: Number(lookbackDays) || 90,
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
          <h1>📊 eNPS Improvement</h1>
        </div>
      </div>

      <div className="data-table-container" style={{ padding: '24px' }}>
        <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
          Generate ranked improvement recommendations from recent engagement / eNPS-style scores.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Department (optional)</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="">All departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Lookback (days)</label>
            <input
              type="number"
              min={7}
              max={730}
              value={lookbackDays}
              onChange={(e) => setLookbackDays(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, marginRight: 8, display: 'inline-block' }} />
                  Analyzing...
                </>
              ) : '🤖 Generate Recommendations'}
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
              {result.department ? <> — Department: <strong>{result.department}</strong></> : null}
              {' '}— Lookback: <strong>{result.lookback_days}d</strong>
            </div>
            <AIAnalysisDisplay data={result.analysis} />
          </div>
        )}
      </div>
    </div>
  );
}
