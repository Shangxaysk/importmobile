import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, CreditCard, Settings, WalletCards, Loader2, Power, MessageSquare } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export default function AdminSettings() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingGlobal, setSavingGlobal] = useState(false);
  
  const [form, setForm] = useState({ cardNumber: '', cardHolder: '' });
  
  const [globalSettings, setGlobalSettings] = useState({
    isOrdersEnabled: true,
    restModeMessageUz: '',
    restModeMessageRu: ''
  });

  useEffect(() => {
    axios.get(import.meta.env.VITE_API_URL + '/admin-settings')
    .then((globalRes) => {
      if (globalRes.data) {
        setForm({ 
          cardNumber: globalRes.data.cardNumber || '', 
          cardHolder: globalRes.data.cardHolder || '' 
        });

        let parsedUz = '';
        let parsedRu = '';
        try {
          const parsedMsg = JSON.parse(globalRes.data.restModeMessage);
          parsedUz = parsedMsg.uz || '';
          parsedRu = parsedMsg.ru || '';
        } catch (e) {
          parsedUz = globalRes.data.restModeMessage || '';
        }

        setGlobalSettings({
          isOrdersEnabled: globalRes.data.isOrdersEnabled,
          restModeMessageUz: parsedUz,
          restModeMessageRu: parsedRu
        });
      }
    })
    .finally(() => setLoading(false));
  }, []);

  const handleCardFormat = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setForm({ ...form, cardNumber: formatted });
  };

  const handleSaveCard = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(import.meta.env.VITE_API_URL + '/admin-settings', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(t('settings_saved'));
    } catch (err) {
      alert(t('error_occurred'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGlobal = async () => {
    setSavingGlobal(true);
    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        isOrdersEnabled: globalSettings.isOrdersEnabled,
        restModeMessage: JSON.stringify({
          uz: globalSettings.restModeMessageUz,
          ru: globalSettings.restModeMessageRu
        })
      };

      await axios.patch(import.meta.env.VITE_API_URL + '/admin-settings/toggle-orders', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(t('system_status_saved'));
    } catch (err) {
      alert(t('error_occurred'));
    } finally {
      setSavingGlobal(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-black"><Loader2 className="animate-spin text-emerald-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-4 sm:p-6 pb-24">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        
        {/* --- TIZIM HOLATI (REST MODE) BLOKI --- */}
        <div className="bg-white dark:bg-gray-900 p-5 sm:p-8 rounded-[24px] sm:rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 transition-colors duration-500 ${globalSettings.isOrdersEnabled ? 'bg-emerald-500' : 'bg-red-500'} pointer-events-none -translate-y-1/2 translate-x-1/4`}></div>
          
          <h2 className="text-lg sm:text-xl font-black mb-5 sm:mb-6 flex items-center gap-2 dark:text-white uppercase relative z-10">
            <Settings className={globalSettings.isOrdersEnabled ? "text-emerald-500" : "text-red-500"} size={24} /> 
            {t('system_status')}
          </h2>
          
          <div className="space-y-4 sm:space-y-6 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 dark:bg-black p-4 sm:p-5 rounded-[20px] border border-gray-100 dark:border-gray-800 gap-4 sm:gap-0 transition-colors">
              <div className="flex-1 pr-0 sm:pr-4">
                <p className="font-bold text-gray-900 dark:text-white text-base sm:text-lg leading-tight">
                  {globalSettings.isOrdersEnabled ? t('site_active_orders_open') : t('site_in_rest_mode')}
                </p>
                <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-1.5 sm:mt-1 leading-relaxed">
                  {t('rest_mode_warning')}
                </p>
              </div>
              
              <div className="self-end sm:self-auto">
                <button 
                  onClick={() => setGlobalSettings({...globalSettings, isOrdersEnabled: !globalSettings.isOrdersEnabled})} 
                  className={`w-14 sm:w-16 h-7 sm:h-8 rounded-full transition-colors relative flex items-center px-1 shrink-0 shadow-inner ${globalSettings.isOrdersEnabled ? 'bg-emerald-500' : 'bg-red-500'}`}
                >
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${globalSettings.isOrdersEnabled ? 'translate-x-7 sm:translate-x-8' : 'translate-x-0'}`}>
                    <Power size={12} className={globalSettings.isOrdersEnabled ? "text-emerald-500" : "text-red-500"} />
                  </div>
                </button>
              </div>
            </div>

            {/* Xabar yozish maydonlari (O'ZBEK VA RUS TILLARIDA) */}
            <div className={`transition-all duration-500 overflow-hidden ${!globalSettings.isOrdersEnabled ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="pt-1 space-y-4">
                
                {/* O'ZBEK TILIDA */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <MessageSquare size={12} />
                    {t('message_uz')}
                  </label>
                  <textarea 
                    value={globalSettings.restModeMessageUz}
                    onChange={e => setGlobalSettings({...globalSettings, restModeMessageUz: e.target.value})}
                    className="w-full p-4 rounded-[20px] bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-900 dark:text-red-100 font-medium text-sm sm:text-base outline-none focus:border-red-500 min-h-[100px] resize-none transition-colors"
                    placeholder={t('message_uz_placeholder')}
                  />
                </div>

                {/* RUS TILIDA */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <MessageSquare size={12} />
                    {t('message_ru')}
                  </label>
                  <textarea 
                    value={globalSettings.restModeMessageRu}
                    onChange={e => setGlobalSettings({...globalSettings, restModeMessageRu: e.target.value})}
                    className="w-full p-4 rounded-[20px] bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-900 dark:text-red-100 font-medium text-sm sm:text-base outline-none focus:border-red-500 min-h-[100px] resize-none transition-colors"
                    placeholder={t('message_ru_placeholder')}
                  />
                </div>

              </div>
            </div>

            <button onClick={handleSaveGlobal} disabled={savingGlobal} className={`w-full py-3.5 sm:py-4 text-white rounded-[20px] font-black text-sm sm:text-base uppercase flex justify-center items-center gap-2 active:scale-95 transition-all shadow-lg ${globalSettings.isOrdersEnabled ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'}`}>
              {savingGlobal ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} {t('save_system_settings')}
            </button>
          </div>
        </div>

        {/* --- KARTA SOZLAMALARI --- */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm">
            <h2 className="text-lg sm:text-xl font-black mb-5 sm:mb-6 flex items-center gap-2 dark:text-white uppercase"><WalletCards className="text-emerald-500"/> {t('finance_payment')}</h2>
            <div className="space-y-4">
              <input placeholder={t('card_number')} value={form.cardNumber} onChange={handleCardFormat} className="w-full p-4 rounded-[20px] bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 dark:text-white font-bold tracking-widest outline-none focus:border-emerald-500 text-sm sm:text-base transition-colors" />
              <input placeholder={t('card_holder')} value={form.cardHolder} onChange={e => setForm({...form, cardHolder: e.target.value.toUpperCase()})} className="w-full p-4 rounded-[20px] bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 dark:text-white font-bold uppercase outline-none focus:border-emerald-500 text-sm sm:text-base transition-colors" />
              <button onClick={handleSaveCard} disabled={saving} className="w-full py-3.5 sm:py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[20px] font-black text-sm sm:text-base uppercase flex justify-center items-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-600/20">
                {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} {t('save_card_settings')}
              </button>
            </div>
          </div>

          <div className="flex flex-col justify-center items-center bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[24px] sm:rounded-[32px] border-2 border-dashed border-emerald-200 dark:border-emerald-800 p-6">
             <p className="text-[10px] font-black text-emerald-600 uppercase mb-4 tracking-widest">{t('card_preview')}</p>
             <div className="w-full max-w-sm mx-auto bg-gradient-to-br from-emerald-600 to-teal-500 p-6 rounded-[24px] text-white shadow-xl relative overflow-hidden aspect-[1.6/1] flex flex-col justify-end">
                <CreditCard className="absolute -right-8 -bottom-8 opacity-20 rotate-12" size={150} />
                <div className="relative z-10">
                  <div className="h-8 w-12 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-md mb-6 opacity-90 shadow-inner"></div>
                  <h3 className="text-lg sm:text-xl font-black tracking-[0.1em] mb-2 sm:mb-4">{form.cardNumber || "0000 0000 0000 0000"}</h3>
                  <p className="text-[10px] sm:text-xs font-bold uppercase opacity-80">{form.cardHolder || "FULL NAME"}</p>
                </div>
             </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}