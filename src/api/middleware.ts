import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.TELEGRAM_BOT_TOKEN || 'fallback_secret_for_dev';
const ADMIN_ID = process.env.ADMIN_TELEGRAM_ID || '8594155055';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    telegramId: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

// Telegram initData tekshirish funksiyasi
export function validateTelegramInitData(initData: string, botToken: string): any {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) return null;
    
    urlParams.delete('hash');
    const keys = Array.from(urlParams.keys()).sort();
    const dataCheckString = keys.map(key => `${key}=${urlParams.get(key)}`).join('\n');
    
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
    
    if (calculatedHash === hash) {
      const userStr = urlParams.get('user');
      if (userStr) return JSON.parse(userStr);
    }
    return null;
  } catch (err) {
    console.error("Telegram validation error:", err);
    return null;
  }
}

// Middlware: Foydalanuvchini autentifikatsiya qilish
export const authenticateUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Ro'yxatdan o'tilmagan" });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Noto'g'ri yoki muddati o'tgan token" });
  }
};

// Middleware: Admin huquqini tekshirish
export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: "Ruxsat etilmagan. Faqat adminlar uchun." });
  }
  next();
};
