import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ChevronLeft, Package, Clock, MessageCircle, ChevronDown, ChevronUp 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext'; // QO'SHILDI

// --- FONT STILI ---
const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  .font-inter { font-family: 'Inter', sans-serif; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
`;

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedChat, setExpandedChat] = useState<string | null>(null);
  const { t } = useLanguage(); // QO'SHILDI

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(import.meta.env.VITE_API_URL + '/orders/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (error) {
      console.error("Buyurtmalarni yuklashda xato", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchOrders();
  }, []);

  const handleMarkAsRead = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      const encodedId = encodeURIComponent(orderId);
     await axios.patch(`${import.meta.env.VITE_API_URL}/orders/${encodedId}/read`, {}, {
    headers: { Authorization: `Bearer ${token}` }
});
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, isMessageRead: true } : o));
    } catch (e) {}
  };

  // --- XAVFSIZ PARSE FUNKSIYASI ---
  const parseMessages = (msgStr: any) => {
    if (!msgStr) return []; 
    try {
      const parsed = JSON.parse(msgStr);
      return Array.isArray(parsed) ? parsed : [{ text: msgStr, date: new Date() }];
    } catch (e) {
      return [{ text: String(msgStr), date: new Date() }];
    }
  };

  if (loading) return (
    <div className="min-h-full flex items-center justify-center bg-white dark:bg-black font-inter pb-[200px]">
      <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-full bg-white dark:bg-black font-inter pb-[200px] transition-colors duration-300">
      <style>{fontStyle}</style>

      {/* HEADER */}
      <div className="sticky top-0 z-40 w-full bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="relative max-w-md mx-auto h-[60px] px-4 flex items-center">
            <button 
                onClick={() => navigate(-1)} 
                className="group flex items-center gap-1 pl-2 pr-4 py-2 bg-emerald-600 rounded-full text-white active:scale-95 transition-all duration-300 z-10"
            >
                <ChevronLeft size={18} strokeWidth={2} />
                <span className="text-xs tracking-wide font-medium">{t('back')}</span>
            </button>
            <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                {t('my_orders')}
            </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-6 mt-2">
        {orders.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-center">
               <Package size={48} className="text-gray-400 mb-4" />
               <h2 className="text-2xl font-bold dark:text-white">{t('no_orders')}</h2>
           </div>
        ) : (
           orders.map((order) => {
               const createdDate = new Date(order.createdAt).getTime();
               const passedDays = Math.floor((new Date().getTime() - createdDate) / (1000 * 3600 * 24));
               const deliveryDays = order.deliveryDays || 15;
               const daysLeft = Math.max(0, deliveryDays - passedDays);
               const progressPercent = Math.min(100, (passedDays / deliveryDays) * 100);

               const messages = parseMessages(order.adminMessage);
               const isNewMessage = messages.length > 0 && !order.isMessageRead;
               const isExpanded = expandedChat === order.id;

               return (
                 <div key={order.id} className="bg-white dark:bg-black p-5 sm:p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 relative transition-all shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] dark:shadow-none mb-6">
                    
                    {/* STATUS HEADER */}
                    <div className="flex justify-between items-center mb-6 border-b border-gray-50 dark:border-gray-900 pb-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-gray-500 mb-1">{order.id}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-colors ${
                            order.status === 'APPROVED' || order.status === 'CONFIRMED' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10' :
                            'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                            {order.status === 'APPROVED' || order.status === 'CONFIRMED' ? t('order_accepted') : t('order_pending')}
                        </div>
                    </div>

                    {/* ITEMS */}
                    <div className="space-y-4 mb-8">
                        {order.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-4 items-center">
                                <div className="w-14 h-14 bg-gray-50 dark:bg-gray-900 rounded-2xl flex-shrink-0 p-2 border border-gray-100 dark:border-gray-800">
                                    <img src={item.product?.images?.[0]} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{item.product?.name}</h3>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase">{item.config} | {item.quantity} {t('pieces')}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* --- ADMIN XABARLARI (Timeline/Chat uslubida) --- */}
                    {messages.length > 0 && (
                        <div 
                          className={`mb-6 rounded-[28px] overflow-hidden border transition-all duration-500 ${
                            isNewMessage 
                            ? 'bg-emerald-600 border-emerald-500 shadow-lg shadow-emerald-600/20' 
                            : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800'
                          }`}
                        >
                            <div 
                              onClick={() => {
                                setExpandedChat(isExpanded ? null : order.id);
                                if (isNewMessage) handleMarkAsRead(order.id);
                              }}
                              className="p-4 flex items-center justify-between cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${isNewMessage ? 'bg-white/20' : 'bg-white dark:bg-black shadow-sm text-emerald-500'}`}>
                                        <MessageCircle size={20} className={isNewMessage ? "animate-pulse" : ""} />
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${isNewMessage ? 'text-white/80' : 'text-emerald-500/80'}`}>
                                            ImportMobile Update {messages.length > 1 && `(${messages.length})`}
                                        </p>
                                        <p className={`text-xs font-bold line-clamp-1 ${isNewMessage ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}>
                                            {/* XAVFSIZ REPLACE AMALI */}
                                            {String(messages[0].text || '').replace('#IMPRT', '')}
                                        </p>
                                    </div>
                                </div>
                                <div className={isNewMessage ? 'text-white' : 'text-gray-400'}>
                                    {isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="px-4 pb-4 space-y-3 max-h-[200px] overflow-y-auto no-scrollbar border-t border-black/5 dark:border-white/5 pt-3">
                                    {messages.map((m: any, i: number) => (
                                        <div key={i} className={`p-3 rounded-2xl ${isNewMessage ? 'bg-white/10' : 'bg-white dark:bg-black/50 border dark:border-gray-800'}`}>
                                            <p className={`text-xs font-medium leading-relaxed ${isNewMessage ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                                {String(m.text || '').replace('#IMPRT', '')}
                                            </p>
                                            <p className={`text-[9px] mt-1 font-bold ${isNewMessage ? 'text-white/50' : 'text-gray-400'}`}>
                                                {new Date(m.date).toLocaleString('uz-UZ', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* PROGRESS BAR */}
                    {(order.status === 'APPROVED' || order.status === 'CONFIRMED') && (
                        <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-[24px] border border-gray-100 dark:border-gray-800">
                            <div className="flex justify-between items-end mb-4">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Clock size={16} strokeWidth={2.5} /> 
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{t('delivery')}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xl font-black text-gray-900 dark:text-white">{daysLeft} {t('days')}</span>
                                </div>
                            </div>
                            <div className="h-2.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 pt-6 border-t border-gray-50 dark:border-gray-800 flex justify-between items-end">
                        <span className="text-[10px] font-black text-gray-400 uppercase mb-1">{t('total_amount_short')}</span>
                        <span className="text-xl sm:text-2xl font-black text-emerald-600">
                          {Number(order.totalPrice).toLocaleString()} <span className="text-sm font-medium text-gray-500">$</span>
                        </span>
                    </div>
                 </div>
               );
           })
        )}
      </div>
    </div>
  );
}