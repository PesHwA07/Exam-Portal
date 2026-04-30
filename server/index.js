import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import resultRoutes from './routes/results.js';
import questionRoutes from './routes/questions.js';

const app = express();

// CORS — allow all origins in production (same domain) and localhost in dev
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (serverless same-domain, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // In production, allow the Vercel domain
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    return callback(null, true); // permissive for now
  },
}));

app.use(express.json({ limit: '10mb' }));
app.use('/api/auth', authRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/questions', questionRoutes);
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── MongoDB connection with caching for serverless ──
let isConnected = false;

export async function connectDB() {
  if (isConnected) return;
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log('✅ Connected to MongoDB');
}

// ── Standalone server mode (local dev) ──
const isVercel = process.env.VERCEL === '1';

if (!isVercel) {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('❌ MongoDB connection failed:', err.message);
      process.exit(1);
    });
}

export default app;
