import React from 'react';
import { Link } from 'react-router-dom';

export const CollectionIntro = () => {
  return (
    <section className="py-24 px-6 text-center bg-[#F9F7F2] dark:bg-black transition-colors duration-300">
      <div className="max-w-2xl mx-auto flex flex-col items-center">
        <div className="mb-6">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 0L21 19L40 20L21 21L20 40L19 21L0 20L19 19L20 0Z" fill="#333" />
          </svg>
        </div>
        <p className="text-sm tracking-[0.2em] text-gray-500 mb-4 font-light">BỘ SƯU TẬP THU ĐÔNG '26</p>
        <h2 className="text-2xl md:text-3xl font-serif text-gray-800 leading-relaxed mb-8">
          Sự giao thoa giữa những giá trị vĩnh cửu và hơi thở đương đại, được khắc họa trọn vẹn trong từng nhịp chạm.
        </h2>
        <Link
          to="/collections"
          className="bg-black text-white px-10 py-4 text-xs uppercase tracking-[0.3em] font-semibold hover:bg-gray-800 transition-colors duration-300"
        >
          Khám phá bộ sưu tập
        </Link>
      </div>
    </section>
  );
};