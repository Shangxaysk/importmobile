import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Loader2, ShoppingBag, ChevronLeft, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext'; // QO'SHILDI

// --- FONT STILI ---
const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  .font-inter { font-family: 'Inter', sans-serif; }
`;

export default function CategoryPage() {
  const { categoryId } = useParams();
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addedItems, setAddedItems] = useState<Record<number, boolean>>({});
  
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { t, language } = useLanguage(); // QO'SHILDI

  useEffect(() => {
    setLoading(true);
    const fetchCategory = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/categories/${categoryId}`);
        setCategory(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [categoryId]);

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      id: product.id.toString(),
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      image: product.images[0],
    });

    setAddedItems({ ...addedItems, [product.id]: true });
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-full bg-white dark:bg-black text-blue-600">
        <Loader2 className="animate-spin" size={40} />
    </div>
  );

  if (!category) return <div className="text-center mt-20 font-inter">{t('category_not_found')}</div>;

  return (
    <div className="min-h-full bg-white dark:bg-black font-inter transition-colors duration-300">
      <style>{fontStyle}</style>

      {/* --- HEADER (STANDART) --- */}
      <div className="sticky top-0 z-40 w-full bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="relative max-w-md mx-auto h-[60px] px-4 flex items-center">
            <button 
                onClick={() => navigate(-1)} 
                className="group flex items-center gap-1 pl-2 pr-4 py-2 bg-emerald-600 rounded-full text-white active:scale-95 hover:bg-emerald-700 transition-all duration-300 z-10"
            >
                <ChevronLeft size={18} strokeWidth={2} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs tracking-wide font-medium">{t('back')}</span>
            </button>

            <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-black text-gray-900 dark:text-white truncate max-w-[180px] text-center">
                {language === 'ru' ? (category.nameRu || category.nameUz) : category.nameUz}
            </h1>
        </div>
      </div>

      {/* --- MAHSULOTLAR RO'YXATI --- */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {category.products && category.products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8">
            {category.products.map((product: any) => {
              const price = Number(product.price).toLocaleString();
              const priceSize = price.length > 5 ? 'text-lg' : 'text-xl';

              return (
                <Link to={`/product/${product.id}`} key={product.id} className="block group relative w-full">
                  {/* Rasm Kapsulasi */}
                  <div className="relative aspect-[4/5] bg-white rounded-2xl mb-3 flex items-center justify-center p-4 border border-gray-100 dark:border-gray-800/60 shadow-sm overflow-hidden">
                     <img 
                       src={product.images[0]} 
                       className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-105" 
                       alt={product.name} 
                     />
                  </div>

                  {/* Ma'lumotlar */}
                  <div className="px-1 flex flex-col gap-1">
                     <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 h-9 group-hover:text-blue-600 transition-colors">
                         {product.name}
                     </h3>

                     <div className="flex items-center justify-between mt-1.5 gap-1">
                         <div className="flex flex-col min-w-0">
                             <span className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">{t('price')}:</span>
                             <div className="flex items-baseline gap-0.5 text-emerald-600 dark:text-emerald-500">
                                 <span className="text-sm font-bold">$</span>
                                 <span className={`${priceSize} font-black tracking-tighter truncate`}>
                                     {price}
                                 </span>
                             </div>
                         </div>

                         <button 
                           onClick={(e) => handleAddToCart(e, product)}
                           className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md active:scale-90 flex-shrink-0 ${
                             addedItems[product.id] 
                             ? 'bg-emerald-500 text-white' 
                             : 'bg-emerald-600 dark:bg-emerald-600 text-white hover:opacity-80'
                           }`}
                         >
                           {addedItems[product.id] ? <Check size={20} strokeWidth={3} /> : <ShoppingBag size={20} strokeWidth={2} />}
                         </button>
                     </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <ShoppingBag size={48} strokeWidth={1} className="mb-4 opacity-20" />
              <p className="font-medium">{t('no_products_in_category')}</p>
          </div>
        )}
      </main>
    </div>
  );
}