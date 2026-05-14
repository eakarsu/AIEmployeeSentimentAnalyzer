import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import AIAnalysisDisplay from '../components/AIAnalysisDisplay';

// Calls POST /api/ai/sentiment-trend. Date range optional.
export default function SentimentTrendPage() {
  const navigate = useNavigate();
  const [metricType, setMetricType] = useState('engagement');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); setResult(null);
    setLoading(true);
    try {
      const body = { metric_type: metricType };
      if (start && end) body.date_range = { start, end };
      const res = await api.post('/ai/sentiment-trend', body);
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
          <h1>📈 Sentiment Trend</h1>
        </div>
      </div>
      <div className="data-table-container" style={{ padding: '24px' }}>
        <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
          Time-series trend analysis with inflection points, seasonality, and forecast for a chosen metric.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Metric type</label>
            <select value={metricType} onChange={(e) => setMetricType(e.target.value)}>
              <option value="surveys">Surveys</option>
              <option value="engagement">Engagement</option>
              <option value="pulse">Pulse</option>
              <option value="morale">Team Morale</option>
              <option value="culture">Culture Index</option>
            </select>
          </div>
          <div className="form-group">
            <label>Start date (optional)</label>
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div className="form-group">
            <label>End date (optional)</label>
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn-save" disabled={loading}>{loading ? 'Analyzing...' : '📊 Run Trend'}</button>
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
            <div style={{ marginBottom: '12px', color: '#94a3b8' }}>Metric: <strong>{result.metric_type}</strong></div>
            <AIAnalysisDisplay data={result.trend_analysis} />
          </div>
        )}
      </div>
    </div>
  );
}
