import React from 'react';
import { Link } from 'react-router-dom';

const services = [
  {
    title: 'Nghệ thuật Chạm',
    desc: 'Nâng tầm phong cách cá nhân cùng những nghệ nhân xỏ khuyên tại không gian riêng tư của chúng tôi.',
    btnText: 'Đặt lịch hẹn',
    to: '/contact',
    image: '/assets/images/piercing studio.jpg'
  },
  {
    title: 'Bộ sưu tập Tinh hoa',
    desc: 'Trải nghiệm mua sắm hoàn hảo và nhận món quà của bạn trong không gian trưng bày sang trọng.',
    btnText: 'Xem bộ sưu tập',
    to: '/collections',
    image: '/assets/images/collect in store.jpg'
  },
  {
    title: 'Dịch vụ Cá nhân hóa',
    desc: 'Tư vấn chuyên sâu 1-1 cùng đội ngũ chuyên gia để tìm kiếm món trang sức dành riêng cho bạn.',
    btnText: 'Liên hệ tư vấn',
    to: '/contact',
    image: '/assets/images/PERSONALIZATION.jpg'
  }
];

export const StoreServices = () => {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-serif text-gray-900 dark:text-white mb-3">Xưởng chế tác & Dịch vụ</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">Khám phá không gian tinh tế của Arume</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <div key={index} className="flex flex-col group">
            {/* Ảnh click → đi đến trang liên quan */}
            <Link to={service.to} className="overflow-hidden mb-6 block relative">
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-500 flex items-center justify-center">
                <span className="text-white text-xs uppercase tracking-widest font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white px-4 py-2">
                  Xem ngay
                </span>
              </div>
            </Link>
            <h3 className="text-lg font-serif mb-3 uppercase tracking-wider dark:text-white">{service.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 flex-grow font-light leading-relaxed">{service.desc}</p>
            <Link
              to={service.to}
              className="text-[10px] uppercase tracking-[0.2em] border-b border-black dark:border-white dark:text-white pb-1 w-fit hover:opacity-60 transition-opacity"
            >
              {service.btnText} →
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};