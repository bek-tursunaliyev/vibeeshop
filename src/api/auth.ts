import { Router } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { validateTelegramInitData, authenticateUser, AuthRequest } from './middleware';

const router = Router();
const JWT_SECRET = process.env.TELEGRAM_BOT_TOKEN || 'fallback_secret_for_dev';
const ADMIN_ID = process.env.ADMIN_TELEGRAM_ID || '8594155055';

router.post('/telegram', async (req, res): Promise<any> => {
  const { initData, devModeId } = req.body;
  let telegramUser = null;

  // Mahalliy sinov uchun dasturchi rejimi
  if (process.env.NODE_ENV !== 'production' && devModeId) {
    telegramUser = {
      id: devModeId,
      first_name: devModeId === parseInt(ADMIN_ID) ? 'Admin' : 'Test',
      last_name: 'User',
      username: devModeId === parseInt(ADMIN_ID) ? 'admin' : 'testuser',
      language_code: 'uz'
    };
  } else {
    // Haqiqiy Telegram tekshiruvi (token atrofidagi bo'sh joylarni tozalash)
    const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
    if (!botToken) {
      return res.status(500).json({ error: "Server xatosi: TELEGRAM_BOT_TOKEN o'rnatilmagan yoki noto'g'ri." });
    }
    
    telegramUser = validateTelegramInitData(initData, botToken);
    
    if (!telegramUser) {
      return res.status(401).json({ error: "Telegram autentifikatsiyasi xato (Kiritilgan bot token noto'g'ri bo'lishi mumkin)" });
    }
  }

  try {
    const tId = telegramUser.id.toString();
    const isAdmin = tId === ADMIN_ID;
    const role = isAdmin ? 'admin' : 'user';

    // Foydalanuvchini bazadan izlash
    let userRecord = await db.query.users.findFirst({
      where: eq(users.telegramId, tId)
    });

    if (!userRecord) {
      // Yangi foydalanuvchini yaratish
      const result = await db.insert(users).values({
        telegramId: tId,
        firstName: telegramUser.first_name || '',
        lastName: telegramUser.last_name || '',
        username: telegramUser.username || '',
        profilePhotoUrl: telegramUser.photo_url || null,
        role: role
      }).returning();
      userRecord = result[0];
    } else {
      // Ma'lumotlarni yangilash (agar ism, familiya o'zgargan bo'lsa)
      if (isAdmin && userRecord.role !== 'admin') {
         const updated = await db.update(users)
           .set({ role: 'admin', firstName: telegramUser.first_name || userRecord.firstName })
           .where(eq(users.id, userRecord.id))
           .returning();
         userRecord = updated[0];
      }
    }

    // JWT token yaratish
    const token = jwt.sign(
      { 
        id: userRecord.id, 
        telegramId: userRecord.telegramId, 
        role: userRecord.role,
        firstName: userRecord.firstName,
        lastName: userRecord.lastName
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({ token, user: userRecord });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ error: "Avtorizatsiya jarayonida xatolik yuz berdi" });
  }
});

router.get('/me', authenticateUser, async (req: AuthRequest, res): Promise<any> => {
  try {
    const userRecord = await db.query.users.findFirst({
      where: eq(users.id, req.user!.id)
    });
    if (!userRecord) return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
    res.json({ user: userRecord });
  } catch (error) {
    res.status(500).json({ error: "Server xatosi" });
  }
});

export default router;
