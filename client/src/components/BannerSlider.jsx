import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

// ============================================================
// HƯỚNG DẪN THAY ẢNH / VIDEO:
// Mỗi slide có thể dùng ảnh (img) HOẶC video (videos), không cần cả hai.
// Thay đường dẫn bên dưới bằng link ảnh/video thật của bạn.
// ============================================================
const slides = [
  {
    sub: "ƯU ĐÃI LÊN ĐẾN 30%",
    title: "Kiểu dáng biểu tượng, những khoảnh khắc đặc biệt",
    desc: "Được chế tác cho cả những khoảnh khắc tỏa sáng và những phút giây lắng đọng.",
    buttons: [
      { label: "MUA NGAY", to: "/collections/All products", primary: true }
    ],
    img: "/assets/images/jewelry-collection.jpg" // Ảnh nền slide 1 (tỉ lệ 16:9 hoặc full-width)
  },
  {
    sub: "XU HƯỚNG HIỆN NAY",
    title: "Phụ kiện thiết yếu mỗi ngày",
    desc: "Nhẹ nhàng, bền bỉ và luôn sẵn sàng cùng bạn tỏa sáng dù là ngày hay đêm.",
    buttons: [
      { label: "MUA NGAY", to: "/collections/All products", primary: true },
      { label: "KHÁM PHÁ NGAY", to: "/collections", primary: false }
    ],
    img: "/assets/images/banner.jpg" // Ảnh nền slide 2
  },
  {
    sub: "TỪ 28/11 - 2/12",
    title: "Ưu đãi trang sức sang trọng",
    desc: "Sở hữu vẻ ngoài hoàn hảo với mức giá ưu đãi đặc biệt trong thời gian giới hạn.",
    buttons: [
      { label: "MUA NGAY", to: "/collections/All products", primary: true },
      { label: "KHÁM PHÁ TẤT CẢ", to: "/collections", primary: false }
    ],
    videos: "/assets/videos/banner 3.mp4" // Video nền slide 3 (.mp4) — nếu dùng ảnh thì đổi thành img:
  }
];

export const BannerSlider = () => {
  return (
    <div className="w-full h-[85vh] overflow-hidden relative">
      <Swiper
        modules={[Navigation, Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        navigation={true}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        className="w-full h-full"
      >
        {slides.map((s, i) => (
          <SwiperSlide key={i} className="relative w-full h-full">
            {s.videos ? (
              <video src={s.videos} autoPlay loop muted playsInline className="w-full h-full object-cover" />
            ) : (
              <img src={s.img} className="w-full h-full object-cover" alt={s.title} />
            )}
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex flex-col items-start justify-center px-10 md:px-20 text-white text-left">
              <p className="text-sm uppercase tracking-[0.2em] mb-4 font-medium opacity-90">{s.sub}</p>
              <h1 className="text-4xl md:text-6xl font-serif italic mb-6 leading-tight max-w-2xl">{s.title}</h1>
              <p className="text-lg md:text-xl font-light mb-8 max-w-md opacity-90">{s.desc}</p>
              <div className="flex gap-4">
                {s.buttons.map((btn, idx) => (
                  <Link key={idx} to={btn.to}
                    className={`${btn.primary ? "bg-white text-black hover:bg-gray-100" : "bg-transparent text-white border border-white hover:bg-white hover:text-black"} px-8 py-3 text-sm uppercase tracking-widest font-bold transition duration-300`}
                  >{btn.label}</Link>
                ))}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
