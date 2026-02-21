import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// Mahsulot turi
type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
};

type WishlistContextType = {
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (id: string) => boolean;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  // 1. Ilova ochilganda xotiradan yuklash
  useEffect(() => {
    const stored = localStorage.getItem('wishlist');
    if (stored) {
      setWishlist(JSON.parse(stored));
    }
  }, []);

  // 2. O'zgarish bo'lganda xotiraga yozish
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Qo'shish yoki Olib tashlash (Toggle)
  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id); // Bor bo'lsa o'chiramiz
      } else {
        return [...prev, product]; // Yo'q bo'lsa qo'shamiz
      }
    });
  };

  // Tekshirish (Yurak qizil bo'lishi uchun)
  const isInWishlist = (id: string) => {
    return wishlist.some((item) => item.id === id);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};