import Batch03Features from './pages/Batch03Features';
import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import FeaturePage from './pages/FeaturePage'
import SentimentAnalysisPage from './pages/SentimentAnalysisPage'
import RetentionPredictPage from './pages/RetentionPredictPage'
import ENPSImprovePage from './pages/ENPSImprovePage'
import LeadershipFeedbackExtractPage from './pages/LeadershipFeedbackExtractPage'
import CultureHealthScorePage from './pages/CultureHealthScorePage'
import CrossModuleCorrelationPage from './pages/CrossModuleCorrelationPage'
import SentimentTrendPage from './pages/SentimentTrendPage'
import InterventionPlannerPage from './pages/InterventionPlannerPage'
import CustomViewsPage from './pages/CustomViewsPage'

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
          <Route path="/batch03" element={<Batch03Features />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/feature/:featureKey" element={<FeaturePage />} />
        <Route path="/ai/sentiment-analysis" element={<SentimentAnalysisPage />} />
        <Route path="/ai/retention-predict" element={<RetentionPredictPage />} />
        <Route path="/ai/enps-improve" element={<ENPSImprovePage />} />
        <Route path="/ai/leadership-feedback-extract" element={<LeadershipFeedbackExtractPage />} />
        <Route path="/ai/culture-health-score" element={<CultureHealthScorePage />} />
        <Route path="/ai/cross-module-correlation" element={<CrossModuleCorrelationPage />} />
        <Route path="/ai/sentiment-trend" element={<SentimentTrendPage />} />
        <Route path="/ai/intervention-planner" element={<InterventionPlannerPage />} />
        <Route path="/custom-views" element={<CustomViewsPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <div className="logo-icon">🧠</div>
        <span>SentimentAI</span>
      </div>
      <div className="navbar-user">
        <a
          data-testid="sidebar-sentiment-views"
          onClick={() => navigate('/custom-views')}
          style={{ cursor: 'pointer', color: '#a78bfa', fontWeight: 600, marginRight: 16 }}
        >
          Sentiment Views
        </a>
        <span>{user.name} ({user.role})</span>
        <button className="btn-logout" onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default App
