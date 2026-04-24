-- AI Employee Sentiment Analyzer - Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'User',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Employee Surveys
CREATE TABLE IF NOT EXISTS employee_surveys (
  id SERIAL PRIMARY KEY,
  employee_name VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  survey_date DATE NOT NULL DEFAULT CURRENT_DATE,
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  sentiment_score DECIMAL(3,2),
  sentiment_label VARCHAR(50),
  ai_analysis TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Department Analytics
CREATE TABLE IF NOT EXISTS department_analytics (
  id SERIAL PRIMARY KEY,
  department VARCHAR(100) NOT NULL,
  period VARCHAR(50) NOT NULL,
  avg_sentiment DECIMAL(3,2),
  total_responses INTEGER DEFAULT 0,
  positive_pct DECIMAL(5,2),
  neutral_pct DECIMAL(5,2),
  negative_pct DECIMAL(5,2),
  key_themes TEXT,
  ai_insights TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Pulse Checks
CREATE TABLE IF NOT EXISTS pulse_checks (
  id SERIAL PRIMARY KEY,
  employee_name VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  mood VARCHAR(50) NOT NULL,
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  comment TEXT,
  ai_analysis TEXT,
  check_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Feedback Analysis
CREATE TABLE IF NOT EXISTS feedback_analysis (
  id SERIAL PRIMARY KEY,
  employee_name VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  feedback_type VARCHAR(100) NOT NULL,
  feedback_text TEXT NOT NULL,
  sentiment_score DECIMAL(3,2),
  key_topics TEXT,
  ai_analysis TEXT,
  submitted_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Retention Risks
CREATE TABLE IF NOT EXISTS retention_risks (
  id SERIAL PRIMARY KEY,
  employee_name VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  tenure_years DECIMAL(4,1),
  risk_score DECIMAL(3,2),
  risk_factors TEXT,
  recommended_actions TEXT,
  ai_prediction TEXT,
  last_assessed DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. Engagement Scores
CREATE TABLE IF NOT EXISTS engagement_scores (
  id SERIAL PRIMARY KEY,
  employee_name VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  score DECIMAL(3,1),
  category VARCHAR(100),
  factors TEXT,
  trend VARCHAR(50),
  ai_recommendations TEXT,
  assessed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. Team Morale
CREATE TABLE IF NOT EXISTS team_morale (
  id SERIAL PRIMARY KEY,
  team_name VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  morale_score DECIMAL(3,1),
  participation_rate DECIMAL(5,2),
  highlights TEXT,
  concerns TEXT,
  ai_analysis TEXT,
  survey_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. Exit Interviews
CREATE TABLE IF NOT EXISTS exit_interviews (
  id SERIAL PRIMARY KEY,
  employee_name VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  exit_date DATE NOT NULL,
  tenure_years DECIMAL(4,1),
  exit_reason VARCHAR(255),
  feedback TEXT,
  ai_analysis TEXT,
  preventable BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 10. Anonymous Reports
CREATE TABLE IF NOT EXISTS anonymous_reports (
  id SERIAL PRIMARY KEY,
  department VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  report_text TEXT NOT NULL,
  severity VARCHAR(50),
  status VARCHAR(50) DEFAULT 'Open',
  ai_analysis TEXT,
  submitted_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 11. Performance Reviews
CREATE TABLE IF NOT EXISTS performance_reviews (
  id SERIAL PRIMARY KEY,
  employee_name VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  reviewer VARCHAR(255),
  rating DECIMAL(2,1),
  strengths TEXT,
  improvements TEXT,
  sentiment_score DECIMAL(3,2),
  ai_analysis TEXT,
  review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 12. Onboarding Feedback
CREATE TABLE IF NOT EXISTS onboarding_feedback (
  id SERIAL PRIMARY KEY,
  employee_name VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  week_number INTEGER NOT NULL,
  satisfaction_score DECIMAL(3,1),
  challenges TEXT,
  suggestions TEXT,
  ai_analysis TEXT,
  submitted_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 13. Benefits Satisfaction
CREATE TABLE IF NOT EXISTS benefits_satisfaction (
  id SERIAL PRIMARY KEY,
  employee_name VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  benefit_type VARCHAR(100) NOT NULL,
  satisfaction_score DECIMAL(3,1),
  comments TEXT,
  ai_analysis TEXT,
  survey_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 14. Work-Life Balance
CREATE TABLE IF NOT EXISTS work_life_balance (
  id SERIAL PRIMARY KEY,
  employee_name VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  balance_score DECIMAL(3,1),
  overtime_hours DECIMAL(4,1),
  flexibility_rating DECIMAL(3,1),
  comments TEXT,
  ai_analysis TEXT,
  assessed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 15. Leadership Ratings
CREATE TABLE IF NOT EXISTS leadership_ratings (
  id SERIAL PRIMARY KEY,
  leader_name VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  rated_by VARCHAR(255),
  communication_score DECIMAL(3,1),
  vision_score DECIMAL(3,1),
  support_score DECIMAL(3,1),
  overall_score DECIMAL(3,1),
  comments TEXT,
  ai_analysis TEXT,
  rating_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 16. Culture Index
CREATE TABLE IF NOT EXISTS culture_index (
  id SERIAL PRIMARY KEY,
  department VARCHAR(100) NOT NULL,
  dimension VARCHAR(100) NOT NULL,
  score DECIMAL(3,1),
  benchmark DECIMAL(3,1),
  gap DECIMAL(3,1),
  comments TEXT,
  ai_analysis TEXT,
  survey_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
