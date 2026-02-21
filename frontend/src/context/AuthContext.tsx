import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// TypeScript xato bermasligi uchun Telegram ob'ektini global tanitamiz
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
  telegramId?: string; // Kelajakda kerak bo'lishi mumkin deb buni ham qo'shdik
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

  // Sahifa yangilanganda tokenni tekshirish
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (phone: string, pass: string) => {
    const res = await axios.post(import.meta.env.VITE_API_URL + '/auth/login', { phone, password: pass });
    
    // BACKENDDAN KELAYOTGAN MA'LUMOTLARNI SAQLASH
    const { access_token, user: userData } = res.data;
    
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(userData)); // { id, fullName, role, phone }
    
    setUser(userData); // State-ni yangilaymiz
  };

  const register = async (fullName: string, phone: string, pass: string) => {
    
    // 1. TELEGRAM ID NI USHLAB QOLAMIZ
    const tg = window.Telegram?.WebApp;
    const telegramId = tg?.initDataUnsafe?.user?.id ? String(tg.initDataUnsafe.user.id) : null;

    // 2. BACKENDGA telegramId NI QO'SHIB JO'NATAMIZ
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