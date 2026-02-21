import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { 
  CheckCircle, Ban, Package, Eye, X, 
  Send, MessageCircle, Clock, Filter, Search, MapPin, ChevronRight, AlertTriangle 
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); 
  const { t } = useLanguage();

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [previewOrder, setPreviewOrder] = useState<any>(null);

  const [updateMsg, setUpdateMsg] = useState("");
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  const fetchOrders = useCallback(async (isAuto = false) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(import.meta.env.VITE_API_URL + '/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      if (!isAuto) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 30000); 
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (id: string, action: string, reason: string = "") => {
    if (!id) return;
    try {
      const token = localStorage.getItem('token');
      const encodedId = encodeURIComponent(id);
      
      await axios.patch(`${import.meta.env.VITE_API_URL}/orders/${encodedId}/status`, 
    { action, reason }, 
    { headers: { Authorization: `Bearer ${token}` } }
);
      
      setShowRejectModal(false);
      setPreviewOrder(null);
      setRejectReason("");
      setSelectedOrder(null);
      fetchOrders(); 
    } catch (err: any) {
      alert(t('error') + ": " + (err.response?.data?.message || ""));
    }
  };

  const sendImprtUpdate = async (orderId: string) => {
    if (!updateMsg.trim()) return;
    setIsSendingMsg(true);
    try {
      const token = localStorage.getItem('token');
      const encodedId = encodeURIComponent(orderId);
      
      await axios.post(`${import.meta.env.VITE_API_URL}/orders/${encodedId}/message`, 
        { message: `#IMPRT ${updateMsg}` }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setUpdateMsg("");
      fetchOrders(true);
      alert(t('msg_sent_success'));
    } catch (err: any) {
      alert(t('error') + ": " + (err.response?.data?.message || t('msg_sent_error')));
    } finally {
      setIsSendingMsg(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: any = {
      NEW: { label: t('status_new'), style: "bg-blue-500/10 text-blue-600 border-blue-200" },
      APPROVED: { label: t('status_approved'), style: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
      CONFIRMED: { label: t('status_confirmed'), style: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
      WAITING_CHECK: { label: t('status_waiting'), style: "bg-orange-500/10 text-orange-600 border-orange-200" },
      REJECTED: { label: t('status_rejected'), style: "bg-red-500/10 text-red-600 border-red-200" },
      CANCELLED: { label: t('status_cancelled'), style: "bg-red-500/10 text-red-600 border-red-200" },
    };
    const item = config[status] || { label: status || t('status_unknown'), style: "bg-gray-100" };
    return <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${item.style}`}>{item.label}</span>;
  };

  const filteredOrders = filter === 'ALL' ? orders : orders.filter(o => {
    if (filter === 'NEW') return o.status === 'NEW' || o.status === 'WAITING_CHECK';
    if (filter === 'APPROVED') return o.status === 'APPROVED' || o.status === 'CONFIRMED';
    if (filter === 'REJECTED') return o.status === 'REJECTED' || o.status === 'CANCELLED';
    return true;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center dark:bg-black font-inter">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-black uppercase tracking-widest text-xs text-center">{t('loading')}</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-black min-h-screen font-inter transition-colors duration-300">
      
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight uppercase">
                <Package className="text-emerald-600" size={32} /> {t('admin_orders_title')}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-gray-500 dark:text-gray-400 font-medium italic">{t('admin_system')}</p>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{t('live_broadcast')}</span>
              </div>
          </div>

          <div className="flex bg-white dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto no-scrollbar">
              {[
                { id: 'ALL', label: t('filter_all') },
                { id: 'NEW', label: t('filter_new') },
                { id: 'APPROVED', label: t('filter_approved') },
                { id: 'REJECTED', label: t('filter_rejected') }
              ].map(f => (
                  <button 
                    key={f.id} 
                    onClick={() => setFilter(f.id)} 
                    className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${filter === f.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                      {f.label}
                  </button>
              ))}
          </div>
      </div>

      <div className="max-w-6xl mx-auto grid gap-6">
        {filteredOrders.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-[32px] p-20 text-center border border-gray-100 dark:border-gray-800 shadow-sm">
                <Filter className="mx-auto text-gray-200 mb-4" size={64}/>
                <h3 className="text-xl font-bold text-gray-400 italic">{t('empty_orders')}</h3>
            </div>
        ) : (
            filteredOrders.map((order) => (
                <div key={order.id} className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden group transition-all hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-none">
                    <div className="flex flex-col lg:flex-row">
                        
                        <div className="flex-1 p-6 md:p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded tracking-tighter uppercase">{order.id}</span>
                                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><Clock size={12}/> {new Date(order.createdAt).toLocaleString('uz-UZ')}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{order.user?.fullName || t('customer_unknown')}</h3>
                                    <p className="text-sm font-bold text-emerald-600/80">{order.contactPhone}</p>
                                </div>
                                {getStatusBadge(order.status)}
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Search size={12}/> {t('cart_label')}</p>
                                    <div className="space-y-2">
                                        {order.items?.map((item: any, i: number) => (
                                            <div key={i} className="flex justify-between items-center bg-gray-50 dark:bg-black/40 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                                                <span className="text-sm font-bold dark:text-gray-300">{item.product?.name} <span className="text-xs text-gray-400">({item.config})</span></span>
                                                <span className="text-sm font-black text-gray-900 dark:text-white">x{item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-2 flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-400">{t('total_amount_order')}</span>
                                        <span className="text-xl font-black text-emerald-600">{Number(order.totalPrice).toLocaleString()} $</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><MapPin size={12}/> {t('delivery_address')}</p>
                                    <div className="bg-gray-50 dark:bg-black/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 h-full min-h-[100px]">
                                        <p className="text-xs font-bold text-gray-600 dark:text-gray-400 leading-relaxed italic">"{order.address}"</p>
                                        {order.comment && (
                                          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/20">
                                            <p className="text-[10px] text-orange-600 font-black uppercase tracking-widest mb-1">{t('customer_comment')}</p>
                                            <p className="text-xs font-bold text-orange-700 dark:text-orange-400">{order.comment}</p>
                                          </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full lg:w-[380px] bg-gray-50/50 dark:bg-gray-800/20 border-l border-gray-100 dark:border-gray-800 p-6 md:p-8 flex flex-col justify-between gap-8">
                            
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{t('control_panel')}</p>
                                {(order.status === 'NEW' || order.status === 'WAITING_CHECK') ? (
                                    <div className="flex gap-3">
                                        <button 
                                          onClick={() => updateStatus(order.id, 'APPROVE')} 
                                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-[20px] font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                                        >
                                          <CheckCircle size={18}/> {t('approve_btn')}
                                        </button>
                                        <button 
                                          onClick={() => { setSelectedOrder(order); setShowRejectModal(true); }} 
                                          className="p-4 bg-white dark:bg-black text-red-500 rounded-[20px] border border-red-100 dark:border-red-900/30 hover:bg-red-50 transition-all"
                                        >
                                          <Ban size={20}/>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between bg-white dark:bg-black p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <span className="text-xs font-black uppercase text-gray-400 tracking-widest">{t('status_label')}</span>
                                        {getStatusBadge(order.status)}
                                    </div>
                                )}
                            </div>

                            {(order.status === 'APPROVED' || order.status === 'CONFIRMED') && (
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">{t('live_message')}</p>
                                    <div className="relative">
                                        <textarea 
                                            placeholder={t('send_update_placeholder')} 
                                            value={selectedOrder?.id === order.id ? updateMsg : ""}
                                            onChange={(e) => { setSelectedOrder(order); setUpdateMsg(e.target.value); }}
                                            className="w-full bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-xs font-bold outline-none focus:border-emerald-500 transition-all dark:text-white min-h-[80px] resize-none shadow-inner"
                                        />
                                        <button 
                                          disabled={isSendingMsg || !updateMsg || selectedOrder?.id !== order.id}
                                          onClick={() => sendImprtUpdate(order.id)}
                                          className="absolute bottom-3 right-3 p-2 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20 hover:scale-110 active:scale-90 transition-all disabled:opacity-30"
                                        >
                                          <Send size={16} />
                                        </button>
                                    </div>
                                    {order.adminMessage && (
                                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold bg-white dark:bg-black px-3 py-2 rounded-lg border dark:border-gray-800">
                                            <MessageCircle size={12} className="text-emerald-500"/> {t('last_message')} {order.adminMessage}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                {order.paymentReceipt ? (
                                    <button 
                                      onClick={() => setPreviewOrder(order)} 
                                      className="w-full flex items-center justify-between p-4 bg-blue-500/5 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white dark:bg-black rounded-lg shadow-sm group-hover:scale-110 transition-transform"><Eye size={16}/></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">{t('payment_receipt_btn')}</span>
                                        </div>
                                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                ) : (
                                    <div className="text-center p-4 text-xs font-bold text-gray-400 italic bg-gray-100 dark:bg-gray-800/50 rounded-2xl uppercase tracking-widest text-center">{t('no_receipt')}</div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            ))
        )}
      </div>

      {/* --- MODAL: CHEK --- */}
      {previewOrder && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={() => setPreviewOrder(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-[40px] max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewOrder(null)} className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-red-500 hover:text-white transition-all z-10"><X size={24}/></button>
            
            <div className="p-8 border-b dark:border-gray-800 bg-gray-50/50 dark:bg-black/50">
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('receipt_doc')}</h3>
                <p className="text-xs font-bold text-gray-400 mt-1">{t('order_prefix')} {previewOrder.id} • {previewOrder.user?.fullName}</p>
            </div>

            <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-gray-200 dark:bg-black">
              <img src={previewOrder.paymentReceipt} className="max-w-full h-auto rounded-3xl shadow-2xl border-8 border-white dark:border-gray-800" />
            </div>

            <div className="p-8 border-t dark:border-gray-800 bg-white dark:bg-gray-900">
               <div className="flex items-center justify-between gap-4">
                  <div className="hidden sm:block">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('to_pay_label')}</p>
                    <p className="text-3xl font-black text-emerald-600 tracking-tighter">{Number(previewOrder.totalPrice).toLocaleString()} $</p>
                  </div>
                  <div className="flex gap-3 flex-1 sm:flex-none">
                     <button onClick={() => updateStatus(previewOrder.id, 'APPROVE')} className="flex-1 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all">{t('approve_btn')}</button>
                     <button onClick={() => { setSelectedOrder(previewOrder); setShowRejectModal(true); setPreviewOrder(null); }} className="px-8 py-4 bg-red-100 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">{t('reject_btn')}</button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: RAD ETISH --- */}
      {showRejectModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[40px] w-full max-w-[420px] shadow-2xl animate-fade-in border border-gray-100 dark:border-gray-800">
            <h3 className="text-2xl font-black mb-1 text-gray-900 dark:text-white tracking-tight uppercase">{t('reject_title')}</h3>
            <p className="text-xs font-bold text-gray-400 mb-8">{t('reject_reason_label')}</p>
            
            <div className="space-y-3">
              <button onClick={() => updateStatus(selectedOrder.id, 'REJECT_FRAUD')} className="w-full text-left p-5 border border-red-50 dark:border-red-900/10 rounded-3xl hover:bg-red-500 hover:text-white dark:hover:bg-red-600 transition-all group flex items-center gap-4">
                <Ban size={24} className="group-hover:scale-110 transition-transform"/> 
                <div>
                  <div className="font-black text-xs uppercase tracking-widest">{t('reject_fraud')}</div>
                  <div className="text-[10px] opacity-70 font-medium tracking-tight">{t('reject_fraud_desc')}</div>
                </div>
              </button>

              <button onClick={() => updateStatus(selectedOrder.id, 'REJECT_WRONG_IMAGE')} className="w-full text-left p-5 border border-orange-50 dark:border-orange-900/10 rounded-3xl hover:bg-orange-500 hover:text-white transition-all group flex items-center gap-4">
                <AlertTriangle size={24} className="group-hover:scale-110 transition-transform"/>
                <div>
                  <div className="font-black text-xs uppercase tracking-widest">{t('reject_wrong_img')}</div>
                  <div className="text-[10px] opacity-70 font-medium tracking-tight">{t('reject_wrong_img_desc')}</div>
                </div>
              </button>

              <div className="p-5 border border-gray-100 dark:border-gray-800 rounded-3xl bg-gray-50 dark:bg-black mt-4 shadow-inner">
                <textarea 
                  className="w-full bg-transparent p-0 text-xs font-bold outline-none dark:text-white resize-none" 
                  rows={2} 
                  placeholder={t('reject_other_placeholder')} 
                  value={rejectReason} 
                  onChange={(e) => setRejectReason(e.target.value)} 
                />
                <button onClick={() => updateStatus(selectedOrder.id, 'REJECT_OTHER', rejectReason)} disabled={!rejectReason} className="mt-4 w-1/2 bg-gray-900 dark:bg-emerald-600 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 transition-all">{t('send')}</button>
              </div>
            </div>
            <button onClick={() => { setShowRejectModal(false); setSelectedOrder(null); }} className="mt-6 text-gray-400 text-[10px] font-black uppercase tracking-widest w-full text-center hover:text-gray-900 dark:hover:text-white transition-colors">{t('close_btn')}</button>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>

    </div>
  );
}