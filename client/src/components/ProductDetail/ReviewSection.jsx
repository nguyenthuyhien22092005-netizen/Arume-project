import React, { useState, useEffect, useCallback } from 'react';
import { Star, ThumbsUp, Pencil, Trash2, BadgeCheck, ChevronDown, X, Send } from 'lucide-react';
import { getProductReviews, createReview, updateReview, deleteReview, voteHelpful } from '../../api';
import { useAuth } from '../../context/AuthContext';

// ── Stars interactive ──────────────────────────────────────────────────────────
const StarRating = ({ value, onChange, size = 20, readOnly = false }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange && onChange(i)}
          onMouseEnter={() => !readOnly && setHovered(i)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={readOnly ? 'cursor-default' : 'cursor-pointer transition-transform hover:scale-110'}
        >
          <Star
            size={size}
            className={
              i <= (hovered || value)
                ? 'fill-[#C9A96E] text-[#C9A96E]'
                : 'text-gray-200 dark:text-gray-600'
            }
          />
        </button>
      ))}
    </div>
  );
};

// ── Rating bar ─────────────────────────────────────────────────────────────────
const RatingBar = ({ star, count, percent, onClick, active }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2 group text-left transition-opacity ${active ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
  >
    <span className="text-xs text-gray-500 w-4 shrink-0">{star}</span>
    <Star size={10} className="fill-[#C9A96E] text-[#C9A96E] shrink-0" />
    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-[#C9A96E] rounded-full transition-all duration-500"
        style={{ width: `${percent}%` }}
      />
    </div>
    <span className="text-xs text-gray-400 w-5 text-right shrink-0">{count}</span>
  </button>
);

// ── Review form ────────────────────────────────────────────────────────────────
const ReviewForm = ({ productId, existing, onDone, onCancel }) => {
  const [rating, setRating] = useState(existing?.rating || 0);
  const [title, setTitle] = useState(existing?.title || '');
  const [comment, setComment] = useState(existing?.comment || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!rating) return setError('Vui lòng chọn số sao');
    if (!comment.trim()) return setError('Vui lòng nhập nhận xét');
    setLoading(true);
    setError('');
    try {
      if (existing) {
        await updateReview(productId, existing._id, { rating, title, comment });
      } else {
        await createReview(productId, { rating, title, comment });
      }
      onDone();
    } catch (e) {
      setError(e.response?.data?.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs uppercase tracking-widest font-bold dark:text-white">
          {existing ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
        </h4>
        {onCancel && (
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Stars */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">Đánh giá của bạn *</p>
        <StarRating value={rating} onChange={setRating} size={24} />
      </div>

      {/* Title */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Tiêu đề ngắn (tuỳ chọn)"
          maxLength={100}
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9A96E] transition-colors"
        />
      </div>

      {/* Comment */}
      <div className="mb-4">
        <textarea
          placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này... *"
          maxLength={1000}
          rows={4}
          value={comment}
          onChange={e => setComment(e.target.value)}
          className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9A96E] transition-colors resize-none"
        />
        <p className="text-[11px] text-gray-400 text-right mt-1">{comment.length}/1000</p>
      </div>

      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 text-xs uppercase tracking-widest font-bold hover:bg-[#C9A96E] dark:hover:bg-[#C9A96E] dark:hover:text-white transition-colors rounded-sm disabled:opacity-50"
      >
        <Send size={12} />
        {loading ? 'Đang gửi...' : existing ? 'Cập nhật' : 'Gửi đánh giá'}
      </button>
    </div>
  );
};

// ── Single review card ─────────────────────────────────────────────────────────
const ReviewCard = ({ review, currentUserId, productId, onRefresh }) => {
  const [editing, setEditing] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful);
  const [voted, setVoted] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleHelpful = async () => {
    try {
      const res = await voteHelpful(productId, review._id);
      setHelpfulCount(res.data.helpful);
      setVoted(res.data.voted);
    } catch { /* ignore */ }
  };

  const handleDelete = async () => {
    if (!window.confirm('Xoá đánh giá này?')) return;
    setDeleting(true);
    try {
      await deleteReview(productId, review._id);
      onRefresh();
    } catch { setDeleting(false); }
  };

  const isOwner = currentUserId && review.user === currentUserId;
  const date = new Date(review.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  if (editing) {
    return (
      <ReviewForm
        productId={productId}
        existing={review}
        onDone={() => { setEditing(false); onRefresh(); }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="border-b border-gray-100 dark:border-gray-800 pb-6 mb-6 last:border-0 last:mb-0 last:pb-0">
      {/* Header */}
      <div className="flex justify-between items-start gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Avatar initials */}
          <div className="w-8 h-8 rounded-full bg-[#C9A96E]/20 flex items-center justify-center text-xs font-bold text-[#C9A96E] uppercase shrink-0">
            {review.userName?.[0] || 'K'}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold dark:text-white">{review.userName}</span>
              {review.verifiedPurchase && (
                <span className="flex items-center gap-0.5 text-[10px] text-green-600 font-medium">
                  <BadgeCheck size={11} className="text-green-500" />
                  Đã mua hàng
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400">{date}</p>
          </div>
        </div>

        {/* Actions */}
        {isOwner && (
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setEditing(true)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
              <Pencil size={13} />
            </button>
            <button onClick={handleDelete} disabled={deleting} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Stars + title */}
      <div className="flex items-center gap-2 mb-2">
        <StarRating value={review.rating} readOnly size={13} />
        {review.title && <span className="text-sm font-semibold dark:text-white">{review.title}</span>}
      </div>

      {/* Comment */}
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">{review.comment}</p>

      {/* Helpful */}
      <button
        onClick={handleHelpful}
        className={`flex items-center gap-1.5 text-[11px] transition-colors ${voted ? 'text-[#C9A96E]' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
      >
        <ThumbsUp size={12} className={voted ? 'fill-[#C9A96E]' : ''} />
        Hữu ích {helpfulCount > 0 && `(${helpfulCount})`}
      </button>
    </div>
  );
};

// ── Main ReviewSection ─────────────────────────────────────────────────────────
export const ReviewSection = ({ productId }) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterRating, setFilterRating] = useState(null);
  const [sort, setSort] = useState('newest');
  const [showAll, setShowAll] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort };
      if (filterRating) params.rating = filterRating;
      const res = await getProductReviews(productId, params);
      setData(res.data);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [productId, sort, filterRating]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const visibleReviews = data?.reviews
    ? (showAll ? data.reviews : data.reviews.slice(0, 5))
    : [];

  const userHasReviewed = user && data?.reviews?.some(r => r.user === user._id || r.user === user.id);

  const sortLabels = {
    newest: 'Mới nhất',
    oldest: 'Cũ nhất',
    highest: 'Sao cao nhất',
    lowest: 'Sao thấp nhất',
    helpful: 'Hữu ích nhất',
  };

  return (
    <section className="mt-16 pt-12 border-t border-gray-100 dark:border-gray-800">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#C9A96E] mb-1">Cộng đồng ARUME</p>
          <h2 className="text-2xl font-serif italic dark:text-white">Đánh giá từ khách hàng</h2>
        </div>

        {user && !userHasReviewed && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="shrink-0 flex items-center gap-2 border-2 border-black dark:border-white px-4 py-2 text-xs uppercase tracking-widest font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
          >
            <Star size={12} /> Viết đánh giá
          </button>
        )}
        {!user && (
          <p className="text-xs text-gray-400 italic">Đăng nhập để viết đánh giá</p>
        )}
      </div>

      {/* Write review form */}
      {showForm && (
        <ReviewForm
          productId={productId}
          onDone={() => { setShowForm(false); fetchReviews(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : data ? (
        <>
          {/* Stats */}
          {data.totalReviews > 0 && (
            <div className="flex flex-col sm:flex-row gap-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 mb-8">
              {/* Average */}
              <div className="flex flex-col items-center justify-center shrink-0 sm:pr-6 sm:border-r border-gray-100 dark:border-gray-700 text-center">
                <span className="text-5xl font-bold text-gray-900 dark:text-white leading-none">
                  {data.avgRating.toFixed(1)}
                </span>
                <StarRating value={Math.round(data.avgRating)} readOnly size={16} />
                <p className="text-xs text-gray-400 mt-1">{data.totalReviews} đánh giá</p>
              </div>

              {/* Distribution */}
              <div className="flex-1 space-y-1.5">
                {data.distribution.map(d => (
                  <RatingBar
                    key={d.star}
                    star={d.star}
                    count={d.count}
                    percent={d.percent}
                    active={filterRating === d.star}
                    onClick={() => setFilterRating(filterRating === d.star ? null : d.star)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          {data.totalReviews > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {/* Sort */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:border-[#C9A96E] cursor-pointer"
                >
                  {Object.entries(sortLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Rating filter chips */}
              {[5, 4, 3, 2, 1].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterRating(filterRating === s ? null : s)}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs border rounded-full transition-all ${filterRating === s
                    ? 'bg-[#C9A96E] text-white border-[#C9A96E]'
                    : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:border-[#C9A96E]'}`}
                >
                  {s} <Star size={10} className={filterRating === s ? 'fill-white text-white' : 'fill-[#C9A96E] text-[#C9A96E]'} />
                </button>
              ))}

              {filterRating && (
                <button
                  onClick={() => setFilterRating(null)}
                  className="text-xs text-gray-400 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors"
                >
                  <X size={12} /> Bỏ lọc
                </button>
              )}
            </div>
          )}

          {/* Reviews list */}
          {visibleReviews.length === 0 ? (
            <div className="text-center py-12">
              <Star size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">
                {filterRating
                  ? `Không có đánh giá ${filterRating} sao`
                  : 'Chưa có đánh giá nào. Hãy là người đầu tiên!'}
              </p>
            </div>
          ) : (
            <div>
              {visibleReviews.map(review => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  currentUserId={user?._id || user?.id}
                  productId={productId}
                  onRefresh={fetchReviews}
                />
              ))}

              {/* Show more */}
              {data.reviews.length > 5 && (
                <button
                  onClick={() => setShowAll(prev => !prev)}
                  className="w-full mt-2 py-3 text-xs uppercase tracking-widest font-bold text-gray-500 hover:text-black dark:hover:text-white border border-gray-200 dark:border-gray-700 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <ChevronDown size={13} className={`transition-transform ${showAll ? 'rotate-180' : ''}`} />
                  {showAll ? 'Thu gọn' : `Xem thêm ${data.reviews.length - 5} đánh giá`}
                </button>
              )}
            </div>
          )}
        </>
      ) : null}
    </section>
  );
};
