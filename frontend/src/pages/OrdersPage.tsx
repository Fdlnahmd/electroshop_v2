import React, { useState, useEffect } from 'react';
import { Package, ChevronRight, X, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { Link, useNavigate } from 'react-router-dom';
import { formatRupiah, getProductImageUrl } from '../utils';

export function OrdersPage() {
  const { user, token, apiUrl, isAuthLoading } = useAppContext();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Redirect if admin
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  // Review Modal states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewProduct, setReviewProduct] = useState<{ id: string; name: string; orderId: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const handleOpenReviewModal = (productId: string, productName: string, orderId: string) => {
    setReviewProduct({ id: productId, name: productName, orderId });
    setRating(5);
    setComment('');
    setReviewError('');
    setReviewSuccess('');
    setIsReviewModalOpen(true);
  };

  const handleSendReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewProduct) return;
    setReviewError('');
    setReviewSuccess('');

    try {
      const res = await fetch(`${apiUrl}/api/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          product_id: reviewProduct.id,
          order_id: reviewProduct.orderId,
          rating: rating,
          comment: comment
        })
      });
      const data = await res.json();
      if (res.ok) {
        setReviewSuccess('Ulasan Anda berhasil dikirim dan akan diverifikasi oleh admin.');
        setTimeout(() => {
          setIsReviewModalOpen(false);
          setReviewProduct(null);
        }, 2000);
      } else {
        setReviewError(data.message || 'Gagal mengirim ulasan.');
      }
    } catch (err) {
      setReviewError('Terjadi kesalahan koneksi.');
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        const res = await fetch(`${apiUrl}/api/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [token, apiUrl]);

  if (isAuthLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to view orders</h2>
        <Link to="/login" className="bg-primary text-white font-medium px-8 py-3 rounded-full hover:bg-primary-hover transition-colors">
          Login
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary transition-colors">
          <ArrowLeft size={16} />
          <span>Kembali ke Toko</span>
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">My Orders</h1>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500 mb-6">Looks like you haven't placed any orders yet.</p>
          <Link to="/" className="text-primary font-medium hover:underline">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 w-full sm:w-auto text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Order Number</p>
                    <p className="font-medium text-gray-900">{order.order_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Date Placed</p>
                    <p className="font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Total Amount</p>
                    <p className="font-medium text-gray-900">{formatRupiah(order.total_amount)}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:items-end w-full sm:w-auto">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="flex flex-wrap gap-4">
                    {order.items.slice(0, 3).map((item: any, idx: number) => (
                      <div key={idx} className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-md overflow-hidden relative flex items-center justify-center">
                        <img src={getProductImageUrl(item.product.image)} alt={item.product.name} className="w-full h-full object-cover" />
                        {item.quantity > 1 && (
                          <span className="absolute bottom-0 right-0 bg-gray-900/80 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-tl-md">
                            x{item.quantity}
                          </span>
                        )}
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-md flex items-center justify-center text-sm font-medium text-gray-500">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors w-full sm:w-auto whitespace-nowrap"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setSelectedOrder(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
              
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900" id="modal-title">
                  Order Details
                </h3>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-500">
                  <X size={24} />
                </button>
              </div>
              
              <div className="px-4 py-5 sm:p-6 h-[60vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-sm text-gray-500">Order ID: <span className="font-medium text-gray-900">{selectedOrder.order_number}</span></p>
                    <p className="text-sm text-gray-500">Date: <span className="font-medium text-gray-900">{new Date(selectedOrder.created_at).toLocaleDateString()}</span></p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Items</h4>
                <div className="space-y-4 mb-8">
                  {selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <img src={getProductImageUrl(item.product.image)} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow">
                        <h5 className="text-sm font-medium text-gray-900 line-clamp-1">{item.product.name}</h5>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          {selectedOrder.status.toLowerCase() === 'delivered' && (
                            <button
                              onClick={() => handleOpenReviewModal(item.product.id, item.product.name, selectedOrder.id)}
                              className="text-xs text-primary font-semibold hover:underline"
                            >
                              Tulis Ulasan
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatRupiah(item.product.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Delivery & Payment Information</h4>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p><span className="font-medium text-gray-900">Delivery Method:</span> {selectedOrder.delivery_method.toUpperCase()}</p>
                      <p><span className="font-medium text-gray-900">Payment Method:</span> {selectedOrder.payment_method.toUpperCase()}</p>
                      {selectedOrder.notes && (
                        <p><span className="font-medium text-gray-900">Notes:</span> {selectedOrder.notes}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Payment Summary</h4>
                    <dl className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <dt>Subtotal</dt>
                        <dd>{formatRupiah(selectedOrder.total_amount - selectedOrder.delivery_fee)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Pengiriman ({selectedOrder.delivery_method})</dt>
                        <dd>{selectedOrder.delivery_fee === 0 ? 'Gratis' : formatRupiah(selectedOrder.delivery_fee)}</dd>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-100 font-bold text-gray-900">
                        <dt>Total</dt>
                        <dd>{formatRupiah(selectedOrder.total_amount)}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && reviewProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsReviewModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Tulis Ulasan</h3>
                  <button onClick={() => setIsReviewModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleSendReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Produk</label>
                    <p className="text-sm text-gray-900 font-semibold mt-1">{reviewProduct.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rating</label>
                    <div className="flex gap-2 my-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`text-2xl transition-transform hover:scale-110 ${
                            star <= rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Komentar / Ulasan</label>
                    <textarea
                      id="comment"
                      rows={4}
                      required
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Bagikan pengalaman Anda menggunakan produk ini..."
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>

                  {reviewError && (
                    <div className="text-red-600 text-sm bg-red-50 p-2 rounded-md border border-red-200">
                      {reviewError}
                    </div>
                  )}

                  {reviewSuccess && (
                    <div className="text-green-600 text-sm bg-green-50 p-2 rounded-md border border-green-200">
                      {reviewSuccess}
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsReviewModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-opacity-95 focus:outline-none shadow"
                    >
                      Kirim Ulasan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
