import React from 'react';
import JsonReport from './JsonReport';

const isPrimitive = (value) => value === null || value === undefined || ['string', 'number', 'boolean'].includes(typeof value);

function labelFor(key) {
  return String(key)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function normalize(data) {
  if (typeof data !== 'string') return data;
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}

function primitiveText(value) {
  if (value === null || value === undefined || value === '') return 'Not provided';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

function statusClass(key, value) {
  if (!/(risk|level|assessment|urgency|priority|sentiment|status)/i.test(key)) return '';
  const text = String(value).toLowerCase();
  if (/(critical|high|negative|blocked|failed|urgent)/.test(text)) return ' badge-negative';
  if (/(medium|moderate|neutral|pending|review)/.test(text)) return ' badge-neutral';
  if (/(low|good|positive|excellent|complete|ready|success)/.test(text)) return ' badge-positive';
  return ' badge-info';
}

function PrimitiveValue({ fieldKey, value }) {
  const badge = statusClass(fieldKey, value);
  return <span className={badge ? `badge${badge}` : 'ai-value'}>{primitiveText(value)}</span>;
}

function ObjectGrid({ value, path }) {
  const entries = Object.entries(value);
  if (!entries.length) return <p className="ai-empty">No details returned.</p>;
  return (
    <div className="ai-result-grid">
      {entries.map(([key, child]) => (
        <section className="ai-result-card" key={`${path}.${key}`}>
          <h4>{labelFor(key)}</h4>
          <NodeValue value={child} fieldKey={key} path={`${path}.${key}`} />
        </section>
      ))}
    </div>
  );
}

function ObjectTable({ rows, path }) {
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  return (
    <div className="ai-table-wrap">
      <table className="ai-result-table">
        <thead><tr>{columns.map((column) => <th key={column}>{labelFor(column)}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${path}.${rowIndex}`}>
              {columns.map((column) => <td key={column}><PrimitiveValue fieldKey={column} value={row[column]} /></td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ArrayValue({ value, path }) {
  if (!value.length) return <p className="ai-empty">No items returned.</p>;
  if (value.every(isPrimitive)) {
    return <ul className="ai-list">{value.map((item, index) => <li key={`${path}.${index}`}><PrimitiveValue fieldKey="item" value={item} /></li>)}</ul>;
  }
  const tabular = value.every((item) => item && !Array.isArray(item) && typeof item === 'object' && Object.values(item).every(isPrimitive));
  if (tabular) return <ObjectTable rows={value} path={path} />;
  return (
    <div className="ai-card-list">
      {value.map((item, index) => (
        <section className="ai-result-card" key={`${path}.${index}`}>
          <h4>Item {index + 1}</h4>
          <NodeValue value={item} fieldKey={`item_${index + 1}`} path={`${path}.${index}`} />
        </section>
      ))}
    </div>
  );
}

function NodeValue({ value, fieldKey, path }) {
  if (Array.isArray(value)) return <ArrayValue value={value} path={path} />;
  if (value && typeof value === 'object') return <ObjectGrid value={value} path={path} />;
  return <PrimitiveValue fieldKey={fieldKey} value={value} />;
}

export default function AIAnalysisDisplay({ data, title = 'AI Analysis Results' }) {
  if (data === null || data === undefined || data === '') return null;
  const value = normalize(data);
  const hasError = value && typeof value === 'object' && !Array.isArray(value) && value.error;

  return (
    <section className={`ai-analysis-container${hasError ? ' ai-analysis-error' : ''}`} aria-label={title}>
      <div className="ai-analysis-header">
        <div className="ai-icon">{hasError ? '⚠' : '🤖'}</div>
        <div>
          <strong>{hasError ? 'AI Analysis Unavailable' : title}</strong>
          <span>{hasError ? 'Review the returned error details.' : 'Structured response'}</span>
        </div>
      </div>
      <NodeValue value={value} fieldKey="result" path="result" />
      <details style={{ marginTop: 12 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Structured response (JSON)</summary>
        <div style={{ marginTop: 12 }}>
          <JsonReport data={value} title={title} />
        </div>
      </details>
    </section>
  );
}
