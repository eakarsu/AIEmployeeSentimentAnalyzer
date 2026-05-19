import SentimentTrendChart from '../components/SentimentTrendChart';
import TeamMoodHeatmap from '../components/TeamMoodHeatmap';
import HRSentimentReport from '../components/HRSentimentReport';
import SurveyRulesEditor from '../components/SurveyRulesEditor';

export default function CustomViewsPage() {
  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 data-testid="custom-views-title" style={{ margin: 0, color: '#e2e8f0' }}>Sentiment Views</h1>
        <p style={{ color: '#94a3b8', marginTop: 4 }}>Custom HR sentiment analytics: trends, team mood, reports, and survey rules.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        <SentimentTrendChart />
        <TeamMoodHeatmap />
        <HRSentimentReport />
        <SurveyRulesEditor />
      </div>
    </div>
  );
}
