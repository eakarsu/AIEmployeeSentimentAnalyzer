import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { departments } from '../features';
import AIAnalysisDisplay from '../components/AIAnalysisDisplay';

export default function RetentionPredictPage() {
  const navigate = useNavigate();
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!department) {
      setError('Department is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/ai/retention-predict', { department });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feature-page">
      <div className="feature-page-header">
        <div className="back-section">
          <button className="btn-back" onClick={() => navigate('/')}>
            ← Back
          </button>
          <h1>📉 Retention Prediction</h1>
        </div>
      </div>

      <div className="data-table-container" style={{ padding: '24px' }}>
        <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
          Predict 90-day churn risk for a department by combining retention, engagement,
          and pulse-check signals.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            >
              <option value="">Select...</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? (
                <>
                  <div
                    className="spinner"
                    style={{ width: 16, height: 16, borderWidth: 2, marginRight: 8, display: 'inline-block' }}
                  />
                  Predicting...
                </>
              ) : (
                '🔮 Predict Retention Risk'
              )}
            </button>
          </div>
        </form>

        {error && (
          <div
            className="ai-analysis-container"
            style={{ borderColor: 'rgba(239, 68, 68, 0.3)', marginTop: '20px' }}
          >
            <div className="ai-analysis-header">
              <div
                className="ai-icon"
                style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}
              >
                ⚠
              </div>
              Error
            </div>
            <div className="ai-section-content">{error}</div>
          </div>
        )}

        {result && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '12px', color: '#94a3b8' }}>
              Department: <strong>{result.department}</strong>
            </div>
            <AIAnalysisDisplay data={result.predictions} />
          </div>
        )}
      </div>
    </div>
  );
}
