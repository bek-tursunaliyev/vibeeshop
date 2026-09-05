import { Router } from 'express';
import { db } from '../db';
import { categories, products } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { authenticateUser, requireAdmin } from './middleware';

const router = Router();

// Hamma uchun mavjud routerlar
router.get('/categories', async (req, res) => {
  try {
    const allCategories = await db.select().from(categories).orderBy(desc(categories.createdAt));
    res.json(allCategories);
  } catch (error) {
    res.status(500).json({ error: "Kategoriyalarni yuklashda xatolik" });
  }
});

router.get('/products', async (req, res) => {
  const { categoryId, search } = req.query;
  try {
    // Asosiy: Faqat faol mahsulotlarni ko'rsatish
    let query = db.select().from(products).where(eq(products.active, true)).orderBy(desc(products.createdAt));
    // Drizzle-da to'liq filteringni osonlashtirish uchun API darajasida JS orqali filtrlaymiz (soddalashtirilgan)
    const allProducts = await query;
    let filtered = allProducts;
    
    if (categoryId) {
      filtered = filtered.filter(p => p.categoryId === parseInt(categoryId as string));
    }
    
    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
    }
    
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: "Mahsulotlarni yuklashda xatolik" });
  }
});

router.get('/products/:id', async (req, res): Promise<any> => {
  try {
    const product = await db.query.products.findFirst({
      where: eq(products.id, parseInt(req.params.id)),
      with: { category: true }
    });
    if (!product) return res.status(404).json({ error: "Mahsulot topilmadi" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Mahsulotni yuklashda xatolik" });
  }
});

// Admin uchun routerlar
router.post('/categories', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { name, imageUrl } = req.body;
    const result = await db.insert(categories).values({ name, imageUrl }).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Kategoriya yaratishda xatolik" });
  }
});

router.put('/categories/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { name, imageUrl } = req.body;
    const result = await db.update(categories)
      .set({ name, imageUrl })
      .where(eq(categories.id, parseInt(req.params.id)))
      .returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Kategoriyani yangilashda xatolik" });
  }
});

router.delete('/categories/:id', authenticateUser, requireAdmin, async (req, res): Promise<any> => {
  try {
    // Kategoriya o'chirilishidan oldin uning mahsulotlarini tekshirish
    const categoryProducts = await db.select().from(products).where(eq(products.categoryId, parseInt(req.params.id)));
    if (categoryProducts.length > 0) {
      return res.status(400).json({ error: "Bu kategoriyada mahsulotlar bor. Avval ularni o'chiring yoki boshqa kategoriyaga o'tkazing." });
    }
    await db.delete(categories).where(eq(categories.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Kategoriyani o'chirishda xatolik" });
  }
});

// Admin - barcha mahsulotlar (shu jumladan nofaollari ham)
router.get('/admin/products', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const allProducts = await db.query.products.findMany({
      orderBy: [desc(products.createdAt)],
      with: { category: true }
    });
    res.json(allProducts);
  } catch (error) {
    res.status(500).json({ error: "Mahsulotlarni yuklashda xatolik" });
  }
});

router.post('/admin/products', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, imageUrl, categoryId, stock, active } = req.body;
    const result = await db.insert(products).values({
      name, description, price: price.toString(), imageUrl, categoryId, stock, active
    }).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Mahsulot yaratishda xatolik" });
  }
});

router.put('/admin/products/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, imageUrl, categoryId, stock, active } = req.body;
    const result = await db.update(products)
      .set({ name, description, price: price.toString(), imageUrl, categoryId, stock, active })
      .where(eq(products.id, parseInt(req.params.id)))
      .returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Mahsulotni yangilashda xatolik" });
  }
});

router.delete('/admin/products/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    await db.delete(products).where(eq(products.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Mahsulotni o'chirishda xatolik (Katta ehtimol bilan buyurtmalarga bog'langan)" });
  }
});

export default router;
