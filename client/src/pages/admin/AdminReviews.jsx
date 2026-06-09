import React, { useState, useEffect, useCallback } from 'react';
import {
  Star, Search, RefreshCw, Trash2, X, MessageSquare,
  ShieldCheck, ChevronLeft, ChevronRight, Filter, ThumbsUp,
  Package, AlertTriangle
} from 'lucide-react';
import API from '../../api';

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const StarRow = ({ rating, size = 14 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star
        key={i}
        size={size}
        className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
      />
    ))}
  </div>
);

const ratingColor = (r) => {
  if (r >= 4) return 'bg-green-50 text-green-700 border-green-200';
  if (r === 3) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  return 'bg-red-50 text-red-700 border-red-200';
};

// ── Stat Card ──────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color = 'bg-white' }) => (
  <div className={`${color} border border-gray-200 rounded-xl p-4`}>
    <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-1">{label}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

// ── Delete Confirm Modal ───────────────────────────────────────────────────────
const DeleteModal = ({ review, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={18} className="text-red-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Xóa đánh giá?</h3>
          <p className="text-xs text-gray-500 mt-0.5">Hành động này không thể hoàn tác</p>
        </div>
      </div>
      <div className="bg-gray-50 rounded-xl p-3 mb-5 text-sm text-gray-700 border border-gray-200 line-clamp-3">
        "{review.comment}"
      </div>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Hủy
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Trash2 size={14} />}
          Xóa
        </button>
      </div>
    </div>
  </div>
);

// ── Review Detail Modal ────────────────────────────────────────────────────────
const ReviewDetailModal = ({ review, onClose, onDelete }) => (
  <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
        <h3 className="font-bold text-gray-900">Chi tiết đánh giá</h3>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Product */}
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
            {review.product?.image
              ? <img src={review.product.image} alt={review.product.name} className="w-full h-full object-cover" />
              : <Package size={18} className="m-auto mt-2.5 text-gray-400" />
            }
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Sản phẩm</p>
            <p className="font-semibold text-gray-900 truncate">{review.product?.name || 'Sản phẩm đã xóa'}</p>
          </div>
        </div>

        {/* Reviewer */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">Người đánh giá</p>
          <p className="font-semibold text-gray-900">{review.userName}</p>
          {review.user?.email && <p className="text-sm text-gray-500">{review.user.email}</p>}
          <div className="flex items-center gap-3 mt-2">
            <StarRow rating={review.rating} size={16} />
            <span className={`text-xs px-2 py-0.5 rounded-sm border font-semibold ${ratingColor(review.rating)}`}>
              {review.rating}/5
            </span>
            {review.verifiedPurchase && (
              <span className="flex items-center gap-1 text-xs text-blue-600 font-semibold">
                <ShieldCheck size={11} /> Đã mua hàng
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div>
          {review.title && (
            <p className="font-bold text-gray-900 mb-2">"{review.title}"</p>
          )}
          <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100">
            {review.comment}
          </p>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{fmtDate(review.createdAt)}</span>
          <span className="flex items-center gap-1">
            <ThumbsUp size={11} /> {review.helpful} lượt hữu ích
          </span>
        </div>

        {/* Actions */}
        <div className="pt-2 border-t border-gray-100">
          <button
            onClick={() => onDelete(review)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-sm font-medium transition-colors"
          >
            <Trash2 size={14} /> Xóa đánh giá này
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
export const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch]       = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [sort, setSort]           = useState('newest');
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]         = useState(0);

  // Modals
  const [selectedReview, setSelectedReview] = useState(null);
  const [deleteTarget, setDeleteTarget]     = useState(null);
  const [deleting, setDeleting]             = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { sort, page, limit: 15 };
      if (filterRating) params.rating = filterRating;
      if (search.trim()) params.search = search.trim();

      const res = await API.get('/admin/reviews', { params });
      setReviews(res.data.reviews);
      setTotal(res.data.total);
      setTotalPages(res.data.pages);
      setStats(res.data.stats);
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể tải đánh giá');
    } finally {
      setLoading(false);
    }
  }, [search, filterRating, sort, page]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  // Reset page khi đổi filter
  useEffect(() => { setPage(1); }, [search, filterRating, sort]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await API.delete(`/admin/reviews/${deleteTarget._id}`);
      setReviews(prev => prev.filter(r => r._id !== deleteTarget._id));
      setTotal(prev => prev - 1);
      setDeleteTarget(null);
      setSelectedReview(null);
      // Cập nhật stats
      if (stats) {
        const dist = stats.distribution.map(d =>
          d.star === deleteTarget.rating ? { ...d, count: d.count - 1 } : d
        );
        setStats({ ...stats, totalAll: stats.totalAll - 1, distribution: dist });
      }
    } catch (err) {
      alert('Xóa thất bại: ' + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đánh giá khách hàng</h1>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý và kiểm duyệt toàn bộ đánh giá sản phẩm</p>
        </div>
        <button
          onClick={fetchReviews}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-white hover:shadow-sm transition-all text-gray-600"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Tổng đánh giá" value={stats.totalAll} />
          <StatCard
            label="Điểm trung bình"
            value={stats.avgRating}
            sub={<StarRow rating={Math.round(stats.avgRating)} />}
          />
          {stats.distribution.slice(0, 2).map(d => (
            <StatCard
              key={d.star}
              label={`${d.star} sao`}
              value={d.count}
              sub={`${stats.totalAll ? Math.round((d.count / stats.totalAll) * 100) : 0}% tổng đánh giá`}
            />
          ))}
        </div>
      )}

      {/* Rating distribution bar */}
      {stats && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-4">Phân bố đánh giá</p>
          <div className="space-y-2">
            {stats.distribution.map(d => {
              const pct = stats.totalAll ? Math.round((d.count / stats.totalAll) * 100) : 0;
              return (
                <div key={d.star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-14 flex-shrink-0">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-semibold text-gray-600">{d.star}</span>
                  </div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-16 text-right">{d.count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên, nội dung..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-gray-400 outline-none transition"
          />
        </div>

        {/* Rating filter */}
        <select
          value={filterRating}
          onChange={e => setFilterRating(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-gray-400 outline-none cursor-pointer text-gray-700"
        >
          <option value="">Tất cả sao</option>
          {[5, 4, 3, 2, 1].map(s => (
            <option key={s} value={s}>{s} sao</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-gray-400 outline-none cursor-pointer text-gray-700"
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="highest">Điểm cao nhất</option>
          <option value="lowest">Điểm thấp nhất</option>
          <option value="helpful">Hữu ích nhất</option>
        </select>
      </div>

      {/* Result count */}
      {!loading && (
        <p className="text-sm text-gray-500">
          Hiển thị <strong>{reviews.length}</strong> / <strong>{total}</strong> đánh giá
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Đang tải đánh giá…</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && reviews.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <MessageSquare size={40} className="text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">Không có đánh giá nào</p>
          <p className="text-sm text-gray-400 mt-1">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
        </div>
      )}

      {/* Review table */}
      {!loading && reviews.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-400 font-bold">Sản phẩm</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-400 font-bold hidden md:table-cell">Người dùng</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-400 font-bold">Đánh giá</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-400 font-bold hidden lg:table-cell">Nội dung</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-400 font-bold hidden md:table-cell">Ngày</th>
                <th className="px-4 py-3 text-xs uppercase tracking-widest text-gray-400 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.map(review => (
                <tr key={review._id} className="hover:bg-gray-50 transition-colors group">
                  {/* Product */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {review.product?.image
                          ? <img src={review.product.image} alt={review.product.name} className="w-full h-full object-cover" />
                          : <Package size={14} className="m-auto mt-2 text-gray-400" />
                        }
                      </div>
                      <p className="text-xs font-medium text-gray-900 max-w-[120px] truncate leading-tight">
                        {review.product?.name || 'Đã xóa'}
                      </p>
                    </div>
                  </td>

                  {/* User */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-xs font-semibold text-gray-900">{review.userName}</p>
                    <p className="text-[11px] text-gray-400 truncate max-w-[130px]">{review.user?.email}</p>
                    {review.verifiedPurchase && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 font-semibold mt-0.5">
                        <ShieldCheck size={9} /> Đã mua
                      </span>
                    )}
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-3">
                    <StarRow rating={review.rating} size={13} />
                    <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded border font-bold ${ratingColor(review.rating)}`}>
                      {review.rating}/5
                    </span>
                  </td>

                  {/* Content preview */}
                  <td className="px-4 py-3 hidden lg:table-cell max-w-[200px]">
                    {review.title && <p className="text-xs font-semibold text-gray-800 truncate">"{review.title}"</p>}
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">{review.comment}</p>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-xs text-gray-400">{fmtDate(review.createdAt)}</p>
                    {review.helpful > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                        <ThumbsUp size={9} /> {review.helpful}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedReview(review)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <MessageSquare size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(review)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa đánh giá"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">Trang {page} / {totalPages}</p>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                        p === page
                          ? 'bg-gray-900 text-white'
                          : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail modal */}
      {selectedReview && (
        <ReviewDetailModal
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
          onDelete={(r) => { setDeleteTarget(r); setSelectedReview(null); }}
        />
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <DeleteModal
          review={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default AdminReviews;
