const { sequelize } = require('../config/database');

async function migrate() {
  console.log('🔄 Phase 3 & 4: Adding University Interest columns...');

  const statements = [
    // Phase 4: University can express interest before govt confirms assignment
    `ALTER TABLE "Challenges" ADD COLUMN IF NOT EXISTS "institutionInterestId" UUID;`,
    `ALTER TABLE "Challenges" ADD COLUMN IF NOT EXISTS "institutionInterestNote" TEXT;`,
    `ALTER TABLE "Challenges" ADD COLUMN IF NOT EXISTS "institutionInterestAt" TIMESTAMP WITH TIME ZONE;`,
    // Phase 3: Domain expertise tags for university matching
    `ALTER TABLE "Challenges" ADD COLUMN IF NOT EXISTS "domainExpertise" TEXT[];`,
  ];

  for (const sql of statements) {
    try {
      await sequelize.query(sql);
      console.log('Done:', sql.substring(0, 80));
    } catch (e) {
      console.warn('Note:', e.message.substring(0, 120));
    }
  }

  console.log('✅ Phase 3 & 4 migrations complete.');
}

migrate()
  .catch(err => console.error('Migration failed:', err))
  .finally(() => process.exit(0));
