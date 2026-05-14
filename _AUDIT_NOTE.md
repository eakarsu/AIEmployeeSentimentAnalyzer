# Audit Notes — AIEmployeeSentimentAnalyzer

Audit source: `_AUDIT/reports/batch_03.md` § 13 (template-clone, audit reported 0 AI endpoints).

## Original audit recommendations

### Missing AI counterparts
- `/sentiment-analysis` — NLP on survey responses / feedback / comments.
- `/retention-predict` — flag employees at churn risk.
- `/engagement-trend` — trend / declining-departments analysis.
- `/eNPS-improve` — recommendations to improve eNPS.
- `/leadership-feedback-extract` — summarize feedback for leaders.
- `/culture-health-score` — composite culture health metric.

### Missing non-AI features
- Survey creation / distribution.
- Results visualization dashboards.
- Access controls (manager / HR / executive).
- Action planning.

### Custom feature suggestions
- Real-time pulse monitoring with leadership view.
- Agentic HR partner.
- Anonymous voice/text hotline with sentiment analysis.
- Diversity & inclusion sentiment slicing.
- Predictive turnover ML.
- Exit-interview structured automation.
- Skip-level insight aggregation.

## Current state observed

`routes/aiNew.js` previously had `/cross-module-correlation`,
`/sentiment-trend`, `/intervention-planner`. CRUD routes existed for the
17 surveys / metrics / feedback domains.

## Implementations applied this pass

1. **`POST /api/ai/sentiment-analysis`** — accepts a batch of free-text
   comments and returns per-text + aggregate sentiment / polarity / themes
   / risk flags (capped at 200 texts per call).
2. **`POST /api/ai/retention-predict`** — joins `retention_risks`,
   `engagement_scores`, and `pulse_checks` for a department and returns
   90-day churn risk segments + drivers + interventions.

Both reuse the existing `analyzeWithAI` helper and pass `node --check`.

## Prioritized backlog

1. **MECHANICAL** — Add `/api/ai/eNPS-improve` reading recent eNPS scores
   and returning ranked improvement recommendations.
2. **MECHANICAL** — Add `/api/ai/leadership-feedback-extract` summarizing
   `leadership_ratings` themes per leader.
3. **MECHANICAL** — Add `/api/ai/culture-health-score` aggregating
   `culture_index` rows into a composite dashboard metric.
4. **NEEDS-PRODUCT-DECISION** — RBAC (manager / HR / exec) requires policy
   and route-level guards.
5. **NEEDS-CREDS** — Real-time pulse monitoring needs SMS / Slack / Teams
   webhook integrations.
6. **TOO-RISKY** — Demographic-sliced D&I metrics require k-anonymity
   safeguards before exposure.

## Apply pass 3 (frontend)

State observed:
- `pages/SentimentAnalysisPage.jsx` and `pages/RetentionPredictPage.jsx`
  already exist and post to `/ai/sentiment-analysis` and `/ai/retention-predict`
  via the shared `api.js` axios instance (with token interceptor).
- `App.jsx` routes both at `/ai/sentiment-analysis` and `/ai/retention-predict`.
- Backend `/api/ai` mounted to `routes/aiNew.js` in `server.js`.

Gap closed:
- `pages/Dashboard.jsx` did not link to either AI page. Added two AI Tools cards
  above the modules grid so users can navigate to Sentiment Analysis and
  Retention Prediction directly from the home dashboard.

Files modified: `frontend/src/pages/Dashboard.jsx`.

Backlog (MECHANICAL): the three older endpoints `/cross-module-correlation`,
`/sentiment-trend`, and `/intervention-planner` still lack dedicated FE pages.
A future pass should add small forms for each; not done here to stay within
the minimum-viable scope.

## Apply pass 4 (mechanical backlog)

Added the three remaining MECHANICAL endpoints from the prioritized backlog plus
matching FE pages and dashboard cards. All endpoints reuse the existing
`analyzeWithAI` helper and add an explicit 503 short-circuit when
`OPENROUTER_API_KEY` is missing. Pages reuse `api.js` (which sends the JWT
bearer via interceptor) and the existing `AIAnalysisDisplay` component.

Backend (`backend/routes/aiNew.js`):
- `POST /api/ai/eNPS-improve` — pulls recent engagement_scores rows for a department over a lookback window and asks the AI for ranked improvement actions.
- `POST /api/ai/leadership-feedback-extract` — joins leadership_ratings filtered by leader_name / department and summarizes per-leader themes.
- `POST /api/ai/culture-health-score` — aggregates culture_index rows into a composite health score with pillar breakdown.

Frontend:
- `pages/ENPSImprovePage.jsx`, `pages/LeadershipFeedbackExtractPage.jsx`, `pages/CultureHealthScorePage.jsx` — forms + 503 handling.
- `App.jsx` — three new routes under `/ai/*`.
- `pages/Dashboard.jsx` — three new AI Tools cards.

Smoke test: started backend on port 4789, hit `/api/health` (200 OK), POST to `/api/ai/eNPS-improve` with `{"department":"Engineering"}` returned a structured AI response (sample_size 0, analysis populated). `node --check` passes for `routes/aiNew.js`.

Items intentionally left in backlog: RBAC (NEEDS-PRODUCT-DECISION), real-time pulse webhooks (NEEDS-CREDS), D&I demographic slicing (TOO-RISKY).

## Apply pass 5 (all backlog)

Closed the FE gap from pass 4 for the three older endpoints
(`/cross-module-correlation`, `/sentiment-trend`, `/intervention-planner`)
and hardened the BE with the existing `requireKey()` 503 guard so they
match the rest of the AI surface.

Backend (`backend/routes/aiNew.js`): added `if (!requireKey(res)) return;`
short-circuit at the top of all three older handlers (`requireKey` is a
hoisted function declaration so usage before definition is valid).

Frontend pages added:
- `pages/CrossModuleCorrelationPage.jsx`
- `pages/SentimentTrendPage.jsx`
- `pages/InterventionPlannerPage.jsx`
- `App.jsx` — three new routes under `/ai/*`.
- `pages/Dashboard.jsx` — three new AI Tools cards.

Smoke test: backend on port 4802, `/api/health` 200, login
(admin@sentiment.com / password123) 200, end-to-end POST to
`/api/ai/cross-module-correlation { "department": "Engineering" }`
returned 200 with a real AI response (claude-haiku-4.5, 2519 tokens).
`node --check` passes on `routes/aiNew.js`.

Items still backlog: RBAC (NEEDS-PRODUCT-DECISION), real-time pulse
webhooks (NEEDS-CREDS), D&I demographic slicing (TOO-RISKY).
