import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Loader2, ArrowLeft, ChevronLeft } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';

// --- FONT STILI (Cart.tsx dan olib qo'shdik) ---
const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  .font-inter { font-family: 'Inter', sans-serif; }
`;

const CATEGORY_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-rose-500',
  'bg-amber-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-pink-500',
  'bg-orange-500', 'bg-teal-500', 'bg-violet-500', 'bg-red-500',
];

export default function Catalog() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(import.meta.env.VITE_API_URL + '/categories');
        setCategories(res.data);
      } catch (err) {
        console.error("Kataloglarni yuklashda xato:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const shouldShowCategory = (cat: any) => {
    if (cat.parentId !== null) return false;
    const hasOwnProducts = cat.products && cat.products.length > 0;
    const hasChildProducts = cat.children && cat.children.some(
      (child: any) => child.products && child.products.length > 0
    );
    return hasOwnProducts || hasChildProducts;
  };

  const renderIcon = (cat: any) => {
    if (cat.image) {
        return <img src={cat.image} className="w-full h-full object-contain brightness-0 invert" alt={language === 'ru' ? cat.nameRu : cat.nameUz} />; 
    }
    const IconComponent = (LucideIcons as any)[cat.icon] || LucideIcons.Folder;
    return <IconComponent size={24} strokeWidth={2} />;
  };

  const getCategoryColor = (id: number) => {
    const index = id % CATEGORY_COLORS.length;
    return CATEGORY_COLORS[index];
  };

  if (loading) return (
    <div className="flex justify-center items-center h-full bg-white dark:bg-black text-blue-600">
        <Loader2 className="animate-spin" size={40} />
    </div>
  );

  const filteredCategories = categories.filter(shouldShowCategory);

  return (
    <div className="min-h-full bg-white dark:bg-black font-inter transition-colors duration-300">
      <style>{fontStyle}</style>
      
      {/* --- HEADER (CART BILAN BIR XIL) --- */}
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
                {t('catalog')}
            </h1>
        </div>
      </div>

      {/* --- CONTENT --- */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {filteredCategories.length > 0 ? (
            <div className="bg-white dark:bg-black rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-900 mb-6">
                {filteredCategories.map((cat, index) => {
                    const bgColor = getCategoryColor(cat.id);

                    return (
                        <Link 
                            to={`/catalog/${cat.id}`} 
                            key={cat.id} 
                            className={`group flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all duration-200 ${
                                index !== filteredCategories.length - 1 ? 'border-b border-gray-100 dark:border-gray-900' : ''
                            }`}
                        >
                            <div className={`w-12 h-12 flex-shrink-0 ${bgColor} rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                {renderIcon(cat)}
                            </div>

                            <div className="flex-1 ml-4">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight group-hover:text-blue-600 transition-colors">
                                    {language === 'ru' ? (cat.nameRu || cat.nameUz) : cat.nameUz}
                                </h3>
                            </div>

                            <div className="text-gray-300 dark:text-gray-700 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
                                <ChevronRight size={20} strokeWidth={2.5} />
                            </div>
                        </Link>
                    );
                })}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <p className="font-medium">{t('categories_not_found')}</p>
            </div>
        )}
      </main>
    </div>
  );
}