import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { useCart } from './context/CartContext';
import { useLanguage } from './context/LanguageContext';
import { useWishlist } from './context/WishlistContext'; // Wishlist ulash
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Catalog from './pages/Catalog';
import CategoryPage from './pages/CategoryPage';
import SubCatalog from './pages/SubCatalog';
import Account from './pages/Account';
import Login from './pages/Login';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/products/AdminProducts';
import AddProduct from './pages/admin/products/AddProduct';
import EditProduct from './pages/admin/products/EditProduct';
import AdminCategories from './pages/admin/categories/AdminCategories';
import AdminOrders from './pages/admin/orders/AdminOrders';
import Checkout from './pages/Checkout';
import SearchOverlay from './components/SearchOverlay';
import Favorites from './pages/Favorites';
import Suggestions from './pages/Suggestions';
import { Smartphone, ShoppingBag, User, Search, Heart, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import AdminUsers from './pages/admin/users/AdminUsers';
import AdminBanners from './pages/admin/banners/AdminBanners';
import Contact from './pages/Contact';
import MyOrders from './pages/MyOrders';
import AdminSettings from './pages/admin/settings/AdminSettings';

// --- FONT VA MAXSUS SOKIN ANIMATSIYA ---
const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  .font-inter { font-family: 'Inter', sans-serif; }
  
  @keyframes soft-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(0.95); }
  }
  .animate-soft-pulse {
    animation: soft-pulse 3s ease-in-out infinite;
  }
`;

function App() {
  const { cart } = useCart();
  const { wishlist } = useWishlist(); 
  const { t } = useLanguage();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  const isAdmin = location.pathname.startsWith('/admin');
  const isProductDetail = location.pathname.startsWith('/product/');
  const isCatalog = location.pathname.startsWith('/catalog');
  const isAccount = location.pathname === '/account';
  const isCart = location.pathname === '/cart';
  const isCheckout = location.pathname === '/checkout';
  const isFavorites = location.pathname === '/favorites';
  const isSuggestions = location.pathname === '/suggestions';
  const isMyOrders = location.pathname === '/my-orders';
  const isConract = location.pathname === '/contact';
  const isLogin = location.pathname === '/login';

  const showHeader = !isAdmin && !isProductDetail && !isCart && !isCheckout && !isCatalog && !isAccount && !isFavorites && !isSuggestions && !isMyOrders && !isConract && !isLogin;
  const showNavbar = !isAdmin && !isProductDetail && !isCheckout && !isSuggestions && !isFavorites && !isMyOrders && !isConract && !isLogin;

  const navLinks = [
    { path: '/', icon: <Smartphone size={24} strokeWidth={2} />, label: t('home') },
    { path: '/catalog', icon: <Menu size={24} strokeWidth={2} />, label: t('catalog') },
    { 
      path: '/cart', 
      icon: <ShoppingBag size={24} strokeWidth={2} />, 
      label: t('cart'),
      badge: cart.length 
    },
    { path: '/account', icon: <User size={24} strokeWidth={2} />, label: t('profile') },
  ];

  return (
    <div className="h-screen w-full bg-white dark:bg-black font-inter text-gray-900 dark:text-gray-100 flex flex-col overflow-hidden transition-colors duration-300">
        <style>{fontStyle}</style>

        {/* --- 1. TEPADAGI ASOSIY HEADER --- */}
        {showHeader && (
          <header className="flex-none bg-white/80 dark:bg-black/80 backdrop-blur-md z-40 border-b border-gray-100 dark:border-gray-800">
            <div className={`mx-auto px-4 h-16 flex justify-between items-center ${!isAdmin ? 'md:pr-24' : ''}`}> 
               <Link to="/" className="text-2xl font-black text-emerald-600 tracking-tighter">
                 ImportMobile
               </Link>
               
               <div className="flex gap-3">
                 <button 
                   onClick={() => setIsSearchOpen(true)}
                   className="p-2.5 bg-gray-50 dark:bg-gray-900 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 transition active:scale-90"
                 >
                   <Search size={20} />
                 </button>

                 {/* Yoqtirganlar tugmasi - Sokin va "Nafas oluvchi" yurakcha */}
                 <Link 
                   to="/favorites" 
                   className="relative p-2.5 bg-gray-50 dark:bg-gray-900 rounded-full transition-all duration-300 active:scale-90 group"
                 >
                   <Heart 
                     size={20} 
                     strokeWidth={2}
                     className={`transition-all duration-700 ${
                       wishlist.length > 0 
                         ? 'text-red-500 fill-red-500 animate-soft-pulse' 
                         : 'text-gray-400 dark:text-gray-500 group-hover:text-red-400'
                     }`}
                   />
                 </Link>
               </div>
            </div>
          </header>
        )}

        {/* --- 2. ASOSIY CONTENT --- */}
        <main className="flex-1 overflow-y-auto relative custom-scrollbar">
           <div className={showHeader ? "max-w-7xl mx-auto px-4 py-6" : "w-full h-full"}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/catalog/:parentId" element={<SubCatalog />} />
                <Route path="/catalog/products/:categoryId" element={<CategoryPage />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/account" element={<Account />} />
                <Route path="/login" element={<Login />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/suggestions" element={<Suggestions />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/my-orders" element={<MyOrders />} />

                {/* ADMIN ROUTES */}
                <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
                <Route path="/admin/products" element={<AdminLayout><AdminProducts /></AdminLayout>} />
                <Route path="/admin/products/add" element={<AdminLayout><AddProduct /></AdminLayout>} />
                <Route path="/admin/products/edit/:id" element={<AdminLayout><EditProduct /></AdminLayout>} />
                <Route path="/admin/categories" element={<AdminLayout><AdminCategories /></AdminLayout>} />
                <Route path="/admin/orders" element={<AdminLayout><AdminOrders /></AdminLayout>} />
                <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
                <Route path="/admin/banners" element={<AdminLayout><AdminBanners /></AdminLayout>} />
                <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
              </Routes>
           </div>
        </main>

        {/* --- 3. MOBIL NAVBAR --- */}
        {showNavbar && (
          <nav className="flex-none md:hidden bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-emerald-100 dark:border-emerald-900/30 px-6 py-2 flex justify-between items-center z-40 h-[80px] pb-safe transition-all duration-300">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link 
                    key={link.path}
                    to={link.path} 
                    className={`flex flex-col items-center w-16 group relative transition-transform active:scale-90 ${
                        isActive ? 'text-emerald-600' : 'text-emerald-600/70'
                    }`}
                  >
                    <div className={`relative p-2 rounded-xl transition-all duration-300 ${
                        isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                    }`}>
                      {link.icon}
                      {(link.badge ?? 0) > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white dark:border-black shadow-sm">
                          {link.badge}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold mt-1 tracking-tight ${isActive ? 'text-emerald-600' : 'text-emerald-600/70'}`}>
                      {link.label}
                    </span>
                  </Link>
                );
              })}
          </nav>
        )}

        {/* --- 4. DESKTOP SIDEBAR --- */}
        {showNavbar && (
          <aside className="hidden md:flex flex-col fixed right-0 top-16 bottom-0 w-20 bg-white dark:bg-black border-l border-emerald-100 dark:border-emerald-900/30 z-50 items-center py-6 gap-8">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link 
                    key={link.path}
                    to={link.path} 
                    className={`flex flex-col items-center gap-1 group w-full relative transition-all ${
                        isActive ? 'text-emerald-600' : 'text-emerald-600/60'
                    }`}
                  >
                    <div className={`relative p-3 rounded-2xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                          : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                    }`}>
                       {link.icon}
                       {(link.badge ?? 0) > 0 && (
                         <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full border-2 border-white dark:border-black shadow-md">
                           {link.badge}
                         </span>
                       )}
                    </div>
                    <span className="text-[10px] font-bold tracking-tight uppercase opacity-80">{link.label}</span>
                  </Link>
                );
              })}
          </aside>
        )}

        <SearchOverlay 
            isOpen={isSearchOpen} 
            onClose={() => setIsSearchOpen(false)} 
        />
    </div>
  );
}

export default App;