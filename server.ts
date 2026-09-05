import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import fs from 'fs';
import { checkDbConnection, getDbStatus } from './src/db';

// API Routers
import authRouter from './src/api/auth';
import catalogRouter from './src/api/catalog';
import cartRouter from './src/api/cart';
import ordersRouter from './src/api/orders';

const PORT = 3000;

// Multer orqali rasmlarni yuklash (local disk storage)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './public/uploads';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

async function startServer() {
  // Avval bazani tekshiramiz
  await checkDbConnection();

  const app = express();
  
  app.use(cors());
  app.use(express.json());

  // Rasmlarni public folder orqali uzatish
  app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

  // Upload endpoint (Admin only ideally, but keeping it simple for now or you can add middleware)
  app.post('/api/upload', upload.single('image'), (req, res): any => {
    if (!req.file) {
      return res.status(400).json({ error: 'Rasm yuklanmadi' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
  });

  // API Routes
  app.use('/api', (req, res, next) => {
    if (!getDbStatus() && req.path !== '/health') {
      return res.status(503).json({ error: 'DATABASE_URL_MISSING', message: "Ma'lumotlar bazasiga ulanish yo'q." });
    }
    next();
  });
  app.use('/api/auth', authRouter);
  app.use('/api/catalog', catalogRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/orders', ordersRouter);
  
  // Health check
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  // Vite middleware for development and static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server ishga tushdi: http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
