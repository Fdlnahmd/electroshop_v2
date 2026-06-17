import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { formatRupiah, getProductImageUrl } from '../utils';

export function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, user, showConfirm } = useAppContext();
  const navigate = useNavigate();

  if (user?.role === 'admin') {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Akses Ditolak</h2>
        <p className="text-gray-500 max-w-md mb-8">Sebagai Admin, Anda tidak memiliki akses ke keranjang belanja.</p>
        <Link to="/admin" className="bg-[#1A1A2E] text-white font-medium px-8 py-3 rounded-full hover:bg-opacity-95 transition-colors">
          Ke Dashboard Admin
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-6">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
        <p className="text-gray-500 max-w-md mb-8">Looks like you haven't added anything to your cart yet. Let's find you some great tech!</p>
        <Link to="/" className="bg-primary text-white font-medium px-8 py-3 rounded-full hover:bg-primary-hover transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const finalTotal = cartTotal;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary transition-colors">
          <ArrowLeft size={16} />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Shopping Cart</h1>

      <div className="lg:grid lg:grid-cols-12 lg:gap-12 flex flex-col gap-8">
        <div className="lg:col-span-8">
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <ul className="divide-y divide-gray-200">
              {cart.map((item) => (
                <li key={item.product.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-6">
                  <div className="flex-shrink-0 w-24 h-24 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                    <img src={getProductImageUrl(item.product.image)} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex flex-col flex-grow justify-between">
                    <div className="flex justify-between border-b sm:border-0 border-gray-100 pb-4 sm:pb-0 mb-4 sm:mb-0">
                      <div>
                        <Link to={`/product/${item.product.id}`} className="text-lg font-semibold text-gray-900 hover:text-primary">
                          {item.product.name}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">{item.product.category}</p>
                      </div>
                      <p className="font-bold text-gray-900 hidden sm:block">{formatRupiah(item.product.price * item.quantity)}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg">
                        <button 
                          onClick={() => {
                            if (item.quantity === 1) {
                              showConfirm(
                                `Apakah Anda yakin ingin menghapus "${item.product.name}" dari keranjang belanja?`,
                                () => removeFromCart(item.product.id),
                                'Hapus Barang'
                              );
                            } else {
                              updateQuantity(item.product.id, item.quantity - 1);
                            }
                          }}
                          className="p-1 px-3 text-gray-500 hover:text-gray-900"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 px-3 text-gray-500 hover:text-gray-900 disabled:opacity-50"
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-gray-900 sm:hidden">{formatRupiah(item.product.price * item.quantity)}</p>
                        <button 
                          onClick={() => showConfirm(
                            `Apakah Anda yakin ingin menghapus "${item.product.name}" dari keranjang belanja?`,
                            () => removeFromCart(item.product.id),
                            'Hapus Barang'
                          )}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-md transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] p-6 sticky top-24">
            <div className="flex items-center justify-between mb-4 border-b border-[#F5F5F5] pb-3">
              <h2 className="font-bold text-sm uppercase tracking-wider text-gray-900">Order Summary</h2>
              <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded font-bold">{cart.length} items</span>
            </div>
            
            <dl className="space-y-4 text-sm text-gray-600 border-b border-gray-100 pb-6 mb-6">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd className="font-medium text-gray-900">{formatRupiah(cartTotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Pengiriman</dt>
                <dd className="text-gray-500 italic">
                  Dihitung saat checkout
                </dd>
              </div>
            </dl>
            
            <div className="flex justify-between items-center mb-6">
              <dt className="text-base font-bold text-gray-900">Total Sementara</dt>
              <dd className="text-2xl font-bold text-gray-900">{formatRupiah(finalTotal)}</dd>
            </div>
            
            <button 
              onClick={() => navigate('/checkout')}
              className="w-full mt-2 py-3 bg-[#1A1A2E] text-white rounded text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-[#1A1A2E]/90 transition-colors"
            >
              Proceed to Checkout
            </button>
            <p className="text-xs text-center text-gray-500 mt-4 flex items-center justify-center gap-1">
               Secure checkout powered by Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
