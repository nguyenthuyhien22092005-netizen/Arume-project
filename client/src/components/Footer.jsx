import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    if (!email.includes('@') || !email.includes('.')) {
      setError('Vui lòng nhập email hợp lệ');
      return;
    }
    setError('');
    try {
      const res = await fetch('/api/contact/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
        setEmail('');
      } else {
        setError(data.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    } catch {
      setError('Không thể kết nối máy chủ. Vui lòng thử lại sau.');
    }
  };

  return (
    <footer className="bg-[#1a1714] text-[#c8b99a] pt-20 pb-10 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">

        {/* Newsletter Section */}
        <div className="text-center mb-20 max-w-lg mx-auto">
          <h3 className="font-serif text-xl mb-2 text-white tracking-widest">NHẬN ƯU ĐÃI 10% CHO ĐƠN HÀNG ĐẦU TIÊN</h3>
          <p className="text-xs text-[#c8b99a]/60 mb-6">Cập nhật tin tức mới nhất và bộ sưu tập độc quyền từ ARUME.</p>

          {submitted ? (
            <p className="text-[#C9A96E] text-sm tracking-wide py-3 border border-[#C9A96E]/40 bg-[#C9A96E]/10">
              ✓ Cảm ơn bạn! Mã giảm giá sẽ được gửi qua email.
            </p>
          ) : (
            <>
              <div className="flex gap-0">
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
                  placeholder="Địa chỉ email của bạn"
                  className="flex-1 bg-transparent border border-[#c8b99a]/30 border-r-0 px-4 py-3 outline-none text-white placeholder-[#c8b99a]/40 text-sm focus:border-[#C9A96E] transition"
                />
                <button
                  onClick={handleSubscribe}
                  className="px-6 py-3 bg-[#C9A96E] text-[#1a1714] text-xs uppercase tracking-widest font-bold hover:bg-white transition"
                >
                  Đăng ký
                </button>
              </div>
              {error && <p className="text-red-400 text-xs mt-2 text-left">{error}</p>}
            </>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-[#c8b99a]/10 mb-16" />

        {/* Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1">
            <h2 className="text-2xl font-serif mb-4 text-white">ARUME</h2>
            <p className="text-sm text-[#c8b99a]/60 leading-relaxed italic">"Không chỉ là trang sức, chúng tôi là khát vọng thay đổi trải nghiệm làm đẹp của bạn."</p>
          </div>
          <div>
            <h4 className="font-medium mb-6 uppercase text-xs tracking-widest text-white">Hỗ trợ khách hàng</h4>
            <ul className="space-y-4 text-sm text-[#c8b99a]/60">
              <li><Link to="/policies/shipping" className="hover:text-[#C9A96E] transition-colors">Chính sách vận chuyển</Link></li>
              <li><Link to="/policies/privacy" className="hover:text-[#C9A96E] transition-colors">Chính sách bảo mật</Link></li>
              <li><Link to="/policies/refund" className="hover:text-[#C9A96E] transition-colors">Đổi trả & Hoàn tiền</Link></li>
              <li><Link to="/policies/terms" className="hover:text-[#C9A96E] transition-colors">Điều khoản dịch vụ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-6 uppercase text-xs tracking-widest text-white">Về ARUME</h4>
            <ul className="space-y-4 text-sm text-[#c8b99a]/60">
              <li><Link to="/about" className="hover:text-[#C9A96E] transition-colors">Câu chuyện thương hiệu</Link></li>
              <li><Link to="/about" className="hover:text-[#C9A96E] transition-colors">Cam kết bền vững</Link></li>
              <li><Link to="/contact" className="hover:text-[#C9A96E] transition-colors">Liên hệ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-6 uppercase text-xs tracking-widest text-white">Kết nối với chúng tôi</h4>
            <ul className="space-y-4 text-sm text-[#c8b99a]/60">
              <li><a href="#" className="hover:text-[#C9A96E] transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-[#C9A96E] transition-colors">Facebook</a></li>
              <li><a href="#" className="hover:text-[#C9A96E] transition-colors">TikTok</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-[#c8b99a]/10 text-xs text-[#c8b99a]/40">
          <p>© 2026, ARUME. Thiết kế & Phát triển bởi Arume.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>MoMo</span>
          </div>
        </div>

      </div>
    </footer>
  );
};