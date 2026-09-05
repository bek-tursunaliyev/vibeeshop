import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { formatPrice } from '../../utils/format';

const statusMap: Record<string, string> = {
  pending: "Kutilmoqda",
  confirmed: "Tasdiqlandi",
  preparing: "Tayyorlanmoqda",
  delivering: "Yetkazilmoqda",
  completed: "Bajarildi",
  cancelled: "Bekor qilindi"
};

export default function AdminOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders/admin', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setOrders(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const updateStatus = async (id: number, status: string) => {
    if (!window.confirm("Statusni o'zgartirasizmi?")) return;
    try {
      const res = await fetch(`/api/orders/admin/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (loading) return <div className="p-8 text-center">Yuklanmoqda...</div>;

  return (
    <div className="p-4 space-y-4 pb-24">
      <h2 className="font-bold text-xl mb-4">Buyurtmalarni boshqarish</h2>
      
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${filter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}>Barchasi</button>
        {Object.entries(statusMap).map(([key, val]) => (
          <button key={key} onClick={() => setFilter(key)} className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${filter === key ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{val}</button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-white border rounded-2xl p-4 shadow-sm">
             <div className="flex justify-between items-start mb-3 border-b pb-3">
               <div>
                 <p className="font-bold text-lg">№{order.id}</p>
                 <p className="text-sm text-gray-500">{format(new Date(order.createdAt), 'dd.MM.yyyy HH:mm')}</p>
               </div>
               
               <select 
                 value={order.status}
                 onChange={(e) => updateStatus(order.id, e.target.value)}
                 className={`text-sm font-bold p-1 rounded border outline-none ${
                   order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                   order.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                   order.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-200' :
                   'bg-blue-100 text-blue-800 border-blue-200'
                 }`}
               >
                 {Object.entries(statusMap).map(([key, val]) => (
                   <option key={key} value={key}>{val}</option>
                 ))}
               </select>
             </div>
             
             <div className="mb-3 text-sm">
               <p><span className="text-gray-500">Mijoz:</span> {order.firstName} {order.lastName}</p>
               <p><span className="text-gray-500">Tel:</span> <a href={`tel:${order.phone}`} className="text-blue-600">{order.phone}</a></p>
               <p><span className="text-gray-500">Manzil:</span> {order.address}</p>
               {order.note && <p><span className="text-gray-500">Izoh:</span> {order.note}</p>}
             </div>
             
             <div className="bg-gray-50 p-3 rounded-lg mb-3 space-y-1">
               {order.items.map((item: any) => (
                 <div key={item.id} className="flex justify-between text-xs">
                   <span>{item.quantity} x {item.productNameSnapshot}</span>
                   <span className="font-medium">{formatPrice(item.subtotal)}</span>
                 </div>
               ))}
             </div>
             
             <div className="flex justify-between font-bold text-lg">
               <span>Jami:</span>
               <span className="text-blue-600">{formatPrice(order.totalAmount)}</span>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
