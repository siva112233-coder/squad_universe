import 'dotenv/config';
// Fix TLS/SSL compatibility with MongoDB Atlas on Windows (Node 18+ OpenSSL issue)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(process.env as any).NODE_TLS_REJECT_UNAUTHORIZED = '0';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import memoriesRouter from './routes/memories';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL || '',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'production') {
      return callback(null, true);
    }
    callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Routes
app.use('/api/memories', memoriesRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Our Squad Universe API is running 🌟' });
});

// Serve frontend static files in production or if dist directory exists
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// MongoDB connection + server start
const startServer = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI not defined in environment variables');

    await mongoose.connect(mongoUri, {
      tls: true,
      tlsAllowInvalidCertificates: false,
      serverSelectionTimeoutMS: 15000,
    });
    console.log('✅ Connected to MongoDB Atlas');

    app.listen(PORT, () => {
      console.log(`🌟 Our Squad Universe server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
