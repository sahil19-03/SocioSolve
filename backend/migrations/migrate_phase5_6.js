const { sequelize } = require('../config/database');

async function migrate() {
  console.log('🔄 Phase 5 & 6: Adding Team Formation & 3-Tier Proposal Review columns...');

  const statements = [
    // Phase 5: Team coordinator approval & university affiliation
    `ALTER TABLE "Teams" ADD COLUMN IF NOT EXISTS "universityId" UUID;`,
    `ALTER TABLE "Teams" ADD COLUMN IF NOT EXISTS "isApprovedByCoordinator" BOOLEAN DEFAULT FALSE;`,
    `ALTER TABLE "Teams" ADD COLUMN IF NOT EXISTS "coordinatorApprovalAt" TIMESTAMP WITH TIME ZONE;`,
    `ALTER TABLE "Teams" ADD COLUMN IF NOT EXISTS "coordinatorNotes" TEXT;`,

    // Phase 6: Structured Solution Proposal sections
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "rootCauseAnalysis" TEXT;`,
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "technicalArchitecture" TEXT;`,
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "impactMetrics" TEXT;`,
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "budgetEstimate" TEXT;`,
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "timelineWeeks" INTEGER;`,
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "riskMitigation" TEXT;`,

    // Phase 6: 3-Tier Sequential Review tracking
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "proposalStatus" VARCHAR(50) DEFAULT 'proposal_submitted';`,
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "currentReviewTier" INTEGER DEFAULT 1;`,

    // Tier 1: Faculty Mentor
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "facultyApproval" VARCHAR(50) DEFAULT 'pending';`,
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "facultyFeedback" TEXT;`,
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "facultyApprovedAt" TIMESTAMP WITH TIME ZONE;`,

    // Tier 2: University Coordinator
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "universityApproval" VARCHAR(50) DEFAULT 'pending';`,
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "universityFeedback" TEXT;`,
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "universityApprovedAt" TIMESTAMP WITH TIME ZONE;`,

    // Tier 3: Government Nodal Officer
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "govtApproval" VARCHAR(50) DEFAULT 'pending';`,
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "govtFeedback" TEXT;`,
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "govtApprovedAt" TIMESTAMP WITH TIME ZONE;`,
  ];

  for (const sql of statements) {
    try {
      await sequelize.query(sql);
      console.log('Done:', sql.substring(0, 80));
    } catch (e) {
      console.warn('Note:', e.message.substring(0, 120));
    }
  }

  console.log('✅ Phase 5 & 6 migrations complete.');
}

migrate()
  .catch(err => console.error('Migration failed:', err))
  .finally(() => process.exit(0));
