import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Edit3, Trash2, Plus, Search, Eye, 
  Package, Image as ImageIcon, EyeOff 
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { getImageUrl } from '../../../utils/image';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const fetchProducts = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + '/products');
      setProducts(res.data);
    } catch (err) {
      console.error("Xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProducts();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm(t('delete_confirm'))) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${import.meta.env.VITE_API_URL}/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(products.filter(p => p.id !== id));
      } catch (err) {
        alert(t('delete_error'));
      }
    }
  };

  // YANGI FUNKSIYA: Mahsulotni yashirish/ko'rsatish
  const handleToggleVisibility = async (id: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      // State'ni darhol o'zgartiramiz (foydalanuvchi kutib qolmasligi uchun)
      setProducts(products.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));
      
      await axios.patch(`${import.meta.env.VITE_API_URL}/products/${id}/toggle-visibility`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      // Xatolik bo'lsa, holatni orqaga qaytaramiz
      setProducts(products.map(p => p.id === id ? { ...p, isActive: currentStatus } : p));
      alert(t('error_occurred') || "Xatolik yuz berdi");
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center dark:bg-black font-inter">
      <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-black font-inter pb-32 transition-colors duration-300">
      
      {/* --- STICKY HEADER --- */}
      <div className="sticky top-0 z-30 w-full bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto h-[70px] md:h-[90px] px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-2xl hidden sm:block">
                <Package size={24} />
             </div>
             <div>
                <h1 className="text-lg md:text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none">{t('products_count')}</h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{t('products_management')}</p>
             </div>
          </div>
          
          <Link 
            to="/admin/products/add" 
            className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/30 active:scale-95 transition-all font-black text-[10px] md:text-xs uppercase tracking-widest"
          >
            <Plus size={18} strokeWidth={3} /> <span>{t('add_btn')}</span>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        
        {/* --- SEARCH BAR --- */}
        <div className="mb-6 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder={t('search_product_placeholder')} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 md:py-5 bg-white dark:bg-gray-900 rounded-[24px] border border-gray-100 dark:border-gray-800 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all text-sm font-bold text-gray-900 dark:text-white shadow-sm"
          />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[40px] border border-dashed border-gray-200 dark:border-gray-800">
            <Search size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('product_not_found')}</h3>
          </div>
        ) : (
          <>
            {/* --- MOBILE: CARD LIST --- */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredProducts.map((product) => (
                <div key={product.id} className={`bg-white dark:bg-gray-900 p-4 rounded-[30px] border shadow-sm flex items-center gap-4 transition-all ${!product.isActive ? 'border-gray-200 dark:border-gray-800 opacity-60' : 'border-gray-100 dark:border-gray-800'}`}>
                  <div className="w-20 h-20 bg-gray-50 dark:bg-black rounded-2xl border border-gray-50 dark:border-gray-800 p-2 flex-shrink-0 relative">
                    {product.images?.[0] ? (
                      <img src={getImageUrl(product.images[0])} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={24}/></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-black text-gray-900 dark:text-white text-sm uppercase truncate pr-2 leading-tight">
                        {product.name}
                      </h4>
                      {/* STATUS BADGE MOBILE */}
                      <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-widest flex-shrink-0 ${product.isActive ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-gray-200 text-gray-500 dark:bg-gray-800'}`}>
                        {product.isActive ? t('status_active') : t('status_inactive')}
                      </span>
                    </div>
                    <p className="text-emerald-600 font-black text-base mt-1">
                      {product.price.toLocaleString()} $
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                       {/* TOGGLE VISIBILITY BUTTON */}
                       <button onClick={() => handleToggleVisibility(product.id, product.isActive)} className={`p-2 rounded-lg active:scale-90 transition-all ${product.isActive ? 'bg-gray-100 text-gray-500 dark:bg-gray-800' : 'bg-emerald-500/10 text-emerald-600'}`}>
                          {product.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                       </button>
                       <Link to={`/admin/products/edit/${product.id}`} className="p-2 bg-amber-500/10 text-amber-600 rounded-lg active:scale-90 transition-all">
                          <Edit3 size={16} />
                       </Link>
                       <Link to={`/product/${product.id}`} className="p-2 bg-blue-500/10 text-blue-600 rounded-lg active:scale-90 transition-all">
                          <Eye size={16} />
                       </Link>
                       <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-500/10 text-red-600 rounded-lg active:scale-90 transition-all">
                          <Trash2 size={16} />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* --- DESKTOP: TABLE VIEW --- */}
            <div className="hidden md:block bg-white dark:bg-gray-900 rounded-[35px] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-black/20 border-b border-gray-50 dark:border-gray-800">
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t('th_product')}</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t('th_price')}</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t('th_category')}</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">{t('th_actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className={`hover:bg-gray-50/50 dark:hover:bg-black/40 transition-colors group ${!product.isActive ? 'opacity-60' : ''}`}>
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 flex-shrink-0 p-2 group-hover:scale-105 transition-transform duration-300">
                            {product.images?.[0] ? (
                              <img src={getImageUrl(product.images[0])} alt="" className="w-full h-full object-contain" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={20}/></div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm line-clamp-1">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: {product.id}</p>
                              {/* STATUS BADGE DESKTOP */}
                              <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-widest ${product.isActive ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-gray-200 text-gray-500 dark:bg-gray-800'}`}>
                                {product.isActive ? t('status_active') : t('status_inactive')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="text-lg font-black text-emerald-600 tracking-tighter">
                          {product.price.toLocaleString()} $
                        </span>
                      </td>
                      <td className="p-6">
                        <span className="px-3 py-1 bg-gray-100 dark:bg-black text-gray-500 dark:text-gray-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-gray-200 dark:border-gray-800">
                          {language === 'ru' ? (product.category?.nameRu || product.category?.nameUz || t('category_standard')) : (product.category?.nameUz || t('category_standard'))}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center justify-center gap-2">
                          {/* TOGGLE VISIBILITY BUTTON */}
                          <button 
                            onClick={() => handleToggleVisibility(product.id, product.isActive)} 
                            title={product.isActive ? t('hide_product') : t('show_product')}
                            className={`p-3 rounded-xl hover:text-white transition-all active:scale-90 ${product.isActive ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-600' : 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 hover:bg-emerald-600'}`}
                          >
                            {product.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                          <Link to={`/product/${product.id}`} className="p-3 bg-blue-50 dark:bg-blue-900/10 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-90"><Eye size={18} /></Link>
                          <Link to={`/admin/products/edit/${product.id}`} className="p-3 bg-amber-50 dark:bg-amber-900/10 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all active:scale-90"><Edit3 size={18} /></Link>
                          <button onClick={() => handleDelete(product.id)} className="p-3 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-90"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}