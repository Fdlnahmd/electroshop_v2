import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { formatRupiah } from '../utils';

export function CheckoutPage() {
  const { cart, cartTotal, clearCart, token, apiUrl, user, isAuthLoading, showAlert } = useAppContext();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthLoading && !token) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    }
  }, [token, isAuthLoading, navigate]);

  // Redirect if admin
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'gojek' | 'grab'>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'transfer' | 'ewallet'>('cod');
  const [notes, setNotes] = useState('');

  if (isAuthLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <Link to="/" className="text-primary hover:underline font-medium">Return to Home</Link>
      </div>
    );
  }

  const deliveryFees = {
    pickup: 0,
    gojek: 15000,
    grab: 18000
  };

  const deliveryLabels = {
    pickup: 'Ambil Sendiri (Rp 0)',
    gojek: 'Gojek (Rp 15.000)',
    grab: 'Grab (Rp 18.000)'
  };

  const paymentLabels = {
    cod: 'Cash on Delivery (COD)',
    transfer: 'Transfer Bank',
    ewallet: 'E-Wallet'
  };

  const shippingFee = deliveryFees[deliveryMethod];
  const finalTotal = cartTotal + shippingFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${apiUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          delivery_method: deliveryMethod,
          payment_method: paymentMethod,
          notes
        })
      });

      const data = await res.json();
      if (res.ok) {
        showAlert('Pesanan berhasil dibuat!', 'Berhasil', async () => {
          await clearCart();
          navigate('/orders', { replace: true });
        });
      } else {
        showAlert(data.message || 'Gagal memproses pesanan', 'Gagal');
      }
    } catch (err) {
      console.error(err);
      showAlert('Terjadi kesalahan koneksi server', 'Kesalahan');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Progress Steps */}
      <nav className="flex items-center justify-center text-sm font-medium mb-10 w-full">
        <ol className="flex items-center w-full max-w-2xl justify-center gap-2 sm:gap-4">
          <li className="flex items-center text-primary">
            <Link to="/cart" className="hover:underline">Cart</Link>
            <ChevronRight size={16} className="mx-2" />
          </li>
          <li className="flex items-center text-primary font-bold">
            <span>Checkout</span>
            <ChevronRight size={16} className="mx-2" />
          </li>
          <li className="flex items-center text-gray-400">
            <span>Done</span>
          </li>
        </ol>
      </nav>

      <div className="lg:grid lg:grid-cols-12 lg:gap-12 flex flex-col-reverse gap-8">
        {/* Form */}
        <div className="lg:col-span-7">
          <Link to="/cart" className="flex items-center text-sm text-gray-500 hover:text-primary font-medium mb-6 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Kembali ke Keranjang
          </Link>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Checkout Details</h2>
          
          <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Metode Pengiriman</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(Object.keys(deliveryFees) as Array<keyof typeof deliveryFees>).map((method) => (
                  <label
                    key={method}
                    className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-all ${
                      deliveryMethod === method
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery_method"
                      value={method}
                      checked={deliveryMethod === method}
                      onChange={() => setDeliveryMethod(method)}
                      className="sr-only"
                    />
                    <span className="font-semibold text-sm text-gray-900">
                      {method === 'pickup' ? 'Ambil Sendiri' : method === 'gojek' ? 'Gojek' : 'Grab'}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      {method === 'pickup' ? 'Rp 0' : method === 'gojek' ? 'Rp 15.000' : 'Rp 18.000'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Metode Pembayaran</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(Object.keys(paymentLabels) as Array<keyof typeof paymentLabels>).map((method) => (
                  <label
                    key={method}
                    className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-all ${
                      paymentMethod === method
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      className="sr-only"
                    />
                    <span className="font-semibold text-sm text-gray-900">
                      {method === 'cod' ? 'COD' : method === 'transfer' ? 'Transfer Bank' : 'E-Wallet'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Catatan Tambahan (Opsional)</label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Titip di satpam, warna cadangan biru, dll."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
              />
            </div>

            <div className="pt-6 mt-6 border-t border-gray-200">
              <button 
                type="submit" 
                className="w-full bg-[#1A1A2E] text-white py-4 rounded-lg font-medium hover:bg-primary-hover transition-colors shadow-lg text-lg uppercase tracking-wider font-bold"
              >
                Buat Pesanan
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Ringkasan Pesanan</h2>
            
            <ul className="space-y-4 mb-6">
              {cart.map((item) => (
                <li key={item.product.id} className="flex gap-4">
                  <div className="relative w-16 h-16 bg-white border border-gray-200 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    <span className="absolute -top-1 -right-1 bg-gray-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{item.product.name}</h4>
                    <p className="text-xs text-gray-500">{item.product.category}</p>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatRupiah(item.product.price * item.quantity)}
                  </div>
                </li>
              ))}
            </ul>
            
            <dl className="space-y-4 text-sm text-gray-600 border-t border-gray-200 pt-6 mb-6">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd className="font-medium text-gray-900">{formatRupiah(cartTotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Pengiriman ({deliveryMethod === 'pickup' ? 'Ambil Sendiri' : deliveryMethod === 'gojek' ? 'Gojek' : 'Grab'})</dt>
                <dd className="font-medium text-gray-900">
                  {shippingFee === 0 ? <span className="text-green-600">Gratis</span> : formatRupiah(shippingFee)}
                </dd>
              </div>
            </dl>
            
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <dt className="text-lg font-bold text-gray-900">Total</dt>
              <dd className="text-2xl font-bold text-gray-900">
                {formatRupiah(finalTotal)}
              </dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
