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
        const res = await api.get(f.apiPath);
        setCounts((prev) => ({ ...prev, [f.key]: res.data.length }));
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
