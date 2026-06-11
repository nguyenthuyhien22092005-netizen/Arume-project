import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Circle, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import API from '../api';
import { useGoogleLogin } from '@react-oauth/google';


// ===== Tab types =====
// 'login' | 'register' | 'forgot' | 'verify' | 'reset'

export const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [tab, setTab] = useState('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', code: '', newPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState(''); // dev only

  const navigate = useNavigate();
  const { login, register } = useAuth();

  // Google Login
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );
        const { sub: googleId, name, email, picture: avatar } = userInfo.data;
        
        const res = await API.post('/auth/google', { googleId, name, email, avatar });
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        onClose();
        navigate('/profile');
        window.location.reload();
      } catch (err) {
        setError('Đăng nhập Google thất bại');
      }
    },
    onError: () => setError('Đăng nhập Google thất bại'),
  });

  if (!isOpen) return null;

  const reset = (newTab) => {
    setTab(newTab);
    setError('');
    setSuccessMsg('');
    setDevCode('');
    setFormData({ name: '', email: '', password: '', confirmPassword: '', code: '', newPassword: '' });
  };

  // Chuyển tab nhưng GIỮ LẠI email (dùng khi chuyển forgot → verify)
  const switchTab = (newTab) => {
    setTab(newTab);
    setError('');
    setSuccessMsg('');
    setDevCode('');
    setFormData(prev => ({ name: '', password: '', confirmPassword: '', code: '', newPassword: '', email: prev.email }));
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Đăng nhập
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const res = await login(formData.email, formData.password);
    setLoading(false);
    if (res.success) {
      if (onSuccess) {
        onSuccess(res.user);
      } else {
        onClose();
        navigate('/profile');
      }
    } else {
      setError(res.message);
    }
  };

  // Đăng ký
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) return setError('Mật khẩu xác nhận không khớp');
    if (formData.password.length < 6) return setError('Mật khẩu phải có ít nhất 6 ký tự');
    setLoading(true);
    const res = await register(formData.name, formData.email, formData.password);
    setLoading(false);
    if (res.success) {
      if (onSuccess) {
        onSuccess(res.user);
      } else {
        onClose();
        navigate('/profile');
      }
    } else {
      setError(res.message);
    }
  };

  // Quên mật khẩu
  const handleForgot = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await API.post('/auth/forgot-password', { email: formData.email });
      setDevCode(res.data.devCode || '');
      setSuccessMsg(res.data.message);
      switchTab('verify');
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi server, vui lòng thử lại');
    } finally { setLoading(false); }
  };

  // Đặt lại mật khẩu
  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.newPassword.length < 6) return setError('Mật khẩu phải có ít nhất 6 ký tự');
    setLoading(true);
    try {
      await API.post('/auth/reset-password', {
        email: formData.email,
        code: formData.code,
        newPassword: formData.newPassword,
      });
      setTab('reset-success');
    } catch (err) {
      setError(err.response?.data?.message || 'Mã xác nhận không đúng hoặc đã hết hạn');
    } finally { setLoading(false); }
  };

  const inputClass = "w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-3 text-sm text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition";

  return (
    <div className="fixed inset-0 z-[1005] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white text-black dark:bg-gray-900 dark:text-white w-full max-w-md relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white z-10 text-xl">✕</button>

        {/* ===== ĐĂNG NHẬP ===== */}
        {tab === 'login' && (
          <div className="p-10">
            <h2 className="text-3xl font-serif italic mb-2 dark:text-white text-center">Đăng Nhập</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">Chào mừng bạn trở lại với Arume.</p>
            {error && <div className="mb-4 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded">{error}</div>}
            <form className="space-y-4 text-left" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold mb-2 dark:text-gray-300">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold mb-2 dark:text-gray-300">Mật khẩu</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required className={inputClass + " pr-12"} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white transition">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="text-right mt-1.5">
                  <button type="button" onClick={() => reset('forgot')} className="text-xs text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition underline underline-offset-2">
                    Quên mật khẩu?
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-black text-white dark:bg-white dark:text-black py-4 text-sm font-bold tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition mt-2 disabled:opacity-50">
                {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
              </button>
            </form>

            {/* Google Login */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-xs text-gray-400">hoặc</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>
            <button onClick={handleGoogleLogin} className="w-full mt-4 border border-gray-300 dark:border-gray-700 py-3 text-sm font-medium flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition dark:text-white">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Tiếp tục với Google
            </button>

            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
              Chưa có tài khoản?{' '}
              <button onClick={() => reset('register')} className="text-black dark:text-white font-bold underline underline-offset-4 hover:text-gray-600 transition">Tạo ngay</button>
            </div>
          </div>
        )}

        {/* ===== ĐĂNG KÝ ===== */}
        {tab === 'register' && (
          <div className="p-10">
            <h2 className="text-3xl font-serif italic mb-2 dark:text-white text-center">Tạo Tài Khoản</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">Trở thành thành viên của Arume ngay.</p>
            {error && <div className="mb-4 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded">{error}</div>}
            <form className="space-y-4 text-left" onSubmit={handleRegister}>
              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold mb-2 dark:text-gray-300">Họ và Tên</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold mb-2 dark:text-gray-300">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold mb-2 dark:text-gray-300">Mật khẩu</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required className={inputClass + " pr-12"} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white transition">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold mb-2 dark:text-gray-300">Xác nhận mật khẩu</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className={inputClass + " pr-12"} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white transition">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-black text-white dark:bg-white dark:text-black py-4 text-sm font-bold tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition mt-2 disabled:opacity-50">
                {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ'}
              </button>
            </form>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-xs text-gray-400">hoặc</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>
            <button onClick={handleGoogleLogin} className="w-full mt-4 border border-gray-300 dark:border-gray-700 py-3 text-sm font-medium flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition dark:text-white">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Đăng ký với Google
            </button>

            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
              Đã có tài khoản?{' '}
              <button onClick={() => reset('login')} className="text-black dark:text-white font-bold underline underline-offset-4 hover:text-gray-600 transition">Đăng nhập</button>
            </div>
          </div>
        )}

        {/* ===== QUÊN MẬT KHẨU ===== */}
        {tab === 'forgot' && (
          <div className="p-10">
            <button onClick={() => reset('login')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white mb-6 transition">
              <ArrowLeft size={16} /> Quay lại
            </button>
            <h2 className="text-2xl font-serif italic mb-2 dark:text-white">Quên Mật Khẩu</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Nhập email của bạn, chúng tôi sẽ gửi mã xác nhận để đặt lại mật khẩu.</p>
            {error && <div className="mb-4 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded">{error}</div>}
            <form className="space-y-4 text-left" onSubmit={handleForgot}>
              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold mb-2 dark:text-gray-300">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-black text-white dark:bg-white dark:text-black py-4 text-sm font-bold tracking-widest hover:bg-gray-800 transition disabled:opacity-50">
                {loading ? 'ĐANG GỬI...' : 'GỬI MÃ XÁC NHẬN'}
              </button>
            </form>
          </div>
        )}

        {/* ===== NHẬP MÃ XÁC NHẬN ===== */}
        {tab === 'verify' && (
          <div className="p-10">
            <button onClick={() => switchTab('forgot')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white mb-6 transition">
              <ArrowLeft size={16} /> Quay lại
            </button>
            <h2 className="text-2xl font-serif italic mb-2 dark:text-white">Đặt Lại Mật Khẩu</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Mã xác nhận đã được gửi đến <strong>{formData.email}</strong>.</p>
            {devCode && (
              <div className="mb-4 text-xs bg-yellow-50 border border-yellow-200 text-yellow-700 p-3 rounded">
                <strong>[DEV]</strong> Mã xác nhận: <strong className="font-mono text-base">{devCode}</strong>
              </div>
            )}
            {error && <div className="mb-4 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded">{error}</div>}
            <form className="space-y-4 text-left" onSubmit={handleReset}>
              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold mb-2 dark:text-gray-300">Mã xác nhận (6 chữ số)</label>
                <input type="text" name="code" value={formData.code} onChange={handleChange} required maxLength={6}
                  className={inputClass + " text-center text-2xl tracking-[0.5em] font-mono"} placeholder="000000" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold mb-2 dark:text-gray-300">Mật khẩu mới</label>
                <div className="relative">
                  <input type={showNewPassword ? 'text' : 'password'} name="newPassword" value={formData.newPassword} onChange={handleChange} required className={inputClass + " pr-12"} />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white transition">
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-black text-white dark:bg-white dark:text-black py-4 text-sm font-bold tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition disabled:opacity-50">
                {loading ? 'ĐANG XỬ LÝ...' : 'ĐẶT LẠI MẬT KHẨU'}
              </button>
            </form>
          </div>
        )}

        {/* ===== THÀNH CÔNG ===== */}
        {tab === 'reset-success' && (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-serif italic mb-2 dark:text-white">Thành Công!</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Mật khẩu của bạn đã được đặt lại. Bạn có thể đăng nhập với mật khẩu mới.</p>
            <button onClick={() => reset('login')} className="w-full bg-black text-white dark:bg-white dark:text-black py-4 text-sm font-bold tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition">
              ĐĂNG NHẬP NGAY
            </button>
          </div>
        )}
      </div>
    </div>
  );
};