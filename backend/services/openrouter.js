const fetch = require('node-fetch');

async function analyzeWithAI(prompt, context) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    return {
      analysis: 'AI analysis unavailable. Please configure OPENROUTER_API_KEY in your .env file.',
      error: true,
    };
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'AI Employee Sentiment Analyzer',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert HR analytics AI assistant specializing in employee sentiment analysis, engagement, and workplace culture. Provide actionable, specific, and empathetic insights. Always structure your response as valid JSON.',
          },
          {
            role: 'user',
            content: `${prompt}\n\nContext:\n${JSON.stringify(context, null, 2)}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      return { analysis: `AI analysis failed: ${response.status}`, error: true };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return { analysis: 'AI returned empty response', error: true };
    }

    // Try to parse as JSON, otherwise return as plain text
    try {
      return JSON.parse(content);
    } catch {
      return { analysis: content };
    }
  } catch (err) {
    console.error('OpenRouter request error:', err.message);
    return { analysis: `AI analysis error: ${err.message}`, error: true };
  }
}

// Feature-specific analysis prompts
const analysisPrompts = {
  surveys: (data) => ({
    prompt: 'Analyze this employee survey response. Identify sentiment, key themes, emotional tone, and provide actionable recommendations for management. Return JSON with fields: sentiment_score (0-1), sentiment_label, themes (array), emotional_tone, recommendations (array), summary.',
    context: data,
  }),

  departmentAnalytics: (data) => ({
    prompt: 'Analyze this department analytics data. Identify trends, areas of concern, strengths, and provide strategic recommendations. Return JSON with fields: overall_health, trends (array), concerns (array), strengths (array), recommendations (array), summary.',
    context: data,
  }),

  pulseChecks: (data) => ({
    prompt: 'Analyze this employee pulse check data. Assess wellbeing indicators, identify potential burnout risks, and suggest interventions. Return JSON with fields: wellbeing_assessment, burnout_risk (low/medium/high), energy_analysis, stress_analysis, interventions (array), summary.',
    context: data,
  }),

  feedbackAnalysis: (data) => ({
    prompt: 'Analyze this employee feedback. Identify sentiment, key topics, constructive elements, and areas for action. Return JSON with fields: sentiment_score (0-1), key_topics (array), constructive_elements (array), action_items (array), summary.',
    context: data,
  }),

  retentionRisks: (data) => ({
    prompt: 'Analyze this employee retention risk data. Predict flight risk probability, identify key risk factors, and suggest targeted retention interventions. Return JSON with fields: risk_level (low/medium/high/critical), flight_probability, key_factors (array), interventions (array), timeline, summary.',
    context: data,
  }),

  engagementScores: (data) => ({
    prompt: 'Analyze this employee engagement data. Identify engagement drivers, barriers, trends, and provide specific recommendations to improve engagement. Return JSON with fields: engagement_level, drivers (array), barriers (array), trend_analysis, recommendations (array), summary.',
    context: data,
  }),

  teamMorale: (data) => ({
    prompt: 'Analyze this team morale data. Assess team health, identify morale drivers and concerns, and recommend team-building actions. Return JSON with fields: morale_assessment, drivers (array), concerns (array), team_dynamics, actions (array), summary.',
    context: data,
  }),

  exitInterviews: (data) => ({
    prompt: 'Analyze this exit interview data. Identify patterns, root causes of departure, preventability, and organizational learnings. Return JSON with fields: root_causes (array), preventability_assessment, patterns (array), organizational_learnings (array), recommendations (array), summary.',
    context: data,
  }),

  anonymousReports: (data) => ({
    prompt: 'Analyze this anonymous report. Assess severity, identify underlying issues, potential organizational impact, and recommend response actions. Return JSON with fields: severity_assessment, underlying_issues (array), impact_assessment, urgency (low/medium/high/critical), recommended_actions (array), summary.',
    context: data,
  }),

  performanceReviews: (data) => ({
    prompt: 'Analyze this performance review data. Assess overall performance sentiment, identify development opportunities, and suggest growth plans. Return JSON with fields: performance_sentiment, strength_areas (array), development_areas (array), growth_plan (array), coaching_tips (array), summary.',
    context: data,
  }),

  onboardingFeedback: (data) => ({
    prompt: 'Analyze this onboarding feedback. Assess the onboarding experience quality, identify gaps, and recommend improvements. Return JSON with fields: experience_quality, satisfaction_trend, gaps (array), effective_elements (array), improvements (array), summary.',
    context: data,
  }),

  benefitsSatisfaction: (data) => ({
    prompt: 'Analyze this benefits satisfaction data. Assess satisfaction levels, identify gaps in benefits offerings, and recommend improvements. Return JSON with fields: satisfaction_level, valued_benefits (array), gaps (array), competitive_analysis, recommendations (array), summary.',
    context: data,
  }),

  workLifeBalance: (data) => ({
    prompt: 'Analyze this work-life balance data. Assess balance health, identify burnout risks, and recommend organizational and individual interventions. Return JSON with fields: balance_assessment, burnout_risk (low/medium/high), overtime_analysis, flexibility_analysis, interventions (array), summary.',
    context: data,
  }),

  leadershipRatings: (data) => ({
    prompt: 'Analyze this leadership rating data. Assess leadership effectiveness, identify strengths and development areas, and recommend leadership development actions. Return JSON with fields: leadership_assessment, strengths (array), development_areas (array), team_impact, development_plan (array), summary.',
    context: data,
  }),

  cultureIndex: (data) => ({
    prompt: 'Analyze this culture index data. Assess cultural health, identify gaps vs benchmarks, and recommend culture improvement initiatives. Return JSON with fields: culture_health, above_benchmark (array), below_benchmark (array), critical_gaps (array), initiatives (array), summary.',
    context: data,
  }),
};

module.exports = { analyzeWithAI, analysisPrompts };
