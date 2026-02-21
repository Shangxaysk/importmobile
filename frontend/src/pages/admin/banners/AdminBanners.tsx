import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Image as ImageIcon, Trash2, Plus, X, Save, 
  Search, Link as LinkIcon, Layers, ToggleLeft, ToggleRight,
  Palette, Move, ExternalLink, Box
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export default function AdminBanners() {
  const [banners, setBanners] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { t, language } = useLanguage();

  const POSITIONS = [
    { id: 'top-left', label: t('pos_top_left'), class: 'top-4 left-4' },
    { id: 'top-right', label: t('pos_top_right'), class: 'top-4 right-4' },
    { id: 'bottom-left', label: t('pos_bottom_left'), class: 'bottom-4 left-4' },
    { id: 'bottom-right', label: t('pos_bottom_right'), class: 'bottom-4 right-4' },
    { id: 'center', label: t('pos_center'), class: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' },
  ];

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [linkType, setLinkType] = useState<'PRODUCT' | 'CATEGORY' | 'EXTERNAL'>('PRODUCT');
  const [linkValue, setLinkValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [badgeText, setBadgeText] = useState("");
  const [badgeColor, setBadgeColor] = useState("#10b981"); 
  const [badgeTextColor, setBadgeTextColor] = useState("#ffffff");
  const [badgePosition, setBadgePosition] = useState("top-right");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bRes, pRes, cRes] = await Promise.all([
        axios.get(import.meta.env.VITE_API_URL + '/banners'),
        axios.get(import.meta.env.VITE_API_URL + '/products'),
        axios.get(import.meta.env.VITE_API_URL + '/categories')
      ]);
      setBanners(bRes.data);
      setProducts(pRes.data);
      setCategories(cRes.data);
    } catch (err) { console.error(err); }
  };

  const handleUpload = async () => {
    if (!file) return alert(t('select_image_error'));
    if (!linkValue) return alert(t('select_link_error'));

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', title);
    formData.append('linkType', linkType);
    formData.append('linkValue', linkValue);
    
    if (badgeText) {
      formData.append('badgeText', badgeText);
      formData.append('badgeColor', badgeColor);
      formData.append('badgeTextColor', badgeTextColor);
      formData.append('badgePosition', badgePosition);
    }
    formData.append('isActive', 'true');

    try {
      const token = localStorage.getItem('token');
      await axios.post(import.meta.env.VITE_API_URL + '/banners', formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      alert(t('error'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('delete_confirm_short'))) return;
    const token = localStorage.getItem('token');
    
    // http://localhost:3000 o'rniga dinamik manzil qo'shildi
    await axios.delete(`${import.meta.env.VITE_API_URL}/banners/${id}`, { 
        headers: { Authorization: `Bearer ${token}` }
    });
    fetchData();
};

const toggleStatus = async (id: number) => {
    const token = localStorage.getItem('token');
    
    // http://localhost:3000 o'rniga dinamik manzil qo'shildi
    await axios.patch(`${import.meta.env.VITE_API_URL}/banners/${id}/toggle`, {}, { 
        headers: { Authorization: `Bearer ${token}` }
    });
    fetchData();
};

  const resetForm = () => {
    setFile(null); setPreview(null); setTitle(""); setLinkValue(""); setBadgeText(""); 
    setSearchTerm(""); setBadgeColor("#10b981"); setBadgeTextColor("#ffffff"); setBadgePosition("top-right");
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const getPosClass = (id: string) => POSITIONS.find(p => p.id === id)?.class || "";

  const getLinkDisplayInfo = (banner: any) => {
     if(banner.linkType === 'PRODUCT') {
         const p = products.find(prod => prod.id.toString() === banner.linkValue);
         return p ? p.name : banner.linkValue;
     }
     if(banner.linkType === 'CATEGORY') {
         const c = categories.find(cat => cat.id.toString() === banner.linkValue);
         return c ? (language === 'ru' ? (c.nameRu || c.nameUz) : c.nameUz) : banner.linkValue;
     }
     return banner.linkValue; 
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-black font-inter transition-colors duration-300">
      
      {/* --- HEADER --- */}
      <div className="sticky top-0 z-30 w-full bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto h-[70px] md:h-[90px] px-4 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
             <div className="p-2.5 md:p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl">
                <ImageIcon size={24} />
             </div>
             <div>
                <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none">{t('banners_title')}</h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{t('banners_desc')}</p>
             </div>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 md:px-6 py-3 md:py-3.5 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-600/30 active:scale-95 transition-all font-black text-[10px] md:text-xs uppercase tracking-widest"
          >
            <Plus size={18} strokeWidth={3} /> <span className="hidden sm:inline">{t('add_banner_btn')}</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6 pb-32">
        {banners.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[40px] border border-dashed border-gray-200 dark:border-gray-800">
             <ImageIcon size={64} className="mx-auto text-gray-200 dark:text-gray-800 mb-4"/>
             <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{t('no_banners')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner) => (
              <div key={banner.id} className={`bg-white dark:bg-gray-900 rounded-[35px] border border-gray-100 dark:border-gray-800 overflow-hidden relative group shadow-sm hover:shadow-xl transition-all ${!banner.isActive ? 'opacity-50 grayscale' : ''}`}>
                <div className="aspect-video bg-gray-100 dark:bg-black relative overflow-hidden">
                  <img src={banner.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                  {banner.badgeText && (
                    <div 
                      className={`absolute px-3 py-1 rounded-lg text-[10px] font-black shadow-lg uppercase tracking-wider ${getPosClass(banner.badgePosition)}`}
                      style={{ backgroundColor: banner.badgeColor, color: banner.badgeTextColor }}
                    >
                      {banner.badgeText}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start gap-4 mb-5">
                    <div className="flex-1 min-w-0">
                       <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight truncate">{banner.title || t('untitled_banner')}</h3>
                       <div className="flex items-center gap-1.5 mt-2 overflow-hidden">
                          <div className="p-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-500 flex-shrink-0">
                             {banner.linkType === 'PRODUCT' ? <Box size={10}/> : banner.linkType === 'CATEGORY' ? <Layers size={10}/> : <ExternalLink size={10}/>}
                          </div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold tracking-widest truncate uppercase">
                             {getLinkDisplayInfo(banner)}
                          </p>
                       </div>
                    </div>
                    <button onClick={() => toggleStatus(banner.id)} className="transition-all active:scale-90 flex-shrink-0">
                      {banner.isActive ? <ToggleRight size={36} className="text-emerald-500"/> : <ToggleLeft size={36} className="text-gray-300 dark:text-gray-700"/>}
                    </button>
                  </div>
                  
                  <button onClick={() => handleDelete(banner.id)} className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/10 text-red-500 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 size={16} /> {t('delete_action')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center md:justify-end">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)}></div>
           
           <div className="relative w-full md:w-[480px] h-[90vh] md:h-screen bg-white dark:bg-black rounded-t-[40px] md:rounded-none md:shadow-2xl flex flex-col animate-slide-up-or-right border-l dark:border-gray-800">
              
              <div className="md:hidden flex justify-center pt-3 pb-1">
                 <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
              </div>

              <div className="p-6 pb-4 flex items-center justify-between flex-shrink-0">
                <div>
                   <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('add_banner_modal_title')}</h2>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{t('for_main_page')}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-gray-100 dark:bg-gray-900 rounded-2xl text-gray-500 hover:bg-red-500 hover:text-white transition-all"><X size={20}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 no-scrollbar space-y-8">
                
                {/* 1. PREVIEW PANEL */}
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">{t('banner_image_label')}</label>
                   <div className="group relative border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[35px] aspect-video flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 overflow-hidden transition-all hover:border-emerald-500">
                    {preview ? (
                      <>
                        <img src={preview} className="w-full h-full object-cover" alt="" />
                        {badgeText && (
                          <div 
                            className={`absolute px-4 py-1.5 rounded-xl text-[10px] font-black shadow-2xl uppercase tracking-widest animate-in zoom-in ${getPosClass(badgePosition)}`}
                            style={{ backgroundColor: badgeColor, color: badgeTextColor }}
                          >
                            {badgeText}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-gray-400 text-center">
                        <ImageIcon className="mx-auto mb-3 opacity-30 text-emerald-500" size={40}/>
                        <p className="font-black text-[10px] uppercase tracking-widest">{t('select_image_hint')}</p>
                      </div>
                    )}
                    <input type="file" onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setFile(e.target.files[0]);
                        setPreview(URL.createObjectURL(e.target.files[0]));
                      }
                    }} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                  </div>
                </div>

                {/* 2. BADGE CUSTOMIZER */}
                <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-[30px] border border-gray-100 dark:border-gray-800 space-y-5">
                   <h4 className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest flex items-center gap-2">
                     <Palette size={14} className="text-emerald-500"/> {t('badge_customizer')}
                   </h4>
                   
                   <input 
                     placeholder={t('badge_text_placeholder')} 
                     value={badgeText}
                     maxLength={15}
                     onChange={(e) => setBadgeText(e.target.value)}
                     className="w-full p-4 bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500 transition-all dark:text-white"
                   />

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('bg_color')}</label>
                        <div className="flex items-center gap-2 bg-white dark:bg-black p-2 rounded-xl border border-gray-100 dark:border-gray-800">
                           <input type="color" value={badgeColor} onChange={e => setBadgeColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent" />
                           <span className="text-[10px] font-mono font-bold uppercase dark:text-white">{badgeColor}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('text_color')}</label>
                        <div className="flex items-center gap-2 bg-white dark:bg-black p-2 rounded-xl border border-gray-100 dark:border-gray-800">
                           <input type="color" value={badgeTextColor} onChange={e => setBadgeTextColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent" />
                           <span className="text-[10px] font-mono font-bold uppercase dark:text-white">{badgeTextColor}</span>
                        </div>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Move size={12}/> {t('position_label')}</label>
                      <div className="grid grid-cols-3 gap-2">
                         {POSITIONS.map(p => (
                           <button 
                            key={p.id} 
                            onClick={() => setBadgePosition(p.id)}
                            className={`py-2.5 text-[9px] font-black uppercase tracking-tighter rounded-xl border transition-all active:scale-95 ${badgePosition === p.id ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white dark:bg-black border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400'}`}
                           >
                             {p.label}
                           </button>
                         ))}
                      </div>
                   </div>
                </div>

                {/* 3. SETTINGS & LINKS */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{t('banner_title_label')}</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:border-emerald-500 font-bold dark:text-white" placeholder={t('banner_title_placeholder')} />
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-[30px] border border-gray-100 dark:border-gray-800 space-y-5 flex flex-col">
                    <h4 className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest flex items-center gap-2"><LinkIcon size={14} className="text-emerald-500"/> {t('redirect_label')}</h4>
                    
                    <div className="flex bg-white dark:bg-black rounded-2xl p-1.5 border border-gray-100 dark:border-gray-800 flex-shrink-0">
                      {(['PRODUCT', 'CATEGORY', 'EXTERNAL'] as const).map(type => (
                         <button key={type} onClick={() => {setLinkType(type); setLinkValue('')}} className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${linkType === type ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                           {type === 'PRODUCT' ? t('type_product') : type === 'CATEGORY' ? t('type_category') : t('type_external')}
                         </button>
                      ))}
                    </div>

                    <div className="flex-1 min-h-[150px] relative">
                        {linkType === 'PRODUCT' && (
                          <div className="absolute inset-0 flex flex-col bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                            <div className="relative border-b border-gray-50 dark:border-gray-800 flex-shrink-0">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
                              <input placeholder={t('search_placeholder_short')} className="w-full pl-10 pr-4 py-3 bg-transparent text-xs font-bold outline-none dark:text-white" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                            <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-gray-50 dark:divide-gray-800/50 p-2">
                              {filteredProducts.map(p => (
                                <div key={p.id} onClick={() => setLinkValue(p.id.toString())} className={`p-3 rounded-xl text-xs cursor-pointer transition-all flex justify-between items-center ${linkValue === p.id.toString() ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 font-black' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                  <span className="truncate pr-2">{p.name}</span>
                                  <span className="text-[9px] font-black opacity-40">#{p.id}</span>
                                </div>
                              ))}
                              {filteredProducts.length === 0 && <div className="p-4 text-center text-xs text-gray-400 font-bold uppercase">{t('not_found_short')}</div>}
                            </div>
                          </div>
                        )}

                        {linkType === 'CATEGORY' && (
                          <div className="absolute inset-0 animate-in fade-in slide-in-from-bottom-2">
                              <select className="w-full h-full p-4 bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-black uppercase tracking-widest outline-none focus:border-emerald-500 dark:text-white" value={linkValue} onChange={e => setLinkValue(e.target.value)}>
                                <option value="">{t('select_category_placeholder')}</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{language === 'ru' ? (c.nameRu || c.nameUz) : c.nameUz}</option>)}
                              </select>
                          </div>
                        )}

                        {linkType === 'EXTERNAL' && (
                          <div className="absolute inset-0 relative animate-in fade-in slide-in-from-bottom-2">
                            <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                            <input placeholder="https://t.me/example" className="w-full h-full pl-12 pr-4 py-4 bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500 dark:text-white" value={linkValue} onChange={e => setLinkValue(e.target.value)} />
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-black flex-shrink-0">
                <button 
                  onClick={handleUpload} 
                  disabled={uploading} 
                  className="w-full bg-emerald-600 text-white py-4 md:py-5 rounded-2xl md:rounded-[24px] font-black uppercase tracking-[0.2em] text-xs hover:bg-emerald-700 transition shadow-xl shadow-emerald-600/20 flex justify-center items-center gap-3 active:scale-95 disabled:opacity-50"
                >
                   {uploading ? t('saving') : <><Save size={18} strokeWidth={3}/> {t('save_banner')}</>}
                </button>
              </div>
           </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        
        @media (max-width: 768px) {
          .animate-slide-up-or-right { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        }
        @media (min-width: 769px) {
          .animate-slide-up-or-right { animation: slideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes slideRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}