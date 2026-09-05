import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Users, PackageSearch, Box, ListTree } from 'lucide-react';
import { formatPrice } from '../../utils/format';

export default function AdminDashboard() {
  const { token, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/orders/admin/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setStats(await res.json());
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
  }, [token, isAdmin, navigate]);

  if (!stats) return <div className="p-8 text-center">Yuklanmoqda...</div>;

  return (
    <div className="p-4 space-y-6">
      <h2 className="font-bold text-2xl">Boshqaruv Paneli</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-gray-500 mb-1 flex items-center gap-2"><Box size={16}/> Mahsulotlar</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalProducts}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-gray-500 mb-1 flex items-center gap-2"><Users size={16}/> Mijozlar</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-2xl shadow-sm border border-blue-100">
          <div className="text-blue-600 mb-1 flex items-center gap-2"><PackageSearch size={16}/> Yangi Buyurtmalar</div>
          <div className="text-2xl font-bold text-blue-900">{stats.pendingOrders}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-2xl shadow-sm border border-green-100">
          <div className="text-green-600 mb-1">Umumiy Daromad</div>
          <div className="text-lg font-bold text-green-900">{formatPrice(stats.revenue)}</div>
        </div>
      </div>

      <div className="space-y-3 pt-4">
        <h3 className="font-bold text-lg mb-2">Bo'limlar</h3>
        
        <Link to="/admin/orders" className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50">
          <PackageSearch className="text-blue-500" />
          <span className="font-medium flex-1">Buyurtmalarni boshqarish</span>
        </Link>
        <Link to="/admin/products" className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50">
          <Box className="text-purple-500" />
          <span className="font-medium flex-1">Mahsulotlarni boshqarish</span>
        </Link>
        <Link to="/admin/categories" className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50">
          <ListTree className="text-green-500" />
          <span className="font-medium flex-1">Kategoriyalarni boshqarish</span>
        </Link>
      </div>
    </div>
  );
}
