import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem } from './data';

interface AppContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  cartCount: number;
  user: any | null;
  token: string | null;
  isAuthLoading: boolean;
  login: (user: any, token: string) => Promise<void>;
  logout: () => Promise<void>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  apiUrl: string;
  showAlert: (message: string, title?: string, onClose?: () => void) => void;
  showConfirm: (message: string, onConfirm: () => void, title?: string, confirmText?: string, cancelText?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Gunakan path relatif agar Vite proxy bisa forward ke backend Docker
// Jangan pakai VITE_API_URL yang berisi hostname Docker (tidak bisa diakses browser)
const API_URL = '';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthLoading, setIsAuthLoading] = useState(() => Boolean(localStorage.getItem('token')));
  const [searchTerm, setSearchTerm] = useState('');
  const [alertModal, setAlertModal] = useState<{
    message: string;
    title?: string;
    onClose?: () => void;
    isConfirm?: boolean;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
  } | null>(null);

  const showAlert = (message: string, title?: string, onClose?: () => void) => {
    setAlertModal({ message, title, onClose });
  };

  const showConfirm = (message: string, onConfirm: () => void, title?: string, confirmText?: string, cancelText?: string) => {
    setAlertModal({
      message,
      title,
      isConfirm: true,
      onConfirm,
      confirmText,
      cancelText
    });
  };

  // Fetch profile and cart on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      setIsAuthLoading(Boolean(token));

      if (token) {
        try {
          const res = await fetch(`${API_URL}/api/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            }
          });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
            await fetchCart(token);
          } else {
            // Token invalid or expired
            handleSessionExpired();
          }
        } catch (err) {
          console.error("Failed to authenticate token:", err);
          handleSessionExpired();
        } finally {
          setIsAuthLoading(false);
        }
      } else {
        // Load guest cart
        const localCart = localStorage.getItem('guest_cart');
        if (localCart) {
          try {
            setCart(JSON.parse(localCart));
          } catch (e) {
            setCart([]);
          }
        }
        setIsAuthLoading(false);
      }
    };
    initAuth();
  }, [token]);

  const handleSessionExpired = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCart([]);
    setIsAuthLoading(false);
  };

  const fetchCart = async (authToken: string) => {
    try {
      const res = await fetch(`${API_URL}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
        }
      });
      if (res.ok) {
        const cartData = await res.json();
        setCart(cartData);
      }
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    }
  };

  const syncGuestCart = async (authToken: string, guestItems: CartItem[]) => {
    for (const item of guestItems) {
      try {
        await fetch(`${API_URL}/api/cart`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            product_id: item.product.id,
            quantity: item.quantity,
          })
        });
      } catch (err) {
        console.error("Failed to sync cart item:", err);
      }
    }
    localStorage.removeItem('guest_cart');
  };

  const addToCart = async (product: Product, quantity = 1) => {
    if (!token) {
      showAlert('Silakan login atau register terlebih dahulu untuk mulai berbelanja.', 'Perlu Login', () => {
        window.location.href = '/login';
      });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/cart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity
        })
      });
      if (res.ok) {
        await fetchCart(token);
      } else {
        const data = await res.json();
        showAlert(data.message || 'Gagal menambahkan ke keranjang', 'Gagal');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (token) {
      try {
        const res = await fetch(`${API_URL}/api/cart/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });
        if (res.ok) {
          await fetchCart(token);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setCart((prev) => {
        const newCart = prev.filter(item => item.product.id !== productId);
        localStorage.setItem('guest_cart', JSON.stringify(newCart));
        return newCart;
      });
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(productId);
    if (token) {
      try {
        const res = await fetch(`${API_URL}/api/cart/${productId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ quantity })
        });
        if (res.ok) {
          await fetchCart(token);
        } else {
          const data = await res.json();
          showAlert(data.message || 'Gagal memperbarui jumlah', 'Gagal');
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setCart((prev) => {
        const newCart = prev.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        );
        localStorage.setItem('guest_cart', JSON.stringify(newCart));
        return newCart;
      });
    }
  };

  const clearCart = async () => {
    if (token) {
      try {
        const res = await fetch(`${API_URL}/api/cart`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });
        if (res.ok) {
          setCart([]);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setCart([]);
      localStorage.removeItem('guest_cart');
    }
  };

  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const login = async (userData: any, authToken: string) => {
    localStorage.setItem('token', authToken);
    setToken(authToken);
    setUser(userData);
    setIsAuthLoading(false);

    // Sync guest cart to db
    const guestCart = localStorage.getItem('guest_cart');
    if (guestCart) {
      try {
        const parsed = JSON.parse(guestCart);
        if (parsed.length > 0) {
          await syncGuestCart(authToken, parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }
    await fetchCart(authToken);
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });
      } catch (err) {
        console.error("Logout failed on server:", err);
      }
    }
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCart([]);
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        user,
        token,
        isAuthLoading,
        login,
        logout,
        searchTerm,
        setSearchTerm,
        apiUrl: API_URL,
        showAlert,
        showConfirm
      }}
    >
      {children}
      {alertModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-gray-100 flex flex-col items-center text-center animate-fade-in">
            {alertModal.isConfirm ? (
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-650 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-650" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-650 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-650" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {alertModal.title || (alertModal.isConfirm ? 'Konfirmasi' : 'Informasi')}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {alertModal.message}
            </p>
            {alertModal.isConfirm ? (
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setAlertModal(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-xl font-semibold transition-colors"
                >
                  {alertModal.cancelText || 'Batal'}
                </button>
                <button
                  onClick={() => {
                    if (alertModal.onConfirm) alertModal.onConfirm();
                    setAlertModal(null);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-750 text-white py-2.5 px-4 rounded-xl font-semibold transition-colors shadow-md"
                >
                  {alertModal.confirmText || 'Hapus'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (alertModal.onClose) alertModal.onClose();
                  setAlertModal(null);
                }}
                className="w-full bg-[#1A1A2E] text-white py-2.5 px-4 rounded-xl font-semibold hover:bg-opacity-90 transition-colors shadow-md"
              >
                OK
              </button>
            )}
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
