import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowLeft, Phone, Lock, User, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { t } = useLanguage();
  
  const [isLoginMode, setIsLoginMode] = useState(true); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState(''); // Maskasiz raqamlar saqlanadi
  const [displayPhone, setDisplayPhone] = useState('+998 '); // Ekranda ko'rinadigan maska
  const [password, setPassword] = useState('');

  // Telefon raqam maskasi: +998 XX XXX XX XX
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, ''); // Faqat raqamlarni qoldirish

    // +998 ni o'chirib tashlashga urinishning oldini olish
    if (!input.startsWith('998')) {
        input = '998' + input;
    }
    
    // Maksimal 12 ta raqam (998 + 9 ta raqam)
    if (input.length > 12) {
        input = input.substring(0, 12);
    }

    setPhone(input); // Haqiqiy raqamni saqlash (masalan: 998901234567)

    // Maskaga solish
    let formatted = '+998 ';
    if (input.length > 3) formatted += input.substring(3, 5);
    if (input.length > 5) formatted += ' ' + input.substring(5, 8);
    if (input.length > 8) formatted += ' ' + input.substring(8, 10);
    if (input.length > 10) formatted += ' ' + input.substring(10, 12);
    
    setDisplayPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Telefon raqam to'liq kiritilganini tekshirish (12 ta raqam)
    if (phone.length !== 12) {
        setError("Telefon raqam to'liq emas!");
        return;
    }

    setLoading(true);

    try {
      if (isLoginMode) {
        await login(phone, password); // Maskasiz raqam yuboriladi
      } else {
        await register(name, phone, password);
      }
      navigate('/account');
    } catch (err: any) {
      console.error(err);
      setError(t('auth_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-black flex flex-col font-inter transition-colors duration-300">
      
      {/* HEADER (Boshqa sahifalar kabi) */}
      <div className="sticky top-0 z-40 w-full bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="relative max-w-md mx-auto h-[60px] px-4 flex items-center">
            <button 
                onClick={() => navigate('/')} 
                className="group flex items-center gap-1 pl-2 pr-4 py-2 bg-emerald-600 rounded-full text-white active:scale-95 hover:bg-emerald-700 transition-all duration-300 z-10"
            >
                <ChevronLeft size={18} strokeWidth={2} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs tracking-wide font-medium">{t('back')}</span>
            </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-20 max-w-md mx-auto w-full">
        
        <div className="mb-10 text-center">
            <div className="w-16 h-16 bg-emerald-600 rounded-[20px] mx-auto flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-600/30 mb-6">
                IM
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
            {isLoginMode ? t('welcome_login') : t('register_title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
            {isLoginMode ? t('login_desc') : t('register_desc')}
            </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 text-red-500 p-4 rounded-2xl text-sm mb-6 text-center font-bold animate-fade-in shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Ism (Faqat registratsiyada) */}
          {!isLoginMode && (
            <div className="bg-white dark:bg-gray-900 p-4 rounded-[20px] flex items-center gap-3 border border-gray-100 dark:border-gray-800 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all shadow-sm">
               <User className="text-gray-400 dark:text-gray-500" size={22} />
               <input 
                 type="text" 
                 placeholder={t('name_placeholder')} 
                 className="bg-transparent outline-none flex-1 font-bold text-gray-900 dark:text-white placeholder:text-gray-400"
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 required
               />
            </div>
          )}

          {/* Telefon */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-[20px] flex items-center gap-3 border border-gray-100 dark:border-gray-800 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all shadow-sm">
             <Phone className="text-gray-400 dark:text-gray-500" size={22} />
             <input 
               type="tel" 
               placeholder="+998 XX XXX XX XX" 
               className="bg-transparent outline-none flex-1 font-bold tracking-wider text-gray-900 dark:text-white placeholder:text-gray-400"
               value={displayPhone}
               onChange={handlePhoneChange}
               required
             />
          </div>

          {/* Parol */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-[20px] flex items-center gap-3 border border-gray-100 dark:border-gray-800 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all shadow-sm">
             <Lock className="text-gray-400 dark:text-gray-500" size={22} />
             <input 
               type="password" 
               placeholder={t('password_placeholder')} 
               className="bg-transparent outline-none flex-1 font-bold text-gray-900 dark:text-white placeholder:text-gray-400"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               required
             />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-[60px] bg-emerald-600 text-white rounded-[20px] font-black uppercase tracking-widest text-sm hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center mt-6 shadow-xl shadow-emerald-600/30 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isLoginMode ? t('login_action') : t('register_action'))}
          </button>
        </form>

        {/* O'tish (Login <-> Register) */}
        <div className="mt-8 text-center">
           <p className="text-gray-500 dark:text-gray-400 font-medium">
             {isLoginMode ? t('no_account') : t('have_account')}
             <button 
               onClick={() => {
                   setIsLoginMode(!isLoginMode);
                   setError(''); // Rejim o'zgarganda xatoni tozalash
               }} 
               className="text-emerald-600 font-bold ml-2 hover:underline tracking-wide"
             >
               {isLoginMode ? t('register_action') : t('login_action')}
             </button>
           </p>
        </div>

      </div>
    </div>
  );
}