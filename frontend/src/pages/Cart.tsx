import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, ArrowLeft, Check, X, ChevronLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

// --- FONT STILI ---
const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  .font-inter { font-family: 'Inter', sans-serif; }
`;

export default function Cart() {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Tanlangan mahsulotlar ID lari
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (cart.length > 0 && selectedIds.length === 0) {
        setSelectedIds(cart.map(item => item.id));
    }
  }, [cart]);

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

  return (
    // ASOSIY O'ZGARISH: min-h-full (h-screen emas) va pb-[200px] (footer uchun joy)
    // Bu sahifa App.tsx dagi 'overflow-y-auto' konteyner ichida render bo'ladi.
    // Shuning uchun o'ziga alohida skrol kerak emas.
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
                               src={item.image || '/placeholder.png'} 
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
                    {/* Jami narx (Dinamik tarjima) */}
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-black dark:text-white font-medium">
                            {t('total_with_count').replace('{{count}}', selectedIds.length.toString())}
                        </span>
                        <span className="text-xl font-black text-black dark:text-white">
                            {totalPrice.toLocaleString()} $
                        </span>
                    </div>

                    <button 
                        onClick={() => navigate('/checkout')}
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
    </div>
  );
}