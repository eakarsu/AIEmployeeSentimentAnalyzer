import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { departments } from '../features';
import AIAnalysisDisplay from '../components/AIAnalysisDisplay';

export default function SentimentAnalysisPage() {
  const navigate = useNavigate();
  const [textsBlob, setTextsBlob] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const texts = textsBlob
      .split(/\r?\n/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (texts.length === 0) {
      setError('Please enter at least one comment (one per line).');
      return;
    }
    if (texts.length > 200) {
      setError('Maximum 200 comments allowed per request.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/ai/sentiment-analysis', {
        texts,
        department: department || undefined,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Analysis failed');
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
          <h1>🧪 Sentiment Analysis</h1>
        </div>
      </div>

      <div className="data-table-container" style={{ padding: '24px' }}>
        <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
          Paste up to 200 employee comments (one per line) for AI-powered batch sentiment analysis.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Department (optional)</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">All departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Comments (one per line)</label>
            <textarea
              rows={10}
              value={textsBlob}
              onChange={(e) => setTextsBlob(e.target.value)}
              placeholder={'I love the new flexible hours.\nManagement does not listen to feedback.\nThe team energy has been great this quarter.'}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? (
                <>
                  <div
                    className="spinner"
                    style={{ width: 16, height: 16, borderWidth: 2, marginRight: 8, display: 'inline-block' }}
                  />
                  Analyzing...
                </>
              ) : (
                '🤖 Run Sentiment Analysis'
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
              Sample size: <strong>{result.sample_size}</strong>
              {result.department ? <> — Department: <strong>{result.department}</strong></> : null}
            </div>
            <AIAnalysisDisplay data={result.analysis} />
          </div>
        )}
      </div>
    </div>
  );
}
