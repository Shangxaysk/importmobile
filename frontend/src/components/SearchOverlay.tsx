import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, X, ChevronRight, Loader2, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext'; // QO'SHILDI

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t, language } = useLanguage(); // QO'SHILDI

  // Oyna ochilganda inputga fokus berish
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    // Oyna yopilganda tozalash
    if (!isOpen) {
        setQuery('');
        setResults([]);
    }
  }, [isOpen]);

  // Qidiruv funksiyasi
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 0) {
        setLoading(true);
        try {
          const res = await axios.get(`http://localhost:3000/products`);
          
          const filteredProducts = res.data.filter((product: any) => 
            product.name.toLowerCase().includes(query.toLowerCase())
          );

          setResults(filteredProducts);
        } catch (error) {
          console.error("Qidiruvda xato:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]); 
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-black flex flex-col animate-fade-in">
      
      {/* --- HEADER (INPUT QISMI) --- */}
      <div className="flex-none px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
        <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
                ref={inputRef}
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('search_placeholder')} 
                className="w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white pl-10 pr-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium placeholder:text-gray-400"
            />
            {loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 size={18} className="animate-spin text-emerald-600" />
                </div>
            )}
        </div>
        
        <button 
            onClick={onClose}
            className="p-3 bg-gray-50 dark:bg-gray-900 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition active:scale-90"
        >
            <X size={24} />
        </button>
      </div>

      {/* --- NATIJALAR QISMI --- */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
         {query.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Search size={48} strokeWidth={1} className="mb-4 opacity-20" />
                <p className="text-sm font-medium">{t('search_start_typing')}</p>
            </div>
         ) : results.length > 0 ? (
            <div className="flex flex-col gap-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                    {t('search_results_found').replace('{{count}}', results.length.toString())}
                </p>
                {results.map((product) => (
                    <Link 
                        key={product.id} 
                        to={`/product/${product.id}`}
                        onClick={onClose} 
                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group border border-transparent hover:border-gray-100 dark:hover:border-gray-800"
                    >
                        <div className="w-16 h-16 bg-white rounded-xl border border-gray-100 dark:border-gray-800 p-1 flex-shrink-0 flex items-center justify-center">
                            <img 
                                src={product.images[0]} 
                                alt={product.name} 
                                className="w-full h-full object-contain mix-blend-multiply" 
                            />
                        </div>
                        
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight group-hover:text-emerald-600 transition-colors mb-1">
                                {product.name}
                            </h4>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md">
                                    {Number(product.price).toLocaleString()} $
                                </span>
                                {product.category && (
                                    <span className="text-[10px] text-gray-400 font-medium">
                                        • {language === 'ru' ? (product.category.nameRu || product.category.nameUz) : product.category.nameUz}
                                    </span>
                                )}
                            </div>
                        </div>

                        <ChevronRight size={20} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
                    </Link>
                ))}
            </div>
         ) : (
            !loading && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <ShoppingBag size={48} strokeWidth={1} className="mb-4 opacity-20" />
                    <p className="text-sm font-medium">{t('nothing_found')}</p>
                </div>
            )
         )}
      </div>
    </div>
  );
}