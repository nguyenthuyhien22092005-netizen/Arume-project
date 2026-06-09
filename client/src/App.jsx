import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';

// Components
import { Header } from './components/Header';
import { BannerSlider } from './components/BannerSlider';
import { VideoShowcase } from './components/VideoShowcase';
import { PressMarquee } from './components/PressMarquee';
import { QuoteSection } from './components/QuoteSection';
import { CategoryGrid } from './components/CategoryGrid';
import { CategoryInteractiveBanner } from './components/CategoryInteractiveBanner';
import { FeaturedCollection } from './components/FeaturedCollection';
import { SignatureSet } from './components/SignatureSet';
import { CollectionIntro } from './components/CollectionIntro';
import { InteractiveLifestyle } from './components/InteractiveLifestyle';
import { QualityCommitment } from './components/QualityCommitment';
import { StoreServices } from './components/StoreServices';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import Loader from './components/Loader';

// Admin Layout + Pages
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminCoupons } from './pages/admin/AdminCoupons';
import { AdminReviews } from './pages/admin/AdminReviews';

// Client Pages
import { ProductDetail } from './pages/ProductDetail';
import { ProductList } from './pages/ProductList';
import { Collections } from './pages/Collections';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Profile } from './pages/Profile';
import { Policy } from './pages/Policy';
import { CheckoutSuccess } from './pages/CheckoutSuccess';
import { InvoicePage } from './pages/InvoicePage';

// =========================================
// CLIENT LAYOUT - Header + Outlet + Footer
// =========================================
const ClientLayout = () => (
  <div className="min-h-screen bg-[#F9F7F2] text-black dark:text-white font-sans flex flex-col transition-colors duration-300 dark:bg-black">
    <Header />
    <CartDrawer />
    <WishlistDrawer />
    <div className="flex-1">
      <Outlet />
    </div>
    <Footer />
    <ScrollToTopButton />
  </div>
);

// =========================================
// HOMEPAGE
// =========================================
const HomePage = () => (
  <>
    <Loader />
    <BannerSlider />
    <PressMarquee />
    <QuoteSection />
    <CategoryGrid />
    <FeaturedCollection />
    <SignatureSet />
    <CategoryInteractiveBanner />
    <CollectionIntro />
    <InteractiveLifestyle />
    <VideoShowcase />
    <QualityCommitment />
    <StoreServices />
  </>
);

// =========================================
// APP ROOT
// =========================================
function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <Router>
            <Routes>

              {/* =========================================
                  ADMIN ROUTES (Không có Header + Footer)
                 ========================================= */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="coupons" element={<AdminCoupons />} />
              </Route>

              {/* Trang hóa đơn — không có Header, Footer, và Loader */}
              <Route path="/invoice/:orderId" element={<InvoicePage />} />

              {/* =========================================
                  CLIENT ROUTES (Có Header + Footer)
                 ========================================= */}
              <Route element={<ClientLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/collections/:category" element={<ProductList />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/policies/*" element={<Policy />} />
                <Route path="/checkout/success" element={<CheckoutSuccess />} />
              </Route>

            </Routes>
          </Router>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;