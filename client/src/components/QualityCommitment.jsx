import React from 'react';

const commitments = [
  { 
    title: 'Nguyên liệu Tái chế', 
    desc: 'Cam kết sử dụng vàng 24k, đồng thau và thiếc từ nguồn tái chế bền vững.',
    icon: (
      <svg className="w-6 h-6 mb-4 stroke-gray-900 dark:stroke-gray-100" fill="none" viewBox="0 0 24 24" strokeWidth="1">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    )
  },
  { 
    title: 'Tiêu chuẩn RJC', 
    desc: 'Sản phẩm được chế tác từ nguồn vàng đạt chuẩn khắt khe của Hội đồng Trang sức có trách nhiệm.',
    icon: (
      <svg className="w-6 h-6 mb-4 stroke-gray-900 dark:stroke-gray-100" fill="none" viewBox="0 0 24 24" strokeWidth="1">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    )
  },
  { 
    title: 'Dịch vụ Làm mới', 
    desc: 'Đồng hành cùng bạn qua dịch vụ chăm sóc, bảo dưỡng và mạ lại trang sức chuyên sâu.',
    icon: (
      <svg className="w-6 h-6 mb-4 stroke-gray-900 dark:stroke-gray-100" fill="none" viewBox="0 0 24 24" strokeWidth="1">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    )
  }
];

export const QualityCommitment = () => {
  return (
    <section className="bg-[#F4F1ED] dark:bg-gray-800 py-20 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
        {commitments.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            {item.icon}
            <h3 className="text-sm font-medium uppercase tracking-[0.2em] mb-4 text-gray-900 dark:text-white">{item.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-[240px] font-light">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};