import axios from 'axios';

// Tự động thêm /api nếu VITE_API_URL chưa có — tránh lỗi khi deploy
const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BASE_URL = rawUrl.replace(/\/api\/?$/, '') + '/api';

const API = axios.create({ 
  baseURL: BASE_URL,
  withCredentials: true
});

// Tự động gắn token JWT vào mọi request lên server nếu có trong localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ── Products ─────────────────────────────────────────────────────────────────
export const getProducts = (params) => API.get('/products', { params });
export const getProduct = (id) => API.get(`/products/${id}`);
export const syncCartPrices = (ids) => API.post('/products/sync-cart', { ids });
export const createProduct = (data) => API.post('/products', data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);

// ── Orders ───────────────────────────────────────────────────────────────────
export const createOrder = (data) => API.post('/orders', data);
export const getMyOrders = () => API.get('/orders/myorders');
export const cancelMyOrder = (id) => API.put(`/orders/${id}/cancel`);
export const getOrderById = (id) => API.get(`/orders/${id}`);
export const getAllOrders = (params) => API.get('/orders', { params });
export const updateOrderStatus = (id, status) => API.put(`/orders/${id}/status`, { status });

// ── Auth ─────────────────────────────────────────────────────────────────────
export const loginUser = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const resetPassword = (data) => API.post('/auth/reset-password', data);
export const changePassword = (data) => API.put('/auth/change-password', data);
export const googleAuth = (data) => API.post('/auth/google', data);
export const getProfile = () => API.get('/auth/profile');
export const getUsers = () => API.get('/auth/users');
export const deleteUser = (id) => API.delete(`/auth/users/${id}`);

// ── Payment ──────────────────────────────────────────────────────────────────
export const createMomoPayment = (data) => API.post('/payment/momo', data);

// ── Coupons ──────────────────────────────────────────────────────────────────
export const validateCoupon = (data) => API.post('/coupons/validate', data);
export const getAllCoupons = () => API.get('/coupons');
export const createCoupon = (data) => API.post('/coupons', data);
export const updateCoupon = (id, data) => API.put(`/coupons/${id}`, data);
export const deleteCoupon = (id) => API.delete(`/coupons/${id}`);
export const seedCoupons = () => API.post('/coupons/seed');

// ── Reviews ──────────────────────────────────────────────────────────────────
export const getProductReviews = (productId, params) => API.get(`/products/${productId}/reviews`, { params });
export const createReview = (productId, data) => API.post(`/products/${productId}/reviews`, data);
export const updateReview = (productId, reviewId, data) => API.put(`/products/${productId}/reviews/${reviewId}`, data);
export const deleteReview = (productId, reviewId) => API.delete(`/products/${productId}/reviews/${reviewId}`);
export const voteHelpful = (productId, reviewId) => API.post(`/products/${productId}/reviews/${reviewId}/helpful`);

export default API;