// src/components/ProductGrid.jsx
export const ProductGrid = ({ products }) => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <h2 className="text-center text-3xl font-serif mb-12">"Life is too short to wear ordinary jewelry"</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((p) => (
          <div key={p.id} className="group cursor-pointer">
            <div className="overflow-hidden bg-gray-100 mb-4">
              <img 
                src={p.image} 
                className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105" 
              />
            </div>
            <h3 className="text-lg font-medium">{p.name}</h3>
            <p className="text-arume-gold font-semibold">${p.price}</p>
          </div>
        ))}
      </div>
    </section>
  );
};