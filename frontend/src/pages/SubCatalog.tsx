import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Loader2, ChevronRight, Folder, ChevronLeft } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  .font-inter { font-family: 'Inter', sans-serif; }
`;

const CATEGORY_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-rose-500',
  'bg-amber-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-pink-500',
  'bg-orange-500', 'bg-teal-500', 'bg-violet-500', 'bg-red-500',
];

export default function SubCatalog() {
  const { parentId } = useParams();
  const [parentCategory, setParentCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  // Rasm URL manzilini Render backend manzili bilan birlashtirish
  const getImageUrl = (path: string) => {
    if (!path) return '';
    // Agar rasm allaqachon to'liq URL bo'lsa (http bilan boshlansa), o'zini qaytaramiz
    if (path.startsWith('http')) return path;
    // Bazadan kelgan /uploads/... yo'lini Render API manzili bilan birlashtiramiz
    const apiUrl = import.meta.env.VITE_API_URL;
    // URL oxirida / bo'lsa olib tashlaymiz, path boshida / bo'lsa qo'shamiz
    const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    return `${baseUrl}${cleanPath}`;
  };

  useEffect(() => {
    setLoading(true);
    axios.get(`${import.meta.env.VITE_API_URL}/categories/${parentId}`)
      .then(res => setParentCategory(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [parentId]);

  const renderIcon = (cat: any) => {
    if (cat.image) {
        return (
          <img 
            src={getImageUrl(cat.image)} 
            className="w-full h-full object-contain brightness-0 invert p-1" 
            alt={language === 'ru' ? (cat.nameRu || cat.nameUz) : cat.nameUz} 
            onError={(e: any) => {
              // Agar rasm yuklanmasa, zaxira ikonkani ko'rsatamiz
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
        );
    }
    const IconComponent = (LucideIcons as any)[cat.icon] || LucideIcons.Folder;
    return <IconComponent size={24} strokeWidth={2} />;
  };

  const getCategoryColor = (id: number) => {
    const index = id % CATEGORY_COLORS.length;
    return CATEGORY_COLORS[index];
  };

  if (loading) return (
    <div className="flex justify-center items-center h-full min-h-[400px] bg-white dark:bg-black text-emerald-600">
        <Loader2 className="animate-spin" size={40} />
    </div>
  );
  
  if (!parentCategory) return (
    <div className="flex justify-center items-center h-full bg-white dark:bg-black text-gray-500 font-bold font-inter py-20">
        {t('category_not_found')}
    </div>
  );

  return (
    <div className="min-h-full bg-white dark:bg-black font-inter transition-colors duration-300">
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

            <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-black text-gray-900 dark:text-white truncate max-w-[180px] text-center leading-tight">
                {language === 'ru' ? (parentCategory.nameRu || parentCategory.nameUz) : parentCategory.nameUz}
            </h1>
        </div>
      </div>
      

      {/* --- CONTENT --- */}
      <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
        {parentCategory.children && parentCategory.children.length > 0 ? (
            <div className="bg-white dark:bg-black rounded-[32px] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-900">
                {parentCategory.children.map((child: any, index: number) => {
                    const bgColor = getCategoryColor(child.id);

                    return (
                        <Link 
                            to={`/catalog/products/${child.id}`} 
                            key={child.id} 
                            className={`group flex items-center p-5 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-all duration-200 cursor-pointer ${
                                index !== parentCategory.children.length - 1 ? 'border-b border-gray-100 dark:border-gray-900' : ''
                            }`}
                        >
                            <div className={`w-14 h-14 flex-shrink-0 ${bgColor} rounded-[18px] flex items-center justify-center text-white shadow-lg shadow-black/5 group-hover:scale-105 transition-transform duration-300 overflow-hidden`}>
                                {renderIcon(child)}
                                <Folder className="hidden" size={24} /> {/* Zaxira ikonka uchun */}
                            </div>

                            <div className="flex-1 ml-4">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight group-hover:text-emerald-600 transition-colors">
                                    {language === 'ru' ? (child.nameRu || child.nameUz) : child.nameUz}
                                </h3>
                                {child.products && (
                                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 block">
                                    {child.products.length} {t('products_count_label') || 'tovarlar'}
                                  </span>
                                )}
                            </div>

                            <div className="text-gray-300 dark:text-gray-700 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all">
                                <ChevronRight size={20} strokeWidth={2.5} />
                            </div>
                        </Link>
                    );
                })}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-6">
                    <Folder size={36} className="text-gray-300 dark:text-gray-700" />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  {t('subcategories_empty')}
                </h3>
                <p className="text-gray-400 text-sm mt-2 max-w-[250px] font-medium">
                  {t('subcategories_empty_desc')}
                </p>
            </div>
        )}
      </div>
    </div>
  );
}