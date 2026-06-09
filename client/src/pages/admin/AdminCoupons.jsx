import React, { useState, useEffect } from 'react';
import {
  Tag, Plus, Edit2, Trash2, Search, X, Save, RefreshCw,
  CheckCircle, XCircle, Calendar, Users, TrendingUp, AlertCircle,
  Copy, Zap
} from 'lucide-react';
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon, seedCoupons } from '../../api';

const TYPE_LABELS = { percent: '% Giảm giá', freeship: 'Freeship', fixed: 'Giảm cố định' };
const TYPE_COLORS = { percent: 'bg-blue-100 text-blue-700', freeship: 'bg-teal-100 text-teal-700', fixed: 'bg-purple-100 text-purple-700' };

const EMPTY_FORM = {
  code: '',
  type: 'percent',
  value: '',
  minOrderValue: '',
  maxDiscount: '',
  startDate: '',
  endDate: '',
  usageLimit: '',
  newCustomerOnly: false,
  isActive: true,
  description: '',
};

// ── Coupon Form Modal ─────────────────────────────────────────────────────────
const CouponModal = ({ coupon, onClose, onSave }) => {
  const [form, setForm] = useState(() => {
    if (!coupon) return EMPTY_FORM;
    return {
      code: coupon.code || '',
      type: coupon.type || 'percent',
      value: coupon.value ?? '',
      minOrderValue: coupon.minOrderValue ?? '',
      maxDiscount: coupon.maxDiscount ?? '',
      startDate: coupon.startDate ? coupon.startDate.split('T')[0] : '',
      endDate: coupon.endDate ? coupon.endDate.split('T')[0] : '',
      usageLimit: coupon.usageLimit ?? '',
      newCustomerOnly: coupon.newCustomerOnly || false,
      isActive: coupon.isActive !== false,
      description: coupon.description || '',
    };
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.code.trim()) return setError('Vui lòng nhập mã giảm giá');
    if (!form.value && form.value !== 0) return setError('Vui lòng nhập giá trị giảm');
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        value: parseFloat(form.value) || 0,
        minOrderValue: parseFloat(form.minOrderValue) || 0,
        maxDiscount: form.maxDiscount !== '' ? parseFloat(form.maxDiscount) : null,
        usageLimit: form.usageLimit !== '' ? parseInt(form.usageLimit) : null,
        startDate: form.startDate || undefined,
        endDate: form.endDate || null,
      };
      if (coupon?._id) {
        await updateCoupon(coupon._id, payload);
      } else {
        await createCoupon(payload);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-bold text-gray-900">{coupon ? 'Chỉnh sửa mã' : 'Tạo mã giảm giá mới'}</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl px-4 py-2.5 text-sm">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* Code + active */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 block">Mã giảm giá *</label>
              <input
                value={form.code}
                onChange={e => set('code', e.target.value.toUpperCase())}
                placeholder="VD: ARUME10"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm uppercase font-mono outline-none focus:border-black transition"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 block">Kích hoạt</label>
              <button
                onClick={() => set('isActive', !form.isActive)}
                className={`mt-0 h-[42px] px-4 rounded-xl text-sm font-semibold border-2 transition-all ${form.isActive ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-200 text-gray-400'}`}
              >
                {form.isActive ? 'Bật' : 'Tắt'}
              </button>
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 block">Loại giảm giá *</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => set('type', k)}
                  className={`py-2.5 px-3 text-xs font-semibold border-2 rounded-xl transition-all ${form.type === k ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Value */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 block">
                Giá trị * {form.type === 'percent' ? '(%)' : '($)'}
              </label>
              <input
                type="number"
                value={form.value}
                onChange={e => set('value', e.target.value)}
                placeholder={form.type === 'percent' ? 'VD: 30' : 'VD: 5'}
                min="0"
                max={form.type === 'percent' ? '100' : undefined}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black transition"
              />
            </div>
            {form.type !== 'freeship' && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 block">Giảm tối đa ($)</label>
                <input
                  type="number"
                  value={form.maxDiscount}
                  onChange={e => set('maxDiscount', e.target.value)}
                  placeholder="Để trống = không giới hạn"
                  min="0"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black transition"
                />
              </div>
            )}
          </div>

          {/* Min order */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 block">Đơn tối thiểu ($)</label>
              <input
                type="number"
                value={form.minOrderValue}
                onChange={e => set('minOrderValue', e.target.value)}
                placeholder="0 = không yêu cầu"
                min="0"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black transition"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 block">Giới hạn lượt dùng</label>
              <input
                type="number"
                value={form.usageLimit}
                onChange={e => set('usageLimit', e.target.value)}
                placeholder="Để trống = không giới hạn"
                min="1"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black transition"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 block">Ngày bắt đầu</label>
              <input
                type="date"
                value={form.startDate}
                onChange={e => set('startDate', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black transition"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 block">Ngày hết hạn</label>
              <input
                type="date"
                value={form.endDate}
                onChange={e => set('endDate', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black transition"
              />
            </div>
          </div>

          {/* New customer only */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => set('newCustomerOnly', !form.newCustomerOnly)}
              className={`w-10 h-6 rounded-full transition-colors relative ${form.newCustomerOnly ? 'bg-black' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.newCustomerOnly ? 'left-5' : 'left-1'}`} />
            </div>
            <span className="text-sm text-gray-700">Chỉ dành cho khách đặt lần đầu</span>
          </label>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 block">Mô tả (hiển thị cho khách)</label>
            <input
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="VD: Giảm 10% cho đơn từ $50"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black transition"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 bg-black text-white py-3 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {saving ? 'Đang lưu...' : <><Save size={14} /> {coupon ? 'Cập nhật' : 'Tạo mã'}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main AdminCoupons ─────────────────────────────────────────────────────────
export const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');
  const [copied, setCopied] = useState('');

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await getAllCoupons();
      setCoupons(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Xóa mã giảm giá này?')) return;
    try {
      await deleteCoupon(id);
      setCoupons(c => c.filter(x => x._id !== id));
    } catch (e) {
      alert('Xóa thất bại');
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      const res = await updateCoupon(coupon._id, { isActive: !coupon.isActive });
      setCoupons(c => c.map(x => x._id === coupon._id ? res.data : x));
    } catch (e) {
      alert('Cập nhật thất bại');
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await seedCoupons();
      setSeedMsg(res.data.message);
      fetchCoupons();
      setTimeout(() => setSeedMsg(''), 3000);
    } catch (e) {
      setSeedMsg('Lỗi: ' + (e.response?.data?.error || e.message));
    } finally {
      setSeeding(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(''), 2000);
  };

  const now = new Date();
  const isExpired = (c) => c.endDate && new Date(c.endDate) < now;
  const isNotStarted = (c) => c.startDate && new Date(c.startDate) > now;

  const filtered = coupons.filter(c => {
    const matchSearch = !search || c.code.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const matchActive = filterActive === 'all' || (filterActive === 'active' && c.isActive) || (filterActive === 'inactive' && !c.isActive);
    return matchSearch && matchActive;
  });

  const stats = {
    total: coupons.length,
    active: coupons.filter(c => c.isActive && !isExpired(c) && !isNotStarted(c)).length,
    totalUsed: coupons.reduce((s, c) => s + (c.usedCount || 0), 0),
  };

  const getCouponStatus = (c) => {
    if (!c.isActive) return { label: 'Tắt', color: 'bg-gray-100 text-gray-500' };
    if (isExpired(c)) return { label: 'Hết hạn', color: 'bg-red-100 text-red-600' };
    if (isNotStarted(c)) return { label: 'Chưa bắt đầu', color: 'bg-yellow-100 text-yellow-700' };
    if (c.usageLimit !== null && c.usedCount >= c.usageLimit) return { label: 'Hết lượt', color: 'bg-orange-100 text-orange-600' };
    return { label: 'Đang hoạt động', color: 'bg-green-100 text-green-700' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mã giảm giá</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý coupon và khuyến mãi</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:border-black transition text-gray-600 hover:text-black disabled:opacity-50"
          >
            <Zap size={14} /> {seeding ? 'Đang seed...' : 'Seed mặc định'}
          </button>
          <button
            onClick={() => { setEditingCoupon(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
          >
            <Plus size={14} /> Tạo mã mới
          </button>
        </div>
      </div>

      {seedMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
          ✓ {seedMsg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Tổng mã', val: stats.total, color: 'text-gray-900' },
          { label: 'Đang hoạt động', val: stats.active, color: 'text-green-600' },
          { label: 'Lượt dùng', val: stats.totalUsed, color: 'text-blue-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm mã, mô tả..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-black transition"
            />
          </div>
          {['all', 'active', 'inactive'].map(v => (
            <button
              key={v}
              onClick={() => setFilterActive(v)}
              className={`px-4 py-2.5 text-sm font-medium rounded-xl border-2 transition-all ${filterActive === v ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}
            >
              {v === 'all' ? 'Tất cả' : v === 'active' ? 'Đang bật' : 'Đang tắt'}
            </button>
          ))}
          <button onClick={fetchCoupons} className="p-2.5 border border-gray-200 rounded-xl hover:border-black transition text-gray-500 hover:text-black">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Coupons grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <RefreshCw size={24} className="animate-spin mx-auto mb-3" />
          Đang tải...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Tag size={32} className="mx-auto mb-3 text-gray-200" />
          <p className="text-gray-400">Chưa có mã giảm giá nào</p>
          <p className="text-xs text-gray-300 mt-1">Nhấn "Seed mặc định" để tạo mã mẫu</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map(coupon => {
            const status = getCouponStatus(coupon);
            const usagePct = coupon.usageLimit ? Math.min(100, (coupon.usedCount / coupon.usageLimit) * 100) : null;
            return (
              <div key={coupon._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => copyCode(coupon.code)}
                        className="group flex items-center gap-1.5 font-mono font-bold text-base text-gray-900 hover:text-black"
                        title="Click để copy"
                      >
                        {coupon.code}
                        <Copy size={13} className={`transition-colors ${copied === coupon.code ? 'text-green-500' : 'text-gray-300 group-hover:text-gray-600'}`} />
                      </button>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${TYPE_COLORS[coupon.type]}`}>
                        {TYPE_LABELS[coupon.type]}
                      </span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Value */}
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {coupon.type === 'percent' ? `${coupon.value}%` : coupon.type === 'fixed' ? `$${coupon.value}` : `Free +$${coupon.value}`}
                    {coupon.maxDiscount && <span className="text-sm font-normal text-gray-400 ml-2">(tối đa ${coupon.maxDiscount})</span>}
                  </p>

                  {coupon.description && <p className="text-xs text-gray-500 mb-3">{coupon.description}</p>}

                  {/* Conditions */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mb-3">
                    {coupon.minOrderValue > 0 && <span>Đơn tối thiểu: ${coupon.minOrderValue}</span>}
                    {coupon.newCustomerOnly && <span className="text-purple-500">👤 Khách hàng mới</span>}
                    {coupon.endDate && <span>HH: {new Date(coupon.endDate).toLocaleDateString('vi-VN')}</span>}
                  </div>

                  {/* Usage progress */}
                  {coupon.usageLimit !== null && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Đã dùng: {coupon.usedCount}/{coupon.usageLimit}</span>
                        <span>{Math.round(usagePct)}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${usagePct >= 90 ? 'bg-red-400' : usagePct >= 60 ? 'bg-yellow-400' : 'bg-green-400'}`}
                          style={{ width: `${usagePct}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {coupon.usageLimit === null && (
                    <p className="text-xs text-gray-400 mb-3">Đã dùng: {coupon.usedCount} lần (không giới hạn)</p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-gray-50">
                    <button
                      onClick={() => handleToggleActive(coupon)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${coupon.isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                    >
                      {coupon.isActive ? 'Tắt mã' : 'Bật mã'}
                    </button>
                    <button
                      onClick={() => { setEditingCoupon(coupon); setShowModal(true); }}
                      className="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:border-black hover:text-black transition-all flex items-center justify-center gap-1"
                    >
                      <Edit2 size={11} /> Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(coupon._id)}
                      className="py-1.5 px-3 text-xs font-semibold rounded-lg border border-gray-200 text-red-500 hover:border-red-300 hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <CouponModal
          coupon={editingCoupon}
          onClose={() => { setShowModal(false); setEditingCoupon(null); }}
          onSave={fetchCoupons}
        />
      )}
    </div>
  );
};
