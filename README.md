# Telegram Mini App - E-commerce (Uzbek)

Bu to'liq ishlaydigan, real e-commerce Telegram Mini App loyihasi.

## Stack
- Frontend: React (Vite), TailwindCSS, @twa-dev/sdk
- Backend: Node.js, Express, Drizzle ORM
- Ma'lumotlar bazasi: PostgreSQL

## Ishga tushirish

1. `.env` faylini yarating va ma'lumotlarni to'ldiring:
```env
TELEGRAM_BOT_TOKEN="sizning_bot_tokeningiz"
ADMIN_TELEGRAM_ID="8594155055"
DATABASE_URL="postgresql://user:pass@host/db"
```

2. Paketlarni o'rnating:
```bash
npm install
```

3. Ma'lumotlar bazasini yangilang (Jadvallarni yaratish):
```bash
npm run db:push
```

4. Serverni ishga tushiring:
```bash
npm run dev
```

## Admin Huquqlari
`ADMIN_TELEGRAM_ID` muhit o'zgaruvchisida belgilangan Telegram ID ga ega foydalanuvchi avtomatik tarzda admin huquqiga ega bo'ladi. U barcha mahsulotlar, buyurtmalar va kategoriyalarni boshqarishi hamda "Preview Mode" orqali mijoz interfeysini ko'rishi mumkin.
