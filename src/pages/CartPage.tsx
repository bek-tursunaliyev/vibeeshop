import React from 'react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';

export default function CartPage() {
  const { items, cartTotal, updateQuantity, fetchCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] p-4 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <ShoppingCart size={40} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold mb-2">Savatingiz hozircha bo'sh</h2>
        <p className="text-gray-500 mb-6">Xarid qilish uchun mahsulotlarni tanlang</p>
        <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium">Xaridni boshlash</Link>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col h-full">
      <h2 className="font-bold text-xl mb-4">Savat</h2>
      
      <div className="flex-1 space-y-3 mb-24">
        {items.map(item => (
          <div key={item.id} className="bg-white p-3 rounded-2xl flex gap-3 shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
              {item.product.imageUrl && <img src={item.product.imageUrl} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 flex flex-col justify-between py-1">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-medium text-sm leading-tight line-clamp-2">{item.product.name}</h3>
                <button 
                  onClick={() => updateQuantity(item.id, 0)}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="font-bold text-blue-600 text-sm">{formatPrice(item.product.price)}</p>
                
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 disabled:opacity-50"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-6 z-10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-500">Umumiy summa:</span>
          <span className="text-xl font-bold">{formatPrice(cartTotal)}</span>
        </div>
        <button 
          onClick={() => navigate('/checkout')}
          className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors"
        >
          Rasmiylashtirish
        </button>
      </div>
    </div>
  );
}

// Quick fallback for icon
import { ShoppingCart } from 'lucide-react';
