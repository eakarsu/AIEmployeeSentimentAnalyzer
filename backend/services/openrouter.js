const fetch = require('node-fetch');

// parseAIJson - 3-strategy AI JSON response parser
// Strategy 1: direct JSON.parse
// Strategy 2: strip markdown code fences then parse
// Strategy 3: brace/bracket matching extraction
function parseAIJson(content) {
  if (content == null) throw new Error('parseAIJson: empty content');
  const raw = String(content).trim();

  // Strategy 1: direct
  try { return JSON.parse(raw); } catch (_) {}

  // Strategy 2: strip code fences
  let cleaned = raw;
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```[\s\S]*$/, '');
    try { return JSON.parse(cleaned.trim()); } catch (_) {}
  } else {
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenceMatch) {
      try { return JSON.parse(fenceMatch[1].trim()); } catch (_) {}
    }
  }

  // Strategy 3: brace-matching
  const objStart = cleaned.indexOf('{');
  const arrStart = cleaned.indexOf('[');
  let start = -1, openCh, closeCh;
  if (objStart !== -1 && (arrStart === -1 || objStart < arrStart)) {
    start = objStart; openCh = '{'; closeCh = '}';
  } else if (arrStart !== -1) {
    start = arrStart; openCh = '['; closeCh = ']';
  }
  if (start === -1) throw new Error('parseAIJson: no JSON object/array found');

  let depth = 0, inString = false, escape = false;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === openCh) depth++;
    else if (ch === closeCh) {
      depth--;
      if (depth === 0) return JSON.parse(cleaned.substring(start, i + 1));
    }
  }
  throw new Error('parseAIJson: unbalanced braces');
}

async function analyzeWithAI(prompt, context) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022';

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    throw new Error('OpenRouter API key not configured');
  }

  try {
    const baseUrl = (process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/chat/completions`, {
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
      throw new Error(`OpenRouter request failed with ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('OpenRouter returned empty content');
    }

    // Try 3-strategy JSON parse, otherwise return as plain text
    try {
      const parsed = parseAIJson(content);
      // Attach metadata for caching/audit
      parsed._ai_model = model;
      parsed._ai_usage = data.usage || null;
      return parsed;
    } catch {
      return { analysis: content, _ai_model: model, _ai_usage: data.usage || null };
    }
  } catch (err) {
    console.error('OpenRouter request error:', err.message);
    throw err;
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

module.exports = { analyzeWithAI, analysisPrompts, parseAIJson };
