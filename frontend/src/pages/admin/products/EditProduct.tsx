import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Upload, X, Save, Smartphone, Cpu, Battery, Camera, 
  Layers, Scale, Globe, CreditCard, Plus, Palette, 
  ChevronDown, DollarSign, Clock, Percent, ArrowLeft, Loader2
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

const CONSTANTS = {
  screens: [
    "LCD", "IPS LCD", "TFT LCD", "LTPS LCD", "OLED", "AMOLED", 
    "Super AMOLED", "Dynamic AMOLED", "Fluid AMOLED", "Retina Display", 
    "LTPO OLED", "Foldable OLED", "Mini-LED", "MicroLED", "E-Ink"
  ],
  chips: {
    android: [
      "Snapdragon 8 Gen 3", "Snapdragon 8 Gen 2", "Snapdragon 8+ Gen 1", "Snapdragon 8 Gen 1",
      "Snapdragon 8 Elite Gen 5", "Snapdragon 7 Gen 3", "Snapdragon 7+ Gen 2", "Snapdragon 7 Gen 1",
      "MediaTek Dimensity 9300", "Dimensity 9200+", "Dimensity 9000", "Dimensity 8300", "Dimensity 7200",
      "Exynos 2400", "Exynos 2200", "Exynos 1480", "Google Tensor G3", "Google Tensor G2"
    ],
    ios: [
      "Apple A19 Pro", "Apple A19", "Apple A18 Pro", "Apple A18", 
      "Apple A17 Pro", "Apple A16 Bionic", "Apple A15 Bionic"
    ]
  },
  os: {
    android: [
      "HyperOS", "One UI", "Pixel UI", "OxygenOS", "ColorOS", "Realme UI", 
      "MIUI", "EMUI", "MagicOS", "Funtouch OS", "OriginOS", "HarmonyOS"
    ],
    ios: [
      "iOS 18", "iOS 17", "iOS 16", "iOS 15", "iOS 14"
    ]
  }
};

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [basic, setBasic] = useState({
    name: '',
    categoryId: '',
    description: '',
    deliveryTime: '',
    prepaymentPercent: ''
  });

  const [variants, setVariants] = useState<{ram: string, rom: string, price: string}[]>([]);
  const [tempVar, setTempVar] = useState({ ram: '', rom: '', price: '' });

  const [existingImages, setExistingImages] = useState<{url: string, color: string}[]>([]);
  const [newImages, setNewImages] = useState<{file: File, preview: string, color: string}[]>([]);

  const [specs, setSpecs] = useState({
    screen: '',
    chipset: '',
    osType: 'Android' as 'Android' | 'iOS',
    osVer: '',
    battery: '',
    weight: '',
    sim: '',
    camRearCount: 3,
    camRearMPs: ['50', '12', '10', ''] as string[],
    camFrontCount: 1,
    camFrontMPs: ['12'] as string[]
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          axios.get('http://localhost:3000/categories'),
          axios.get(`http://localhost:3000/products/${id}`)
        ]);
        
        setCategories(catRes.data);
        const p = prodRes.data;

        setBasic({
          name: p.name || '',
          categoryId: p.categoryId || '',
          description: p.description || '',
          deliveryTime: p.deliveryTime || '',
          prepaymentPercent: p.prepaymentPercent || ''
        });

        let parsedSpecs: any = {};
        try {
          parsedSpecs = typeof p.specifications === 'string' ? JSON.parse(p.specifications) : (p.specifications || {});
        } catch (e) {}

        if (parsedSpecs.variants && Array.isArray(parsedSpecs.variants)) {
          setVariants(parsedSpecs.variants);
        }

        const osString = parsedSpecs.os || '';
        const osType = osString.toLowerCase().includes('ios') ? 'iOS' : 'Android';
        const osVer = osString.replace('Android ', '').replace('iOS ', '');

        const parseCameras = (camStr: string) => {
          if (!camStr) return [];
          return camStr.split('+').map(s => s.replace('MP', '').trim());
        };
        const rCams = parseCameras(parsedSpecs.cameraRear);
        const fCams = parseCameras(parsedSpecs.cameraFront);

        setSpecs({
          screen: parsedSpecs.screen || '',
          chipset: parsedSpecs.chipset || '',
          osType,
          osVer,
          battery: parsedSpecs.battery ? parsedSpecs.battery.replace(' mAh', '') : '',
          weight: parsedSpecs.weight ? parsedSpecs.weight.replace(' g', '') : '',
          sim: parsedSpecs.sim || '',
          camRearCount: rCams.length > 0 ? rCams.length : 3,
          camRearMPs: [...rCams, '', '', '', ''].slice(0, 4),
          camFrontCount: fCams.length > 0 ? fCams.length : 1,
          camFrontMPs: [...fCams, '', ''].slice(0, 2)
        });

        let parsedColors: string[] = [];
        try {
          parsedColors = typeof parsedSpecs.colors === 'string' ? JSON.parse(parsedSpecs.colors) : (parsedSpecs.colors || []);
        } catch (e) {}

        if (p.images && Array.isArray(p.images)) {
          const exImgs = p.images.map((url: string, i: number) => ({
            url,
            color: parsedColors[i] || '#10b981'
          }));
          setExistingImages(exImgs);
        }

      } catch (err) {
        alert(t('load_error'));
        navigate('/admin/products');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const addVariant = () => {
    if (tempVar.ram && tempVar.rom && tempVar.price) {
      setVariants([...variants, tempVar]);
      setTempVar({ ram: '', rom: '', price: '' });
    } else {
      alert(t('req_fields_error'));
    }
  };

  const removeVariant = (idx: number) => {
    setVariants(variants.filter((_, i) => i !== idx));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (existingImages.length + newImages.length + files.length > 7) {
        return alert(t('max_7_images'));
      }
      const upcoming = files.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        color: '#10b981'
      }));
      setNewImages([...newImages, ...upcoming]);
    }
  };

  const updateExistingImageColor = (idx: number, color: string) => {
    const updated = [...existingImages];
    updated[idx].color = color;
    setExistingImages(updated);
  };

  const updateNewImageColor = (idx: number, color: string) => {
    const updated = [...newImages];
    updated[idx].color = color;
    setNewImages(updated);
  };

  const removeExistingImage = (idx: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== idx));
  };

  const removeNewImage = (idx: number) => {
    setNewImages(newImages.filter((_, i) => i !== idx));
  };

  const updateCamMP = (type: 'rear' | 'front', index: number, value: string) => {
    if (type === 'rear') {
      const newMps = [...specs.camRearMPs];
      newMps[index] = value;
      setSpecs({...specs, camRearMPs: newMps});
    } else {
      const newMps = [...specs.camFrontMPs];
      newMps[index] = value;
      setSpecs({...specs, camFrontMPs: newMps});
    }
  };

  const handleUpdate = async () => {
    if (!basic.name || !basic.categoryId || variants.length === 0) {
      return alert(t('req_fields_error'));
    }

    setUpdating(true);
    const formData = new FormData();

    formData.append('name', basic.name);
    formData.append('categoryId', basic.categoryId);
    formData.append('description', basic.description);
    formData.append('deliveryTime', basic.deliveryTime);
    formData.append('prepaymentPercent', basic.prepaymentPercent || '100');
    
    const minPrice = Math.min(...variants.map(v => Number(v.price)));
    formData.append('price', minPrice.toString());
    formData.append('variants', JSON.stringify(variants));

    const finalSpecs = {
      screen: specs.screen,
      chipset: specs.chipset,
      os: `${specs.osType} ${specs.osVer}`.trim(),
      cameraRear: specs.camRearMPs.slice(0, specs.camRearCount).filter(mp => mp).map(mp => `${mp}MP`).join(' + '),
      cameraFront: specs.camFrontMPs.slice(0, specs.camFrontCount).filter(mp => mp).map(mp => `${mp}MP`).join(' + '),
      battery: specs.battery ? `${specs.battery} mAh` : '',
      weight: specs.weight ? `${specs.weight} g` : '',
      sim: specs.sim,
      variants: variants,
    };
    formData.append('specifications', JSON.stringify(finalSpecs));

    const finalColors = [
      ...existingImages.map(img => img.color),
      ...newImages.map(img => img.color)
    ];
    formData.append('colors', JSON.stringify(finalColors));
    
    formData.append('existingImages', JSON.stringify(existingImages.map(img => img.url)));
    newImages.forEach(img => formData.append('images', img.file));

    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:3000/products/${id}`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` 
        }
      });
      alert(t('edit_success'));
      navigate('/admin/products');
    } catch (err) {
      alert(t('error'));
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
      <Loader2 className="animate-spin text-emerald-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black font-inter pb-32 p-4 md:p-6 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      
      <div className="flex items-center justify-between mb-8 max-w-5xl mx-auto mt-2">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
             <button onClick={() => navigate(-1)} className="p-2 bg-gray-200 dark:bg-gray-800 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 transition">
               <ArrowLeft size={24}/>
             </button>
             {t('edit_product_title')}<span className="text-emerald-600 truncate max-w-[200px] md:max-w-md">{basic.name}</span>
          </h1>
      </div>

      <div className="space-y-6 max-w-5xl mx-auto">
        
        {/* 1. ASOSIY MA'LUMOTLAR */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Smartphone className="text-emerald-600"/> {t('basic_info')}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="spec-label">{t('product_name')}</label>
                    <input className="input-std" value={basic.name} onChange={e => setBasic({...basic, name: e.target.value})} />
                </div>
                <div>
                    <label className="spec-label">{t('th_category')}</label>
                    <div className="relative">
                        <select className="input-std appearance-none" value={basic.categoryId} onChange={e => setBasic({...basic, categoryId: e.target.value})}>
                            <option value="">{t('category_select')}</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{language === 'ru' ? (c.nameRu || c.nameUz) : c.nameUz}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-4 text-gray-400 pointer-events-none" size={18}/>
                    </div>
                </div>
            </div>
            <div className="mt-4">
                <label className="spec-label">{t('description_label')}</label>
                <textarea rows={4} className="input-std" value={basic.description} onChange={e => setBasic({...basic, description: e.target.value})}></textarea>
            </div>
        </div>

        {/* 2. VARIANTLAR VA NARX */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 pointer-events-none">
                <DollarSign size={100} className="text-emerald-500"/>
            </div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10 text-gray-900 dark:text-white">
                <Layers className="text-emerald-600"/> {t('variants_prices')}
            </h2>
            
            <div className="flex flex-col md:flex-row gap-3 items-end mb-4 relative z-10">
                <div className="flex-1 w-full">
                    <label className="spec-label">RAM (GB)</label>
                    <input type="number" placeholder="8" className="input-std" value={tempVar.ram} onChange={e => setTempVar({...tempVar, ram: e.target.value})}/>
                </div>
                <div className="flex-1 w-full">
                    <label className="spec-label">ROM (GB)</label>
                    <input type="number" placeholder="256" className="input-std" value={tempVar.rom} onChange={e => setTempVar({...tempVar, rom: e.target.value})}/>
                </div>
                <div className="flex-[2] w-full">
                    <label className="spec-label">{t('price')} ($)</label>
                    <input type="number" placeholder="1200" className="input-std text-emerald-600 font-black" value={tempVar.price} onChange={e => setTempVar({...tempVar, price: e.target.value})}/>
                </div>
                <button onClick={addVariant} className="h-[52px] w-full md:w-auto px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl flex items-center justify-center transition shadow-lg shadow-emerald-500/20 active:scale-95">
                    <Plus strokeWidth={3}/> {t('add_variant_btn')}
                </button>
            </div>

            {variants.length > 0 && (
                <div className="space-y-2 relative z-10">
                    {variants.map((v, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                            <div className="flex items-center gap-4 font-bold text-gray-700 dark:text-gray-200">
                                <span className="bg-white dark:bg-black px-3 py-1 rounded-lg shadow-sm border dark:border-gray-800">{v.ram}/{v.rom} GB</span>
                                <span className="text-emerald-700 dark:text-emerald-400 text-lg">{Number(v.price).toLocaleString()} $</span>
                            </div>
                            <button onClick={() => removeVariant(idx)} className="p-2 bg-white dark:bg-black text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"><X size={18}/></button>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* 3. RASMLAR VA RANGLAR */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Palette className="text-emerald-600"/> {t('images_colors')} ({(existingImages.length + newImages.length)}/7)
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingImages.map((img, idx) => (
                    <div key={`old-${idx}`} className="relative group bg-gray-50 dark:bg-black rounded-2xl p-2 border border-gray-200 dark:border-gray-800">
                        <img src={img.url} className="w-full h-32 object-contain rounded-xl bg-white dark:bg-gray-900 mb-2" />
                        <button onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition transform hover:scale-110"><X size={14}/></button>
                        <div className="flex items-center gap-2">
                            <input type="color" value={img.color} onChange={e => updateExistingImageColor(idx, e.target.value)} className="w-8 h-8 rounded-full cursor-pointer border-2 border-white dark:border-gray-700 shadow-sm p-0 overflow-hidden" />
                            <input type="text" value={img.color} onChange={e => updateExistingImageColor(idx, e.target.value)} className="text-xs font-mono w-full bg-white dark:bg-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-md px-1 py-1 uppercase" maxLength={7}/>
                        </div>
                    </div>
                ))}

                {newImages.map((img, idx) => (
                    <div key={`new-${idx}`} className="relative group bg-gray-50 dark:bg-black rounded-2xl p-2 border border-emerald-400 dark:border-emerald-700">
                        <img src={img.preview} className="w-full h-32 object-contain rounded-xl bg-white dark:bg-gray-900 mb-2" />
                        <button onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition transform hover:scale-110"><X size={14}/></button>
                        <div className="flex items-center gap-2">
                            <input type="color" value={img.color} onChange={e => updateNewImageColor(idx, e.target.value)} className="w-8 h-8 rounded-full cursor-pointer border-2 border-white dark:border-gray-700 shadow-sm p-0 overflow-hidden" />
                            <input type="text" value={img.color} onChange={e => updateNewImageColor(idx, e.target.value)} className="text-xs font-mono w-full bg-white dark:bg-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-md px-1 py-1 uppercase" maxLength={7}/>
                        </div>
                    </div>
                ))}

                {(existingImages.length + newImages.length) < 7 && (
                    <label className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center h-44 cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition">
                        <Upload className="text-gray-400 dark:text-gray-500 mb-2"/>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{t('upload_img')}</span>
                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                )}
            </div>
        </div>

        {/* 4. TEXNIK XUSUSIYATLAR */}
        <div className="bg-slate-50 dark:bg-gray-900/50 p-6 rounded-[32px] border border-slate-200 dark:border-gray-800 transition-colors">
             <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                <Cpu size={20}/> {t('tech_specs')}
             </h2>
             
             <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                 <div>
                    <label className="spec-label"><Layers size={14}/> {t('screen_type')}</label>
                    <input list="screen-list" className="input-std bg-white dark:bg-black" value={specs.screen} onChange={e => setSpecs({...specs, screen: e.target.value})} />
                    <datalist id="screen-list">{CONSTANTS.screens.map(s => <option key={s} value={s}/>)}</datalist>
                 </div>

                 <div>
                    <label className="spec-label"><Cpu size={14}/> {t('chipset_label')}</label>
                    <input list="chip-list" className="input-std bg-white dark:bg-black" value={specs.chipset} onChange={e => setSpecs({...specs, chipset: e.target.value})} />
                    <datalist id="chip-list">{[...CONSTANTS.chips.android, ...CONSTANTS.chips.ios].map(c => <option key={c} value={c}/>)}</datalist>
                 </div>

                 <div className="md:col-span-2 bg-white dark:bg-black p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
                    <label className="spec-label mb-3"><Globe size={14}/> {t('os_label')}</label>
                    <div className="flex gap-4">
                        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-xl">
                            <button onClick={() => setSpecs({...specs, osType: 'Android'})} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${specs.osType === 'Android' ? 'bg-white dark:bg-gray-800 shadow text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>Android</button>
                            <button onClick={() => setSpecs({...specs, osType: 'iOS'})} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${specs.osType === 'iOS' ? 'bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>iOS</button>
                        </div>
                        <div className="flex-1">
                            <input list="os-list" className="input-std" value={specs.osVer} onChange={e => setSpecs({...specs, osVer: e.target.value})} />
                            <datalist id="os-list">{(specs.osType === 'Android' ? CONSTANTS.os.android : CONSTANTS.os.ios).map(os => <option key={os} value={os}/>)}</datalist>
                        </div>
                    </div>
                 </div>

                 <div className="md:col-span-2 grid md:grid-cols-2 gap-6 bg-white dark:bg-black p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="spec-label mb-0"><Camera size={14}/> {t('main_camera')}</label>
                            <select className="bg-gray-100 dark:bg-gray-900 dark:text-white text-xs font-bold p-1 rounded outline-none" value={specs.camRearCount} onChange={e => setSpecs({...specs, camRearCount: Number(e.target.value)})}>
                                <option value="1">{t('cam_count_1')}</option><option value="2">{t('cam_count_2')}</option><option value="3">{t('cam_count_3')}</option><option value="4">{t('cam_count_4')}</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            {Array.from({length: specs.camRearCount}).map((_, i) => (
                                <input key={i} type="number" placeholder={`${i+1}-MP`} className="input-std px-2 text-center" value={specs.camRearMPs[i] || ''} onChange={e => updateCamMP('rear', i, e.target.value)} />
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="spec-label mb-0"><Camera size={14}/> {t('front_camera')}</label>
                            <select className="bg-gray-100 dark:bg-gray-900 dark:text-white text-xs font-bold p-1 rounded outline-none" value={specs.camFrontCount} onChange={e => setSpecs({...specs, camFrontCount: Number(e.target.value)})}>
                                <option value="1">{t('cam_count_1')}</option><option value="2">{t('cam_count_2')}</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            {Array.from({length: specs.camFrontCount}).map((_, i) => (
                                <input key={i} type="number" placeholder={`${i+1}-MP`} className="input-std px-2 text-center" value={specs.camFrontMPs[i] || ''} onChange={e => updateCamMP('front', i, e.target.value)} />
                            ))}
                        </div>
                    </div>
                 </div>

                 <div>
                    <label className="spec-label"><Battery size={14}/> {t('battery_label')}</label>
                    <div className="relative">
                        <input type="number" className="input-std bg-white dark:bg-black pr-12" value={specs.battery} onChange={e => setSpecs({...specs, battery: e.target.value})} />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">mAh</span>
                    </div>
                 </div>
                 <div>
                    <label className="spec-label"><Scale size={14}/> {t('weight_label')}</label>
                    <div className="relative">
                        <input type="number" className="input-std bg-white dark:bg-black pr-12" value={specs.weight} onChange={e => setSpecs({...specs, weight: e.target.value})} />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">gr</span>
                    </div>
                 </div>
                 <div className="md:col-span-2">
                    <label className="spec-label"><CreditCard size={14}/> {t('sim_label')}</label>
                    <input list="sim-list" className="input-std bg-white dark:bg-black" value={specs.sim} onChange={e => setSpecs({...specs, sim: e.target.value})} />
                    <datalist id="sim-list"><option value="Nano-SIM + eSIM" /><option value="2x Nano-SIM" /><option value="eSIM only" /><option value="2x Nano-SIM + eSIM" /></datalist>
                 </div>
             </div>
        </div>

        {/* 5. MOLIYAVIY VA YETKAZIB BERISH */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Clock className="text-orange-500"/> {t('finance_delivery')}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="spec-label">{t('delivery_days')}</label>
                    <input className="input-std" value={basic.deliveryTime} onChange={e => setBasic({...basic, deliveryTime: e.target.value})} />
                </div>
                <div>
                    <label className="spec-label">{t('prepayment_percent')}</label>
                    <div className="relative">
                        <input type="number" max="100" className="input-std pr-10" value={basic.prepaymentPercent} onChange={e => setBasic({...basic, prepaymentPercent: e.target.value})} />
                        <Percent size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                    </div>
                </div>
            </div>
        </div>

        {/* SAVE BUTTON */}
        <button onClick={handleUpdate} disabled={updating} className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xl hover:shadow-2xl hover:shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
             {updating ? <><Loader2 className="animate-spin" size={24}/> {t('saving')}</> : <><Save size={24}/> {t('save_changes')}</>}
        </button>

      </div>

      <style>{`
        .input-std { 
            width: 100%; 
            padding: 16px; 
            border-radius: 18px; 
            border: 1px solid #e2e8f0; 
            background: #f8fafc; 
            outline: none; 
            font-weight: 600; 
            font-size: 15px; 
            transition: all 0.2s; 
            color: #0f172a;
        }
        
        .dark .input-std {
            background: #000000;
            border-color: #1f2937;
            color: #ffffff;
        }

        .input-std:focus { 
            border-color: #10b981; 
            background: white; 
            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); 
        }

        .dark .input-std:focus {
            background: #000000;
            border-color: #10b981;
            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2); 
        }

        .spec-label { 
            font-size: 0.75rem; 
            font-weight: 800; 
            color: #94a3b8; 
            text-transform: uppercase; 
            margin-bottom: 0.5rem; 
            margin-left: 0.5rem; 
            display: flex; 
            align-items: center; 
            gap: 0.25rem; 
        }
        
        .dark .spec-label {
            color: #9ca3af;
        }
      `}</style>
    </div>
  );
}