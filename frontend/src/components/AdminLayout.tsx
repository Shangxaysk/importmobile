import { type ReactNode, useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext'; // QO'SHILDI
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  LogOut, 
  Layers, 
  Menu, 
  X, 
  Image as ImageIcon,
  Globe,
  Settings
} from 'lucide-react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage(); // QO'SHILDI
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/'); 
    }
  }, [user, navigate]);

  if (!user || user.role !== 'ADMIN') return null;

  const handleLogout = () => {
    if (window.confirm(t('logout_confirm'))) {
      logout();
      navigate('/login');
    }
  };

  const menus = [
    { name: t('menu_dashboard'), path: '/admin', icon: <LayoutDashboard size={24} /> },
    { name: t('menu_orders'), path: '/admin/orders', icon: <ShoppingBag size={24} /> },
    { name: t('menu_products'), path: '/admin/products', icon: <Package size={24} /> },
    { name: t('menu_categories'), path: '/admin/categories', icon: <Layers size={24} /> },
    { name: t('menu_banners'), path: '/admin/banners', icon: <ImageIcon size={24} /> },
    { name: t('menu_users'), path: '/admin/users', icon: <Users size={24} /> },
    { name: t('menu_settings'), path: '/admin/settings', icon: <Settings size={24} /> },
  ];

  return (
    <div className="flex h-screen bg-[#F9FAFB] dark:bg-black font-inter overflow-hidden transition-colors duration-300">
      
      {/* === MOBIL OVERLAY === */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* === SIDEBAR (Yon Menyu) === */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[320px] bg-white dark:bg-black border-r border-gray-100 dark:border-gray-800 
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:block flex-shrink-0
      `}>
        
        {/* LOGO QISMI */}
        <div className="h-[70px] md:h-[90px] flex items-center justify-between px-8 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-[18px] flex items-center justify-center text-white font-black text-sm shadow-lg shadow-emerald-600/20">
              IM
            </div>
            <div>
              <h2 className="font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none text-xl">ImportMobile</h2>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">{t('dashboard_title')}</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-red-500 p-2 bg-gray-50 dark:bg-gray-900 rounded-full">
            <X size={24} />
          </button>
        </div>
        
        {/* LINKLAR */}
        <nav className="flex-1 overflow-y-auto py-8 px-6 space-y-3 no-scrollbar">
          <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">{t('main_menu_label')}</p>
          
          {menus.map((menu) => {
            const isActive = menu.path === '/admin' 
              ? location.pathname === '/admin' 
              : location.pathname.startsWith(menu.path);

            return (
              <Link
                key={menu.path}
                to={menu.path}
                className={`flex items-center gap-4 px-5 py-4 rounded-[24px] transition-all font-black text-sm uppercase tracking-wide ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 scale-100' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white active:scale-95'
                }`}
              >
                <div className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-emerald-500 transition-colors'}`}>
                  {menu.icon}
                </div>
                <span>{menu.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* SIDEBAR FOOTER */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex-shrink-0 bg-gray-50/50 dark:bg-black space-y-3">
          <Link 
            to="/"
            className="flex items-center gap-3 w-full px-5 py-4 rounded-[20px] text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-900 hover:text-emerald-500 transition-all font-black text-xs uppercase tracking-widest border border-transparent hover:border-gray-200 dark:hover:border-gray-800 shadow-sm active:scale-95"
          >
            <Globe size={20} />
            <span>{t('go_to_website')}</span>
          </Link>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-5 py-4 rounded-[20px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-black text-xs uppercase tracking-widest active:scale-95"
          >
            <LogOut size={20} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* === ASOSIY CONTENT === */}
      <main className="flex-1 h-full overflow-y-auto relative w-full lg:w-[calc(100%-320px)] bg-[#F9FAFB] dark:bg-black">
        
        {/* MOBIL HEADER */}
        <div className="lg:hidden sticky top-0 left-0 right-0 h-[70px] bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 z-30 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2.5 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 rounded-xl active:scale-90 transition-all border border-transparent dark:border-gray-800"
            >
              <Menu size={22} />
            </button>
            <div className="w-10 h-10 bg-emerald-600 rounded-[14px] flex items-center justify-center text-white font-black text-xs shadow-lg shadow-emerald-600/20">
              IM
            </div>
          </div>
          
          <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl">
            {t('go_to_site_short')}
          </Link>
        </div>

        {/* SAHIFA CONTENTI (Children) */}
        {children}

      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}