import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    ChevronLeft, ShoppingBag, Truck, Heart, Share2, 
    Smartphone, Cpu, Camera, Battery, Globe, CreditCard, Scale,
    Minus, Plus, CheckCircle, X, Maximize2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext'; // QO'SHILDI
import { useWishlist } from '../context/WishlistContext';

// --- FONT STILI ---
const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  .font-inter { font-family: 'Inter', sans-serif; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
`;

const Toast = ({ message, show, onClose }: any) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);
  if (!show) return null;
  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-fade-in">
      <div className="bg-black/80 dark:bg-white/90 backdrop-blur-md text-white dark:text-black px-6 py-3 rounded-full flex items-center gap-3 font-medium text-sm">
        <CheckCircle size={18} className="text-emerald-500" /> {message}
      </div>
    </div>
  );
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { t } = useLanguage(); // QO'SHILDI
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  
  const [parsedSpecs, setParsedSpecs] = useState<any>(null);
  const [isImageOpen, setIsImageOpen] = useState(false);
  
  const [variants, setVariants] = useState<any[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [activeVariant, setActiveVariant] = useState<any>(null);
  const [activeColor, setActiveColor] = useState<string>("");
  const [mainImage, setMainImage] = useState<string>(""); 

  useEffect(() => {
    window.scrollTo(0, 0);
   axios.get(`${import.meta.env.VITE_API_URL}/products/${id}`)
  .then((res) => {
    const data = res.data;
    setProduct(data);
    
    if (data.images && data.images.length > 0) {
      // Rasmni ko'rsatishda ham ehtiyot bo'ling: 
      // Agar bazada rasm yo'li to'liq bo'lmasa, API URL ni qo'shish kerak bo'ladi
      setMainImage(data.images[0]);
    }

        if (data.specifications) {
            try {
                const specs = typeof data.specifications === 'string' ? JSON.parse(data.specifications) : data.specifications;
                setParsedSpecs(specs);
                
                const v = data.variants ? (typeof data.variants === 'string' ? JSON.parse(data.variants) : data.variants) : (specs.variants || []);
                setVariants(v);
                if (v.length > 0) setActiveVariant(v[0]);

                const c = data.colors ? (typeof data.colors === 'string' ? JSON.parse(data.colors) : data.colors) : (specs.colors || []);
                setColors(c);
                if (c.length > 0) setActiveColor(c[0]);

            } catch (e) { setParsedSpecs({}); }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      const finalPrice = activeVariant ? Number(activeVariant.price) : Number(product.price);
      addToCart({ 
        id: product.id.toString(), 
        name: product.name, 
        price: finalPrice, 
        quantity, 
        image: mainImage, 
        selectedOptions: { 
            ram: activeVariant?.ram, 
            rom: activeVariant?.rom, 
            color: activeColor 
        } 
      });
      setShowToast(true);
    }
  };

  const handleWishlist = () => {
    if (product) {
      toggleWishlist({
        id: product.id.toString(),
        name: product.name,
        price: activeVariant ? Number(activeVariant.price) : Number(product.price),
        image: mainImage
      });
    }
  };

  if (loading || !product) return (
    <div className="min-h-screen flex justify-center items-center bg-white dark:bg-black font-inter">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-emerald-600 rounded-full animate-spin"></div>
    </div>
  );

  const isFavorite = isInWishlist(product.id.toString());
  const currentPrice = activeVariant ? activeVariant.price : product.price;

  const SPEC_KEYS = ['screen', 'chipset', 'cameraRear', 'cameraFront', 'battery', 'os', 'sim', 'weight'];
  const SPEC_MAP: any = {
    screen:      { icon: Smartphone, label: t('spec_screen') },
    chipset:     { icon: Cpu, label: t('spec_chipset') },
    cameraRear:  { icon: Camera, label: t('spec_camera_rear') },
    cameraFront: { icon: Camera, label: t('spec_camera_front') },
    battery:     { icon: Battery, label: t('spec_battery') },
    os:          { icon: Globe, label: t('spec_os') },
    sim:         { icon: CreditCard, label: t('spec_sim') },
    weight:      { icon: Scale, label: t('spec_weight') },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 font-inter pb-[100px] transition-colors duration-300">
      <style>{fontStyle}</style>
      <Toast message={t('added_to_cart')} show={showToast} onClose={() => setShowToast(false)} />

      {/* --- FULL SCREEN IMAGE MODAL --- */}
      {isImageOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsImageOpen(false)}>
            <button className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition">
                <X size={24} />
            </button>
            <img src={mainImage} alt={product.name} className="max-w-full max-h-full object-contain" />
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="sticky top-0 z-40 w-full bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="relative max-w-5xl mx-auto h-[60px] px-4 flex items-center justify-between">
            <button 
                onClick={() => navigate(-1)} 
                className="group flex items-center gap-1 pl-2 pr-4 py-2 bg-emerald-600 rounded-full text-white active:scale-95 hover:bg-emerald-700 transition-all duration-300 z-10"
            >
                <ChevronLeft size={18} strokeWidth={2} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs tracking-wide font-medium">{t('back')}</span>
            </button>
            
            <div className="flex gap-3 z-10">
                <button onClick={handleWishlist} className="active:scale-90 transition text-gray-900 dark:text-white">
                   <Heart size={22} strokeWidth={1.5} className={isFavorite ? "fill-red-500 text-red-500 border-none" : ""} />
                </button>
                <button className="active:scale-90 transition text-gray-900 dark:text-white">
                   <Share2 size={22} strokeWidth={1.5} />
                </button>
            </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
          {/* --- 1. RASM QISMI --- */}
          <div 
             className="relative w-full aspect-square md:aspect-[4/3] bg-white flex items-center justify-center cursor-zoom-in border-b border-gray-100 dark:border-gray-800"
             onClick={() => setIsImageOpen(true)}
          >
             <img src={mainImage} className="w-[80%] h-[80%] object-contain mix-blend-multiply transition-all duration-300" alt={product.name} />
             <div className="absolute bottom-4 right-4 bg-gray-100 p-2 rounded-full opacity-50"><Maximize2 size={16} className="text-black" /></div>
          </div>

          {/* --- 2. MA'LUMOTLAR QISMI --- */}
          <div className="px-5 py-6 flex flex-col gap-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white leading-tight mb-2">{product.name}</h1>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{Number(currentPrice).toLocaleString()}</span>
                    <span className="text-base text-gray-500 font-medium">$</span>
                </div>
            </div>

            {/* RAM/ROM VARIANTLARI */}
            {variants.length > 0 && (
                <div>
                    <span className="text-sm text-gray-500 mb-3 block font-medium">{t('memory')}</span>
                    <div className="flex flex-wrap gap-2">
                        {variants.map((v: any, idx: number) => {
                            const isActive = activeVariant && activeVariant.ram === v.ram && activeVariant.rom === v.rom;
                            return (
                                <button 
                                    key={idx} onClick={() => setActiveVariant(v)}
                                    className={`px-5 py-2 rounded-xl text-sm font-medium transition-all border ${
                                        isActive 
                                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                                        : 'border-gray-200 bg-transparent text-gray-600 dark:border-gray-800 dark:text-gray-400 hover:border-emerald-400/50'
                                    }`}
                                >
                                    {v.ram}/{v.rom} GB
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* RANGLAR */}
            {colors.length > 0 && (
                <div>
                    <span className="text-sm text-gray-500 mb-3 block font-medium">{t('color')}</span>
                    <div className="flex flex-wrap gap-3">
                        {colors.map((hex: string, idx: number) => {
                            const isSelected = activeColor === hex;
                            return (
                                <button
                                   key={idx} 
                                   onClick={() => {
                                       setActiveColor(hex);
                                       if (product.images[idx]) {
                                           setMainImage(product.images[idx]);
                                       }
                                   }}
                                   className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isSelected ? 'ring-2 ring-offset-2 ring-emerald-500 dark:ring-offset-black' : 'hover:scale-110'}`}
                                >
                                   <div className="w-full h-full rounded-full border border-gray-200 dark:border-gray-700 shadow-sm" style={{ backgroundColor: hex }}></div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* TEXNIK XUSUSIYATLAR */}
            <div className="pt-2">
                <div className="flex flex-col gap-3">
                    {SPEC_KEYS.map((key) => {
                        let value = parsedSpecs?.[key];
                        const meta = SPEC_MAP[key];
                        if (!value || !meta) return null;
                        return (
                            <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-900 last:border-0">
                                <div className="flex items-center gap-3 text-gray-500"><meta.icon size={18} strokeWidth={1.5} /><span className="text-sm font-medium">{meta.label}</span></div>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-200 text-right max-w-[60%]">{value}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div>
               <h3 className="text-base font-semibold mb-2 dark:text-white">{t('product_about')}</h3>
               <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{product.description}</p>
            </div>

            <div className="flex items-center gap-3 py-2 text-gray-600 dark:text-gray-400">
                <Truck size={20} strokeWidth={1.5} className="text-emerald-600" />
                <span className="text-sm font-medium">{t('delivery_time').replace('{{time}}', product.deliveryTime || "3-5")}</span>
            </div>
          </div>
      </div>

      {/* --- FOOTER --- */}
      <div className="fixed bottom-0 left-0 right-0 z-[70] bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800">
         <div className="max-w-3xl mx-auto px-5 py-3 flex items-center gap-4">
            <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-[18px] h-[60px] px-1">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white"><Minus size={18}/></button>
                <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white"><Plus size={18}/></button>
            </div>

            <button 
                onClick={handleAddToCart}
                className="flex-1 h-[60px] bg-emerald-600 text-white font-medium text-sm rounded-[18px] hover:bg-emerald-700 active:bg-emerald-800 transition-colors flex items-center justify-center gap-2"
            >
                <ShoppingBag size={18} /><span>{t('add_to_cart_btn')}</span>
            </button>
         </div>
         <div className="h-[env(safe-area-inset-bottom)] bg-white dark:bg-black"></div>
      </div>
    </div>
  );
}