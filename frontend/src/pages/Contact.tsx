import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ChevronLeft, Send, MapPin, Phone, Mail, 
  MessageCircle, Upload, X, Edit3, Save, 
  PackageSearch, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext'; // QO'SHILDI

export default function Contact() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage(); // QO'SHILDI
  const isAdmin = user?.role === 'ADMIN';

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // 1. MAHSULOT QIDIRUV FORMASI
  const [requestMsg, setRequestMsg] = useState('');
  const [requestFile, setRequestFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // 2. ALOQA MA'LUMOTLARI (Bazadan keladi)
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    telegram: '',
    email: '',
    address: ''
  });
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);

  // --- BAZADAN MA'LUMOTLARNI YUKLASH ---
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchSettings = async () => {
        try {
            const res = await axios.get(import.meta.env.VITE_API_URL + '/contact/settings');
            if (res.data) {
                setContactInfo({
                    phone: res.data.phone,
                    telegram: res.data.telegram,
                    email: res.data.email,
                    address: res.data.address,
                });
            }
        } catch (err) {
            console.error("Sozlamalarni yuklashda xato:", err);
        }
    };
    fetchSettings();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert(t('file_size_error'));
      setRequestFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // --- MAHSULOT QIDIRUVINI YUBORISH (Topic 5) ---
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestMsg.trim() && !requestFile) return;

    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append('message', requestMsg); 
    if (requestFile) formData.append('file', requestFile);

    try {
      await axios.post(import.meta.env.VITE_API_URL + '/contact/product-search', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus({ type: 'success', msg: t('request_success') });
      setRequestMsg('');
      setRequestFile(null);
      setPreview(null);
    } catch (error) {
      setStatus({ type: 'error', msg: t('error') });
    } finally {
      setLoading(false);
    }
  };

  // --- ADMIN: ALOQA MA'LUMOTLARINI SAQLASH ---
  const handleSaveContactInfo = async () => {
    setSavingInfo(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(import.meta.env.VITE_API_URL + '/contact/settings', contactInfo, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsEditingInfo(false);
      setStatus({ type: 'success', msg: t('save_success') });
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      alert(t('save_error'));
    } finally {
      setSavingInfo(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-50 dark:bg-black font-inter pb-[200px] transition-colors duration-300">
      
      {/* --- HEADER --- */}
      <div className="sticky top-0 z-40 w-full bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="relative max-w-md mx-auto h-[60px] px-4 flex items-center">
            
            <button 
                onClick={() => navigate(-1)} 
                className="group flex items-center gap-1 pl-2 pr-4 py-2 bg-emerald-600 rounded-full text-white active:scale-95 hover:bg-emerald-700 transition-all duration-300 z-10"
            >
                <ChevronLeft size={18} strokeWidth={2} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs tracking-wide font-medium">{t('back')}</span>
            </button>

            <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-black text-gray-900 dark:text-white">
                {t('contact_us')}
            </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-6 mt-4">

        {/* 1. MAHSULOT QIDIRUV BO'LIMI */}
        <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden transition-colors">
            <div className="absolute -top-10 -right-10 text-emerald-500/5 dark:text-emerald-500/10 pointer-events-none transform -rotate-12">
                <PackageSearch size={220} />
            </div>

            <div className="relative z-10 mb-8">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                    <PackageSearch size={32} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">{t('product_search')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium max-w-xl">
                    {t('product_search_desc')}
                </p>
            </div>

            <form onSubmit={handleRequestSubmit} className="relative z-10 space-y-5">
                <textarea 
                    value={requestMsg}
                    onChange={(e) => setRequestMsg(e.target.value)}
                    placeholder={t('search_placeholder')}
                    className="w-full p-5 bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 rounded-3xl outline-none focus:border-emerald-500 min-h-[140px] transition-all text-sm font-semibold text-gray-900 dark:text-white resize-none shadow-inner"
                ></textarea>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        {preview ? (
                            <div className="relative w-full h-[140px] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden group shadow-lg">
                                <img src={preview} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center backdrop-blur-sm">
                                    <button type="button" onClick={() => { setRequestFile(null); setPreview(null); }} className="bg-red-500 text-white p-3 rounded-full shadow-xl transform hover:scale-110 active:scale-90 transition-all"><X size={20}/></button>
                                </div>
                            </div>
                        ) : (
                            <label className="cursor-pointer h-[140px] flex flex-col items-center justify-center gap-2 bg-gray-50 dark:bg-black rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-gray-400 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/5 transition-all duration-300 shadow-inner">
                                <Upload size={28} strokeWidth={2.5} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{t('upload_image')}</span>
                                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                            </label>
                        )}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-end">
                        <button 
                            type="submit" 
                            disabled={loading || (!requestMsg.trim() && !requestFile)}
                            className="w-full h-[64px] bg-emerald-600 text-white rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-95 shadow-xl shadow-emerald-600/20 transition-all disabled:opacity-50 disabled:grayscale"
                        >
                            {loading ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div> : <><Send size={20} /> {t('send')}</>}
                        </button>
                    </div>
                </div>

                {status && (
                    <div className={`flex items-center gap-3 text-sm font-bold p-5 rounded-3xl animate-fade-in shadow-sm ${
                        status.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                        <CheckCircle2 size={20}/> {status.msg}
                    </div>
                )}
            </form>
        </div>

        {/* 2. ALOQA MA'LUMOTLARI */}
        <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t('our_contacts')}</h3>
                
                {isAdmin && (
                    <button 
                        onClick={() => isEditingInfo ? handleSaveContactInfo() : setIsEditingInfo(true)}
                        disabled={savingInfo}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg active:scale-95 ${
                            isEditingInfo 
                            ? 'bg-emerald-600 text-white shadow-emerald-600/20' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                    >
                        {savingInfo ? t('saving') : isEditingInfo ? <><Save size={16}/> {t('save')}</> : <><Edit3 size={16}/> {t('edit')}</>}
                    </button>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-5">
                {/* Telefon */}
                <div className="contact-card">
                    <div className="contact-icon text-emerald-600"><Phone size={20}/></div>
                    <div className="w-full">
                        <p className="contact-label">{t('phone')}</p>
                        {isEditingInfo ? (
                            <input value={contactInfo.phone} onChange={e => setContactInfo({...contactInfo, phone: e.target.value})} className="contact-input" />
                        ) : (
                            <p className="contact-value">{contactInfo.phone || t('not_entered')}</p>
                        )}
                    </div>
                </div>

                {/* Telegram */}
                <div className="contact-card">
                    <div className="contact-icon text-blue-500"><MessageCircle size={20}/></div>
                    <div className="w-full">
                        <p className="contact-label">{t('telegram')}</p>
                        {isEditingInfo ? (
                            <input value={contactInfo.telegram} onChange={e => setContactInfo({...contactInfo, telegram: e.target.value})} className="contact-input" />
                        ) : (
                            <a href={`https://t.me/${contactInfo.telegram.replace('@', '')}`} target="_blank" rel="noreferrer" className="contact-value text-blue-600 dark:text-blue-400 hover:underline">{contactInfo.telegram || t('not_entered')}</a>
                        )}
                    </div>
                </div>

                {/* Email */}
                <div className="contact-card">
                    <div className="contact-icon text-orange-500"><Mail size={20}/></div>
                    <div className="w-full">
                        <p className="contact-label">{t('email')}</p>
                        {isEditingInfo ? (
                            <input value={contactInfo.email} onChange={e => setContactInfo({...contactInfo, email: e.target.value})} className="contact-input" />
                        ) : (
                            <p className="contact-value">{contactInfo.email || t('not_entered')}</p>
                        )}
                    </div>
                </div>

                {/* Manzil */}
                <div className="contact-card">
                    <div className="contact-icon text-red-500"><MapPin size={20}/></div>
                    <div className="w-full">
                        <p className="contact-label">{t('address')}</p>
                        {isEditingInfo ? (
                            <textarea value={contactInfo.address} onChange={e => setContactInfo({...contactInfo, address: e.target.value})} className="contact-input min-h-[60px] resize-none" rows={2}></textarea>
                        ) : (
                            <p className="contact-value leading-relaxed">{contactInfo.address || t('not_entered')}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>

      </div>

      <style>{`
        .contact-card { display: flex; align-items: flex-start; gap: 1rem; padding: 1.25rem; background: #f8fafc; border-radius: 1.5rem; border: 1px solid #f1f5f9; transition: all 0.3s; }
        .dark .contact-card { background: #000; border-color: #1f2937; }
        .contact-icon { padding: 0.75rem; background: white; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
        .dark .contact-icon { background: #111; box-shadow: none; }
        .contact-label { font-size: 0.65rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.25rem; }
        .contact-value { font-size: 0.875rem; font-weight: 700; color: #0f172a; }
        .dark .contact-value { color: #f8fafc; }
        .contact-input { width: 100%; background: white; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 0.5rem; font-size: 0.875rem; font-weight: 700; outline: none; }
        .dark .contact-input { background: #111; border-color: #333; color: white; }
        .contact-input:focus { border-color: #10b981; }
      `}</style>
    </div>
  );
}