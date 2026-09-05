import { Router } from 'express';
import { db } from '../db';
import { carts, cartItems, products } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { authenticateUser, AuthRequest } from './middleware';

const router = Router();

// Foydalanuvchining savatini olish yoki yaratish yordamchi funksiyasi
async function getOrCreateCart(userId: number) {
  let userCart = await db.query.carts.findFirst({
    where: eq(carts.userId, userId),
  });

  if (!userCart) {
    const result = await db.insert(carts).values({ userId }).returning();
    userCart = result[0];
  }
  return userCart;
}

router.get('/', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const cart = await getOrCreateCart(req.user!.id);
    const items = await db.query.cartItems.findMany({
      where: eq(cartItems.cartId, cart.id),
      with: { product: true }
    });
    res.json({ cart, items });
  } catch (error) {
    res.status(500).json({ error: "Savatni yuklashda xatolik" });
  }
});

router.post('/items', authenticateUser, async (req: AuthRequest, res): Promise<any> => {
  try {
    const { productId, quantity } = req.body;
    
    // Mahsulotni tekshirish
    const product = await db.query.products.findFirst({ where: eq(products.id, productId) });
    if (!product) return res.status(404).json({ error: "Mahsulot topilmadi" });
    if (!product.active || product.stock < quantity) {
      return res.status(400).json({ error: "Mahsulot yetarli miqdorda mavjud emas" });
    }

    const cart = await getOrCreateCart(req.user!.id);
    
    // Savatda allaqachon bormi?
    const existingItem = await db.query.cartItems.findFirst({
      where: and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId))
    });

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (newQty > product.stock) {
         return res.status(400).json({ error: "Bazada buncha mahsulot qolmagan" });
      }
      const updated = await db.update(cartItems)
        .set({ quantity: newQty })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return res.json(updated[0]);
    } else {
      const inserted = await db.insert(cartItems).values({
        cartId: cart.id,
        productId,
        quantity
      }).returning();
      return res.json(inserted[0]);
    }
  } catch (error) {
    res.status(500).json({ error: "Savatga qo'shishda xatolik" });
  }
});

router.put('/items/:id', authenticateUser, async (req: AuthRequest, res): Promise<any> => {
  try {
    const { quantity } = req.body;
    const itemId = parseInt(req.params.id);
    
    const item = await db.query.cartItems.findFirst({
      where: eq(cartItems.id, itemId),
      with: { product: true }
    });
    
    if (!item) return res.status(404).json({ error: "Savat elementi topilmadi" });
    if (quantity > item.product.stock) {
      return res.status(400).json({ error: "Bazada buncha mahsulot yo'q" });
    }
    
    if (quantity <= 0) {
      await db.delete(cartItems).where(eq(cartItems.id, itemId));
      return res.json({ success: true, deleted: true });
    }
    
    const updated = await db.update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, itemId))
      .returning();
      
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: "Savatni yangilashda xatolik" });
  }
});

router.delete('/items/:id', authenticateUser, async (req: AuthRequest, res) => {
  try {
    await db.delete(cartItems).where(eq(cartItems.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Savatdan o'chirishda xatolik" });
  }
});

router.delete('/', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const cart = await getOrCreateCart(req.user!.id);
    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Savatni tozalashda xatolik" });
  }
});

export default router;
