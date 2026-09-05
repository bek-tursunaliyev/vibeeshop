import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart, Product, Category } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import { Search } from 'lucide-react';
import WebApp from '@twa-dev/sdk';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { addToCart } = useCart();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [activeCategory, search]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/catalog/categories');
      if (res.ok) setCategories(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/api/catalog/products?';
      if (activeCategory) url += `categoryId=${activeCategory}&`;
      if (search) url += `search=${search}`;
      
      const res = await fetch(url);
      if (res.ok) setProducts(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAddToCart = async (product: Product) => {
    if (product.stock <= 0) return;
    try {
      // Haptic feedback (Telegram API)
      if (WebApp.HapticFeedback) WebApp.HapticFeedback.impactOccurred('light');
      
      await addToCart(product.id, 1);
      WebApp.showAlert("Mahsulot savatga qo‘shildi!");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Search */}
      <div className="relative">
        <input 
          type="text" 
          placeholder="Mahsulot izlash..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-blue-500 transition-colors"
        />
        <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h2 className="font-bold text-lg mb-3">Kategoriyalar</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                activeCategory === null ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700'
              }`}
            >
              Barchasi
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                  activeCategory === c.id ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div>
        <h2 className="font-bold text-lg mb-3">Mahsulotlar</h2>
        
        {loading ? (
          <div className="flex justify-center p-8">Yuklanmoqda...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Mahsulotlar topilmadi</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map(p => (
              <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
                <div className="aspect-square bg-gray-100 relative">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">Rasm yo'q</div>
                  )}
                  {p.stock <= 0 && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Tugagan</span>
                    </div>
                  )}
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="font-medium text-sm line-clamp-2 leading-tight flex-1 mb-1">{p.name}</h3>
                  <p className="font-bold text-blue-600 text-sm mb-2">{formatPrice(p.price)}</p>
                  
                  <button 
                    onClick={() => handleAddToCart(p)}
                    disabled={p.stock <= 0}
                    className="w-full bg-blue-50 text-blue-600 font-medium py-2 rounded-xl text-sm hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    Savatga
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
