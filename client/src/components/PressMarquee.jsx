import React from 'react';
import { motion } from 'framer-motion';

// Danh sách thương hiệu mở rộng
const brands = [
  "BAZAAR", "ELLE", "FORBES", "VOGUE", 
  "MARIE CLAIRE", "COSMOPOLITAN", "GQ", 
  "INSTYLE", "VANITY FAIR", "TATLER"
];

export const PressMarquee = () => {
  return (
    <div className="w-full bg-[#F9F7F2] dark:bg-black py-12 border-y border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-300">
      <motion.div 
        className="flex gap-20"
        initial={{ x: 0 }}
        animate={{ x: "-50%" }}
        transition={{ 
          duration: 20, // Tăng duration lên để chạy chậm lại nếu danh sách dài hơn
          ease: "linear", 
          repeat: Infinity,
          repeatType: "loop"
        }}
      >
        {/* Nhân đôi danh sách để tạo vòng lặp vô tận */}
        {[...brands, ...brands].map((brand, index) => (
          <span 
            key={index} 
            className="text-2xl font-serif tracking-widest text-gray-800 opacity-60 hover:opacity-100 transition-opacity whitespace-nowrap cursor-default"
          >
            {brand}
          </span>
        ))}
      </motion.div>
    </div>
  );
};