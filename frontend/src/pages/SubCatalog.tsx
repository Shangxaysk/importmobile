import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Loader2, ChevronRight, Folder, ChevronLeft } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getImageUrl } from '../utils/image'; // Boyagi markaziy funksiyamizni ishlatamiz

const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  .font-inter { font-family: 'Inter', sans-serif; }
`;

export default function SubCatalog() {
  const { parentId } = useParams();
  const [parentCategory, setParentCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  useEffect(() => {
    setLoading(true);
    axios.get(`${import.meta.env.VITE_API_URL}/categories/${parentId}`)
      .then(res => setParentCategory(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [parentId]);

  const renderIcon = (cat: any) => {
    // 1. Agar rasm bo'lsa (ImgBB yoki Uploads)
    if (cat.image) {
      return (
        <img 
          src={getImageUrl(cat.image)} 
          className="w-10 h-10 object-contain" // Kvadrat ichida emas, o'z holicha
          alt={cat.nameUz} 
          onError={(e: any) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
      );
    }
    // 2. Agar rasm bo'lmasa, Lucide ikonka
    const IconComponent = (LucideIcons as any)[cat.icon] || LucideIcons.Folder;
    return <IconComponent size={28} strokeWidth={1.5} className="text-gray-400 dark:text-gray-500" />;
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
      <div className="sticky top-0 z-40 w-full bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-b border-gray-100 dark:border-gray-800">
        <div className="relative max-w-md mx-auto h-[60px] px-4 flex items-center">
            <button 
                onClick={() => navigate(-1)} 
                className="group flex items-center gap-1 pl-2 pr-4 py-2 bg-emerald-600 rounded-full text-white active:scale-95 transition-all z-10"
            >
                <ChevronLeft size={18} strokeWidth={2} />
                <span className="text-xs font-medium">{t('back')}</span>
            </button>
            <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-black text-gray-900 dark:text-white truncate max-w-[180px]">
                {language === 'ru' ? (parentCategory.nameRu || parentCategory.nameUz) : parentCategory.nameUz}
            </h1>
        </div>
      </div>
      

      {/* --- CONTENT --- */}
      <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
        {parentCategory.children && parentCategory.children.length > 0 ? (
            <div className="space-y-3"> {/* Kvadratli massiv emas, alohida qatorlar */}
                {parentCategory.children.map((child: any) => (
                    <Link 
                        to={`/catalog/products/${child.id}`} 
                        key={child.id} 
                        className="flex items-center p-4 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/30 group"
                    >
                        {/* Ikonka qismi - endi rangli kvadrat emas */}
                        <div className="w-12 h-12 flex items-center justify-center">
                            {renderIcon(child)}
                            <Folder className="hidden" size={24} />
                        </div>

                        <div className="flex-1 ml-4">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                                {language === 'ru' ? (child.nameRu || child.nameUz) : child.nameUz}
                            </h3>
                            {child.products && (
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                {child.products.length} {t('products_count_label') || 'tovarlar'}
                              </span>
                            )}
                        </div>

                        <div className="text-gray-300 dark:text-gray-700 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all">
                            <ChevronRight size={20} strokeWidth={2.5} />
                        </div>
                    </Link>
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Folder size={36} className="text-gray-300 dark:text-gray-700 mb-4" />
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  {t('subcategories_empty')}
                </h3>
            </div>
        )}
      </div>
    </div>
  );
}