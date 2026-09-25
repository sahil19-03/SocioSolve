const { Sequelize } = require('sequelize');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const isSupabase = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: (isProduction || isSupabase)
    ? { ssl: { require: true, rejectUnauthorized: false } }  // Supabase requires SSL
    : {},
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ PostgreSQL connected (${isProduction ? 'Supabase' : 'Local'})`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
