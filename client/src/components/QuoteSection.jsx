import React from 'react';

export const QuoteSection = () => {
  return (
    <section className="w-full py-24 bg-[#F9F7F2] dark:bg-black flex flex-col items-center justify-center text-center px-6 transition-colors duration-300">
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-serif italic text-gray-800 leading-relaxed">
          “Trang sức giống như loại gia vị hoàn hảo – luôn bổ sung cho điều đã có sẵn”
        </h2>
        <p className="mt-8 text-sm uppercase tracking-[0.2em] text-gray-500 font-medium">
          — Diane von Furstenberg
        </p>
        <div className="w-16 h-px bg-gray-300 mt-10 mx-auto"></div>
      </div>
    </section>
  );
};