-- Seed Data for AI Employee Sentiment Analyzer

-- Users (passwords are bcrypt hash of 'password123')
INSERT INTO users (email, password, name, role) VALUES
('admin@sentiment.com', '$2b$10$MVj/oBWdFB1VqDjUHrmLpeXn6WD6OerOVub8VBXqnVX99wSztNGbS', 'Admin User', 'Admin'),
('user@sentiment.com', '$2b$10$MVj/oBWdFB1VqDjUHrmLpeXn6WD6OerOVub8VBXqnVX99wSztNGbS', 'Regular User', 'User')
ON CONFLICT (email) DO NOTHING;

-- Employee Surveys
INSERT INTO employee_surveys (employee_name, department, survey_date, question, response, sentiment_score, sentiment_label) VALUES
('Alice Johnson', 'Engineering', '2025-01-15', 'How satisfied are you with your current role?', 'I really enjoy working on challenging projects. The team is great and I feel valued.', 0.85, 'Positive'),
('Bob Smith', 'Marketing', '2025-01-15', 'How satisfied are you with your current role?', 'The workload has been overwhelming lately. I feel burned out and underappreciated.', 0.25, 'Negative'),
('Carol Davis', 'Sales', '2025-01-16', 'How do you feel about company culture?', 'The culture is generally positive but there could be more transparency from leadership.', 0.60, 'Neutral'),
('David Wilson', 'HR', '2025-01-16', 'How do you feel about company culture?', 'I love the collaborative environment. Everyone is supportive and willing to help.', 0.90, 'Positive'),
('Emma Brown', 'Finance', '2025-01-17', 'Rate your work-life balance', 'It has been difficult to disconnect from work. Constant after-hours emails are stressful.', 0.30, 'Negative'),
('Frank Miller', 'Operations', '2025-01-17', 'How satisfied are you with your manager?', 'My manager is excellent at providing feedback and supporting my growth.', 0.88, 'Positive'),
('Grace Lee', 'Product', '2025-01-18', 'How do you feel about career growth?', 'There are limited opportunities for advancement. I feel stuck in my current position.', 0.35, 'Negative'),
('Henry Taylor', 'Design', '2025-01-18', 'How satisfied are you with your current role?', 'The creative freedom is amazing. I get to work on projects I am passionate about.', 0.92, 'Positive'),
('Ivy Chen', 'Legal', '2025-01-19', 'Rate your work-life balance', 'The flexibility to work from home has been a game changer for my well-being.', 0.82, 'Positive'),
('Jack Anderson', 'Support', '2025-01-19', 'How do you feel about company culture?', 'Customer support gets overlooked. We need more resources and recognition.', 0.28, 'Negative'),
('Karen White', 'Engineering', '2025-01-20', 'How satisfied are you with your manager?', 'Communication could be better. Sometimes I feel out of the loop on important decisions.', 0.45, 'Neutral'),
('Leo Martinez', 'Marketing', '2025-01-20', 'How do you feel about career growth?', 'The mentorship program has been incredibly helpful for my professional development.', 0.87, 'Positive'),
('Mia Robinson', 'Sales', '2025-01-21', 'Rate your work-life balance', 'Sales targets are realistic and management is understanding about personal time.', 0.75, 'Positive'),
('Nathan Clark', 'HR', '2025-01-21', 'How satisfied are you with your current role?', 'I enjoy helping employees but the administrative burden is increasing.', 0.55, 'Neutral'),
('Olivia Harris', 'Finance', '2025-01-22', 'How do you feel about company culture?', 'The company values are just words on a wall. Actions do not match the statements.', 0.20, 'Negative');

-- Department Analytics
INSERT INTO department_analytics (department, period, avg_sentiment, total_responses, positive_pct, neutral_pct, negative_pct, key_themes) VALUES
('Engineering', 'Q1 2025', 0.72, 45, 62.00, 22.00, 16.00, 'Innovation, collaboration, workload concerns'),
('Marketing', 'Q1 2025', 0.58, 38, 45.00, 30.00, 25.00, 'Creativity, resource constraints, recognition'),
('Sales', 'Q1 2025', 0.65, 42, 52.00, 28.00, 20.00, 'Targets, compensation, team dynamics'),
('HR', 'Q1 2025', 0.70, 20, 60.00, 25.00, 15.00, 'Employee wellbeing, administrative burden, policy'),
('Finance', 'Q1 2025', 0.55, 25, 40.00, 32.00, 28.00, 'Workload, accuracy pressure, career growth'),
('Operations', 'Q1 2025', 0.68, 35, 55.00, 28.00, 17.00, 'Efficiency, process improvement, staffing'),
('Product', 'Q1 2025', 0.62, 30, 48.00, 30.00, 22.00, 'Roadmap clarity, cross-team collaboration, deadlines'),
('Design', 'Q1 2025', 0.78, 18, 68.00, 20.00, 12.00, 'Creative freedom, tools, feedback loops'),
('Legal', 'Q1 2025', 0.60, 15, 46.00, 34.00, 20.00, 'Compliance burden, work-life balance, resources'),
('Support', 'Q1 2025', 0.48, 40, 35.00, 28.00, 37.00, 'Burnout, customer escalations, understaffing'),
('Engineering', 'Q4 2024', 0.68, 43, 58.00, 24.00, 18.00, 'Technical debt, hiring, tooling'),
('Marketing', 'Q4 2024', 0.62, 36, 50.00, 28.00, 22.00, 'Campaign success, budget, workload'),
('Sales', 'Q4 2024', 0.70, 44, 58.00, 25.00, 17.00, 'Year-end push, bonuses, pipeline'),
('HR', 'Q4 2024', 0.66, 19, 55.00, 28.00, 17.00, 'Benefits review, recruitment, engagement'),
('Finance', 'Q4 2024', 0.52, 24, 38.00, 30.00, 32.00, 'Year-end close, audit pressure, overtime');

-- Pulse Checks
INSERT INTO pulse_checks (employee_name, department, mood, energy_level, stress_level, comment, check_date) VALUES
('Alice Johnson', 'Engineering', 'Happy', 8, 3, 'Great week! Shipped a major feature successfully.', '2025-02-01'),
('Bob Smith', 'Marketing', 'Stressed', 4, 8, 'Campaign deadline is approaching and we are behind schedule.', '2025-02-01'),
('Carol Davis', 'Sales', 'Content', 7, 5, 'On track to hit quarterly targets. Feeling good about pipeline.', '2025-02-01'),
('David Wilson', 'HR', 'Energetic', 9, 2, 'New wellness program launch went smoothly.', '2025-02-01'),
('Emma Brown', 'Finance', 'Anxious', 5, 7, 'Quarter-end reporting is piling up. Need more support.', '2025-02-01'),
('Frank Miller', 'Operations', 'Focused', 7, 4, 'New process improvements are showing results.', '2025-02-02'),
('Grace Lee', 'Product', 'Frustrated', 5, 7, 'Roadmap keeps changing. Hard to maintain focus on priorities.', '2025-02-02'),
('Henry Taylor', 'Design', 'Inspired', 9, 2, 'Working on an exciting rebrand project.', '2025-02-02'),
('Ivy Chen', 'Legal', 'Calm', 6, 4, 'Steady workload this week. Good balance.', '2025-02-02'),
('Jack Anderson', 'Support', 'Overwhelmed', 3, 9, 'Ticket volume is through the roof. We need more staff.', '2025-02-02'),
('Karen White', 'Engineering', 'Motivated', 8, 4, 'Excited about the new architecture migration project.', '2025-02-03'),
('Leo Martinez', 'Marketing', 'Happy', 7, 3, 'Content strategy is really clicking with our audience.', '2025-02-03'),
('Mia Robinson', 'Sales', 'Determined', 7, 5, 'Big deal in the pipeline. Feeling optimistic.', '2025-02-03'),
('Nathan Clark', 'HR', 'Tired', 4, 6, 'Busy with open enrollment. Long days ahead.', '2025-02-03'),
('Olivia Harris', 'Finance', 'Neutral', 5, 5, 'Regular workload. Nothing unusual.', '2025-02-03');

-- Feedback Analysis
INSERT INTO feedback_analysis (employee_name, department, feedback_type, feedback_text, sentiment_score, key_topics, submitted_date) VALUES
('Alice Johnson', 'Engineering', 'Peer Review', 'Alice is an exceptional team player who consistently delivers high-quality code. Her mentorship of junior developers is invaluable.', 0.92, 'Teamwork, Code Quality, Mentorship', '2025-01-20'),
('Bob Smith', 'Marketing', 'Self Assessment', 'I have been struggling with the constant shifting of priorities. It is hard to produce quality work when goals change weekly.', 0.30, 'Priority Changes, Work Quality, Frustration', '2025-01-20'),
('Carol Davis', 'Sales', '360 Feedback', 'Carol has strong client relationships but sometimes overpromises on deliverables. She would benefit from better internal communication.', 0.55, 'Client Relations, Overpromising, Communication', '2025-01-21'),
('David Wilson', 'HR', 'Manager Review', 'David shows outstanding initiative in implementing employee programs. His empathy and communication skills are exemplary.', 0.90, 'Initiative, Empathy, Communication', '2025-01-21'),
('Emma Brown', 'Finance', 'Peer Review', 'Emma is very detail-oriented but tends to work in isolation. More collaboration with the team would improve outcomes.', 0.58, 'Detail-Oriented, Isolation, Collaboration', '2025-01-22'),
('Frank Miller', 'Operations', 'Self Assessment', 'I feel I have made significant improvements to our operational efficiency this quarter. The new workflows are saving 20 hours per week.', 0.85, 'Efficiency, Process Improvement, Results', '2025-01-22'),
('Grace Lee', 'Product', '360 Feedback', 'Grace has strong product vision but needs to better communicate the rationale behind her decisions to the team.', 0.52, 'Product Vision, Communication, Decision Making', '2025-01-23'),
('Henry Taylor', 'Design', 'Manager Review', 'Henry brings incredible creativity and consistently pushes boundaries. His designs have significantly improved user satisfaction.', 0.93, 'Creativity, Innovation, User Satisfaction', '2025-01-23'),
('Ivy Chen', 'Legal', 'Peer Review', 'Ivy is thorough and reliable. Her legal analyses are well-researched and clearly communicated.', 0.80, 'Thoroughness, Reliability, Communication', '2025-01-24'),
('Jack Anderson', 'Support', 'Self Assessment', 'I am frustrated with the lack of resources. Our team is understaffed and customers are waiting too long for resolution.', 0.22, 'Understaffing, Frustration, Customer Wait Times', '2025-01-24'),
('Karen White', 'Engineering', '360 Feedback', 'Karen is technically strong but could improve her documentation practices. She is great at problem-solving under pressure.', 0.68, 'Technical Skills, Documentation, Problem Solving', '2025-01-25'),
('Leo Martinez', 'Marketing', 'Manager Review', 'Leo has shown tremendous growth in content strategy. His data-driven approach has improved campaign ROI by 35%.', 0.88, 'Growth, Content Strategy, ROI', '2025-01-25'),
('Mia Robinson', 'Sales', 'Peer Review', 'Mia is a natural leader who motivates the entire sales team. Her pipeline management skills are exceptional.', 0.87, 'Leadership, Motivation, Pipeline Management', '2025-01-26'),
('Nathan Clark', 'HR', 'Self Assessment', 'I enjoy the people aspect of my job but the administrative tasks are consuming too much of my time. Need better tools.', 0.50, 'People Skills, Administrative Burden, Tools', '2025-01-26'),
('Olivia Harris', 'Finance', '360 Feedback', 'Olivia needs to improve her communication with non-finance teams. She is highly competent but comes across as dismissive at times.', 0.42, 'Communication, Competence, Interpersonal Skills', '2025-01-27');

-- Retention Risks
INSERT INTO retention_risks (employee_name, department, tenure_years, risk_score, risk_factors, recommended_actions, last_assessed) VALUES
('Bob Smith', 'Marketing', 3.5, 0.82, 'Burnout symptoms, declining engagement scores, missed promotions', 'Immediate workload review, career development plan, 1-on-1 with leadership', '2025-02-01'),
('Grace Lee', 'Product', 2.8, 0.75, 'Frustration with roadmap changes, limited growth, peer departures', 'Role clarity discussion, stretch assignments, mentorship pairing', '2025-02-01'),
('Jack Anderson', 'Support', 4.2, 0.88, 'Chronic understaffing, burnout, below-market compensation', 'Compensation review, hire additional support staff, recognition program', '2025-02-01'),
('Emma Brown', 'Finance', 1.5, 0.65, 'Work-life balance concerns, isolation, limited team interaction', 'Team building activities, flexible scheduling, cross-functional projects', '2025-02-02'),
('Olivia Harris', 'Finance', 5.0, 0.58, 'Communication friction, stagnant role, market opportunity awareness', 'Leadership development program, cross-department rotation, salary benchmark', '2025-02-02'),
('Karen White', 'Engineering', 3.0, 0.45, 'Minor communication concerns, generally satisfied but watching for opportunities', 'Regular check-ins, conference budget, technical leadership track', '2025-02-02'),
('Nathan Clark', 'HR', 2.2, 0.52, 'Administrative burden increasing, tool frustrations, moderate satisfaction', 'HR tech investment, process automation, role expansion discussion', '2025-02-03'),
('Carol Davis', 'Sales', 4.5, 0.38, 'Stable but watching competitor offers, commission structure concerns', 'Commission review, clear promotion path, client portfolio expansion', '2025-02-03'),
('Alice Johnson', 'Engineering', 5.5, 0.15, 'Highly engaged, strong team bonds, satisfied with growth', 'Continue growth opportunities, maintain mentorship role, stock refresh', '2025-02-03'),
('David Wilson', 'HR', 6.0, 0.12, 'Very satisfied, mission-driven, strong cultural fit', 'Leadership track, wellness program ownership, conference speaking opportunities', '2025-02-04'),
('Henry Taylor', 'Design', 3.2, 0.20, 'Highly creative, loves the work, good team dynamic', 'Design system leadership, external showcase opportunities, skill workshops', '2025-02-04'),
('Frank Miller', 'Operations', 7.0, 0.18, 'Long tenure, strong results, respected by peers', 'Director-level consideration, strategic project ownership, equity review', '2025-02-04'),
('Leo Martinez', 'Marketing', 1.8, 0.30, 'Growing rapidly, good manager relationship, learning a lot', 'Accelerated growth plan, marketing budget ownership, industry events', '2025-02-05'),
('Mia Robinson', 'Sales', 2.5, 0.22, 'Top performer, good compensation, team leadership potential', 'Sales lead role, commission accelerators, management training', '2025-02-05'),
('Ivy Chen', 'Legal', 4.0, 0.35, 'Stable but limited legal team growth, considering external options', 'Senior counsel track, policy ownership, external counsel network building', '2025-02-05');

-- Engagement Scores
INSERT INTO engagement_scores (employee_name, department, score, category, factors, trend, assessed_date) VALUES
('Alice Johnson', 'Engineering', 9.2, 'Highly Engaged', 'Meaningful work, growth opportunities, team culture', 'Improving', '2025-01-31'),
('Bob Smith', 'Marketing', 4.5, 'Disengaged', 'Workload, lack of recognition, shifting priorities', 'Declining', '2025-01-31'),
('Carol Davis', 'Sales', 7.0, 'Engaged', 'Client relationships, target achievement, team support', 'Stable', '2025-01-31'),
('David Wilson', 'HR', 9.0, 'Highly Engaged', 'Mission alignment, autonomy, positive impact', 'Improving', '2025-01-31'),
('Emma Brown', 'Finance', 5.2, 'Partially Engaged', 'Work quality, learning, but poor work-life balance', 'Declining', '2025-01-31'),
('Frank Miller', 'Operations', 8.1, 'Highly Engaged', 'Process ownership, visible impact, managerial support', 'Stable', '2025-02-01'),
('Grace Lee', 'Product', 5.8, 'Partially Engaged', 'Product passion, but roadmap frustration, limited growth', 'Declining', '2025-02-01'),
('Henry Taylor', 'Design', 9.5, 'Highly Engaged', 'Creative freedom, project variety, skill development', 'Improving', '2025-02-01'),
('Ivy Chen', 'Legal', 7.2, 'Engaged', 'Professional development, work quality, but limited team', 'Stable', '2025-02-01'),
('Jack Anderson', 'Support', 3.8, 'Disengaged', 'Overwhelmed, under-resourced, lack of recognition', 'Declining', '2025-02-01'),
('Karen White', 'Engineering', 7.5, 'Engaged', 'Technical challenges, good compensation, learning', 'Stable', '2025-02-02'),
('Leo Martinez', 'Marketing', 8.3, 'Highly Engaged', 'Growth trajectory, mentorship, creative work', 'Improving', '2025-02-02'),
('Mia Robinson', 'Sales', 8.0, 'Highly Engaged', 'Performance recognition, client wins, team leadership', 'Improving', '2025-02-02'),
('Nathan Clark', 'HR', 6.5, 'Engaged', 'People focus, but administrative burden, tool frustration', 'Declining', '2025-02-02'),
('Olivia Harris', 'Finance', 5.0, 'Partially Engaged', 'Competence, but communication issues, feeling stagnant', 'Declining', '2025-02-02');

-- Team Morale
INSERT INTO team_morale (team_name, department, morale_score, participation_rate, highlights, concerns, survey_date) VALUES
('Backend Team', 'Engineering', 8.5, 92.00, 'Successful product launch, strong collaboration', 'Technical debt concerns, on-call fatigue', '2025-01-31'),
('Frontend Team', 'Engineering', 7.8, 88.00, 'New design system adoption, skill growth', 'Cross-team dependency delays', '2025-01-31'),
('Content Team', 'Marketing', 6.2, 75.00, 'Blog traffic up 40%, new video series', 'Resource constraints, frequent priority shifts', '2025-01-31'),
('Growth Team', 'Marketing', 7.0, 82.00, 'Successful campaign launch, good data', 'Budget limitations, tool access', '2025-01-31'),
('Enterprise Sales', 'Sales', 7.5, 90.00, 'Q4 targets exceeded, strong pipeline', 'Pressure to maintain growth, travel fatigue', '2025-02-01'),
('SMB Sales', 'Sales', 6.8, 85.00, 'Improved conversion rates, new playbook', 'Commission structure concerns, quota changes', '2025-02-01'),
('People Ops', 'HR', 8.0, 95.00, 'Wellness program launch, positive feedback', 'Growing headcount without additional staff', '2025-02-01'),
('Accounting', 'Finance', 5.5, 70.00, 'Clean audit results', 'Quarter-end pressure, overtime, tool limitations', '2025-02-01'),
('Supply Chain', 'Operations', 7.2, 80.00, 'Reduced lead times by 15%', 'Vendor reliability issues, staffing gaps', '2025-02-02'),
('UX Team', 'Design', 8.8, 94.00, 'User satisfaction scores up, design awards', 'Need for more research capacity', '2025-02-02'),
('Platform Team', 'Engineering', 7.0, 85.00, 'Infrastructure modernization progress', 'Legacy system maintenance burden', '2025-02-02'),
('Product Strategy', 'Product', 6.5, 78.00, 'Clear annual roadmap defined', 'Frequent scope changes, stakeholder alignment', '2025-02-02'),
('Compliance', 'Legal', 6.8, 82.00, 'No regulatory issues this quarter', 'Increasing regulatory complexity', '2025-02-03'),
('Tier 1 Support', 'Support', 4.5, 65.00, 'New KB articles reduced repeat tickets', 'Understaffing, burnout, high ticket volume', '2025-02-03'),
('Tier 2 Support', 'Support', 5.0, 68.00, 'Improved escalation process', 'Complex cases increasing, training needs', '2025-02-03');

-- Exit Interviews
INSERT INTO exit_interviews (employee_name, department, exit_date, tenure_years, exit_reason, feedback, preventable) VALUES
('Tom Baker', 'Engineering', '2025-01-10', 2.5, 'Better compensation elsewhere', 'Loved the team and culture but received a 40% higher offer. Would have stayed with competitive pay.', true),
('Sarah Kim', 'Marketing', '2025-01-15', 1.2, 'Burnout', 'The constant pivots and unrealistic deadlines made it impossible to do quality work. Management needs to set clearer priorities.', true),
('Ryan Peters', 'Sales', '2025-01-20', 3.0, 'Career advancement', 'No clear promotion path. Was told to wait but saw external opportunities for senior roles. Good company otherwise.', true),
('Lisa Wong', 'Support', '2025-01-25', 0.8, 'Workload and stress', 'The support team is severely understaffed. I was handling 3x the tickets of industry standard. Could not sustain it.', true),
('Mike Chang', 'Finance', '2025-02-01', 4.5, 'Relocation', 'Spouse got a job in another city. Would have stayed if remote work was an option for my role.', true),
('Jennifer Adams', 'Product', '2025-02-05', 2.0, 'Lack of growth', 'Felt pigeonholed into a narrow scope. Asked for growth opportunities multiple times but nothing materialized.', true),
('Robert Kim', 'Engineering', '2025-02-10', 1.5, 'Company culture mismatch', 'The stated values do not match reality. Decisions are made top-down despite claiming to be collaborative.', false),
('Amy Zhang', 'Operations', '2025-02-15', 5.0, 'Retirement', 'Wonderful career here. The company has been like family. I will miss the team.', false),
('Chris Lee', 'Design', '2025-02-20', 0.5, 'Role mismatch', 'The job description did not match the actual work. Expected more UX research but ended up doing mostly production work.', true),
('Diana Ross', 'HR', '2025-02-25', 3.5, 'Starting own business', 'Learned so much here. The HR practices at this company inspired me to start my own consulting firm.', false),
('Kevin Brown', 'Sales', '2025-03-01', 2.0, 'Commission structure changes', 'The new commission structure significantly reduced my earnings despite higher performance. Lost trust in leadership.', true),
('Patricia Nguyen', 'Legal', '2025-03-05', 4.0, 'Better work-life balance', 'The legal team is too small for the workload. Constantly working evenings and weekends. Found a role with better boundaries.', true),
('Steve Martinez', 'Engineering', '2025-03-10', 6.0, 'Startup opportunity', 'Always wanted to join a startup. This is the right time in my career. No complaints about the company.', false),
('Nancy Taylor', 'Marketing', '2025-03-12', 1.8, 'Management issues', 'My manager micromanaged everything and took credit for team accomplishments. Multiple complaints went unaddressed.', true),
('James Wilson', 'Support', '2025-03-15', 1.0, 'Health reasons', 'The constant stress affected my health. The on-call rotations with an understaffed team were unsustainable.', true);

-- Anonymous Reports
INSERT INTO anonymous_reports (department, category, report_text, severity, status, submitted_date) VALUES
('Engineering', 'Work Environment', 'The open office layout is extremely distracting. Many team members wear noise-canceling headphones all day, reducing collaboration.', 'Medium', 'Under Review', '2025-01-15'),
('Marketing', 'Management', 'Our team lead frequently takes credit for individual contributions in leadership meetings. This is demoralizing.', 'High', 'Open', '2025-01-18'),
('Sales', 'Compensation', 'The new commission structure disproportionately affects mid-level sales reps. Top performers are unaffected while others lose 15-20%.', 'High', 'Under Review', '2025-01-20'),
('Support', 'Staffing', 'We have lost 4 team members in 6 months and none have been replaced. Remaining staff are burning out.', 'Critical', 'Open', '2025-01-22'),
('Finance', 'Work-Life Balance', 'Month-end close requires 60+ hour weeks regularly. This is presented as normal but it is not sustainable.', 'High', 'Open', '2025-01-25'),
('HR', 'Process', 'The anonymous feedback system feels performative. Previous reports were acknowledged but no visible action was taken.', 'Medium', 'Under Review', '2025-01-28'),
('Product', 'Communication', 'Strategic decisions are made without consulting the product team, then we are expected to execute on unrealistic timelines.', 'High', 'Open', '2025-02-01'),
('Design', 'Tools', 'We are still using outdated design software while competitors use modern tools. Requests for upgrades have been denied for a year.', 'Medium', 'Resolved', '2025-02-03'),
('Legal', 'Staffing', 'The legal team has not grown despite the company doubling in size. We are stretched too thin and risk mistakes.', 'High', 'Open', '2025-02-05'),
('Operations', 'Safety', 'The warehouse ventilation system needs maintenance. Multiple employees have reported headaches during summer months.', 'Critical', 'Under Review', '2025-02-08'),
('Engineering', 'Diversity', 'The engineering team lacks diversity in senior positions. Promotion criteria seem biased toward certain demographics.', 'High', 'Open', '2025-02-10'),
('Marketing', 'Resources', 'Budget cuts have eliminated essential marketing tools but expectations remain the same. We cannot deliver without resources.', 'Medium', 'Open', '2025-02-12'),
('Sales', 'Ethics', 'Some team members are using pressure tactics that border on unethical to meet quarterly targets. Management turns a blind eye.', 'High', 'Under Review', '2025-02-15'),
('Support', 'Training', 'New support agents receive only 2 days of training before handling live tickets. Industry standard is 2-4 weeks.', 'High', 'Open', '2025-02-18'),
('Finance', 'Transparency', 'Financial decisions affecting employee benefits are made without any consultation or advance notice to affected teams.', 'Medium', 'Open', '2025-02-20');

-- Performance Reviews
INSERT INTO performance_reviews (employee_name, department, reviewer, rating, strengths, improvements, sentiment_score, review_date) VALUES
('Alice Johnson', 'Engineering', 'Mark Thompson', 4.5, 'Exceptional technical skills, mentors junior developers, consistently exceeds sprint goals', 'Could take on more architectural leadership, public speaking skills', 0.90, '2025-01-15'),
('Bob Smith', 'Marketing', 'Lisa Chen', 3.0, 'Creative thinking, good writing skills', 'Time management, handling pressure, needs to improve campaign planning', 0.45, '2025-01-15'),
('Carol Davis', 'Sales', 'James Wright', 3.8, 'Strong client relationships, persuasive communicator', 'Over-promising on delivery timelines, internal communication gaps', 0.62, '2025-01-16'),
('David Wilson', 'HR', 'Sandra Lee', 4.7, 'Outstanding empathy, program development, team building', 'Data analytics skills, budget management', 0.92, '2025-01-16'),
('Emma Brown', 'Finance', 'Robert Kim', 3.5, 'Attention to detail, accuracy, compliance knowledge', 'Team collaboration, communication with non-finance stakeholders', 0.52, '2025-01-17'),
('Frank Miller', 'Operations', 'Jane Foster', 4.2, 'Process optimization, data-driven decisions, reliability', 'Delegation skills, embracing new technology faster', 0.82, '2025-01-17'),
('Grace Lee', 'Product', 'Mike Johnson', 3.3, 'Product vision, user empathy, strategic thinking', 'Stakeholder management, decision communication, flexibility', 0.48, '2025-01-18'),
('Henry Taylor', 'Design', 'Anna Park', 4.8, 'Exceptional creativity, design system thinking, user research', 'Project estimation, saying no to scope creep', 0.95, '2025-01-18'),
('Ivy Chen', 'Legal', 'Tom Bradley', 4.0, 'Thorough legal analysis, clear communication, reliability', 'Proactive risk identification, business strategy input', 0.78, '2025-01-19'),
('Jack Anderson', 'Support', 'Laura Garcia', 3.2, 'Customer empathy, problem-solving under pressure', 'Workload management, escalation procedures, self-care', 0.40, '2025-01-19'),
('Karen White', 'Engineering', 'Mark Thompson', 4.0, 'Strong debugging skills, reliable delivery, good code reviews', 'Documentation, cross-team communication, mentoring', 0.75, '2025-01-20'),
('Leo Martinez', 'Marketing', 'Lisa Chen', 4.3, 'Data-driven approach, content strategy, rapid learning', 'Campaign budgeting, vendor management', 0.85, '2025-01-20'),
('Mia Robinson', 'Sales', 'James Wright', 4.5, 'Top performer, natural leader, excellent pipeline management', 'Formal presentation skills, CRM data entry consistency', 0.88, '2025-01-21'),
('Nathan Clark', 'HR', 'Sandra Lee', 3.5, 'People skills, empathy, conflict resolution', 'Process efficiency, technology adoption, prioritization', 0.55, '2025-01-21'),
('Olivia Harris', 'Finance', 'Robert Kim', 3.8, 'Financial modeling expertise, accuracy, deadline adherence', 'Interpersonal communication, approachability, cross-team collaboration', 0.58, '2025-01-22');

-- Onboarding Feedback
INSERT INTO onboarding_feedback (employee_name, department, week_number, satisfaction_score, challenges, suggestions, submitted_date) VALUES
('Leo Martinez', 'Marketing', 1, 8.5, 'Getting access to all the tools took 3 days', 'Pre-provision tool access before start date', '2025-01-07'),
('Leo Martinez', 'Marketing', 2, 8.0, 'Information overload in first two weeks', 'Spread onboarding content over longer period', '2025-01-14'),
('Leo Martinez', 'Marketing', 4, 9.0, 'None significant - mentor has been incredibly helpful', 'The buddy system is excellent, keep it', '2025-01-28'),
('Chris Lee', 'Design', 1, 5.0, 'Role expectations unclear, different from job description', 'Align job descriptions with actual roles', '2025-02-03'),
('Chris Lee', 'Design', 2, 4.5, 'Still waiting for design tool licenses', 'Streamline software procurement process', '2025-02-10'),
('Mia Robinson', 'Sales', 1, 7.5, 'CRM training was too brief', 'Extend CRM training to full day', '2024-12-02'),
('Mia Robinson', 'Sales', 2, 8.0, 'Shadowing senior reps was very helpful', 'More shadowing opportunities in first month', '2024-12-09'),
('Mia Robinson', 'Sales', 4, 8.5, 'Feeling confident and productive', 'Overall great onboarding experience', '2024-12-23'),
('Tom Baker', 'Engineering', 1, 9.0, 'Dev environment setup was smooth', 'Good documentation for setup', '2024-07-08'),
('Tom Baker', 'Engineering', 2, 8.5, 'Code review process was well explained', 'Maybe pair programming in first week', '2024-07-15'),
('Lisa Wong', 'Support', 1, 4.0, 'Only 2 days of training before live tickets', 'Extend training to at least 2 weeks', '2024-11-04'),
('Lisa Wong', 'Support', 2, 3.5, 'Thrown into deep end too quickly', 'Gradual ticket complexity ramp-up', '2024-11-11'),
('Jennifer Adams', 'Product', 1, 7.0, 'Met the team quickly, good introductions', 'More context on product history', '2024-10-07'),
('Jennifer Adams', 'Product', 2, 6.5, 'Hard to understand all the stakeholder dynamics', 'Stakeholder map document would help', '2024-10-14'),
('Jennifer Adams', 'Product', 4, 7.0, 'Getting into the flow but scope still unclear', 'Clearer role boundaries needed', '2024-10-28');

-- Benefits Satisfaction
INSERT INTO benefits_satisfaction (employee_name, department, benefit_type, satisfaction_score, comments, survey_date) VALUES
('Alice Johnson', 'Engineering', 'Health Insurance', 8.5, 'Great coverage options. Dental could be better.', '2025-01-15'),
('Bob Smith', 'Marketing', 'Health Insurance', 7.0, 'Premiums are reasonable but specialist coverage is limited.', '2025-01-15'),
('Carol Davis', 'Sales', 'Retirement Plan', 8.0, '401k match is competitive. Would like more investment options.', '2025-01-16'),
('David Wilson', 'HR', 'Wellness Program', 9.5, 'The new wellness program is outstanding. Gym reimbursement is a great perk.', '2025-01-16'),
('Emma Brown', 'Finance', 'PTO Policy', 5.0, 'Unlimited PTO sounds good but the culture discourages taking time off.', '2025-01-17'),
('Frank Miller', 'Operations', 'Health Insurance', 8.0, 'Family coverage is comprehensive. Happy with the provider network.', '2025-01-17'),
('Grace Lee', 'Product', 'Professional Development', 6.0, 'Budget exists but approval process is slow and bureaucratic.', '2025-01-18'),
('Henry Taylor', 'Design', 'Remote Work', 9.0, 'Flexible remote policy is the best benefit. Home office stipend is generous.', '2025-01-18'),
('Ivy Chen', 'Legal', 'PTO Policy', 7.5, 'Good PTO allocation. Appreciated the additional wellness days.', '2025-01-19'),
('Jack Anderson', 'Support', 'Health Insurance', 6.0, 'Mental health coverage should be expanded given the stress of the role.', '2025-01-19'),
('Karen White', 'Engineering', 'Professional Development', 8.5, 'Conference budget and learning platform subscriptions are excellent.', '2025-01-20'),
('Leo Martinez', 'Marketing', 'Wellness Program', 7.5, 'Good variety of wellness activities. Would like more mental health support.', '2025-01-20'),
('Mia Robinson', 'Sales', 'Retirement Plan', 7.0, 'Match percentage could be higher compared to industry standards.', '2025-01-21'),
('Nathan Clark', 'HR', 'Remote Work', 7.0, 'Hybrid model works well but some meetings could be async.', '2025-01-21'),
('Olivia Harris', 'Finance', 'Professional Development', 5.5, 'Limited budget for certifications. CPA exam support would be appreciated.', '2025-01-22');

-- Work-Life Balance
INSERT INTO work_life_balance (employee_name, department, balance_score, overtime_hours, flexibility_rating, comments, assessed_date) VALUES
('Alice Johnson', 'Engineering', 8.0, 3.0, 8.5, 'Good balance most weeks. Occasional crunch during releases.', '2025-02-01'),
('Bob Smith', 'Marketing', 4.5, 12.0, 5.0, 'Consistently working evenings to meet campaign deadlines.', '2025-02-01'),
('Carol Davis', 'Sales', 6.5, 6.0, 7.0, 'Flexible schedule but client calls sometimes extend into evenings.', '2025-02-01'),
('David Wilson', 'HR', 8.5, 2.0, 9.0, 'Excellent balance. Manager respects boundaries.', '2025-02-01'),
('Emma Brown', 'Finance', 4.0, 15.0, 4.5, 'Month-end closes require significant overtime. Unsustainable.', '2025-02-01'),
('Frank Miller', 'Operations', 7.5, 4.0, 7.5, 'Generally good. Some weeks require extra attention during transitions.', '2025-02-02'),
('Grace Lee', 'Product', 5.5, 8.0, 6.0, 'Constant context switching between meetings and deep work.', '2025-02-02'),
('Henry Taylor', 'Design', 9.0, 1.0, 9.5, 'Best work-life balance I have ever had. Flexible and trusting environment.', '2025-02-02'),
('Ivy Chen', 'Legal', 6.5, 5.0, 7.0, 'Most weeks are fine but urgent matters can disrupt plans.', '2025-02-02'),
('Jack Anderson', 'Support', 3.0, 18.0, 3.5, 'On-call rotations with understaffed team means no real time off.', '2025-02-02'),
('Karen White', 'Engineering', 7.0, 5.0, 7.5, 'Flexible hours but sprint commitments sometimes require extra effort.', '2025-02-03'),
('Leo Martinez', 'Marketing', 7.5, 3.0, 8.0, 'Manager is great about protecting personal time.', '2025-02-03'),
('Mia Robinson', 'Sales', 7.0, 5.0, 7.0, 'Travel can be tiring but schedule is otherwise manageable.', '2025-02-03'),
('Nathan Clark', 'HR', 6.0, 7.0, 6.5, 'Open enrollment and year-end periods are brutal.', '2025-02-03'),
('Olivia Harris', 'Finance', 5.0, 10.0, 5.5, 'Better than last quarter but still too much overtime.', '2025-02-03');

-- Leadership Ratings
INSERT INTO leadership_ratings (leader_name, department, rated_by, communication_score, vision_score, support_score, overall_score, comments, rating_date) VALUES
('Mark Thompson', 'Engineering', 'Alice Johnson', 8.5, 9.0, 9.0, 8.8, 'Excellent technical leader who empowers the team and provides clear direction.', '2025-01-31'),
('Mark Thompson', 'Engineering', 'Karen White', 7.0, 8.5, 7.5, 7.7, 'Good vision but communication could be more frequent. Sometimes decisions feel opaque.', '2025-01-31'),
('Lisa Chen', 'Marketing', 'Bob Smith', 5.0, 6.0, 4.5, 5.2, 'Priorities change too frequently. Feels like we are always reacting instead of planning.', '2025-01-31'),
('Lisa Chen', 'Marketing', 'Leo Martinez', 7.5, 7.0, 8.0, 7.5, 'Supportive manager who invests in team growth. Strategy could be more consistent.', '2025-01-31'),
('James Wright', 'Sales', 'Carol Davis', 7.0, 7.5, 7.0, 7.2, 'Fair and knowledgeable. Could advocate more for the team with senior leadership.', '2025-02-01'),
('James Wright', 'Sales', 'Mia Robinson', 8.0, 8.0, 8.5, 8.2, 'Great mentor who leads by example. Creates a positive competitive environment.', '2025-02-01'),
('Sandra Lee', 'HR', 'David Wilson', 9.0, 8.5, 9.5, 9.0, 'Truly cares about employee wellbeing. Leads with empathy and integrity.', '2025-02-01'),
('Sandra Lee', 'HR', 'Nathan Clark', 7.5, 7.0, 7.0, 7.2, 'Good leader but needs to push back on increasing admin workload for the team.', '2025-02-01'),
('Robert Kim', 'Finance', 'Emma Brown', 5.5, 6.0, 5.0, 5.5, 'Technically competent but does not address work-life balance concerns adequately.', '2025-02-02'),
('Robert Kim', 'Finance', 'Olivia Harris', 6.0, 6.5, 5.5, 6.0, 'Knows the domain well but interpersonal skills need improvement.', '2025-02-02'),
('Jane Foster', 'Operations', 'Frank Miller', 8.0, 7.5, 8.5, 8.0, 'Reliable and supportive. Gives clear objectives and trusts the team to deliver.', '2025-02-02'),
('Mike Johnson', 'Product', 'Grace Lee', 5.5, 7.0, 5.0, 5.8, 'Has good ideas but does not communicate rationale. Decisions feel arbitrary.', '2025-02-02'),
('Anna Park', 'Design', 'Henry Taylor', 9.0, 9.5, 9.0, 9.2, 'Incredible design leader. Creates space for creativity while maintaining quality.', '2025-02-03'),
('Tom Bradley', 'Legal', 'Ivy Chen', 7.5, 7.0, 8.0, 7.5, 'Solid legal guidance but needs to advocate for team growth with leadership.', '2025-02-03'),
('Laura Garcia', 'Support', 'Jack Anderson', 6.0, 5.0, 6.5, 5.8, 'Tries her best but cannot solve the fundamental understaffing problem.', '2025-02-03');

-- Culture Index
INSERT INTO culture_index (department, dimension, score, benchmark, gap, comments, survey_date) VALUES
('Engineering', 'Innovation', 8.5, 7.5, 1.0, 'Strong culture of experimentation. Hackathons and innovation sprints are well-received.', '2025-01-31'),
('Engineering', 'Collaboration', 7.8, 8.0, -0.2, 'Good within teams but cross-team collaboration could improve.', '2025-01-31'),
('Marketing', 'Creativity', 7.0, 7.5, -0.5, 'Creative talent exists but is constrained by shifting priorities and limited resources.', '2025-01-31'),
('Marketing', 'Communication', 6.0, 7.0, -1.0, 'Internal communication is inconsistent. Strategy changes not well communicated.', '2025-01-31'),
('Sales', 'Competitiveness', 8.0, 7.0, 1.0, 'Healthy competitive spirit. Strong drive to exceed targets.', '2025-02-01'),
('Sales', 'Ethics', 6.5, 8.0, -1.5, 'Some concerns about pressure tactics. Ethics training needed.', '2025-02-01'),
('HR', 'Empathy', 9.0, 7.5, 1.5, 'HR team leads by example in creating an empathetic workplace.', '2025-02-01'),
('HR', 'Transparency', 7.0, 7.5, -0.5, 'Good within HR but information flow to other departments could improve.', '2025-02-01'),
('Finance', 'Accuracy', 9.0, 8.5, 0.5, 'Exceptional attention to detail and compliance standards.', '2025-02-02'),
('Finance', 'Work-Life Balance', 4.5, 7.0, -2.5, 'Significant gap. Month-end and year-end periods are particularly challenging.', '2025-02-02'),
('Operations', 'Efficiency', 8.0, 7.0, 1.0, 'Continuous improvement mindset. Strong operational metrics.', '2025-02-02'),
('Design', 'Creativity', 9.5, 8.0, 1.5, 'Outstanding creative culture. Freedom to explore and innovate.', '2025-02-02'),
('Legal', 'Thoroughness', 8.5, 8.0, 0.5, 'Meticulous approach to legal work. No compliance issues.', '2025-02-03'),
('Support', 'Resilience', 5.0, 7.0, -2.0, 'Team is burning out. Resilience is being tested by chronic understaffing.', '2025-02-03'),
('Product', 'Vision', 7.0, 7.5, -0.5, 'Good product thinking but vision gets diluted by constant scope changes.', '2025-02-03');
