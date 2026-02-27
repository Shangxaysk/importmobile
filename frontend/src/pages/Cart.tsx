import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, Check, ChevronLeft, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { getImageUrl } from '../utils/image';
import axios from 'axios';

// --- FONT STILI ---
const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  .font-inter { font-family: 'Inter', sans-serif; }
`;

export default function Cart() {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Tanlangan mahsulotlar ID lari
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // TIZIM HOLATI (REST MODE) UCHUN STATE'LAR
  const [globalSettings, setGlobalSettings] = useState({ isOrdersEnabled: true, restModeMessage: '' });
  const [showRestModal, setShowRestModal] = useState(false);

  useEffect(() => {
    if (cart.length > 0 && selectedIds.length === 0) {
        setSelectedIds(cart.map(item => item.id));
    }
  }, [cart]);

  // TIZIM HOLATINI BAZADAN OLIB KELISH
  useEffect(() => {
    axios.get(import.meta.env.VITE_API_URL + '/admin-settings')
      .then((res) => {
        if (res.data) {
          let messageToDisplay = '';
          try {
            const parsedMsg = JSON.parse(res.data.restModeMessage);
            messageToDisplay = language === 'ru' ? parsedMsg.ru : parsedMsg.uz; 
          } catch(e) {
            messageToDisplay = res.data.restModeMessage; 
          }

          setGlobalSettings({
            isOrdersEnabled: res.data.isOrdersEnabled,
            restModeMessage: messageToDisplay || ''
          });
        }
      })
      .catch((err) => console.error("Tizim sozlamasini yuklashda xato:", err));
  }, [language]); // Til o'zgarganda xabarni qayta yuklaydi

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const totalPrice = cart
    .filter(item => selectedIds.includes(item.id))
    .reduce((total, item) => total + (item.price * item.quantity), 0);

  const goToProduct = (id: string) => {
    navigate(`/product/${id}`);
  };

  // CHECKOUT GA O'TISHDAN OLDIN TEKSHIRAMIZ
  const handleProceedToCheckout = () => {
    if (!globalSettings.isOrdersEnabled) {
      setShowRestModal(true); // Sayt o'chiq bo'lsa modal chiqaramiz
    } else {
      navigate('/checkout'); // Ishlayotgan bo'lsa o'tkazib yuboramiz
    }
  };

  return (
    <div className="min-h-full bg-white dark:bg-black text-gray-900 dark:text-gray-100 font-inter transition-colors duration-300 relative pb-[200px]">
      <style>{fontStyle}</style>

      {/* --- CART HEADER (STICKY) ---*/}
      <div className="sticky top-0 z-40 w-full bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="relative max-w-md mx-auto h-[60px] px-4 flex items-center">
            
            <button 
                onClick={() => navigate(-1)} 
                className="group flex items-center gap-1 pl-2 pr-4 py-2 bg-emerald-600 rounded-full text-white active:scale-95 hover:bg-emerald-700 transition-all duration-300 z-10"
            >
                <ChevronLeft size={18} strokeWidth={2} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs tracking-wide font-medium">{t('back')}</span>
            </button>

            <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-black text-gray-900 dark:text-white">
                {t('cart')}
            </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-6">
               <ShoppingBag size={48} strokeWidth={1} className="text-gray-400 dark:text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold mb-3 dark:text-white">{t('cart_empty')}</h2>
            <Link to="/" className="px-8 py-3.5 bg-emerald-600 dark:bg-emerald-600 text-white dark:text-white rounded-full font-bold text-sm tracking-wide shadow-lg hover:scale-105 transition-transform">
              {t('cart_start')}
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
             
             {/* MAHSULOTLAR RO'YXATI */}
             <div className="space-y-6">
                {cart.map((item) => {
                   const isSelected = selectedIds.includes(item.id);

                   return (
                   <div key={item.id} className="flex gap-4 items-center py-2 group">
                      
                      {/* 1. CHECKBOX */}
                      <button 
                        onClick={() => toggleSelection(item.id)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all flex-shrink-0 ${
                            isSelected 
                            ? 'bg-emerald-600 border-emerald-600 text-white' 
                            : 'bg-transparent border-gray-300 dark:border-gray-600 hover:border-emerald-600'
                        }`}
                      >
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </button>

                      {/* 2. MAHSULOT KARTASI */}
                      <div className="flex-1 flex gap-4 bg-white dark:bg-black">
                          {/* Rasm */}
                          <div 
                            onClick={() => goToProduct(item.id)}
                            className="cursor-pointer w-24 h-24 sm:w-28 sm:h-28 bg-gray-50 dark:bg-gray-900 rounded-2xl flex-shrink-0 p-3 flex items-center justify-center relative overflow-hidden border border-gray-100 dark:border-gray-800"
                          >
                             <img 
                               src={getImageUrl(item.image)} 
                               alt={item.name} 
                               className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal hover:scale-105 transition-transform duration-300" 
                             />
                          </div>

                          {/* Ma'lumotlar */}
                          <div className="flex-1 flex flex-col justify-between py-1">
                             <div>
                                <div className="flex justify-between items-start">
                                    <h3 
                                        onClick={() => goToProduct(item.id)}
                                        className="cursor-pointer font-bold text-base sm:text-lg leading-snug line-clamp-2 pr-4 hover:text-blue-600 transition-colors"
                                    >
                                        {item.name}
                                    </h3>
                                    
                                    <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition p-1 -mr-2">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                
                                {item.selectedOptions && (
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1.5">
                                        {Object.values(item.selectedOptions).join(' / ')}
                                    </p>
                                )}
                             </div>

                             <div className="flex justify-between items-end mt-3">
                                <span className="font-bold text-lg sm:text-xl text-black dark:text-white">
                                    {item.price.toLocaleString()} <span className="text-sm text-gray-500 font-medium">$</span>
                                </span>

                                {/* Quantity Control */}
                                <div className="flex items-center bg-emerald-600 dark:bg-emerald-600 rounded-full h-9 px-1">
                                    <button onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeFromCart(item.id)} className="w-8 h-full flex items-center justify-center text-white hover:text-white transition active:scale-90">
                                        <Minus size={14} />
                                    </button>
                                    <span className="w-6 text-center font-bold text-white">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-full flex items-center justify-center text-white hover:text-white transition active:scale-90">
                                        <Plus size={14} />
                                    </button>
                                </div>
                             </div>
                          </div>
                      </div>
                   </div>
                   );
                })}
             </div>
          </div>
        )}
      </div>

      {/* --- PASTKI CHECKOUT PANEL (FIXED) --- */}
      {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-[70]">
            <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 -z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]"></div>
            
            <div className="max-w-3xl mx-auto px-5 py-4">
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-black dark:text-white font-medium">
                            {t('total_with_count').replace('{{count}}', selectedIds.length.toString())}
                        </span>
                        <span className="text-xl font-black text-black dark:text-white">
                            {totalPrice.toLocaleString()} $
                        </span>
                    </div>

                    <button 
                        onClick={handleProceedToCheckout}
                        disabled={selectedIds.length === 0}
                        className={`w-full h-[54px] rounded-full font-bold text-base tracking-wide shadow-xl flex items-center justify-center gap-2 transition-all 
                            ${selectedIds.length === 0 
                                ? 'bg-emerald-600 dark:bg-emerald-600 text-white cursor-not-allowed opacity-50' 
                                : 'bg-emerald-600 dark:bg-emerald-600 text-white hover:scale-[1.01] active:scale-95'}`
                        }
                    >
                        <span>{t('checkout')}</span>
                        <ArrowRight size={20} strokeWidth={2.5} />
                    </button>
                </div>
                {/* iPhone Safe Area */}
                <div className="h-[env(safe-area-inset-bottom)]"></div>
            </div>
          </div>
      )}

      {/* --- TIZIM DAM OLISH REJIMI MODALI --- */}
      {showRestModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in pb-safe">
          <div className="bg-white dark:bg-gray-900 rounded-[40px] p-8 max-w-sm w-full text-center shadow-2xl border border-gray-100 dark:border-gray-800 relative">
            <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock size={36} />
            </div>
            <h2 className="text-2xl font-black mb-4 dark:text-white uppercase tracking-tight">
              {t('service_paused')}
            </h2>
            
            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed text-sm font-medium">
              {globalSettings.restModeMessage || t('default_rest_message')}
            </p>
            
            <a href="https://t.me/importmobile" target="_blank" rel="noopener noreferrer" className="block w-full py-4 bg-emerald-600 hover:bg-emerald-700 transition-colors text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] mb-3 shadow-lg shadow-emerald-600/20">
              {t('telegram_channel')}
            </a>
            
            <button onClick={() => setShowRestModal(false)} className="text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition">
              {t('close_btn')}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}