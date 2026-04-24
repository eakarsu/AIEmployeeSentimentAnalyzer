export default function AIAnalysisDisplay({ data }) {
  if (!data) return null;

  if (data.error) {
    return (
      <div className="ai-analysis-container" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
        <div className="ai-analysis-header">
          <div className="ai-icon" style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}>⚠</div>
          AI Analysis Unavailable
        </div>
        <div className="ai-section-content">{data.analysis || 'An error occurred during analysis.'}</div>
      </div>
    );
  }

  const renderValue = (key, value) => {
    if (value === null || value === undefined) return null;

    const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    if (Array.isArray(value)) {
      return (
        <div key={key} className="ai-section">
          <div className="ai-section-title">{label}</div>
          {value.length > 0 && typeof value[0] === 'object' ? (
            <ul className="ai-list">
              {value.map((item, i) => (
                <li key={i}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</li>
              ))}
            </ul>
          ) : (
            <div className="ai-tags">
              {value.map((item, i) => (
                <span key={i} className="ai-tag">{String(item)}</span>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (typeof value === 'object') {
      return (
        <div key={key} className="ai-section">
          <div className="ai-section-title">{label}</div>
          {Object.entries(value).map(([k, v]) => renderValue(k, v))}
        </div>
      );
    }

    if (typeof value === 'number' && (key.includes('score') || key.includes('probability'))) {
      const pct = value <= 1 ? value * 100 : value;
      const level = pct >= 70 ? 'high' : pct >= 40 ? 'medium' : 'low';
      return (
        <div key={key} className="ai-section">
          <div className="ai-section-title">{label}</div>
          <div className="ai-score-display">
            <div className={`ai-score-circle ${level}`}>{value <= 1 ? (value * 100).toFixed(0) : value.toFixed(1)}%</div>
            <div className="ai-section-content" style={{ textTransform: 'capitalize' }}>{level} level</div>
          </div>
        </div>
      );
    }

    if (key.includes('risk') || key.includes('level') || key.includes('assessment') || key.includes('urgency')) {
      const lowerVal = String(value).toLowerCase();
      let badgeClass = 'badge-info';
      if (lowerVal.includes('critical') || lowerVal.includes('high')) badgeClass = 'badge-negative';
      else if (lowerVal.includes('medium') || lowerVal.includes('moderate')) badgeClass = 'badge-neutral';
      else if (lowerVal.includes('low') || lowerVal.includes('good') || lowerVal.includes('positive') || lowerVal.includes('excellent')) badgeClass = 'badge-positive';

      return (
        <div key={key} className="ai-section">
          <div className="ai-section-title">{label}</div>
          <span className={`badge ${badgeClass}`} style={{ fontSize: '14px', padding: '6px 14px' }}>{String(value)}</span>
        </div>
      );
    }

    return (
      <div key={key} className="ai-section">
        <div className="ai-section-title">{label}</div>
        <div className="ai-section-content">{String(value)}</div>
      </div>
    );
  };

  return (
    <div className="ai-analysis-container">
      <div className="ai-analysis-header">
        <div className="ai-icon">🤖</div>
        AI Analysis Results
      </div>
      {typeof data === 'string' ? (
        <div className="ai-section-content">{data}</div>
      ) : (
        Object.entries(data).map(([key, value]) => renderValue(key, value))
      )}
    </div>
  );
}
