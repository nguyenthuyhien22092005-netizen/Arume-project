// src/components/ProductList.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export const ProductList = ({ products }) => {
  if (!products || products.length === 0) {
    return <p className="text-center">Không có sản phẩm nào.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {products.map(product => (
        <div key={product._id} className="group border border-gray-100 p-4 transition-all hover:shadow-xl">
          <div className="overflow-hidden mb-4">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105" 
            />
          </div>
          <h2 className="text-lg font-medium dark:text-white">{product.name}</h2>
          <p className="text-[#C9A96E] font-semibold my-2">${product.price}</p>
          
          <Link 
            to={`/product/${product._id}`} 
            className="block w-full border border-black dark:border-white py-2 text-center text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
          >
            Xem chi tiết
          </Link>
        </div>
      ))}
    </div>
  );
};