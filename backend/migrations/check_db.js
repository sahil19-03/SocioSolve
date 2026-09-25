const { sequelize } = require('../config/database');
async function check() {
  const [challenges] = await sequelize.query(
    "SELECT title, status, \"submissionCode\", urgency, \"affectedPopulation\", district, state FROM \"Challenges\" ORDER BY \"createdAt\" DESC LIMIT 10;"
  );
  console.log('\n📋 Challenges in DB:\n');
  challenges.forEach(c => {
    console.log(`  [${c.status}] ${c.submissionCode || 'N/A'} — ${c.title.slice(0, 60)}`);
    console.log(`    Location: ${c.district || '-'}, ${c.state || '-'} | Urgency: ${c.urgency || '-'} | Population: ${c.affectedPopulation || '-'}\n`);
  });
}
check().catch(console.error).finally(() => process.exit(0));
