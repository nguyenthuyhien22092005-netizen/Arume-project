import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQSection = () => {
  const faqs = [
    { question: "Bạn giao hàng đến những quốc gia nào?", answer: "Chúng tôi giao hàng đến hơn 50 quốc gia trên toàn thế giới." },
    { question: "Tôi có thể hủy đơn hàng không?", answer: "Bạn có thể hủy trong vòng 1 giờ sau khi đặt hàng bằng cách liên hệ hỗ trợ." },
    { question: "Tôi có phải trả thuế nhập khẩu không?", answer: "Có thể có tùy theo quy định thuế của quốc gia nơi bạn nhận hàng." }
  ];

  return (
    <div className="mt-16 max-w-3xl mx-auto">
      <h2 className="text-xl font-serif text-center mb-8">Câu hỏi thường gặp</h2>
      {faqs.map((item, index) => (
        <div key={index} className="border-b border-gray-200">
          <button className="w-full py-5 flex justify-between items-center text-sm uppercase tracking-wider hover:text-red-900 transition">
            {item.question} <ChevronDown size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default FAQSection;