import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/format';
import { useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';

export default function CheckoutPage() {
  const { cartTotal, clearCart } = useCart();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    address: '',
    note: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.address) {
      WebApp.showAlert("Iltimos, barcha majburiy maydonlarni to'ldiring.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        clearCart();
        WebApp.showAlert("Buyurtmangiz muvaffaqiyatli qabul qilindi!", () => {
           navigate('/orders');
        });
      } else {
        const data = await res.json();
        WebApp.showAlert(data.error || "Xatolik yuz berdi");
      }
    } catch (err) {
      console.error(err);
      WebApp.showAlert("Tarmoq xatosi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto pb-24">
      <h2 className="font-bold text-xl mb-4">Rasmiylashtirish</h2>
      
      <div className="bg-blue-50 p-4 rounded-xl mb-6">
        <p className="text-blue-800 font-medium text-sm mb-1">To'lanadigan summa:</p>
        <p className="text-2xl font-bold text-blue-900">{formatPrice(cartTotal)}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ism *</label>
          <input 
            type="text" required
            value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Familiya *</label>
          <input 
            type="text" required
            value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefon raqam *</label>
          <input 
            type="tel" required
            value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500" 
            placeholder="+998 90 123 45 67"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Yetkazib berish manzili *</label>
          <textarea 
            required rows={3}
            value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500" 
            placeholder="Viloyat, shahar, ko'cha, uy raqami..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Qo'shimcha izoh (ixtiyoriy)</label>
          <textarea 
            rows={2}
            value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500" 
            placeholder="Kuryer uchun qandaydir eslatma..."
          />
        </div>

        <button 
          type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl mt-4 hover:bg-blue-700 disabled:opacity-70 flex justify-center"
        >
          {loading ? "Kuting..." : "Tasdiqlash"}
        </button>
      </form>
    </div>
  );
}
