const { sequelize } = require('../config/database');

async function auditDB() {
  console.log('=== DATABASE SCHEMA AUDIT ===\n');

  // 1. Check Tables
  const [tables] = await sequelize.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
  );
  console.log('Tables found (' + tables.length + '):');
  tables.forEach(t => console.log('  • ' + t.table_name));

  const checkTable = async (tableName) => {
    const [cols] = await sequelize.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${tableName}' ORDER BY ordinal_position;`
    );
    console.log(`\n${tableName} Columns (${cols.length}):`);
    cols.forEach(c => console.log(`  - ${c.column_name}: ${c.data_type}`));
  };

  await checkTable('Challenges');
  await checkTable('Solutions');
  await checkTable('Teams');
  await checkTable('Milestones');
  await checkTable('IndustryPartnerships');
  await checkTable('CommunityFeedbacks');
  await checkTable('Users');

  process.exit(0);
}

auditDB().catch(e => { console.error(e); process.exit(1); });
