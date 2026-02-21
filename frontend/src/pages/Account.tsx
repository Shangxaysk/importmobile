import { useEffect, useState } from 'react';
import { 
  User, Moon, Sun, Globe, MessageSquare, ShieldCheck, 
  ChevronRight, LogOut, Phone, Package 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function Account() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [hasNewUpdate, setHasNewUpdate] = useState(false);

  // --- TELEFON RAQAMNI FORMATLASH FUNKSIYASI ---
  const formatPhoneNumber = (phoneStr: string) => {
    if (!phoneStr) return '';
    let clean = phoneStr.replace(/\D/g, '');
    if (!clean.startsWith('998')) clean = '998' + clean;
    if (clean.length > 12) clean = clean.substring(0, 12);

    let formatted = '+998 ';
    if (clean.length > 3) formatted += clean.substring(3, 5);
    if (clean.length > 5) formatted += ' ' + clean.substring(5, 8);
    if (clean.length > 8) formatted += ' ' + clean.substring(8, 10);
    if (clean.length > 10) formatted += ' ' + clean.substring(10, 12);
    
    return formatted;
  };

  // --- BAZADAN YANGI XABARLARNI TEKSHIRISH ---
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      axios.get(import.meta.env.VITE_API_URL + '/orders/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        const hasUnread = res.data.some((order: any) => order.adminMessage && !order.isMessageRead);
        setHasNewUpdate(hasUnread);
      })
      .catch(err => console.error("Update check error:", err));
    }
  }, [user]);

  const cardStyle = `
    bg-white dark:bg-gray-900/40 
    rounded-[32px] 
    shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]
    border border-gray-200 dark:border-gray-800/50
    transition-all duration-300
    mb-6
    backdrop-blur-sm
  `;

  return (
    <div className="min-h-full bg-gray-50 dark:bg-black pb-24 font-inter text-gray-900 dark:text-gray-100 transition-colors duration-300">
      
      <div className="p-5 max-w-md mx-auto">

        {/* PROFIL KARTASI */}
        <div className={`${cardStyle} p-6 flex flex-col items-center text-center relative overflow-hidden`}>

           <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-500 shadow-sm relative z-10 border-4 border-white dark:border-gray-800">
             <User size={44} strokeWidth={1.5} />
           </div>
           
           {user ? (
             <div className="w-full relative z-10">
               <h2 className="text-2xl font-black tracking-tight mb-1">{user?.fullName}</h2>
               {/* Formatlangan telefon raqami shu yerda */}
               <p className="text-gray-500 dark:text-gray-400 font-bold text-sm tracking-wider">
                 {formatPhoneNumber(user.phone)}
               </p>
               
               {user.role === 'ADMIN' && (
                 <span className="mt-3 inline-block bg-emerald-600 text-white text-[10px] px-4 py-1.5 rounded-full font-bold uppercase tracking-widest shadow-lg">
                   {t('admin_badge')}
                 </span>
               )}

               <button 
                 onClick={logout} 
                 className="mt-8 w-full py-4 rounded-2xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all active:scale-95"
               >
                 <LogOut size={18} /> {t('logout')}
               </button>
             </div>
           ) : (
             <div className="w-full relative z-10">
               <h2 className="text-2xl font-black mb-2">{t('welcome')}</h2>
               <p className="text-gray-500 mb-8">{t('login_prompt')}</p>
               <button 
                 onClick={() => navigate('/login')} 
                 className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-xl active:scale-95 transition-all"
               >
                 {t('login_btn')}
               </button>
             </div>
           )}
        </div>

        {/* SOZLAMALAR KARTASI */}
        <div className={`${cardStyle} overflow-hidden`}>
           {/* Tungi Rejim */}
           <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
             <div className="flex items-center gap-4">
                 <div className={`p-3 rounded-2xl shadow-sm ${isDarkMode ? 'bg-indigo-500 text-white' : 'bg-orange-100 text-orange-600'}`}>
                    {isDarkMode ? <Moon size={22} /> : <Sun size={22} />}
                 </div>
                 <span className="font-bold text-base">{t('dark_mode')}</span>
             </div>
             <button 
                onClick={toggleTheme}
                className={`w-14 h-8 flex items-center rounded-full p-1 transition-all duration-300 ${isDarkMode ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                <div className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
             </button>
           </div>

           {/* Til */}
           <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-sm">
                    <Globe size={22} />
                 </div>
                 <span className="font-bold text-base">{t('app_lang')}</span>
              </div>
              <div className="flex bg-gray-100 dark:bg-black rounded-xl p-1.5 border border-gray-200 dark:border-gray-800">
                 {['uz', 'ru'].map((lang) => (
                    <button 
                      key={lang}
                      onClick={() => setLanguage(lang as any)}
                      className={`px-5 py-2 text-xs font-black rounded-lg transition-all ${language === lang ? 'bg-emerald-600 shadow text-white' : 'text-gray-400'}`}
                    >
                      {lang.toUpperCase()}
                    </button>
                 ))}
              </div>
           </div>
        </div>

        {/* ASOSIY MENYULAR */}
        <div className={`${cardStyle} overflow-hidden`}>
           {[
             { 
               icon: Package, 
               label: t('my_orders_menu'), 
               bg: 'bg-emerald-100 dark:bg-emerald-900/30', 
               color: 'text-emerald-600 dark:text-emerald-400',
               link: '/my-orders',
               badge: hasNewUpdate 
             },
             { 
               icon: MessageSquare, 
               label: t('suggestions'), 
               bg: 'bg-blue-100 dark:bg-blue-900/30', 
               color: 'text-blue-600 dark:text-blue-400',
               link: '/suggestions' 
             },
             { 
               icon: ShieldCheck, 
               label: t('admin_panel'), 
               bg: 'bg-rose-100 dark:bg-rose-900/30', 
               color: 'text-rose-600 dark:text-rose-400', 
               adminOnly: true, 
               link: '/admin' 
             },
             { 
               icon: Phone, 
               label: t('contact_us_menu'), 
               bg: 'bg-amber-100 dark:bg-amber-900/30', 
               color: 'text-amber-600 dark:text-amber-400',
               link: '/contact'
             }
           ].map((item, idx) => {
              if (item.adminOnly && user?.role !== 'ADMIN') return null;

              return (
                <div key={idx} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <Link to={item.link}>
                    <div className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group">
                      <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl shadow-sm relative transition-transform group-hover:scale-110 ${item.bg} ${item.color}`}>
                             <item.icon size={22} strokeWidth={2} />
                             {item.badge && (
                               <span className="absolute -top-1 -right-1 w-3 h-3 bg-white dark:bg-black rounded-full flex items-center justify-center">
                                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                               </span>
                             )}
                          </div>
                          <span className="font-bold text-base text-gray-800 dark:text-gray-200">{item.label}</span>
                      </div>
                      <ChevronRight size={20} className="text-gray-300 dark:text-gray-700 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                </div>
              );
           })}
        </div>

        <p className="text-center text-gray-300 dark:text-gray-800 text-[10px] font-black tracking-[4px] pt-4">
            ImportMobile 2026
        </p>

      </div>
    </div>
  );
}