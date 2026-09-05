import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/format';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import WebApp from '@twa-dev/sdk';

export default function AdminProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        fetch('/api/catalog/admin/products', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/catalog/categories')
      ]);
      setProducts(await pRes.json());
      setCategories(await cRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', e.target.files[0]);
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentProduct({ ...currentProduct, imageUrl: data.url });
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
      alert("Xatolik");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = currentProduct.id ? `/api/catalog/admin/products/${currentProduct.id}` : `/api/catalog/admin/products`;
      const method = currentProduct.id ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentProduct)
      });
      
      if (res.ok) {
        setIsEditing(false);
        fetchData();
        WebApp.showAlert("Muvaffaqiyatli saqlandi!");
      } else {
        alert("Xatolik yuz berdi");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Rostdan ham o'chirmoqchimisiz?")) return;
    try {
      const res = await fetch(`/api/catalog/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
      } else {
        const d = await res.json();
        alert(d.error);
      }
    } catch (e) { console.error(e); }
  };

  if (isEditing) {
    return (
      <div className="p-4 bg-white min-h-screen">
        <h2 className="font-bold text-xl mb-4">{currentProduct.id ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4 pb-20">
          <div>
            <label className="block text-sm font-medium mb-1">Nomi</label>
            <input required type="text" value={currentProduct?.name || ''} onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Narxi</label>
            <input required type="number" value={currentProduct?.price || ''} onChange={e => setCurrentProduct({...currentProduct, price: e.target.value})} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kategoriya</label>
            <select required value={currentProduct?.categoryId || ''} onChange={e => setCurrentProduct({...currentProduct, categoryId: parseInt(e.target.value)})} className="w-full border p-2 rounded">
              <option value="">Tanlang</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ombordagi qoldiq</label>
            <input required type="number" value={currentProduct?.stock || 0} onChange={e => setCurrentProduct({...currentProduct, stock: parseInt(e.target.value)})} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tavsif</label>
            <textarea value={currentProduct?.description || ''} onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})} className="w-full border p-2 rounded" rows={3}></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Rasm yuklash</label>
            {currentProduct?.imageUrl && <img src={currentProduct.imageUrl} className="h-24 w-24 object-cover mb-2 rounded" />}
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="w-full border p-2 rounded" />
            {uploadingImage && <span className="text-sm text-blue-500">Yuklanmoqda...</span>}
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={currentProduct?.active ?? true} onChange={e => setCurrentProduct({...currentProduct, active: e.target.checked})} id="active" />
            <label htmlFor="active" className="text-sm font-medium">Faol (sotuvda mavjud)</label>
          </div>
          
          <div className="flex gap-2 pt-4">
            <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-gray-200 py-3 rounded-xl font-medium">Bekor qilish</button>
            <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium">Saqlash</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-xl">Mahsulotlar</h2>
        <button 
          onClick={() => { setCurrentProduct({ active: true, stock: 1 }); setIsEditing(true); }}
          className="bg-blue-600 text-white p-2 rounded-lg flex items-center gap-1 text-sm font-medium"
        >
          <Plus size={16} /> Qo'shish
        </button>
      </div>

      {loading ? <div>Yuklanmoqda...</div> : (
        <div className="space-y-3 pb-20">
          {products.map(p => (
            <div key={p.id} className="bg-white p-3 border rounded-xl flex gap-3">
              <img src={p.imageUrl || ''} alt="" className="w-16 h-16 bg-gray-100 rounded object-cover" />
              <div className="flex-1">
                <h3 className="font-medium line-clamp-1">{p.name}</h3>
                <p className="text-blue-600 font-bold text-sm">{formatPrice(p.price)}</p>
                <p className="text-xs text-gray-500">Omborda: {p.stock} ta | {p.active ? 'Faol' : 'Nofaol'}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => { setCurrentProduct(p); setIsEditing(true); }} className="p-2 text-blue-600 bg-blue-50 rounded"><Edit2 size={16}/></button>
                <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 bg-red-50 rounded"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
