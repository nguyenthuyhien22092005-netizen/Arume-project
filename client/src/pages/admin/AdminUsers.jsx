import React, { useState, useEffect } from 'react';
import { Search, Mail, Shield, RefreshCw, UserCheck, ChevronDown, ChevronUp, X, Package, ShoppingBag } from 'lucide-react';
import { getUsers } from '../../api';
import API from '../../api';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);
  const [userOrders, setUserOrders] = useState({});
  const [loadingOrders, setLoadingOrders] = useState({});

  const fetchUsers = () => {
    setLoading(true);
    getUsers()
      .then(res => { setUsers(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const fetchUserOrders = async (userId) => {
    if (userOrders[userId]) {
      setExpandedUser(expandedUser === userId ? null : userId);
      return;
    }
    setLoadingOrders(prev => ({ ...prev, [userId]: true }));
    setExpandedUser(userId);
    try {
      // Admin lấy tất cả orders rồi filter theo user
      const res = await API.get('/orders');
      const all = res.data;
      const filtered = all.filter(o => o.user?._id === userId || o.user === userId);
      setUserOrders(prev => ({ ...prev, [userId]: filtered }));
    } catch (e) {
      setUserOrders(prev => ({ ...prev, [userId]: [] }));
    } finally {
      setLoadingOrders(prev => ({ ...prev, [userId]: false }));
    }
  };

  const filtered = users.filter(u =>
    search === '' ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const avatarColors = ['bg-purple-500', 'bg-blue-500', 'bg-emerald-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];

  const statusColor = (status) => {
    if (status === 'Đã giao')     return 'text-green-600';
    if (status === 'Đang giao')   return 'text-blue-600';
    if (status === 'Đã xác nhận') return 'text-indigo-600';
    if (status === 'Đã hủy')      return 'text-red-500';
    return 'text-yellow-600';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Quản lý Khách hàng</h2>
          <p className="text-sm text-gray-400 mt-0.5">{users.length} người dùng đã đăng ký</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm tên, email..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black w-56"
            />
          </div>
          <button onClick={fetchUsers} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-500">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Đang tải danh sách...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-sm">Không tìm thấy người dùng nào</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Người dùng</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Ngày tham gia</th>
                <th className="p-4 font-medium">Vai trò</th>
                <th className="p-4 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filtered.map((user, idx) => (
                <React.Fragment key={user._id}>
                  <tr className={`hover:bg-gray-50 transition-colors border-t border-gray-50 ${expandedUser === user._id ? 'bg-gray-50' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{user._id.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{user.email}</td>
                    <td className="p-4 text-gray-400 text-xs">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4">
                      {user.isAdmin ? (
                        <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                          <Shield size={12} /> Admin
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          <UserCheck size={12} /> Khách hàng
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`mailto:${user.email}`}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50 inline-flex"
                          title="Gửi email"
                        >
                          <Mail size={16} />
                        </a>
                        <button
                          onClick={() => fetchUserOrders(user._id)}
                          className="p-2 text-gray-400 hover:text-black transition-colors rounded-lg hover:bg-gray-100 inline-flex"
                          title="Xem đơn hàng"
                        >
                          {expandedUser === user._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded orders row */}
                  {expandedUser === user._id && (
                    <tr>
                      <td colSpan={5} className="bg-gray-50 px-6 pb-4">
                        <div className="pt-2 pb-1">
                          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                            <ShoppingBag size={12} /> Lịch sử đơn hàng
                          </p>
                          {loadingOrders[user._id] ? (
                            <p className="text-xs text-gray-400 py-2">Đang tải...</p>
                          ) : !userOrders[user._id] || userOrders[user._id].length === 0 ? (
                            <p className="text-xs text-gray-400 py-2">Chưa có đơn hàng nào</p>
                          ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {userOrders[user._id].map(order => (
                                <div key={order._id} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-gray-100">
                                  <div>
                                    <span className="text-xs font-mono font-bold text-gray-700">{order.orderCode || `#${order._id.slice(-8).toUpperCase()}`}</span>
                                    <span className="mx-2 text-gray-300">·</span>
                                    <span className="text-xs text-gray-500">{order.items?.length || 0} sản phẩm</span>
                                    {order.couponCode && (
                                      <span className="ml-2 text-xs text-green-600">🏷 {order.couponCode}</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-gray-900">${(order.totalPrice || 0).toFixed(2)}</span>
                                    <span className={`text-[11px] font-semibold ${statusColor(order.status)}`}>{order.status}</span>
                                    <span className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
