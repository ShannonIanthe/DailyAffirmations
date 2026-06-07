import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db';
import authRoutes from './routes/auth';
import affirmationRoutes from './routes/affirmations';
import userAffirmationRoutes from './routes/user-affirmations';
import logRoutes from './routes/logs';
import userRoutes from './routes/users';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS === '*'
    ? true  // allow all (for Capacitor file:// origin)
    : process.env.CORS_ORIGINS?.split(',').map(s => s.trim()) || true,
  credentials: true,
}));
app.use(express.json());

// Initialize database
initializeDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/affirmations', affirmationRoutes);
app.use('/api/user-affirmations', userAffirmationRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Daily Affirm API server running on http://0.0.0.0:${PORT}`);
});