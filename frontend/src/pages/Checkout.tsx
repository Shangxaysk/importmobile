import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import { 
  Upload, AlertTriangle, X, Clock, ShieldCheck, 
  ChevronLeft, MapPin, Phone, CreditCard, Receipt, Send, Layers, Smartphone, CheckCircle2, Lock
} from 'lucide-react';
import { getImageUrl } from '../utils/image';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { t, language } = useLanguage(); 
  
  const [enrichedCart, setEnrichedCart] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [adminCard, setAdminCard] = useState({ number: '', holder: '' });
  
  const [globalSettings, setGlobalSettings] = useState({ isOrdersEnabled: true, restModeMessage: '' });
  const [showRestModal, setShowRestModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [form, setForm] = useState({
    address: '',
    extraPhone: '', 
    telegramUser: '',
    comment: '',
    passportSeria: '',
    passportNumber: '',
    paymentReceipt: '' 
  });

  const [displayExtraPhone, setDisplayExtraPhone] = useState('+998 ');
  const [showWarning, setShowWarning] = useState(false);
  const [timer, setTimer] = useState(10);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const formatPhoneNumber = (input: string) => {
    let clean = input.replace(/\D/g, '');
    if (clean.startsWith('998')) clean = clean.substring(3);
    if (clean.length > 9) clean = clean.substring(0, 9);
    let formatted = '+998 ';
    if (clean.length > 0) formatted += clean.substring(0, 2);
    if (clean.length > 2) formatted += ' ' + clean.substring(2, 5);
    if (clean.length > 5) formatted += ' ' + clean.substring(5, 7);
    if (clean.length > 7) formatted += ' ' + clean.substring(7, 9);
    return { clean: '998' + clean, formatted };
  };

  const formattedUserPhone = user?.phone ? formatPhoneNumber(user.phone).formatted : '';

  useEffect(() => {
    if (cart.length === 0) {
        navigate('/cart');
        return;
    }

    const fetchData = async () => {
      try {
        // DIQQAT: API manzillari to'g'rilandi. Bitta murojaatda ham karta, ham tizim holati keladi
        const [prodRes, globalRes] = await Promise.all([
          axios.get(import.meta.env.VITE_API_URL + '/products'),
          axios.get(import.meta.env.VITE_API_URL + '/admin-settings') 
        ]);

        const mappedCart = cart.map(cartItem => {
            const prod = prodRes.data.find((p: any) => p.id.toString() === cartItem.id.toString());
            const percent = prod?.prepaymentPercent ? Number(prod.prepaymentPercent) : 100;
            return { ...cartItem, prepaymentPercent: percent };
        });
        setEnrichedCart(mappedCart);

        if(globalRes.data) {
          // Kartani set qilamiz
          setAdminCard({ 
            number: globalRes.data.cardNumber, 
            holder: globalRes.data.cardHolder 
          });

          // Tizim holatini set qilamiz
          let messageToDisplay = '';
          try {
            const parsedMsg = JSON.parse(globalRes.data.restModeMessage);
            messageToDisplay = language === 'ru' ? parsedMsg.ru : parsedMsg.uz; 
          } catch(e) {
            messageToDisplay = globalRes.data.restModeMessage; 
          }

          setGlobalSettings({
            isOrdersEnabled: globalRes.data.isOrdersEnabled,
            restModeMessage: messageToDisplay || ''
          });
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setEnrichedCart(cart.map(c => ({ ...c, prepaymentPercent: 100 })));
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [cart, navigate, language]);

  useEffect(() => {
    let interval: any;
    if (showWarning && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [showWarning, timer]);

  const copyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    if(!adminCard.number) return;
    navigator.clipboard.writeText(adminCard.number.replace(/\s/g, ''));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleExtraPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { clean, formatted } = formatPhoneNumber(e.target.value);
    setForm({ ...form, extraPhone: clean });
    setDisplayExtraPhone(formatted);
  };

  const handleImageUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file); 
    setUploading(true);
    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + '/upload', formData);
      setForm({ ...form, paymentReceipt: res.data.secure_url || res.data.url });
    } catch (err) {
      alert(t('error'));
    } finally {
      setUploading(false);
    }
  };

  const handlePreSubmit = (e: any) => {
    e.preventDefault();
    if (!globalSettings.isOrdersEnabled) {
      setShowRestModal(true);
      return;
    }
    if (!form.address || !form.passportSeria || !form.passportNumber || !form.paymentReceipt) {
      alert(t('fill_required_fields'));
      return;
    }
    setShowWarning(true);
  };

  const totalFullPrice = enrichedCart.reduce((total, item) => total + (Number(item.price) * Number(item.quantity)), 0);
  const totalPrepayment = enrichedCart.reduce((total, item) => {
      const itemFullPrice = Number(item.price) * Number(item.quantity);
      return total + (itemFullPrice * item.prepaymentPercent) / 100;
  }, 0);

  const handleFinalSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    
    setLoading(true);
    try {
      const orderData = {
        ...form,
        contactPhone: user?.phone || form.extraPhone || t('not_entered'),
        passportPinfl: t('not_entered'),
        totalPrice: Number(totalFullPrice),
        items: enrichedCart.map((item) => ({
            productId: Number(item.id),
            quantity: Number(item.quantity),
            price: Number(item.price), 
            config: item.selectedOptions ? Object.values(item.selectedOptions).join(', ') : ''
        }))
      };

      await axios.post(import.meta.env.VITE_API_URL + '/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      clearCart();
      setShowWarning(false);
      navigate('/account'); 
    } catch (err: any) {
      alert(t('server_error'));
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingData) return <div className="min-h-screen flex items-center justify-center dark:bg-black"><div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black font-inter pb-32 transition-colors duration-300">
      
      {/* BILDIRISHNOMA */}
      <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className="bg-gray-900 dark:bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-xl">
           <CheckCircle2 size={20} className="text-emerald-400 dark:text-white" />
           <span className="text-sm font-black uppercase tracking-widest">{t('card_copied')}</span>
        </div>
      </div>

      {/* HEADER */}
      <div className="sticky top-0 z-40 w-full bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="relative max-w-md mx-auto h-[60px] px-4 flex items-center">
            <button onClick={() => navigate(-1)} className="group flex items-center gap-1 pl-2 pr-4 py-2 bg-emerald-600 rounded-full text-white active:scale-95 transition-all duration-300 z-10">
                <ChevronLeft size={18} strokeWidth={2} />
                <span className="text-xs tracking-wide font-medium">{t('back')}</span>
            </button>
            <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('checkout_title')}</h1>
        </div>
      </div>

      <form onSubmit={handlePreSubmit} className="max-w-3xl mx-auto p-4 space-y-6 mt-2">
        {/* ALOQA VA MANZIL */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="font-black text-lg mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
            <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-2 rounded-xl"><Phone size={20}/></span> {t('contact_and_address')}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-2 mb-1 block">{t('phone_main')}</label>
              <input value={formattedUserPhone} disabled className="w-full p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 font-bold border border-transparent cursor-not-allowed tracking-wider" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-2 mb-1 block">{t('extra_phone')}</label>
                    <input type="tel" value={displayExtraPhone} onChange={handleExtraPhoneChange} placeholder="+998 XX XXX XX XX" className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 dark:text-white font-bold tracking-wider focus:border-emerald-500 outline-none transition" />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-2 mb-1 block">{t('telegram_user')}</label>
                    <input name="telegramUser" value={form.telegramUser} onChange={(e) => setForm({...form, telegramUser: e.target.value})} placeholder="@username" className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 dark:text-white font-medium focus:border-emerald-500 outline-none transition" />
                </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-2 mb-1 block">{t('address_label')} <span className="text-red-500">*</span></label>
              <textarea name="address" required value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} placeholder={t('address_placeholder')} rows={3} className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 dark:text-white font-medium focus:border-emerald-500 outline-none transition resize-none"></textarea>
            </div>
          </div>
        </div>

        {/* BOJXONA MA'LUMOTLARI */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 pointer-events-none"><ShieldCheck size={100}/></div>
          <h2 className="font-black text-lg mb-2 flex items-center gap-3 text-gray-900 dark:text-white relative z-10">
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-xl"><CreditCard size={20}/></span> {t('customs_info')}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 relative z-10 leading-relaxed">{t('customs_desc')}</p>
          <div className="flex gap-4 relative z-10">
             <div className="w-1/3">
                <label className="text-xs font-bold text-gray-400 uppercase ml-2 mb-1 block">{t('passport_seria')} *</label>
                <input name="passportSeria" required maxLength={2} value={form.passportSeria} onChange={e => setForm({...form, passportSeria: e.target.value.toUpperCase()})} placeholder="AA" className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 dark:text-white font-bold text-center uppercase focus:border-emerald-500 outline-none transition" />
             </div>
             <div className="w-2/3">
                <label className="text-xs font-bold text-gray-400 uppercase ml-2 mb-1 block">{t('passport_number')} *</label>
                <input name="passportNumber" required maxLength={7} type="number" value={form.passportNumber} onChange={(e) => setForm({...form, passportNumber: e.target.value})} placeholder="1234567" className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 dark:text-white font-bold text-center tracking-widest focus:border-emerald-500 outline-none transition" />
             </div>
          </div>
        </div>

        {/* TO'LOV KARTASI */}
        <div 
          className="w-full bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-[32px] p-6 md:p-8 text-white shadow-xl shadow-emerald-600/20 relative overflow-hidden transition-all active:scale-[0.98] cursor-pointer group"
          onClick={copyToClipboard}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
              <div className="bg-white/20 px-4 py-1.5 rounded-xl backdrop-blur-md border border-white/10 shadow-sm flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.1em]">{t('payment_method')}</span>
              </div>
              <div className="h-7 w-10 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded-lg shadow-inner opacity-90"></div>
            </div>
            
            <div className="space-y-1 mb-8 relative">
              <p className="text-[10px] font-bold uppercase opacity-80 ml-1 tracking-widest">{t('card_number')}</p>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-2xl md:text-3xl font-black tracking-[0.15em] drop-shadow-lg font-mono">
                  {adminCard.number || "0000 0000 0000 0000"}
                </h3>
                <div className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl transition-colors shadow-sm">
                   <Layers size={20} />
                </div>
              </div>
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase opacity-80 mb-0.5 tracking-widest">{t('card_holder')}</p>
              <p className="text-base font-black uppercase tracking-wide drop-shadow-md">{adminCard.holder || "ADMIN"}</p>
            </div>
          </div>
        </div>

        {/* TO'LOV CHEKI VA SUMMA */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="font-black text-lg mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
            <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-2 rounded-xl"><Receipt size={20}/></span> {t('payment_receipt')}
          </h2>
          <div className="mb-6 bg-gray-50 dark:bg-black p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-gray-500 uppercase">{t('total_amount')}</span>
                  <span className="text-sm font-bold text-gray-400 line-through">{totalFullPrice.toLocaleString()} $</span>
              </div>
              <div className="flex justify-between items-end">
                  <div>
                      <span className="text-xs font-black text-emerald-600 uppercase tracking-wider block mb-1">{t('amount_to_pay')}</span>
                      <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{totalPrepayment.toLocaleString()} $</span>
                  </div>
              </div>
          </div>
          <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
             {form.paymentReceipt ? (
               <div className="relative w-full max-w-[200px] mx-auto">
                 <img src={getImageUrl(form.paymentReceipt)} className="rounded-xl shadow-md w-full" alt="Receipt" />
                 <button type="button" onClick={() => setForm({...form, paymentReceipt: ''})} className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-lg hover:scale-110 transition"><X size={16}/></button>
               </div>
             ) : (
               <label className="cursor-pointer flex flex-col items-center gap-3 py-6">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600">
                      {uploading ? <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div> : <Upload size={28} />}
                  </div>
                  <span className="font-bold text-gray-600 dark:text-gray-300">{t('upload_receipt')}</span>
                  <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
               </label>
             )}
          </div>
          <div className="mt-6">
             <label className="text-xs font-bold text-gray-400 uppercase ml-2 mb-1 block">{t('comment_label')}</label>
             <textarea name="comment" maxLength={300} value={form.comment} onChange={(e) => setForm({...form, comment: e.target.value})} placeholder={t('comment_placeholder')} rows={2} className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 dark:text-white font-medium focus:border-emerald-500 outline-none transition resize-none"></textarea>
          </div>
        </div>
      </form>

      {/* FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 z-[70] bg-white/90 dark:bg-black/90 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800 pb-safe">
         <div className="max-w-3xl mx-auto px-5 py-4 flex items-center gap-4">
            <div className="flex-1">
                <p className="text-xs font-bold text-gray-400 uppercase mb-0.5">{t('amount_to_pay')}</p>
                <p className="text-xl font-black text-emerald-600">{totalPrepayment.toLocaleString()} $</p>
            </div>
            <button onClick={handlePreSubmit} className="h-[54px] px-8 bg-emerald-600 text-white font-black text-sm rounded-[20px] shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-wide">
                {t('confirm')} <Send size={18}/>
            </button>
         </div>
      </div>

      {/* WARNING MODAL (ESKI) */}
      {showWarning && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in pb-safe">
           <div className="bg-white dark:bg-gray-900 w-full max-w-md md:rounded-[32px] rounded-t-[32px] p-6 shadow-2xl relative">
              <div className="flex justify-center mb-4">
                 <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600"><ShieldCheck size={40} /></div>
              </div>
              <h3 className="text-2xl font-black text-center mb-2 dark:text-white tracking-tight">{t('security_guarantee')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6 leading-relaxed">{t('security_desc')}</p>
              {timer > 0 && (
                <div className="flex justify-center items-center gap-2 text-orange-500 font-bold bg-orange-50 dark:bg-orange-900/10 py-3 rounded-2xl mb-6">
                   <Clock size={20} className="animate-pulse" /> {t('wait_seconds').replace('{{time}}', timer.toString())}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 mt-2">
                 <button onClick={() => setShowWarning(false)} className="py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-black text-sm uppercase">{t('reject')}</button>
                 <button onClick={handleFinalSubmit} disabled={timer > 0 || loading} className={`py-4 rounded-2xl font-black text-sm uppercase transition flex justify-center items-center gap-2 ${timer > 0 ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'}`}>
                   {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : t('agree')}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* --- YANGI: TIZIM DAM OLISH REJIMI MODALI --- */}
      {showRestModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in pb-safe">
          <div className="bg-white dark:bg-gray-900 rounded-[40px] p-8 max-w-sm w-full text-center shadow-2xl border border-gray-100 dark:border-gray-800 relative">
            <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock size={36} />
            </div>
            <h2 className="text-2xl font-black mb-4 dark:text-white uppercase tracking-tight">
              {t('service_paused')}
            </h2>
            
            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed text-sm font-medium">
              {globalSettings.restModeMessage || t('default_rest_message')}
            </p>
            
            <a href="https://t.me/importmobile_uz" target="_blank" rel="noopener noreferrer" className="block w-full py-4 bg-emerald-600 hover:bg-emerald-700 transition-colors text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] mb-3 shadow-lg shadow-emerald-600/20">
              {t('telegram_channel')}
            </a>
            
            <button onClick={() => setShowRestModal(false)} className="text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition">
              {t('close_btn')}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}