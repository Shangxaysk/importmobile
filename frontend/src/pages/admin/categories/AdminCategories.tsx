import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Trash2, Upload, Check, X, Smartphone, FolderPlus, 
  Layers, LayoutGrid, Plus, Laptop, Tablet, Watch, Headphones, Tv, Cpu, Gamepad2, Apple, Zap, Infinity
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

const TECH_ICONS = [
  { id: 'Smartphone', icon: <Smartphone size={20}/>, label: 'Smartfon' },
  { id: 'Laptop', icon: <Laptop size={20}/>, label: 'Noutbuk' },
  { id: 'Tablet', icon: <Tablet size={20}/>, label: 'Planshet' },
  { id: 'Watch', icon: <Watch size={20}/>, label: 'Soat' },
  { id: 'Headphones', icon: <Headphones size={20}/>, label: 'Quloqchin' },
  { id: 'Tv', icon: <Tv size={20}/>, label: 'Televizor' },
  { id: 'Cpu', icon: <Cpu size={20}/>, label: 'Protsessor' },
  { id: 'Gamepad2', icon: <Gamepad2 size={20}/>, label: 'Konsol' },
  { id: 'Apple', icon: <Apple size={20}/>, label: 'Apple' },
  { id: 'Zap', icon: <Zap size={20}/>, label: 'Xiaomi' },
  { id: 'Infinity', icon: <Infinity size={20}/>, label: 'Samsung' },
];

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { t, language } = useLanguage();

  const [form, setForm] = useState({
    nameUz: '',
    nameRu: '',
    image: '',
    icon: '',
    hasSpecs: false,
    parentId: ''
  });

  // Rasm URL manzilini to'g'ri shakllantirish funksiyasi
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('blob:') || imagePath.startsWith('http')) {
      return imagePath;
    }
    return import.meta.env.VITE_API_URL + imagePath;
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + '/categories');
      setCategories(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleImageUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setForm({ ...form, image: previewUrl, imageFile: file } as any);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.nameUz) return alert(t('enter_name_error'));

    setLoading(true);
    const formData = new FormData();
    formData.append('nameUz', form.nameUz);
    formData.append('nameRu', form.nameRu);
    formData.append('icon', form.icon);
    formData.append('hasSpecs', String(form.hasSpecs));
    if (form.parentId) formData.append('parentId', form.parentId);
    if ((form as any).imageFile) formData.append('image', (form as any).imageFile);

    try {
      const token = localStorage.getItem('token');
      await axios.post(import.meta.env.VITE_API_URL + '/categories', formData, {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
      });
      setShowForm(false);
      setForm({ nameUz: '', nameRu: '', image: '', icon: '', hasSpecs: false, parentId: '' }); 
      fetchCategories(); 
    } catch (err: any) {
      alert(err.response?.data?.message || t('error'));
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('delete_confirm_short'))) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCategories();
    } catch (err) { alert(t('error')); }
  };

  const IconRenderer = ({ name, className }: { name: string, className?: string }) => {
    const IconComponent = (LucideIcons as any)[name];
    return IconComponent ? <IconComponent className={className} /> : null;
  };

  const parentCategories = categories.filter(c => !c.parentId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black font-inter transition-colors duration-300">
      
      {/* HEADER */}
      <div className="sticky top-0 z-30 w-full bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto h-[80px] px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-600/20">
                 <Layers size={24} />
              </div>
              <div>
                 <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none">{t('categories_title')}</h1>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{t('control_panel')}</p>
              </div>
          </div>
          
          <button 
            onClick={() => {
              setForm({ nameUz: '', nameRu: '', image: '', icon: '', hasSpecs: false, parentId: '' });
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-600/30 active:scale-95 transition-all font-black text-xs uppercase tracking-widest"
          >
            <Plus size={18} strokeWidth={3} /> <span className="hidden sm:inline">{t('add_category_btn')}</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parentCategories.map((cat) => (
            <div key={cat.id} className="bg-white dark:bg-gray-900 rounded-[35px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group flex flex-col">
               <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-[22px] bg-gray-50 dark:bg-black flex items-center justify-center text-emerald-600 border border-gray-100 dark:border-gray-800 group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                      {cat.image ? (
                        <img src={getImageUrl(cat.image)} className="w-full h-full object-contain" alt="" />
                      ) : (
                        cat.icon ? <IconRenderer name={cat.icon} className="w-8 h-8" /> : <FolderPlus size={28} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-gray-900 dark:text-white uppercase tracking-tight">{language === 'ru' ? (cat.nameRu || cat.nameUz) : cat.nameUz}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{language === 'ru' ? cat.nameUz : cat.nameRu}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(cat.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={20} />
                  </button>
               </div>

               <div className="px-6 pb-6 flex-1">
                  <div className="flex flex-wrap gap-2 pt-5 border-t border-gray-50 dark:border-gray-800">
                    {categories.filter(sub => sub.parentId === cat.id).map(sub => (
                      <div key={sub.id} className="flex items-center gap-2 bg-gray-50/50 dark:bg-black pl-2 pr-3 py-2 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-emerald-500/30 transition-all">
                         <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{language === 'ru' ? (sub.nameRu || sub.nameUz) : sub.nameUz}</span>
                         <button onClick={() => handleDelete(sub.id)} className="text-gray-300 hover:text-red-500"><X size={14} /></button>
                      </div>
                    ))}
                    <button 
                      onClick={() => { setForm({...form, parentId: cat.id}); setShowForm(true); }}
                      className="p-2 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 text-gray-400 hover:border-emerald-500 hover:text-emerald-500 transition-all"
                    >
                      <Plus size={16}/>
                    </button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- RESPONSIVE MODAL --- */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center md:justify-end">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowForm(false)}></div>
           
           <div className="relative w-full md:w-[450px] h-full md:h-screen bg-white dark:bg-gray-900 md:shadow-2xl flex flex-col animate-slide-up-or-right">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('new_category_title')}</h2>
                <button onClick={() => setShowForm(false)} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-500 hover:bg-red-500 hover:text-white transition-all"><X size={22}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('category_location')}</label>
                      <select 
                          value={form.parentId}
                          onChange={e => setForm({...form, parentId: e.target.value})}
                          className="w-full p-5 rounded-[22px] bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 outline-none font-bold text-sm focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all dark:text-white"
                      >
                          <option value="">{t('main_category_parent')}</option>
                          {parentCategories.map(p => <option key={p.id} value={p.id}>{language === 'ru' ? (p.nameRu || p.nameUz) : p.nameUz}</option>)}
                      </select>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('category_name')}</label>
                    <input placeholder={t('name_uz_placeholder')} value={form.nameUz} onChange={e => setForm({...form, nameUz: e.target.value})} className="w-full p-5 rounded-[22px] bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 outline-none font-bold dark:text-white" />
                    <input placeholder={t('name_ru_placeholder')} value={form.nameRu} onChange={e => setForm({...form, nameRu: e.target.value})} className="w-full p-5 rounded-[22px] bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 outline-none font-bold dark:text-white" />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('select_icon')}</label>
                    <div className="grid grid-cols-4 gap-3">
                      {TECH_ICONS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setForm({...form, icon: item.id})}
                          className={`flex flex-col items-center justify-center aspect-square rounded-[22px] border transition-all active:scale-90 ${
                            form.icon === item.id 
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl scale-105' 
                            : 'bg-gray-50 dark:bg-black border-gray-100 dark:border-gray-800 text-gray-400'
                          }`}
                        >
                          {item.icon}
                          <span className="text-[7px] mt-2 font-black uppercase truncate w-full px-1">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                     <div className="flex items-center gap-4 bg-gray-50 dark:bg-black p-5 rounded-[25px] border border-gray-100 dark:border-gray-800">
                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center text-emerald-600 border dark:border-gray-800 overflow-hidden shadow-inner">
                          {form.image ? (
                            <img src={getImageUrl(form.image)} className="w-full h-full object-contain" alt="" />
                          ) : (
                            form.icon ? <IconRenderer name={form.icon} className="w-7 h-7" /> : <Upload size={24} />
                          )}
                        </div>
                        <label className="flex-1 cursor-pointer bg-white dark:bg-gray-800 text-center py-4 rounded-2xl text-xs font-black uppercase tracking-widest border border-gray-100 dark:border-gray-700 hover:bg-emerald-50 transition-all shadow-sm dark:text-white">
                          {loading ? "..." : t('upload_image_btn')}
                          <input type="file" hidden onChange={handleImageUpload} accept="image/*" />
                        </label>
                     </div>

                     <div onClick={() => setForm({...form, hasSpecs: !form.hasSpecs})} className={`p-5 rounded-[25px] border-2 transition-all flex items-center justify-between cursor-pointer ${form.hasSpecs ? 'border-emerald-500 bg-emerald-500/5' : 'border-gray-100 dark:border-gray-800'}`}>
                        <div className="flex items-center gap-3">
                           <LayoutGrid size={20} className={form.hasSpecs ? 'text-emerald-500' : 'text-gray-400'}/>
                           <span className="text-xs font-black uppercase text-gray-700 dark:text-gray-200 tracking-tight">{t('smartphone_mode')}</span>
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${form.hasSpecs ? 'bg-emerald-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          {form.hasSpecs && <Check size={14} strokeWidth={3} />}
                        </div>
                     </div>
                  </div>
                </form>
              </div>

              <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-black/20">
                <button 
                  onClick={handleSubmit}
                  disabled={loading} 
                  className="w-full py-5 bg-emerald-600 text-white font-black rounded-[24px] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all uppercase tracking-[0.2em] text-sm"
                >
                  {loading ? t('saving') : t('save_category')}
                </button>
              </div>
           </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        @media (max-width: 768px) {
          .animate-slide-up-or-right { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        }
        @media (min-width: 769px) {
          .animate-slide-up-or-right { animation: slideRight 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        }

        @keyframes slideUp { 
          from { transform: translateY(100%); } 
          to { transform: translateY(0); } 
        }
        @keyframes slideRight { 
          from { transform: translateX(100%); } 
          to { transform: translateX(0); } 
        }
      `}</style>

    </div>
  );
}