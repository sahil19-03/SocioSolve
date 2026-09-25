const { sequelize } = require('../config/database');

async function migrate() {
  console.log('🔄 Checking Users table columns...');
  try {
    await sequelize.query(`ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "phone" VARCHAR(255);`);
    console.log('✅ Added phone column to Users table.');
  } catch (err) {
    console.log('Note:', err.message);
  }
}

migrate()
  .catch(err => console.error('Migration error:', err))
  .finally(() => process.exit(0));
