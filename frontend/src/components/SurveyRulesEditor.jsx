import { useEffect, useState } from 'react';
import api from '../api';

const CADENCES = ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly'];

export default function SurveyRulesEditor() {
  const [rules, setRules] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', cadence: 'weekly', questions: '', audience: 'all_departments', active: true });
  const [editingId, setEditingId] = useState(null);

  const load = () => {
    api.get('/custom-views/survey-rules')
      .then((r) => setRules(r.data.rules || []))
      .catch((e) => setError(e.response?.data?.error || e.message));
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ name: '', cadence: 'weekly', questions: '', audience: 'all_departments', active: true });
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      name: form.name,
      cadence: form.cadence,
      questions: form.questions.split('\n').map((q) => q.trim()).filter(Boolean),
      audience: form.audience,
      active: form.active
    };
    try {
      if (editingId) {
        await api.put(`/custom-views/survey-rules/${editingId}`, payload);
      } else {
        await api.post('/custom-views/survey-rules', payload);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const edit = (r) => {
    setEditingId(r.id);
    setForm({
      name: r.name,
      cadence: r.cadence,
      questions: (r.questions || []).join('\n'),
      audience: r.audience || 'all_departments',
      active: !!r.active
    });
  };

  const remove = async (id) => {
    if (!confirm('Delete this rule?')) return;
    try {
      await api.delete(`/custom-views/survey-rules/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 }}>
      <h3 style={{ margin: '0 0 12px', color: '#e2e8f0' }}>Survey Rules Editor</h3>
      {error && <div style={{ background: '#7f1d1d', color: '#fecaca', padding: 8, borderRadius: 6, marginBottom: 12 }}>{error}</div>}

      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16, padding: 12, background: '#1e293b', borderRadius: 8 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Survey Name</label>
          <input data-testid="rule-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Cadence</label>
          <select value={form.cadence} onChange={(e) => setForm({ ...form, cadence: e.target.value })} style={inputStyle}>
            {CADENCES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Audience</label>
          <input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} style={inputStyle} placeholder="all_departments or dept,dept" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Questions (one per line)</label>
          <textarea value={form.questions} onChange={(e) => setForm({ ...form, questions: e.target.value })} rows={4} style={{ ...inputStyle, fontFamily: 'inherit' }} />
        </div>
        <div>
          <label style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            Active
          </label>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {editingId && <button type="button" onClick={resetForm} style={btnSecondary}>Cancel</button>}
          <button data-testid="rule-submit" type="submit" style={btnPrimary}>{editingId ? 'Update Rule' : 'Add Rule'}</button>
        </div>
      </form>

      <div data-testid="rules-list">
        {rules.length === 0 && <div style={{ color: '#94a3b8', fontSize: 13 }}>No rules yet.</div>}
        {rules.map((r) => (
          <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: 12, borderBottom: '1px solid #1e293b' }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#e2e8f0', fontWeight: 600 }}>
                {r.name} <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: 12 }}>• {r.cadence} • {r.audience}</span>
                {r.active ? <span style={{ marginLeft: 8, background: '#065f46', color: '#a7f3d0', padding: '2px 6px', borderRadius: 4, fontSize: 10 }}>ACTIVE</span>
                          : <span style={{ marginLeft: 8, background: '#374151', color: '#9ca3af', padding: '2px 6px', borderRadius: 4, fontSize: 10 }}>PAUSED</span>}
              </div>
              <ul style={{ margin: '6px 0 0 16px', color: '#cbd5e1', fontSize: 13 }}>
                {(r.questions || []).map((q, i) => <li key={i}>{q}</li>)}
              </ul>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => edit(r)} style={btnSecondary}>Edit</button>
              <button onClick={() => remove(r.id)} style={btnDanger}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '6px 10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', fontSize: 13 };
const btnPrimary = { background: '#8b5cf6', color: 'white', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' };
const btnSecondary = { background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' };
const btnDanger = { background: '#7f1d1d', color: '#fecaca', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' };
