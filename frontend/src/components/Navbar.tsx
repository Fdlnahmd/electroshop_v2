import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, LogIn, UserPlus } from 'lucide-react';
import { useAppContext } from '../AppContext';

export function Navbar() {
  const { cartCount, user, searchTerm, setSearchTerm } = useAppContext();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <img src="/favicon.svg" alt="ElectroShop Logo" className="w-8 h-8" />
              <span className="font-bold text-xl tracking-tight hidden sm:block">ElectroShop</span>
            </Link>
          </div>

          <div className="flex-1 max-w-lg px-2 sm:px-4">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-8 sm:pl-10 pr-3 py-1.5 sm:py-2 bg-[#F5F5F5] border-none rounded-full text-xs sm:text-sm focus:ring-1 focus:ring-[#1A1A2E] focus:outline-none transition-colors"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {(!user || user.role !== 'admin') && (
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-primary transition-colors">
                <ShoppingCart size={22} className="sm:h-6 sm:w-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] sm:text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-primary rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            <div className="hidden md:flex items-center gap-2 border-l border-gray-200 pl-4">
              {user ? (
                <>
                  <Link to="/profile" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary">
                    <User size={18} />
                    <span>Profile</span>
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="text-sm font-medium text-gray-500 hover:text-primary ml-2">
                      Admin
                    </Link>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="flex items-center gap-2 text-sm font-medium text-primary border border-primary px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
                    <LogIn size={16} />
                    <span>Login</span>
                  </Link>
                  <Link to="/register" className="flex items-center gap-2 text-sm font-medium text-white bg-primary px-4 py-2 rounded-md hover:bg-primary-hover transition-colors">
                    <UserPlus size={16} />
                    <span>Register</span>
                  </Link>
                </div>
              )}
            </div>

            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-1.5 text-gray-600"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3">
            <div className="flex flex-col space-y-2">
              {user ? (
                <>
                  <Link to="/profile" className="py-2 text-gray-700 flex items-center gap-2 font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                    <User size={18} /> Profile
                  </Link>
                  {user.role !== 'admin' && (
                    <Link to="/orders" className="py-2 text-gray-700 flex items-center gap-2 font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                      My Orders
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin" className="py-2 text-primary font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                      Admin Dashboard
                    </Link>
                  )}
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/login" className="py-2 flex items-center gap-2 font-medium text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                    <LogIn size={18} /> Login
                  </Link>
                  <Link to="/register" className="py-2 flex items-center gap-2 font-medium text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                    <UserPlus size={18} /> Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
