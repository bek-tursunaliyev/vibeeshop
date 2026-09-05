import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/format';
import { Package } from 'lucide-react';
import { format } from 'date-fns';

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string, color: string }> = {
    pending: { label: 'Kutilmoqda', color: 'bg-yellow-100 text-yellow-800' },
    confirmed: { label: 'Tasdiqlandi', color: 'bg-blue-100 text-blue-800' },
    preparing: { label: 'Tayyorlanmoqda', color: 'bg-indigo-100 text-indigo-800' },
    delivering: { label: 'Yetkazilmoqda', color: 'bg-purple-100 text-purple-800' },
    completed: { label: 'Bajarildi', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Bekor qilindi', color: 'bg-red-100 text-red-800' }
  };
  
  const s = map[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  
  return (
    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${s.color}`}>
      {s.label}
    </span>
  );
};

export default function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders/my', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setOrders(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  if (loading) return <div className="p-8 text-center">Yuklanmoqda...</div>;

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] p-4 text-center">
        <Package size={48} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-bold mb-2">Hozircha buyurtmalar yo'q</h2>
        <p className="text-gray-500">Siz hali hech narsa xarid qilmadingiz.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-20">
      <h2 className="font-bold text-xl mb-4">Mening Buyurtmalarim</h2>
      
      {orders.map(order => (
        <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Buyurtma №{order.id}</p>
              <p className="text-sm font-medium">{format(new Date(order.createdAt), 'dd.MM.yyyy HH:mm')}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>
          
          <div className="space-y-2 mb-3">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.quantity} x {item.productNameSnapshot}</span>
                <span className="font-medium">{formatPrice(item.subtotal)}</span>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <span className="font-medium text-gray-600">Jami:</span>
            <span className="font-bold text-lg text-blue-600">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
