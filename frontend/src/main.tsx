import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { CartProvider } from './context/CartContext.tsx' // <-- Qo'shildi
import { AuthProvider } from './context/AuthContext.tsx'
import { LanguageProvider } from './context/LanguageContext.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx';
import { BrowserRouter } from 'react-router-dom';
import { WishlistProvider } from './context/WishlistContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter> 
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider>
          <CartProvider>
            <WishlistProvider>
              <App />
            </WishlistProvider>
          </CartProvider>
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)