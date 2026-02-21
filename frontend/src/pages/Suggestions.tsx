import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Paperclip, Send, X, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext'; // QO'SHILDI

export default function Suggestions() {
  const navigate = useNavigate();
  const { t } = useLanguage(); // QO'SHILDI
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert(t('file_size_error'));
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !file) return;

    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append('message', message);
    if (file) {
      formData.append('file', file); 
    }

    try {
      await axios.post('http://localhost:3000/contact/suggestion', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data' 
        }
      });
      
      setStatus({ type: 'success', msg: t('suggestion_success') });
      setMessage('');
      setFile(null);
      
      setTimeout(() => navigate('/account'), 3000); 
    } catch (error: any) {
      console.error("Yuborishda xatolik:", error.response?.data || error.message);
      setStatus({ 
        type: 'error', 
        msg: error.response?.data?.message || t('suggestion_error') 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-50 dark:bg-black font-inter pb-20 transition-colors duration-300">
      
      {/* HEADER */}
      <div className="sticky top-0 z-40 w-full bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-b border-gray-100 dark:border-gray-800">
        <div className="relative max-w-md mx-auto h-[60px] px-4 flex items-center">
            <button onClick={() => navigate(-1)} className="group flex items-center gap-1 pl-2 pr-4 py-2 bg-emerald-600 rounded-full text-white active:scale-95 transition-all">
                <ChevronLeft size={18} strokeWidth={2} />
                <span className="text-xs font-medium">{t('back')}</span>
            </button>
            <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-bold text-gray-900 dark:text-white">
                {t('suggestions_title')}
            </h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto p-4 mt-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            
            <div className="flex items-center gap-3 mb-6 text-emerald-600">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                    <FileText size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{t('write_to_us')}</h3>
                    <p className="text-xs text-gray-500 text-left">{t('suggestions_desc')}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('message_placeholder')}
                    className="w-full p-4 bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:border-emerald-500 min-h-[150px] transition-all text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
                ></textarea>

                {/* Fayl yuklash */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <label className="cursor-pointer flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm font-medium w-full justify-center border border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500">
                            <Paperclip size={18} />
                            <span>{file ? t('change_file') : t('upload_file')}</span>
                            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx" />
                        </label>
                        
                        {file && (
                            <button type="button" onClick={() => setFile(null)} className="p-3 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl transition hover:bg-red-100">
                                <X size={18} />
                            </button>
                        )}
                    </div>
                    
                    {file && (
                        <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium px-2 py-1 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg">
                            <CheckCircle2 size={14} />
                            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </div>
                    )}
                </div>

                <button 
                    type="submit" 
                    disabled={loading || (!message.trim() && !file)}
                    className="w-full h-[54px] bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-emerald-500/20 mt-4"
                >
                    {loading ? <Loader2 className="animate-spin text-white" /> : <><Send size={18} /> {t('send')}</>}
                </button>

                {/* Status Xabari */}
                {status && (
                    <div className={`flex items-center justify-center gap-2 text-sm font-medium p-4 rounded-2xl mt-4 animate-fade-in ${
                        status.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' 
                        : 'bg-red-50 text-red-500 dark:bg-red-900/20'
                    }`}>
                    {status.type === 'success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
                    {status.msg}
                    </div>
                )}
            </form>
        </div>
      </div>
    </div>
  );
}