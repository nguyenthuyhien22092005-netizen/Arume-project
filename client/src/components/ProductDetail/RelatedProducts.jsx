import React from 'react';
import { Link } from 'react-router-dom';

const RelatedProducts = ({ allProducts, category, currentId }) => {
  const relatedItems = allProducts.filter(item => item.category === category && item.id !== currentId).slice(0, 4);

  if (relatedItems.length === 0) return null;

  return (
    <div className="py-12 border-t border-gray-100">
      <h2 className="text-2xl font-serif mb-10 text-center">Sản phẩm liên quan</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {relatedItems.map((product) => (
          <Link to={`/product/${product.id}`} key={product.id} className="group">
            <div className="bg-gray-50 aspect-square mb-4 overflow-hidden">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
            </div>
            <p className="text-sm font-medium mt-2">{product.name}</p>
            <p className="text-sm text-gray-500">${product.price}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;