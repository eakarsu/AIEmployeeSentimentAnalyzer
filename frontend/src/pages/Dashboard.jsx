import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { features } from '../features';

export default function Dashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    features.forEach(async (f) => {
      try {
        const res = await api.get(f.apiPath, { params: { page: 1, limit: 1 } });
        // Handle paginated {data, pagination} response - prefer total, fallback to length
        const total = res.data?.pagination?.total ?? (Array.isArray(res.data) ? res.data.length : (res.data?.data?.length ?? 0));
        setCounts((prev) => ({ ...prev, [f.key]: total }));
      } catch {
        setCounts((prev) => ({ ...prev, [f.key]: 0 }));
      }
    });
  }, []);

  const totalItems = Object.values(counts).reduce((a, b) => a + b, 0);
  const activeFeatures = features.filter((f) => (counts[f.key] || 0) > 0).length;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>AI-powered employee sentiment analytics platform</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-label">Total Records</div>
          <div className="stat-value">{totalItems}</div>
          <div className="stat-change positive">Across all modules</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Modules</div>
          <div className="stat-value">{activeFeatures}</div>
          <div className="stat-change positive">of {features.length} total</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Departments</div>
          <div className="stat-value">10</div>
          <div className="stat-change positive">All monitored</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">AI Models</div>
          <div className="stat-value">1</div>
          <div className="stat-change positive">Claude Haiku 4.5</div>
        </div>
      </div>

      <div className="dashboard-header" style={{ marginTop: 24 }}>
        <h2>AI Tools</h2>
      </div>
      <div className="features-grid">
        <div
          className="feature-card"
          style={{ '--card-color': '#8b5cf6' }}
          onClick={() => navigate('/ai/sentiment-analysis')}
        >
          <div className="card-icon" style={{ background: '#8b5cf620' }}>🧪</div>
          <h3>Sentiment Analysis</h3>
          <p>Batch sentiment analysis on free-text employee comments.</p>
          <div className="card-count">AI endpoint</div>
        </div>
        <div
          className="feature-card"
          style={{ '--card-color': '#f59e0b' }}
          onClick={() => navigate('/ai/retention-predict')}
        >
          <div className="card-icon" style={{ background: '#f59e0b20' }}>📉</div>
          <h3>Retention Prediction</h3>
          <p>Predict 90-day churn risk for a department.</p>
          <div className="card-count">AI endpoint</div>
        </div>
        <div
          className="feature-card"
          style={{ '--card-color': '#22d3ee' }}
          onClick={() => navigate('/ai/enps-improve')}
        >
          <div className="card-icon" style={{ background: '#22d3ee20' }}>📊</div>
          <h3>eNPS Improvement</h3>
          <p>Ranked actions to lift engagement / eNPS scores.</p>
          <div className="card-count">AI endpoint</div>
        </div>
        <div
          className="feature-card"
          style={{ '--card-color': '#a78bfa' }}
          onClick={() => navigate('/ai/leadership-feedback-extract')}
        >
          <div className="card-icon" style={{ background: '#a78bfa20' }}>👔</div>
          <h3>Leadership Feedback Extract</h3>
          <p>Per-leader theme and development summary.</p>
          <div className="card-count">AI endpoint</div>
        </div>
        <div
          className="feature-card"
          style={{ '--card-color': '#34d399' }}
          onClick={() => navigate('/ai/culture-health-score')}
        >
          <div className="card-icon" style={{ background: '#34d39920' }}>🏛️</div>
          <h3>Culture Health Score</h3>
          <p>Composite culture metric with pillar breakdown.</p>
          <div className="card-count">AI endpoint</div>
        </div>
        <div
          className="feature-card"
          style={{ '--card-color': '#06b6d4' }}
          onClick={() => navigate('/ai/cross-module-correlation')}
        >
          <div className="card-icon" style={{ background: '#06b6d420' }}>🔗</div>
          <h3>Cross-Module Correlation</h3>
          <p>Composite at-risk score across retention, engagement, pulse, exit data.</p>
          <div className="card-count">AI endpoint</div>
        </div>
        <div
          className="feature-card"
          style={{ '--card-color': '#fb7185' }}
          onClick={() => navigate('/ai/sentiment-trend')}
        >
          <div className="card-icon" style={{ background: '#fb718520' }}>📈</div>
          <h3>Sentiment Trend</h3>
          <p>Time-series trends with inflection points and forecasts.</p>
          <div className="card-count">AI endpoint</div>
        </div>
        <div
          className="feature-card"
          style={{ '--card-color': '#facc15' }}
          onClick={() => navigate('/ai/intervention-planner')}
        >
          <div className="card-icon" style={{ background: '#facc1520' }}>🛠️</div>
          <h3>Intervention Planner</h3>
          <p>Actionable HR plans with timelines and success metrics.</p>
          <div className="card-count">AI endpoint</div>
        </div>
      </div>

      <div className="dashboard-header" style={{ marginTop: 24 }}>
        <h2>Modules</h2>
      </div>
      <div className="features-grid">
        {features.map((f) => (
          <div
            key={f.key}
            className="feature-card"
            style={{ '--card-color': f.color }}
            onClick={() => navigate(`/feature/${f.key}`)}
          >
            <div className="card-icon" style={{ background: `${f.color}20` }}>
              {f.icon}
            </div>
            <h3>{f.title}</h3>
            <p>{f.description}</p>
            <div className="card-count">
              {counts[f.key] !== undefined ? counts[f.key] : '...'} records
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
