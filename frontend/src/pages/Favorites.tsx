import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, ChevronLeft, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';
import { getImageUrl } from '../utils/image'; // TO'G'IRLANDI

// --- FONT STILI ---
const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  .font-inter { font-family: 'Inter', sans-serif; }
`;

export default function Favorites() {
  const { wishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-full bg-white dark:bg-black font-inter transition-colors duration-300 pb-20">
      <style>{fontStyle}</style>

      {/* --- HEADER --- */}
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
                {t('favorites')}
            </h1>
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {wishlist.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8">
            {wishlist.map((product) => (
               <div key={product.id} className="block group relative w-full">
                 {/* Rasm Kapsulasi */}
                 <div className="relative aspect-[4/5] bg-white rounded-2xl mb-3 flex items-center justify-center p-4 border border-gray-100 dark:border-gray-800/60 shadow-sm overflow-hidden">
                     
                     <button 
                        onClick={() => toggleWishlist(product)}
                        className="absolute top-2 right-2 p-2 bg-gray-100/80 dark:bg-black/20 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all z-20"
                     >
                        <Heart size={18} className="fill-red-500 text-red-500" />
                     </button>

                     <Link to={`/product/${product.id}`} className="w-full h-full flex items-center justify-center">
                        {/* TO'G'IRLANDI */}
                        <img 
                          src={getImageUrl(product.image)} 
                          className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-105 mix-blend-multiply" 
                          alt={product.name} 
                        />
                     </Link>
                 </div>

                 {/* Ma'lumotlar */}
                 <Link to={`/product/${product.id}`} className="px-1 flex flex-col gap-1">
                     <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 h-9 group-hover:text-blue-600 transition-colors">
                         {product.name}
                     </h3>

                     <div className="flex items-center justify-between mt-1.5 gap-1">
                         <div className="flex flex-col min-w-0">
                             <span className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">{t('price')}:</span>
                             <div className="flex items-baseline gap-0.5 text-emerald-600 dark:text-emerald-500">
                                 <span className="text-sm font-bold">$</span>
                                 <span className="text-lg font-black tracking-tighter truncate">
                                     {product.price.toLocaleString()}
                                 </span>
                             </div>
                         </div>
                     </div>
                 </Link>
               </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-6">
               <Heart size={48} strokeWidth={1} className="text-gray-300 dark:text-gray-700" />
            </div>
            <h2 className="text-xl font-bold mb-2 dark:text-white">{t('favorites_empty')}</h2>
            <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto">
                {t('favorites_desc')}
            </p>
            <Link to="/" className="px-8 py-3 bg-emerald-600 text-white rounded-full font-bold text-sm tracking-wide shadow-lg hover:bg-emerald-700 transition-colors">
                {t('go_to_catalog')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}