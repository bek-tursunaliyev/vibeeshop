import React from 'react';
import { BrowserRouter, Routes, Route, Link, Outlet, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { ShoppingCart, Home, User, Settings, PackageSearch, LayoutDashboard } from 'lucide-react';

// === Layouts ===
const Layout = () => {
  const { user, isAdmin, previewMode, togglePreviewMode } = useAuth();
  const { cartCount } = useCart();
  
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center p-4">Ilovadan foydalanish uchun Telegram orqali kiring.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 pb-16">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {user.profilePhotoUrl ? (
            <img src={user.profilePhotoUrl} alt="avatar" className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </div>
          )}
          <div className="leading-tight">
            <h1 className="font-semibold">{user.firstName} {user.lastName}</h1>
            {user.username && <p className="text-xs text-gray-500">@{user.username}</p>}
          </div>
        </div>
        
        {user.role === 'admin' && (
           <button 
             onClick={togglePreviewMode} 
             className="text-xs bg-gray-100 px-3 py-1.5 rounded-full font-medium"
           >
             {previewMode ? 'Chiqish (Preview)' : 'Preview Mode'}
           </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 px-2 z-20">
        <Link to="/" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-600">
          <Home size={22} />
          <span className="text-[10px] mt-1 font-medium">Asosiy</span>
        </Link>
        
        {!isAdmin ? (
          <>
            <Link to="/cart" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-600 relative">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-6 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
              <span className="text-[10px] mt-1 font-medium">Savat</span>
            </Link>
            <Link to="/orders" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-600">
              <PackageSearch size={22} />
              <span className="text-[10px] mt-1 font-medium">Buyurtmalar</span>
            </Link>
          </>
        ) : (
          <>
            <Link to="/admin" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-600">
              <LayoutDashboard size={22} />
              <span className="text-[10px] mt-1 font-medium">Panel</span>
            </Link>
          </>
        )}
      </nav>
    </div>
  );
};

// === Pages placeholders (Will expand in separate files or inline for simplicity) ===
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';

const AppContent = () => {
  const { isLoading, dbError } = useAuth();
  
  if (isLoading) return <div className="flex h-screen items-center justify-center">Yuklanmoqda...</div>;
  if (dbError) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-6 rounded-2xl shadow max-w-sm text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Sozlash talab etiladi</h2>
          <p className="text-gray-600 mb-4 text-sm">
            Ilovalar ma'lumotlar bazasi (PostgreSQL) ga ulana olmadi. Iltimos, AI Studio'dagi <b>Secrets</b> bo'limida <code>DATABASE_URL</code> parametrini o'rnating.
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
