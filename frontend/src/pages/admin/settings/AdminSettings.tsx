import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, CreditCard, Settings, WalletCards, Loader2 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export default function AdminSettings() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ cardNumber: '', cardHolder: '' });

  useEffect(() => {
    axios.get('http://localhost:3000/admin-settings')
      .then(res => setForm({ 
        cardNumber: res.data.cardNumber || '', 
        cardHolder: res.data.cardHolder || '' 
      }))
      .finally(() => setLoading(false));
  }, []);

  const handleCardFormat = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setForm({ ...form, cardNumber: formatted });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/admin-settings', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(t('settings_saved'));
    } catch (err) {
      alert("Xato yuz berdi!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-black"><Loader2 className="animate-spin text-emerald-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border dark:border-gray-800 shadow-sm">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2 dark:text-white uppercase"><WalletCards className="text-emerald-500"/> {t('finance_payment')}</h2>
          <div className="space-y-4">
            <input placeholder={t('card_number')} value={form.cardNumber} onChange={handleCardFormat} className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-black border dark:border-gray-800 dark:text-white font-bold tracking-widest outline-none focus:border-emerald-500" />
            <input placeholder={t('card_holder')} value={form.cardHolder} onChange={e => setForm({...form, cardHolder: e.target.value.toUpperCase()})} className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-black border dark:border-gray-800 dark:text-white font-bold uppercase outline-none focus:border-emerald-500" />
            <button onClick={handleSave} disabled={saving} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase flex justify-center items-center gap-2 active:scale-95 transition-all">
              {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} {t('save_settings')}
            </button>
          </div>
        </div>

        {/* KARTA PREVIEW */}
        <div className="flex flex-col justify-center items-center bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[32px] border-2 border-dashed border-emerald-200 dark:border-emerald-800 p-6">
           <p className="text-[10px] font-black text-emerald-600 uppercase mb-4 tracking-widest">Preview</p>
           <div className="w-full bg-gradient-to-br from-emerald-600 to-teal-500 p-6 rounded-[24px] text-white shadow-xl relative overflow-hidden">
              <CreditCard className="absolute -right-8 -bottom-8 opacity-20 rotate-12" size={150} />
              <div className="relative z-10">
                <div className="h-8 w-12 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-md mb-8 opacity-90 shadow-inner"></div>
                <h3 className="text-xl font-black tracking-[0.1em] mb-4">{form.cardNumber || "0000 0000 0000 0000"}</h3>
                <p className="text-xs font-bold uppercase opacity-80">{form.cardHolder || "FULL NAME"}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}