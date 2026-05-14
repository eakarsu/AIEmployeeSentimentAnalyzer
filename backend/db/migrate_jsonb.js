const db = require('./index');

const AI_ANALYSIS_TABLES = [
  { table: 'employee_surveys', column: 'ai_analysis' },
  { table: 'department_analytics', column: 'ai_insights' },
  { table: 'pulse_checks', column: 'ai_analysis' },
  { table: 'feedback_analysis', column: 'ai_analysis' },
  { table: 'retention_risks', column: 'ai_prediction' },
  { table: 'engagement_scores', column: 'ai_recommendations' },
  { table: 'team_morale', column: 'ai_analysis' },
  { table: 'exit_interviews', column: 'ai_analysis' },
  { table: 'anonymous_reports', column: 'ai_analysis' },
  { table: 'performance_reviews', column: 'ai_analysis' },
  { table: 'onboarding_feedback', column: 'ai_analysis' },
  { table: 'benefits_satisfaction', column: 'ai_analysis' },
  { table: 'work_life_balance', column: 'ai_analysis' },
  { table: 'leadership_ratings', column: 'ai_analysis' },
  { table: 'culture_index', column: 'ai_analysis' },
];

async function runMigration() {
  for (const { table, column } of AI_ANALYSIS_TABLES) {
    try {
      // Check current column type
      const typeCheck = await db.query(
        `SELECT data_type FROM information_schema.columns WHERE table_name=$1 AND column_name=$2`,
        [table, column]
      );

      if (typeCheck.rows.length === 0) {
        console.log(`Column ${column} not found in ${table}, skipping.`);
        continue;
      }

      const currentType = typeCheck.rows[0].data_type;
      if (currentType === 'jsonb') {
        console.log(`${table}.${column} is already JSONB, skipping.`);
        continue;
      }

      // Alter column from TEXT to JSONB
      await db.query(
        `ALTER TABLE ${table} ALTER COLUMN ${column} TYPE JSONB USING (
          CASE
            WHEN ${column} IS NULL THEN NULL
            WHEN ${column} = '' THEN NULL
            ELSE ${column}::jsonb
          END
        )`
      );
      console.log(`Migrated ${table}.${column} from TEXT to JSONB`);
    } catch (err) {
      console.error(`Failed to migrate ${table}.${column}:`, err.message);
    }
  }
}

module.exports = { runMigration };
