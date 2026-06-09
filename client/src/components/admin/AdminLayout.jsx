import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, Tag, Home, Eye, EyeOff, Lock, Mail, ShieldAlert, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ─── Admin Login Page (inline, không redirect) ───────────────────────────────
const AdminLoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.success) {
      setError(res.message || 'Đăng nhập thất bại');
    } else if (!res.user?.isAdmin) {
      setError('Tài khoản này không có quyền truy cập trang quản trị.');
    }
    // nếu success + isAdmin → AuthContext set user → component re-render → vào layout
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <p className="text-3xl font-serif font-bold tracking-widest text-black">ARUME</p>
          <p className="text-xs uppercase text-gray-400 tracking-widest mt-1">Admin Panel</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-2 mb-6">
            <ShieldAlert size={18} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Đăng nhập quản trị</h2>
          </div>

          {error && (
            <div className="mb-5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="admin@arume.vn"
                  className="w-full pl-9 pr-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-black transition bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Mật khẩu</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-black transition bg-gray-50 focus:bg-white"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-xl text-sm font-bold tracking-widest hover:bg-gray-800 transition mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Đang xử lý...</>
              ) : 'ĐĂNG NHẬP'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          <Link to="/" className="hover:text-black transition">← Về trang chủ</Link>
        </p>
      </div>
    </div>
  );
};

export const AdminLayout = () => {
  const location = useLocation();
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
          <p className="text-gray-400 text-xs">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập hoặc không phải admin → hiển thị trang login ngay tại đây
  if (!user || !user.isAdmin) {
    return <AdminLoginPage />;
  }

  const navItems = [
    { name: 'Tổng quan',    path: '/admin',          icon: <LayoutDashboard size={20} /> },
    { name: 'Sản phẩm',     path: '/admin/products', icon: <Package size={20} /> },
    { name: 'Đơn hàng',     path: '/admin/orders',   icon: <ShoppingCart size={20} /> },
    { name: 'Đánh giá',     path: '/admin/reviews',  icon: <MessageSquare size={20} /> },
    { name: 'Khách hàng',   path: '/admin/users',    icon: <Users size={20} /> },
    { name: 'Mã giảm giá',  path: '/admin/coupons',  icon: <Tag size={20} /> },
  ];

  const activeItem = navItems.find(i =>
    location.pathname === i.path ||
    (i.path !== '/admin' && location.pathname.startsWith(i.path))
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col transition-all flex-shrink-0">
        <div className="h-20 flex items-center justify-center border-b border-gray-200">
          <Link to="/" className="text-center">
            <p className="text-2xl font-serif font-bold tracking-widest text-black">ARUME</p>
            <p className="text-[10px] uppercase text-gray-400 tracking-normal mt-0.5">Admin Panel</p>
          </Link>
        </div>

        <nav className="flex-1 py-8 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm
                  ${isActive ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-black'}`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm text-gray-600 hover:bg-gray-100 hover:text-black"
          >
            <Home size={20} />
            Về Cửa Hàng
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut size={20} />
            Đăng Xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
          <h1 className="text-xl font-semibold text-gray-800">
            {activeItem?.name || 'Tổng quan'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-gray-500">Quản trị viên</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white text-sm font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};