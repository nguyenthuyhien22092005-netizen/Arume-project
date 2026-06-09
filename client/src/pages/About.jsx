import React, { useState } from 'react';

export const About = () => {
  const [activeTab, setActiveTab] = useState(0); 

  const tabs = [
    {
      title: "Báo Cáo Trách Nhiệm",
      subtitle: "Bảo tồn giá trị nhân văn bản địa",
      content: "Chúng tôi hợp tác chặt chẽ với các tổ chức khai thác minh bạch toàn cầu, đảm bảo an sinh xã hội và tôn trọng quyền lợi của cộng đồng nghệ nhân bản địa."
    },
    {
      title: "Chất Liệu & Bảo Quản",
      subtitle: "Quy trình tuyển chọn và tái chế tuần hoàn",
      content: "Mọi vụn kim loại quý từ quá trình chế tác đều được thu gom và tái chế tuần hoàn nghiêm ngặt nhằm tiếp tục đúc nên những tạo tác mới tinh túy."
    },
    {
      title: "Vòng Đời Trang Sức",
      subtitle: "Chương trình thu đổi và tái chế xanh",
      content: "Chương trình Vòng Đời Xanh hỗ trợ trao đổi hoặc nâng cấp trang sức cũ, thúc đẩy mô hình thời trang tuần hoàn và giảm thiểu rác thải môi trường."
    },
    {
      title: "Đặc Quyền Bảo Hành",
      subtitle: "Cam kết đồng hành trọn đời sản phẩm",
      content: "Đặc quyền bảo hành 12 tháng đối với lỗi kỹ thuật và hỗ trợ dịch vụ làm sạch, phục hồi độ sáng bóng trọn đời."
    }
  ];

  return (
    <div className="bg-[#FAF6F0] text-[#111111] dark:bg-zinc-950 dark:text-zinc-100 min-h-screen pt-28 transition-colors duration-500 antialiased selection:bg-amber-100/50 selection:text-amber-900">
      
      {/* 1. HERO SECTION - THIẾT KẾ ĐƯỢC TÁI CẤU TRÚC THEO FILE IMAGE_780D42.PNG */}
      <section className="w-full h-[65vh] sm:h-[75vh] md:h-[80vh] flex flex-col md:flex-row overflow-hidden">
        
        {/* Nửa trái: Khối màu tối giản chứa thông tin định danh thương hiệu */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full bg-[#54433A] dark:bg-zinc-900 flex flex-col justify-center px-10 sm:px-16 md:px-20 lg:px-28 text-[#F4EFEA]">
          <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-[#C4B4A9] dark:text-zinc-400 font-light block mb-4">
            About Us
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-light tracking-wide leading-tight">
            We're Arume Jewelry
          </h1>
          <div className="w-10 h-[1px] bg-[#C4B4A9]/40 mt-6 mb-4 hidden md:block"></div>
          <p className="font-sans text-xs sm:text-sm max-w-sm font-light text-[#C4B4A9] leading-relaxed tracking-wide hidden md:block">
            Nơi nghệ thuật chế tác thủ công gặp gỡ tư duy thẩm mỹ bền vững, kiến tạo nên những món trang sức mang linh hồn di sản vượt thời gian.
          </p>
        </div>

        {/* Nửa phải: Khối ảnh cận cảnh sản phẩm cao cấp, lấp đầy không gian thị giác */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden bg-zinc-200">
          <img 
            src="/assets/images/banner about.webp" 
            alt="Arume Jewelry Close-up Collection" 
            className="w-full h-full object-cover object-center scale-100 transition-transform duration-[3000ms] ease-out hover:scale-102"
          />
        </div>

      </section>

      {/* 2. INTRO STATEMENT & TRỤC DỌC LIÊN KẾT LIỀN MẠCH */}
      <section className="pt-28 pb-16 px-8 text-center max-w-3xl mx-auto relative">
        <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-amber-900 dark:text-amber-500 font-medium block mb-6">
          Tầm Nhìn & Triết Lý
        </span>
        <p className="font-serif text-xl md:text-3xl italic text-zinc-800 dark:text-zinc-200 leading-[1.65] font-light">
          "Kể từ khi bắt đầu, Arume đã định hình lại trang sức cao cấp thành một trải nghiệm nghệ thuật đầy chiều sâu, đồng hành cùng bạn kể câu chuyện độc bản của chính mình."
        </p>
        
        {/* Sợi chỉ dọc liên kết mạch trang xuyên suốt */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-16 bg-gradient-to-b from-transparent to-zinc-300 dark:to-zinc-800"></div>
      </section>


      {/* ========================================================
          HỆ THỐNG TRỤC THỜI GIAN/DI SẢN LIÊN KẾT CHẶT CHẼ
         ======================================================== */}
      <div className="relative max-w-[1300px] mx-auto px-4 sm:px-8">
        
        {/* Đường hairline chạy xuyên suốt tâm trục dọc */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden md:block z-0"></div>

        {/* KHỐI 1: [ẢNH TRÁI - CHỮ PHẢI] */}
        <section className="relative flex flex-col md:flex-row items-center gap-8 lg:gap-16 py-12 md:py-20 z-10">
          <div className="w-full md:w-[45%] aspect-[4/3] relative overflow-hidden bg-zinc-100 dark:bg-zinc-900 group">
            <img 
              src="/assets/images/câu chuyện của arume.jpg" 
              alt="Thiết Kế Linh Hoạt" 
              className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-102"
            />
          </div>
          
          <div className="w-full md:w-[55%] flex flex-col justify-center md:pl-8">
            <span className="text-[10px] uppercase tracking-[0.4em] text-amber-900 dark:text-amber-500 font-semibold block mb-3 font-sans">
              01 / Sáng Tạo Độc Bản
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-light mb-6 text-zinc-900 dark:text-white tracking-wide leading-tight">
              Thiết Kế Khối Linh Hoạt
            </h2>
            <div className="space-y-4 text-zinc-600 dark:text-zinc-400 font-light text-base leading-relaxed tracking-wide max-w-xl font-sans">
              <p>
                Hệ thống trang sức module thông minh của Arume cho phép bạn tự do phối hợp và biến tấu ngẫu hứng. Từ một thiết kế nền tảng nguyên bản, bạn có thể dễ dàng kết nối các mảnh ghép phụ kiện để tạo nên dấu ấn cá nhân khác biệt hoàn toàn.
              </p>
              <p className="font-serif font-light italic text-base text-amber-900 dark:text-amber-400/90 pt-4 border-t border-zinc-200 dark:border-zinc-800/60">
                Các dòng khuyên nụ và khuyên tai đi kèm tương thích chuẩn xác tuyệt đối, giúp bạn dễ dàng làm mới phong cách mỗi ngày.
              </p>
            </div>
          </div>
        </section>

        {/* KHỐI 2: [CHỮ TRÁI - ẢNH PHẢI] */}
        <section className="relative flex flex-col-reverse md:flex-row items-center gap-8 lg:gap-16 py-12 md:py-20 z-10">
          <div className="w-full md:w-[55%] flex flex-col justify-center items-start md:items-end md:text-right md:pr-8">
            <div className="max-w-xl flex flex-col items-start md:items-end">
              <span className="text-[10px] uppercase tracking-[0.4em] text-amber-900 dark:text-amber-500 font-semibold block mb-3 font-sans">
                02 / Trách Nhiệm Xanh
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-light mb-8 text-zinc-900 dark:text-white tracking-wide leading-tight">
                Báo Cáo Bền Vững
              </h2>
              
              <div className="space-y-8 text-left w-full font-sans">
                <div className="relative pl-5 border-l border-zinc-300 dark:border-zinc-800 md:border-l-0 md:border-r md:pl-0 md:pr-5 py-0.5">
                  <span className="text-[9px] uppercase tracking-widest text-zinc-400 block mb-1">Dòng Sản Phẩm Tiên Phong</span>
                  <h4 className="text-base font-serif font-medium text-zinc-900 dark:text-zinc-200 mb-1.5 tracking-wide">
                    Kim Cương Tân Tiến (Lab-Grown)
                  </h4>
                  <p className="text-zinc-500 dark:text-zinc-400 font-light text-sm leading-relaxed">
                    Đá quý đích thực được khởi tạo hoàn toàn trong phòng thí nghiệm hiện đại hàng đầu — giải pháp đột phá bảo vệ hệ sinh thái và hành tinh xanh.
                  </p>
                </div>

                <div className="relative pl-5 border-l border-zinc-300 dark:border-zinc-800 md:border-l-0 md:border-r md:pl-0 md:pr-5 py-0.5">
                  <span className="text-[9px] uppercase tracking-widest text-zinc-400 block mb-1">Cam Kết Nguyên Liệu</span>
                  <h4 className="text-base font-serif font-medium text-zinc-900 dark:text-zinc-200 mb-1.5 tracking-wide">
                    Vàng Nguyên Khối Minh Bạch
                  </h4>
                  <p className="text-zinc-500 dark:text-zinc-400 font-light text-sm leading-relaxed">
                    Cam kết sử dụng 100% vàng 14K nguyên khối tinh khiết với nguồn cung minh bạch, mang lại giá trị vẻ đẹp trường tồn theo thời gian.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-[45%] aspect-[4/3] relative overflow-hidden bg-zinc-100 dark:bg-zinc-900 group">
            <img 
              src="/assets/images/giá trị cốt lõi.webp" 
              alt="Báo Cáo Bền Vững" 
              className="w-full h-full object-cover transition-transform duration-[2500ms] ease-out group-hover:scale-102"
            />
          </div>
        </section>

        {/* KHỐI 3: [ẢNH TRÁI - CHỮ PHẢI] */}
        <section className="relative flex flex-col md:flex-row items-center gap-8 lg:gap-16 py-12 md:py-20 z-10">
          <div className="w-full md:w-[45%] aspect-[4/3] relative overflow-hidden bg-zinc-100 dark:bg-zinc-900 group">
            <img 
              src="/assets/images/banner 2.jpg" 
              alt="Cam Kết Cộng Đồng" 
              className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-102"
            />
          </div>
          <div className="w-full md:w-[55%] flex flex-col justify-center md:pl-8">
            <span className="text-[10px] uppercase tracking-[0.4em] text-amber-900 dark:text-amber-500 font-semibold block mb-3 font-sans">
              03 / Giá Trị Cộng Đồng
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-light mb-6 text-zinc-900 dark:text-white tracking-wide leading-tight">
              Cam Kết Nhân Văn
            </h2>
            <div className="space-y-4 text-zinc-600 dark:text-zinc-400 font-light text-base leading-relaxed tracking-wide max-w-xl font-sans">
              <p>
                Arume kiến tạo những giá trị nhân văn sâu sắc thông qua việc vận hành <span className="text-zinc-900 dark:text-white font-normal">Quỹ Trao Quyền</span>, tích cực đồng hành và hỗ trợ phụ nữ trên toàn quốc tiếp cận tri thức hiện đại, phát triển kỹ năng làm chủ cuộc sống.
              </p>
              <p className="font-serif italic text-base text-zinc-800 dark:text-zinc-300">
                Chiến dịch lớn "Một Năm Hành Động" hợp tác cùng các tổ chức uy tín thế giới nhằm thúc đẩy bình đẳng giới mạnh mẽ và bảo vệ phúc lợi y tế bền vững cho cộng đồng.
              </p>
            </div>
          </div>
        </section>

      </div>

      {/* 3. TESTIMONIAL BLOCK */}
      <section className="bg-[#F5EFE6]/50 dark:bg-zinc-900/10 py-28 px-8 text-center border-t border-b border-zinc-200/60 dark:border-zinc-900/80 my-8">
        <div className="max-w-2xl mx-auto">
          <p className="font-serif text-xl md:text-2xl italic text-zinc-800 dark:text-zinc-200 leading-[1.65] font-light mb-6">
            "Chất lượng thiết kế duy mỹ vượt bậc cùng tư duy chế tác thủ công tỉ mỉ. Đây là một trong số ít những thương hiệu trang sức sở hữu triết lý nhân văn và ý thức bảo vệ môi trường triệt để vô cùng đáng trân quý."
          </p>
          <span className="text-[10px] uppercase tracking-[0.4em] text-amber-900 dark:text-amber-500 block font-medium font-sans">
            — Khách Hàng Khảo Sát Thường Niên, Úc
          </span>
        </div>
      </section>

      {/* KHỐI 4: [TABS CHỮ TRÁI - ẢNH PHẢI] */}
      <section className="max-w-[1300px] mx-auto px-4 sm:px-8 py-12 md:py-20 relative">
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden md:block z-0"></div>

        <div className="relative flex flex-col-reverse md:flex-row items-center gap-8 lg:gap-16 z-10">
          <div className="w-full md:w-[55%] flex flex-col justify-center md:pr-8">
            <div className="w-full space-y-0">
              {tabs.map((tab, idx) => {
                const isOpen = activeTab === idx;
                return (
                  <div 
                    key={idx} 
                    className="border-b border-zinc-200 dark:border-zinc-800/80 py-5 first:pt-0 last:border-0 transition-all duration-[400ms]"
                  >
                    <button 
                      onClick={() => setActiveTab(isOpen ? -1 : idx)}
                      className="w-full flex justify-between items-baseline text-left focus:outline-none group"
                    >
                      <div className="flex items-baseline gap-5">
                        <span className={`font-sans text-[10px] tracking-widest ${isOpen ? 'text-amber-900 dark:text-amber-400 font-medium' : 'text-zinc-400'}`}>
                          0{idx + 1}
                        </span>
                        <div>
                          <h3 className={`text-lg md:text-xl font-serif tracking-wide transition-all duration-500 ${isOpen ? 'text-amber-900 dark:text-amber-400 font-light italic translate-x-1' : 'text-zinc-900 dark:text-zinc-200 font-light group-hover:text-amber-950'}`}>
                            {tab.title}
                          </h3>
                          <span className="text-xs text-zinc-400 dark:text-zinc-500 block mt-1 font-sans font-light tracking-wide">
                            {tab.subtitle}
                          </span>
                        </div>
                      </div>
                    </button>
                    
                    <div 
                      className={`text-base text-zinc-600 dark:text-zinc-400 font-sans font-light leading-relaxed overflow-hidden transition-all duration-[400ms] ease-in-out ${
                        isOpen ? 'max-h-[200px] opacity-100 mt-4 pl-9' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <p className="max-w-md text-sm md:text-base">{tab.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-full md:w-[45%] aspect-[4/3] relative overflow-hidden bg-zinc-100 dark:bg-zinc-900 group">
            <img 
              src="/assets/images/cam kết.webp" 
              alt="Trách Nhiệm Chế Tác" 
              className="w-full h-full object-cover transition-transform duration-[2500ms] ease-out group-hover:scale-102"
            />
          </div>
        </div>
      </section>

      {/* 5. CORE COMMITMENTS FOOTER STRIP */}
      <section className="bg-[#F2EAE0]/60 dark:bg-zinc-900/40 py-24 px-8 border-t border-zinc-200/60 dark:border-zinc-900 font-sans">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 text-left md:text-center">
          
          <div className="space-y-2">
            <span className="text-[10px] font-sans tracking-[0.3em] text-amber-900 dark:text-amber-500 block uppercase font-medium">I. Minh Bạch</span>
            <h4 className="text-base text-zinc-900 dark:text-white font-serif font-light tracking-wide">
              Giá Trị Thực Sự
            </h4>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-light leading-relaxed max-w-[240px] md:mx-auto">
              Thiết kế trang sức cao cấp mang mức giá tối ưu và hoàn toàn minh bạch.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-sans tracking-[0.3em] text-amber-900 dark:text-amber-500 block uppercase font-medium">II. Di Sản</span>
            <h4 className="text-base text-zinc-900 dark:text-white font-serif font-light tracking-wide">
              Nghệ Nhân Dẫn Đường
            </h4>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-light leading-relaxed max-w-[240px] md:mx-auto">
              Hơn hai thập kỷ đồng hành cùng đội ngũ nghệ nhân kim hoàn gạo cội.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-sans tracking-[0.3em] text-amber-900 dark:text-amber-500 block uppercase font-medium">III. Đặc Quyền</span>
            <h4 className="text-base text-zinc-900 dark:text-white font-serif font-light tracking-wide">
              An Tâm Tuyệt Đối
            </h4>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-light leading-relaxed max-w-[240px] md:mx-auto">
              Chính sách bảo hành vượt trội và đổi trả linh hoạt lên tới 30 ngày.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-sans tracking-[0.3em] text-amber-900 dark:text-amber-500 block uppercase font-medium">IV. Duy Mỹ</span>
            <h4 className="text-base text-zinc-900 dark:text-white font-serif font-light tracking-wide">
              Cảm Hứng Bất Tận
            </h4>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-light leading-relaxed max-w-[240px] md:mx-auto">
              Mỗi tạo tác mang thiết kế hoàn mỹ lưu giữ trọn vẹn những khoảnh khắc quý giá.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};