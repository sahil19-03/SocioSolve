const { sequelize } = require('../config/database');

async function migrate() {
  console.log('🔄 Phases 8, 9 & 10: Adding Evaluation Rubric, Pilot Deployment, & Impact Handover columns...');

  const statements = [
    // Phase 8: Multi-Axis Independent Prototype Evaluation (3-Axis Rubric)
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "technicalScore" INTEGER;`,
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "socialImpactScore" INTEGER;`,
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "deploymentReadinessScore" INTEGER;`,
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "compositeScore" NUMERIC(5,2);`,
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "pilotReadinessCertified" BOOLEAN DEFAULT FALSE;`,
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "evaluatedById" UUID;`,
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "evaluatedAt" TIMESTAMP WITH TIME ZONE;`,
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "conflictCheckConfirmed" BOOLEAN DEFAULT FALSE;`,
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "identifiedRisks" TEXT;`,

    // Phase 9: Industry Partnership & Pilot Deployment Approval
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "pilotRequested" BOOLEAN DEFAULT FALSE;`,
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "pilotRequestedAt" TIMESTAMP WITH TIME ZONE;`,
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "pilotRequestDetails" TEXT;`,
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "pilotPermitGranted" BOOLEAN DEFAULT FALSE;`,
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "pilotPermitNumber" VARCHAR(100);`,
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "pilotSiteLocation" VARCHAR(255);`,
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "pilotPermitGrantedAt" TIMESTAMP WITH TIME ZONE;`,
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "pilotPermitOfficerNotes" TEXT;`,
    `ALTER TABLE "Solutions" ADD COLUMN IF NOT EXISTS "pilotStatus" VARCHAR(50) DEFAULT 'none';`,

    // Phase 10: Community Feedback, Impact Validation & Implementation
    `ALTER TABLE "Challenges" ADD COLUMN IF NOT EXISTS "beneficiaryCount" INTEGER DEFAULT 0;`,
    `ALTER TABLE "Challenges" ADD COLUMN IF NOT EXISTS "baselineMetric" TEXT;`,
    `ALTER TABLE "Challenges" ADD COLUMN IF NOT EXISTS "targetMetric" TEXT;`,
    `ALTER TABLE "Challenges" ADD COLUMN IF NOT EXISTS "actualMetric" TEXT;`,
    `ALTER TABLE "Challenges" ADD COLUMN IF NOT EXISTS "communityRating" NUMERIC(3,2) DEFAULT 0.0;`,
    `ALTER TABLE "Challenges" ADD COLUMN IF NOT EXISTS "communityRatingCount" INTEGER DEFAULT 0;`,
    `ALTER TABLE "Challenges" ADD COLUMN IF NOT EXISTS "handoverStatus" VARCHAR(50) DEFAULT 'pending';`,
    `ALTER TABLE "Challenges" ADD COLUMN IF NOT EXISTS "handoverNotes" TEXT;`,
    `ALTER TABLE "Challenges" ADD COLUMN IF NOT EXISTS "handoverDate" TIMESTAMP WITH TIME ZONE;`,

    // Community feedback tracking table if not exists
    `CREATE TABLE IF NOT EXISTS "CommunityFeedbacks" (
      "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "challengeId" UUID NOT NULL REFERENCES "Challenges"("id") ON DELETE CASCADE,
      "citizenId" UUID REFERENCES "Users"("id") ON DELETE SET NULL,
      "rating" INTEGER NOT NULL CHECK ("rating" >= 1 AND "rating" <= 5),
      "feedback" TEXT NOT NULL,
      "verifiedImpact" BOOLEAN DEFAULT FALSE,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`
  ];

  for (const sql of statements) {
    try {
      await sequelize.query(sql);
      console.log('Done:', sql.substring(0, 80));
    } catch (e) {
      console.warn('Note:', e.message.substring(0, 120));
    }
  }

  console.log('✅ Phases 8, 9 & 10 migrations complete.');
}

migrate()
  .catch(err => console.error('Migration failed:', err))
  .finally(() => process.exit(0));
