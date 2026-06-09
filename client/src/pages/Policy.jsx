import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

export const Policy = () => {
  const location = useLocation();
  const [policyContent, setPolicyContent] = useState({ title: '', content: null });

  const navigationTabs = [
    { name: 'Vận Chuyển', path: '/policies/shipping' },
    { name: 'Bảo Mật', path: '/policies/privacy' },
    { name: 'Đổi Trả & Hoàn Tiền', path: '/policies/refund' },
    { name: 'Điều Khoản', path: '/policies/terms' },
  ];

  useEffect(() => {
    const path = location.pathname;
    let title = 'Chính Sách';
    let content = <p className="text-zinc-400 italic text-sm font-light">Nội dung đang được cập nhật...</p>;

    if (path.includes('shipping')) {
      title = 'Chính Sách Vận Chuyển';
      content = (
        <div className="space-y-8 text-zinc-600 dark:text-zinc-400 font-sans font-light text-sm md:text-base leading-relaxed tracking-wide">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">
              <p>Arume trân trọng từng tạo tác và cam kết cung cấp phương thức giao hàng bảo mật cao cấp nhất, đảm bảo tính an toàn tuyệt đối từ xưởng chế tác đến tận tay quý khách.</p>
              <div>
                <h3 className="font-serif text-lg md:text-xl font-light text-zinc-900 dark:text-zinc-100 mb-4 tracking-wide">Thời Gian Kiến Hiệu</h3>
                <ul className="space-y-3 pl-4 border-l border-zinc-200 dark:border-zinc-800">
                  <li><span className="font-normal text-zinc-900 dark:text-zinc-200">Khu vực Nội thành (Hà Nội / TP.HCM):</span> Quy trình giao nhận hoàn thiện trong vòng 1-2 ngày làm việc.</li>
                  <li><span className="font-normal text-zinc-900 dark:text-zinc-200">Các Tỉnh thành lân cận:</span> Thời gian vận chuyển tiêu chuẩn từ 3-5 ngày làm việc.</li>
                  <li><span className="font-normal text-zinc-900 dark:text-zinc-200">Đặc quyền Hỏa tốc:</span> Áp dụng giao nhận trong ngày đối với một số danh mục sản phẩm thượng lưu.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-serif text-lg md:text-xl font-light text-zinc-900 dark:text-zinc-100 mb-4 tracking-wide">Đặc Quyền Chi Phí</h3>
                <p>Mọi tạo tác của Arume đều được <span className="font-normal text-zinc-900 dark:text-zinc-200">đặc quyền miễn phí vận chuyển</span> trên phạm vi toàn quốc, đi kèm hệ thống bảo hiểm hàng hóa toàn phần.</p>
              </div>
            </div>
            <div className="hidden md:block w-[380px] flex-shrink-0 self-stretch">
              <img src="/assets/images/collect in store.jpg" alt="Vận chuyển" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
            </div>
          </div>
        </div>
      );
    } else if (path.includes('privacy')) {
      title = 'Chính Sách Bảo Mật';
      content = (
        <div className="space-y-8 text-zinc-600 dark:text-zinc-400 font-sans font-light text-sm md:text-base leading-relaxed tracking-wide">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">
              <p>Tại Arume, sự riêng tư của quý khách là tôn chỉ tối thượng. Chúng tôi thiết lập các tiêu chuẩn mã hóa cấp cao nhất để bảo vệ tuyệt đối cơ sở dữ liệu cá nhân.</p>
              <div>
                <h3 className="font-serif text-lg md:text-xl font-light text-zinc-900 dark:text-zinc-100 mb-4 tracking-wide">Lưu Trữ Tối Giản</h3>
                <p>Hệ thống chỉ ghi nhận những thông tin cơ bản phục vụ cho đặc quyền cá nhân hóa và logistics. Chúng tôi cam kết không chia sẻ dữ liệu này cho bất kỳ bên thứ ba nào nằm ngoài mục đích phục vụ khách hàng.</p>
              </div>
              <div>
                <h3 className="font-serif text-lg md:text-xl font-light text-zinc-900 dark:text-zinc-100 mb-4 tracking-wide">Bảo Mật Giao Dịch</h3>
                <p>Mọi tiến trình thanh toán đều được thực hiện thông qua giao thức mã hóa SSL tân tiến. Arume hoàn toàn <span className="italic">không lưu trữ</span> dữ liệu thẻ hay tài khoản ngân hàng của quý khách.</p>
              </div>
            </div>
            <div className="hidden md:block w-[380px] flex-shrink-0 self-stretch">
              <img src="/assets/images/câu chuyện của arume.jpg" alt="Bảo mật" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
            </div>
          </div>
        </div>
      );
    } else if (path.includes('refund')) {
      title = 'Đổi Trả & Hoàn Tiền';
      content = (
        <div className="space-y-8 text-zinc-600 dark:text-zinc-400 font-sans font-light text-sm md:text-base leading-relaxed tracking-wide">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">
              <p>Nhằm mang lại trải nghiệm an tâm tuyệt đối, Arume áp dụng chính sách đổi trả linh hoạt trong vòng <span className="font-normal text-zinc-900 dark:text-zinc-200">14 ngày</span> kể từ thời điểm bàn giao tạo tác thành công.</p>
              <div>
                <h3 className="font-serif text-lg md:text-xl font-light text-zinc-900 dark:text-zinc-100 mb-4 tracking-wide">Tiêu Chuẩn Tiếp Nhận</h3>
                <ul className="space-y-3 pl-4 border-l border-zinc-200 dark:border-zinc-800">
                  <li>Tạo tác phải giữ nguyên tình trạng nguyên bản, chưa qua sử dụng, không xuất hiện các dấu vết tác động ngoại lực hay trầy xước.</li>
                  <li>Sản phẩm đi kèm đầy đủ hộp chứng thư di sản, túi bọc lụa, giấy chứng nhận đá quý (GIA nếu có) và chứng từ giao dịch gốc.</li>
                  <li><span className="italic text-zinc-400">Lưu ý:</span> Quyền lợi đổi trả không áp dụng đối với các tạo tác được khắc chữ cá nhân hóa hoặc chế tác riêng theo yêu cầu (Bespoke).</li>
                </ul>
              </div>
            </div>
            <div className="hidden md:block w-[380px] flex-shrink-0 self-stretch">
              <img src="/assets/images/Bộ sưu tập nhẫn.jpg" alt="Đổi trả" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
            </div>
          </div>
        </div>
      );
    } else if (path.includes('terms')) {
      title = 'Điều Khoản Dịch Vụ';
      content = (
        <div className="space-y-8 text-zinc-600 dark:text-zinc-400 font-sans font-light text-sm md:text-base leading-relaxed tracking-wide">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">
              <p>Việc quý khách tiếp cận và trải nghiệm không gian số của Arume đồng nghĩa với việc đồng thuận với các quy tắc và điều khoản dịch vụ hiện hành của chúng tôi.</p>
              <div>
                <h3 className="font-serif text-lg md:text-xl font-light text-zinc-900 dark:text-zinc-100 mb-4 tracking-wide">Bản Quyền Thẩm Mỹ</h3>
                <p>Tất cả hình ảnh truyền thông, bản vẽ đồ họa, phom dáng hình học và tư liệu chữ viết trên hệ thống này đều thuộc quyền sở hữu trí tuệ độc quyền của Arume Jewelry. Mọi hành vi sao chép, tái bản hoặc ứng dụng vào mục đích thương mại khi chưa có sự phê duyệt bằng văn bản pháp lý đều được xem là vi phạm nghiêm trọng.</p>
              </div>
            </div>
            <div className="hidden md:block w-[380px] flex-shrink-0 self-stretch">
              <img src="/assets/images/banner 2.jpg" alt="Điều khoản" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
            </div>
          </div>
        </div>
      );
    }

    setPolicyContent({ title, content });
  }, [location.pathname]);

  return (
    <div className="bg-[#FAF6F0] text-[#111111] dark:bg-zinc-950 dark:text-zinc-100 min-h-screen pt-28 pb-32 transition-colors duration-500 antialiased selection:bg-amber-100/50">
      <div className="max-w-[1450px] mx-auto px-6 sm:px-10 pt-16 font-sans">

        {/* THANH TAB — trên đầu */}
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-widest font-light mb-8 border-b border-zinc-200/40 dark:border-zinc-900/60 pb-5">
          {navigationTabs.map((tab, index) => {
            const isActive = location.pathname.includes(tab.path.split('/').pop());
            return (
              <Link
                key={index}
                to={tab.path}
                className={`relative pb-1 transition-colors duration-300 ${
                  isActive
                    ? 'text-amber-900 dark:text-amber-400 font-normal'
                    : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {tab.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-amber-900 dark:bg-amber-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* TIÊU ĐỀ */}
        <div className="mb-10 border-b border-zinc-200/40 dark:border-zinc-900/60 pb-6">
          <h1 className="text-3xl md:text-4xl font-serif font-light tracking-[0.05em] text-zinc-900 dark:text-zinc-100">
            {policyContent.title}
          </h1>
        </div>

        {/* NỘI DUNG CHÍNH */}
        <div className="max-w-4xl text-left">
          <div className="prose dark:prose-invert max-w-none">
            {policyContent.content}
          </div>
        </div>

      </div>
    </div>
  );
};