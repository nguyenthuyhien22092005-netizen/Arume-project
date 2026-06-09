import React, { useState } from 'react';

const Gallery = ({ images }) => {
  const [mainImage, setMainImage] = useState(images[0]);

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Danh sách ảnh nhỏ */}
      <div className="flex md:flex-col gap-3 order-2 md:order-1">
        {images.map((img, index) => (
          <div 
            key={index}
            onClick={() => setMainImage(img)}
            className={`w-20 h-20 cursor-pointer border overflow-hidden rounded-sm transition ${
              mainImage === img ? 'border-black' : 'border-transparent hover:border-gray-300'
            }`}
          >
            <img src={img} alt={`Thumbnail ${index}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {/* Ảnh chính */}
      <div className="flex-1 order-1 md:order-2 bg-gray-50 aspect-square flex items-center justify-center overflow-hidden">
        <img src={mainImage} alt="Sản phẩm chính" className="w-full h-full object-contain transition-all duration-500 hover:scale-105" />
      </div>
    </div>
  );
};

export default Gallery;