import { useEffect, useState } from 'react';
import axios from 'axios';
import { Smartphone, Loader2, Folder, ArrowRight, ShoppingBag, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/swiper-bundle.css';

import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { getImageUrl } from '../utils/image'; // TO'G'IRLANDI

interface Banner {
  id: number;
  image: string;
  title: string | null;
  linkType: 'PRODUCT' | 'CATEGORY' | 'EXTERNAL';
  linkValue: string;
  badgeText: string | null;
  badgeColor: string | null;
  badgeTextColor: string | null;
  badgePosition: string | null;
  isActive: boolean;
}

interface Product {
  id: number;
  name: string;
  price: string; 
  images: string[];
  category: {
    nameUz: string;
    nameRu: string;
  };
}

const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  .font-inter { font-family: 'Inter', sans-serif; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [brands, setBrands] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [addedItems, setAddedItems] = useState<Record<number, boolean>>({});
  
  const { addToCart } = useCart();
  const { t, language } = useLanguage(); 
  const navigate = useNavigate();

  const getBadgePositionClass = (pos: string | null) => {
    switch (pos) {
      case 'top-left': return 'top-4 left-4';
      case 'top-right': return 'top-4 right-4';
      case 'bottom-left': return 'bottom-4 left-4';
      case 'bottom-right': return 'bottom-4 right-4';
      case 'center': return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      default: return 'top-4 right-4';
    }
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [productsRes, bannersRes, categoriesRes] = await Promise.all([
          axios.get(import.meta.env.VITE_API_URL + '/products?activeOnly=true'),
          axios.get(import.meta.env.VITE_API_URL + '/banners'),
          axios.get(import.meta.env.VITE_API_URL + '/categories')
        ]);

        const mixedProducts = productsRes.data.sort(() => Math.random() - 0.5);
        setProducts(mixedProducts);
        setBanners(bannersRes.data.filter((b: Banner) => b.isActive));

        const allBrands: any[] = [];
        categoriesRes.data.forEach((cat: any) => {
           if (cat.children && cat.children.length > 0) {
              allBrands.push(...cat.children);
           }
        });
        setBrands(allBrands);

      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchHomeData();
  }, []);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      id: product.id.toString(),
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      image: getImageUrl(product.images[0]), // TO'G'IRLANDI
    });

    setAddedItems({ ...addedItems, [product.id]: true });
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  const renderBrandIcon = (brand: any) => {
    if (brand.image) {
        // TO'G'IRLANDI: dark:invert olib tashlandi yoki getImageUrl ishlatildi
        return <img src={getImageUrl(brand.image)} className="w-full h-full object-contain filter drop-shadow-sm" alt={brand.nameUz} />;
    }
    if (brand.icon) {
        const IconComponent = (LucideIcons as any)[brand.icon];
        if (IconComponent) return <IconComponent size={48} strokeWidth={1.5} className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors" />;
    }
    return <Folder size={48} strokeWidth={1} className="text-gray-300" />;
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen bg-white dark:bg-black"><Loader2 className="animate-spin text-gray-900 dark:text-white" size={32} /></div>;

  return (
    <div className="pb-32 bg-white dark:bg-black min-h-screen font-inter text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <style>{fontStyle}</style>
      
      {/* === BANNER SLIDER === */}
      {banners.length > 0 && (
        <section className="w-full mb-10 pt-4">
          <Swiper
            centeredSlides={true}
            slidesPerView={1.1}
            spaceBetween={12}
            loop={false}
            breakpoints={{ 768: { slidesPerView: 1.3, spaceBetween: 24 }, 1024: { slidesPerView: 1.5, spaceBetween: 32 } }}
            autoplay={{ delay: 5000, stopOnLastSlide: false }}
            pagination={{ clickable: true, dynamicBullets: true }}
            modules={[Autoplay, Pagination]}
            className="pb-8"
          >
            {banners.map((banner) => (
              <SwiperSlide key={banner.id}>
                <div 
                  className="relative aspect-[2/1] md:aspect-[21/9] cursor-pointer rounded-2xl overflow-hidden shadow-lg dark:shadow-none bg-gray-100 dark:bg-gray-900" 
                  onClick={() => navigate(banner.linkValue)}
                >
                  {/* TO'G'IRLANDI */}
                  <img src={getImageUrl(banner.image)} alt="" className="w-full h-full object-cover" />
                  {banner.badgeText && (
                    <div 
                      className={`absolute px-4 py-1.5 rounded-lg text-xs md:text-sm font-black uppercase tracking-widest shadow-md z-20 ${getBadgePositionClass(banner.badgePosition)}`}
                      style={{ backgroundColor: banner.badgeColor || '#ef4444', color: banner.badgeTextColor || '#fff' }}
                    >
                      {banner.badgeText}
                    </div>
                  )}
                  {banner.title && !banner.badgeText && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-6">
                        <h2 className="text-white text-xl md:text-2xl font-black tracking-tighter leading-none drop-shadow-xl uppercase">{banner.title}</h2>
                      </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      )}

      {/* === BRENDLAR === */}
      <section className="max-w-7xl mx-auto mb-12 pl-4 md:pl-0">
        <h2 className="text-xl md:text-2xl font-black mb-6 tracking-tight">{t('brands')}</h2>
        <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x">
           {brands.map((brand) => (
              <Link to={`/catalog/products/${brand.id}`} key={brand.id} className="group flex flex-col items-center flex-shrink-0 snap-start" style={{ width: '80px' }}>
                 <div className="w-[80px] h-[60px] flex items-center justify-center mb-2 transition-transform duration-300 group-hover:scale-110">
                    {renderBrandIcon(brand)}
                 </div>
                 <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide group-hover:text-blue-600 transition-colors line-clamp-1">
                    {language === 'ru' ? (brand.nameRu || brand.nameUz) : brand.nameUz}
                 </span>
              </Link>
           ))}
        </div>
      </section>

      {/* === MAHSULOTLAR === */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-black tracking-tight">{t('all_products')}</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8">
          {products.map((product) => {
            const price = Number(product.price).toLocaleString();
            const priceSize = price.length > 5 ? 'text-lg md:text-xl' : 'text-xl md:text-2xl';

            return (
              <Link to={`/product/${product.id}`} key={product.id} className="block group relative w-full">
                
                {/* Rasm Kapsulasi (Oq fon) */}
                <div className="relative aspect-[4/5] bg-white rounded-2xl mb-3 flex items-center justify-center p-4 border border-gray-100 dark:border-gray-800/60 shadow-sm dark:shadow-none overflow-hidden">
                    <div className="absolute top-2 left-2 z-10">
                        <span className="px-2 py-0.5 bg-emerald-600 rounded-md text-[9px] font-bold uppercase text-white shadow-sm tracking-wide">
                          {language === 'ru' ? (product.category?.nameRu || product.category?.nameUz) : product.category?.nameUz}
                        </span>
                    </div>
                    {/* TO'G'IRLANDI */}
                    <img src={getImageUrl(product.images[0])} className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-105" alt={product.name} />
                </div>

                {/* Ma'lumot */}
                <div className="px-1 flex flex-col gap-1">
                   <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 h-9 group-hover:text-blue-600 transition-colors">
                       {product.name}
                   </h3>

                   {/* Narx va Savat qatori */}
                   <div className="flex items-center justify-between mt-1.5 gap-1">
                       <div className="flex flex-col min-w-0">
                           <span className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">{t('price')}:</span>
                           <div className="flex items-baseline gap-0.5 text-black dark:text-white">
                               <span className="text-sm font-bold">$</span>
                               <span className={`${priceSize} font-black tracking-tighter truncate`}>
                                   {price}
                               </span>
                           </div>
                       </div>

                       {/* Savat tugmasi */}
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
      </section>

      <style>{`
        .swiper-pagination-bullet { background: #cbd5e1; opacity: 1; width: 6px; height: 6px; transition: all 0.3s; }
        .swiper-pagination-bullet-active { background: #000 !important; width: 20px !important; border-radius: 4px; }
        .dark .swiper-pagination-bullet-active { background: #fff !important; }
      `}</style>
    </div>
  );
}