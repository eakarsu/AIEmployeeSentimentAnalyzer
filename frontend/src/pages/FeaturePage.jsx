import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { features, departments } from '../features';
import AIAnalysisDisplay from '../components/AIAnalysisDisplay';

export default function FeaturePage() {
  const { featureKey } = useParams();
  const navigate = useNavigate();
  const feature = features.find((f) => f.key === featureKey);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (feature) loadItems();
  }, [featureKey]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await api.get(feature.apiPath, { params: { page: 1, limit: 100 } });
      // Handle paginated {data, pagination} or plain array
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setItems(list);
    } catch (err) {
      console.error('Error loading items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`${feature.apiPath}/${id}`);
      setSelectedItem(null);
      loadItems();
    } catch (err) {
      alert('Error deleting item');
    }
  };

  const handleAnalyze = async (id) => {
    setAnalyzing(true);
    try {
      const res = await api.post(`${feature.apiPath}/${id}/analyze`);
      setSelectedItem(res.data);
      loadItems();
    } catch (err) {
      alert('Error analyzing item');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async (data) => {
    try {
      if (editItem) {
        await api.put(`${feature.apiPath}/${editItem.id}`, data);
      } else {
        await api.post(feature.apiPath, data);
      }
      setShowForm(false);
      setEditItem(null);
      loadItems();
    } catch (err) {
      alert('Error saving item: ' + (err.response?.data?.error || err.message));
    }
  };

  const openEdit = () => {
    setEditItem(selectedItem);
    setShowForm(true);
    setSelectedItem(null);
  };

  if (!feature) return <div className="loading">Feature not found</div>;

  const formatValue = (val, col) => {
    if (val === null || val === undefined) return '-';
    if (col === 'preventable') return val ? 'Yes' : 'No';
    if (col.includes('date')) return new Date(val).toLocaleDateString();
    if (col.includes('score') || col.includes('sentiment') || col === 'avg_sentiment') {
      const num = parseFloat(val);
      return (
        <span>
          {num.toFixed(2)}
          <span className="score-bar">
            <span
              className={`score-bar-fill ${num >= 0.7 || num >= 7 ? 'high' : num >= 0.4 || num >= 4 ? 'medium' : 'low'}`}
              style={{ width: `${col.includes('sentiment') || col === 'avg_sentiment' || col === 'risk_score' ? num * 100 : num * 10}%` }}
            />
          </span>
        </span>
      );
    }
    if (col === 'severity') return <span className={`badge badge-${val.toLowerCase()}`}>{val}</span>;
    if (col === 'status') return <span className={`badge badge-${val.toLowerCase().replace(/\s/g, '-')}`}>{val}</span>;
    if (col === 'sentiment_label') {
      const cls = val === 'Positive' ? 'positive' : val === 'Negative' ? 'negative' : 'neutral';
      return <span className={`badge badge-${cls}`}>{val}</span>;
    }
    if (col === 'trend') {
      const cls = val === 'Improving' ? 'positive' : val === 'Declining' ? 'negative' : 'neutral';
      return <span className={`badge badge-${cls}`}>{val}</span>;
    }
    if (col === 'category' && feature.key === 'engagement-scores') {
      const cls = val.includes('Highly') ? 'positive' : val.includes('Disengaged') ? 'negative' : 'neutral';
      return <span className={`badge badge-${cls}`}>{val}</span>;
    }
    const str = String(val);
    return str.length > 60 ? str.slice(0, 60) + '...' : str;
  };

  return (
    <div className="feature-page">
      <div className="feature-page-header">
        <div className="back-section">
          <button className="btn-back" onClick={() => navigate('/')}>
            ← Back
          </button>
          <h1>{feature.icon} {feature.title}</h1>
        </div>
        <button className="btn-new" onClick={() => { setEditItem(null); setShowForm(true); }}>
          + New {feature.title.replace(/s$/, '')}
        </button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /> Loading...</div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                {feature.columns.map((col) => (
                  <th key={col}>{feature.columnLabels[col] || col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={feature.columns.length} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No records found. Click "New" to add one.</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} onClick={() => setSelectedItem(item)}>
                    {feature.columns.map((col) => (
                      <td key={col}>{formatValue(item[col], col)}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedItem && (
        <DetailPanel
          item={selectedItem}
          feature={feature}
          onClose={() => setSelectedItem(null)}
          onEdit={openEdit}
          onDelete={() => handleDelete(selectedItem.id)}
          onAnalyze={() => handleAnalyze(selectedItem.id)}
          analyzing={analyzing}
        />
      )}

      {showForm && (
        <FormModal
          feature={feature}
          item={editItem}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditItem(null); }}
        />
      )}
    </div>
  );
}

function DetailPanel({ item, feature, onClose, onEdit, onDelete, onAnalyze, analyzing }) {
  const aiData = item[feature.aiField];
  let parsedAI = null;
  if (aiData) {
    if (typeof aiData === 'string') {
      try { parsedAI = JSON.parse(aiData); } catch { parsedAI = { analysis: aiData }; }
    } else {
      parsedAI = aiData;
    }
  }

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
        <div className="detail-header">
          <h2>{feature.icon} Details</h2>
          <button className="detail-close" onClick={onClose}>×</button>
        </div>
        <div className="detail-body">
          {Object.entries(item).filter(([k]) => k !== 'id' && k !== 'created_at' && k !== feature.aiField).map(([key, val]) => (
            <div key={key} className="detail-field">
              <label>{key.replace(/_/g, ' ')}</label>
              <div className="value">
                {val === null || val === undefined ? '-' :
                  key.includes('date') ? new Date(val).toLocaleDateString() :
                  typeof val === 'boolean' ? (val ? 'Yes' : 'No') :
                  String(val)}
              </div>
            </div>
          ))}

          {parsedAI && <AIAnalysisDisplay data={parsedAI} />}
        </div>
        <div className="detail-actions">
          <button className="btn-analyze" onClick={onAnalyze} disabled={analyzing}>
            {analyzing ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, marginRight: 0 }} /> Analyzing...</> : '🤖 AI Analyze'}
          </button>
          <button className="btn-edit" onClick={onEdit}>Edit</button>
          <button className="btn-delete" onClick={onDelete}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function FormModal({ feature, item, onSave, onClose }) {
  const [formData, setFormData] = useState(() => {
    if (item) {
      const data = { ...item };
      feature.fields.forEach((f) => {
        if (f.type === 'date' && data[f.name]) {
          data[f.name] = new Date(data[f.name]).toISOString().split('T')[0];
        }
      });
      return data;
    }
    const data = {};
    feature.fields.forEach((f) => { data[f.name] = ''; });
    return data;
  });

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{item ? 'Edit' : 'New'} {feature.title.replace(/s$/, '')}</h2>
        <form onSubmit={handleSubmit}>
          {feature.fields.map((field) => (
            <div key={field.name} className="form-group">
              <label>{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                />
              ) : field.type === 'select' ? (
                <select
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                >
                  <option value="">Select...</option>
                  {field.name === 'department'
                    ? departments.map((d) => <option key={d} value={d}>{d}</option>)
                    : (field.options || []).map((o) => <option key={o} value={o}>{o}</option>)
                  }
                </select>
              ) : (
                <input
                  type={field.type}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  step={field.step}
                  min={field.min}
                  max={field.max}
                />
              )}
            </div>
          ))}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save">{item ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
