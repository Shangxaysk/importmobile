import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

declare global {
  interface Window {
    Telegram?: any;
  }
}

interface User {
  id: number;
  fullName: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  telegramId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (phone: string, pass: string) => Promise<void>;
  register: (name: string, phone: string, pass: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // SAHIFA YANGILANGANDA AVTOMATIK TEKSHIRISH (YANGILANDI)
  useEffect(() => {
    const initAuth = async () => {
      // 1. Eski usul: Lokal xotirada bormi? (1-qurilma uchun)
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (savedUser && token) {
        setUser(JSON.parse(savedUser));
        setLoading(false);
        return;
      }

      // 2. Yangi usul: Lokal xotira bo'sh bo'lsa, Telegram orqali urinib ko'ramiz (2-qurilma uchun)
      const tg = window.Telegram?.WebApp;
      const telegramId = tg?.initDataUnsafe?.user?.id ? String(tg.initDataUnsafe.user.id) : null;

      if (telegramId) {
        try {
          const res = await axios.post(import.meta.env.VITE_API_URL + '/auth/telegram-login', { telegramId });
          
          const { access_token, user: userData } = res.data;
          localStorage.setItem('token', access_token);
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
        } catch (error) {
          // Bazada yo'q bo'lsa indamaymiz, o'zi register oynasiga o'tadi
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (phone: string, pass: string) => {
    const res = await axios.post(import.meta.env.VITE_API_URL + '/auth/login', { phone, password: pass });
    
    const { access_token, user: userData } = res.data;
    
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(userData)); 
    
    setUser(userData);
  };

  const register = async (fullName: string, phone: string, pass: string) => {
    const tg = window.Telegram?.WebApp;
    const telegramId = tg?.initDataUnsafe?.user?.id ? String(tg.initDataUnsafe.user.id) : null;

    const res = await axios.post(import.meta.env.VITE_API_URL + '/auth/register', { 
        fullName, 
        phone, 
        password: pass,
        telegramId 
    });
    
    const { access_token, user: userData } = res.data;
    
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth error");
  return context;
};