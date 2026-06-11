import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const Contact = () => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: 'Tư vấn sản phẩm', message: '' });
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setForm({ name: '', phone: '', email: '', subject: 'Tư vấn sản phẩm', message: '' });
      } else {
        setStatus('error');
        setErrorMsg(data.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="bg-[#F9F7F2] dark:bg-gray-900 min-h-screen pt-28 pb-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">

        {/* Nút quay lại */}
        <div className="mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            <ArrowLeft size={14} /> Trang chủ
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-serif italic mb-4 text-gray-900 dark:text-white">Liên Hệ</h1>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Chúng tôi luôn ở đây để lắng nghe bạn</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-serif italic mb-8 dark:text-white">Dịch vụ Khách hàng</h2>
            <p className="text-gray-600 dark:text-gray-400 font-light leading-relaxed mb-8">
              Mọi thắc mắc về sản phẩm, đơn hàng hay dịch vụ chăm sóc, xin vui lòng điền vào biểu mẫu hoặc liên hệ trực tiếp với chúng tôi qua các thông tin bên dưới.
            </p>

            <div className="space-y-6">
              <div>
                <h4 className="text-xs uppercase tracking-widest font-semibold mb-2 dark:text-gray-200">Email</h4>
                <p className="text-gray-600 dark:text-gray-400 font-serif italic text-lg">care@arume.com</p>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-widest font-semibold mb-2 dark:text-gray-200">Điện thoại</h4>
                <p className="text-gray-600 dark:text-gray-400 font-serif italic text-lg">+84 123 456 789</p>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-widest font-semibold mb-2 dark:text-gray-200">Giờ làm việc</h4>
                <p className="text-gray-600 dark:text-gray-400 font-serif italic text-lg">Thứ Hai - Thứ Bảy: 9:00 Sáng - 8:00 Tối</p>
              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-2xl font-serif italic mb-6 dark:text-white">Cửa hàng Tuyển chọn</h2>
              <div className="border-t border-gray-300 dark:border-gray-700 py-4">
                <h4 className="font-semibold text-sm mb-2 dark:text-white">ARUME Flagship - Hà Nội</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-light">56 Đường Láng, Quận Đống Đa, Hà Nội</p>
              </div>
              <div className="border-t border-gray-300 dark:border-gray-700 py-4">
                <h4 className="font-semibold text-sm mb-2 dark:text-white">ARUME Boutique - Hồ Chí Minh</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-light">32A Đường Lê Duẩn, Quận 1, TP. HCM</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 p-10 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-serif italic mb-8 dark:text-white">Gửi Tin Nhắn</h2>

            {/* Success state */}
            {status === 'success' ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-serif italic mb-3 dark:text-white">Tin nhắn đã được gửi!</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                  Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc.<br/>
                  Email xác nhận đã được gửi đến hộp thư của bạn.
                </p>
                <button
                  onClick={() => setStatus(null)}
                  className="text-sm uppercase tracking-widest underline text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                >
                  Gửi tin nhắn khác
                </button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Họ và tên <span className="text-red-400">*</span></label>
                    <input
                      type="text" name="name" value={form.name} onChange={handleChange} required
                      className="w-full border-b border-gray-300 dark:border-gray-600 py-2 outline-none focus:border-black dark:focus:border-white transition-colors bg-transparent text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Điện thoại</label>
                    <input
                      type="tel" name="phone" value={form.phone} onChange={handleChange}
                      className="w-full border-b border-gray-300 dark:border-gray-600 py-2 outline-none focus:border-black dark:focus:border-white transition-colors bg-transparent text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="0123 456 789"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Email <span className="text-red-400">*</span></label>
                  <input
                    type="email" name="email" value={form.email} onChange={handleChange} required
                    className="w-full border-b border-gray-300 dark:border-gray-600 py-2 outline-none focus:border-black dark:focus:border-white transition-colors bg-transparent text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Chủ đề</label>
                  <select
                    name="subject" value={form.subject} onChange={handleChange}
                    className="w-full border-b border-gray-300 dark:border-gray-600 py-2 outline-none focus:border-black dark:focus:border-white transition-colors text-gray-600 dark:text-gray-300 bg-transparent dark:bg-gray-800"
                  >
                    <option className="dark:bg-gray-800">Tư vấn sản phẩm</option>
                    <option className="dark:bg-gray-800">Đơn hàng & Vận chuyển</option>
                    <option className="dark:bg-gray-800">Bảo hành & Đổi trả</option>
                    <option className="dark:bg-gray-800">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Tin nhắn <span className="text-red-400">*</span></label>
                  <textarea
                    rows="4" name="message" value={form.message} onChange={handleChange} required
                    className="w-full border-b border-gray-300 dark:border-gray-600 py-2 outline-none focus:border-black dark:focus:border-white transition-colors resize-none bg-transparent text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Hãy cho chúng tôi biết bạn cần hỗ trợ gì..."
                  />
                </div>

                {/* Error message */}
                {status === 'error' && (
                  <p className="text-red-500 text-sm">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-black dark:bg-white text-white dark:text-black py-4 text-sm uppercase tracking-[0.2em] font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? 'Đang gửi...' : 'Gửi Tin Nhắn'}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};