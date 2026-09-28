require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, sequelize } = require('./config/database');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve production client build if it exists
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// ─── API Routes ───────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/challenges', require('./routes/challenges'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/solutions', require('./routes/solutions'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/milestones', require('./routes/milestones'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/industry', require('./routes/industry'));
app.use('/api/analytics', require('./routes/analytics'));

// ─── Health Check ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SocioSolve API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// ─── Serve client SPA for non-API routes in production ────────────
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    const indexPath = path.join(clientDistPath, 'index.html');
    return res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(200).send(`
          <h2>SocioSolve Backend API is Running</h2>
          <p>The React client dev server is available at: <a href="http://localhost:3000">http://localhost:3000</a></p>
          <p>API endpoints are available under <code>/api</code></p>
        `);
      }
    });
  }
  next();
});

// ─── Error Handler ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

// ─── Start Server ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  // Sync all models (create tables if not exist)
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synced');
  } catch (syncErr) {
    console.warn('⚠️ Table alter sync warning:', syncErr.message);
    await sequelize.sync();
    console.log('✅ Database tables synced (safe mode)');
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 SocioSolve server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    console.log(`🔌 API Base: http://localhost:${PORT}/api\n`);
  });
};

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = app;
