export const Hero = () => {
  return (
    <div className="relative h-screen w-full flex items-center justify-center bg-gray-200">
      {/* Thay URL bằng ảnh trang sức của bạn */}
      <img src="/hero-bg.jpg" className="absolute inset-0 w-full h-full object-cover" />
      
      <div className="relative z-10 text-center text-white px-4">
        <p className="uppercase tracking-[0.3em] text-sm mb-4">Trending Now</p>
        <h1 className="text-6xl md:text-8xl font-serif italic mb-8">Your daily Essential</h1>
        <button className="border border-white px-12 py-4 hover:bg-white hover:text-black transition-all duration-300">
          SHOP NOW
        </button>
      </div>
    </div>
  );
};