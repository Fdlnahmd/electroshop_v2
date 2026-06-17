import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { formatRupiah, getProductImageUrl } from '../utils';
import { 
  BarChart, Users, Package, ShoppingCart, Star, Search, Plus, 
  Edit, Trash2, CheckCircle, XCircle, Download, X, Clock, TrendingUp,
  ArrowLeft, LogOut, Menu
} from 'lucide-react';

export function AdminPage() {
  const { user, token, apiUrl, logout, isAuthLoading } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'users' | 'reviews'>('dashboard');
  const [isAdminMobileMenuOpen, setIsAdminMobileMenuOpen] = useState(false);
  
  // Data states
  const [stats, setStats] = useState<any>({
    total_products: 0,
    total_orders: 0,
    total_users: 0,
    total_revenue: 0,
    pending_orders: 0,
    delivered_revenue: 0,
    completion_rate: 0,
    top_products: [],
    payment_distribution: [],
    status_distribution: [],
    sales_trend: []
  });
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Filters for stats report
  const [period, setPeriod] = useState<'all' | 'today' | 'weekly' | 'monthly' | 'yearly' | 'custom'>('all');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  // Modals / Form States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    image_url: '',
    status: 'active'
  });
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    tone?: 'danger' | 'primary';
    onConfirm: () => Promise<void> | void;
  } | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Fetch all data helper
  const refreshData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      // Stats
      const resStats = await fetch(`${apiUrl}/api/admin/stats?period=${period}&date_start=${dateStart}&date_end=${dateEnd}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (resStats.ok) setStats(await resStats.json());

      // Products
      const resProducts = await fetch(`${apiUrl}/api/admin/products`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (resProducts.ok) setProducts(await resProducts.json());

      // Orders
      const resOrders = await fetch(`${apiUrl}/api/admin/orders`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (resOrders.ok) setOrders(await resOrders.json());

      // Users
      const resUsers = await fetch(`${apiUrl}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (resUsers.ok) setUsers(await resUsers.json());

      // Reviews
      const resReviews = await fetch(`${apiUrl}/api/admin/reviews`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (resReviews.ok) setReviews(await resReviews.json());

      // Fetch Categories for dropdown with real database IDs
      const resCats = await fetch(`${apiUrl}/api/admin/categories`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (resCats.ok) {
        setCategories(await resCats.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [token, apiUrl, period, dateStart, dateEnd]);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotice({ type, message });
    window.setTimeout(() => setNotice(null), 3200);
  };

  const readResponseMessage = async (res: Response, fallback: string) => {
    try {
      const data = await res.json();
      return data.message || fallback;
    } catch {
      return fallback;
    }
  };

  const runConfirmedAction = async () => {
    if (!confirmDialog) return;
    setIsConfirming(true);
    try {
      await confirmDialog.onConfirm();
      setConfirmDialog(null);
    } finally {
      setIsConfirming(false);
    }
  };

  // Wait for persisted token validation before deciding where to route.
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" state={{ from: { pathname: '/admin' } }} />;
  }

  // Product actions
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      stock: '',
      category_id: categories[0]?.id?.toString() || '1',
      image_url: '',
      status: 'active'
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product: any) => {
    setEditingProduct(product);
    // Find category ID matching the category name or default to 1
    const categoryObj = (categories || []).find(c => c?.name === product?.category);
    setProductForm({
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price?.toString() || '',
      stock: product?.stock?.toString() || '',
      category_id: categoryObj ? categoryObj.id.toString() : '1',
      image_url: product?.image || '',
      status: product?.status || 'active'
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingProduct
        ? `${apiUrl}/api/admin/products/${editingProduct.id}`
        : `${apiUrl}/api/admin/products`;
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: productForm.name,
          description: productForm.description,
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock),
          category_id: parseInt(productForm.category_id),
          image_url: productForm.image_url,
          status: productForm.status
        })
      });

      const message = await readResponseMessage(res, editingProduct ? 'Produk diperbarui!' : 'Produk ditambahkan!');
      if (res.ok) {
        showNotice('success', message);
        setIsProductModalOpen(false);
        refreshData();
      } else {
        showNotice('error', message || 'Gagal menyimpan produk');
      }
    } catch (err) {
      console.error(err);
      showNotice('error', 'Terjadi kesalahan koneksi');
    }
  };

  const handleDeleteProduct = (id: string) => {
    setConfirmDialog({
      title: 'Hapus produk?',
      message: 'Produk akan dinonaktifkan dan tidak tampil lagi di toko maupun daftar admin.',
      confirmLabel: 'Hapus Produk',
      tone: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`${apiUrl}/api/admin/products/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
          const message = await readResponseMessage(res, 'Produk berhasil dihapus');
          if (res.ok) {
            showNotice('success', message);
            refreshData();
          } else {
            showNotice('error', message || 'Gagal menghapus produk');
          }
        } catch (err) {
          console.error(err);
          showNotice('error', 'Terjadi kesalahan koneksi');
        }
      }
    });
  };

  // Order actions
  const handleUpdateOrderStatus = async (orderNumber: string, status: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/orders/${orderNumber}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      const message = await readResponseMessage(res, 'Status pesanan diperbarui');
      if (res.ok) {
        showNotice('success', message);
        refreshData();
      } else {
        showNotice('error', message || 'Gagal memperbarui status pesanan');
      }
    } catch (err) {
      console.error(err);
      showNotice('error', 'Terjadi kesalahan koneksi');
    }
  };

  const handleDeleteOrder = (orderNumber: string) => {
    setConfirmDialog({
      title: 'Hapus pesanan?',
      message: `Pesanan ${orderNumber} dan item di dalamnya akan dihapus dari admin.`,
      confirmLabel: 'Hapus Pesanan',
      tone: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`${apiUrl}/api/admin/orders/${orderNumber}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
          const message = await readResponseMessage(res, 'Pesanan berhasil dihapus');
          if (res.ok) {
            showNotice('success', message);
            refreshData();
          } else {
            showNotice('error', message || 'Gagal menghapus pesanan');
          }
        } catch (err) {
          console.error(err);
          showNotice('error', 'Terjadi kesalahan koneksi');
        }
      }
    });
  };

  // Review actions
  const handleModerateReview = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      const fallback = `Ulasan ${status === 'approved' ? 'disetujui' : 'ditolak'}`;
      const message = await readResponseMessage(res, fallback);
      if (res.ok) {
        showNotice('success', message || fallback);
        refreshData();
      } else {
        showNotice('error', message || 'Gagal memperbarui ulasan');
      }
    } catch (err) {
      console.error(err);
      showNotice('error', 'Terjadi kesalahan koneksi');
    }
  };

  const handleDeleteReview = (id: string) => {
    setConfirmDialog({
      title: 'Hapus ulasan?',
      message: 'Ulasan ini akan dihapus permanen dari daftar review.',
      confirmLabel: 'Hapus Ulasan',
      tone: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`${apiUrl}/api/admin/reviews/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
          const message = await readResponseMessage(res, 'Ulasan berhasil dihapus');
          if (res.ok) {
            showNotice('success', message);
            refreshData();
          } else {
            showNotice('error', message || 'Gagal menghapus ulasan');
          }
        } catch (err) {
          console.error(err);
          showNotice('error', 'Terjadi kesalahan koneksi');
        }
      }
    });
  };

  // Export report
  const handleExportCSV = () => {
    window.open(`${apiUrl}/api/admin/export?token=${token}&period=${period}&date_start=${dateStart}&date_end=${dateEnd}`, '_blank');
  };

  // Filters based on search query
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter(o => 
    o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReviews = reviews.filter(r => 
    r.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.comment && r.comment.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'confirmed': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const statItems = [
    { name: 'Total Produk', icon: Package, value: stats.total_products },
    { name: 'Total Pesanan', icon: ShoppingCart, value: stats.total_orders },
    { name: 'Total Pendapatan', icon: BarChart, value: formatRupiah(stats.total_revenue) },
    { name: 'Pendapatan Terkirim', icon: CheckCircle, value: formatRupiah(stats.delivered_revenue || 0) },
    { name: 'Pesanan Pending', icon: Clock, value: stats.pending_orders || 0 },
    { name: 'Tingkat Penyelesaian', icon: TrendingUp, value: `${stats.completion_rate || 0}%` },
    { name: 'Total Pengguna', icon: Users, value: stats.total_users },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 border-t border-gray-200">
      
      {/* Mobile Admin Header */}
      <div className="md:hidden bg-[#1A1A2E] text-white px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAdminMobileMenuOpen(!isAdminMobileMenuOpen)}
            className="p-1 text-white/80 hover:text-white transition-colors"
          >
            <Menu size={24} />
          </button>
          <span className="font-bold text-base tracking-tight uppercase">Admin Console</span>
        </div>
        <div className="text-xs font-semibold px-2.5 py-1 bg-white/10 rounded uppercase">
          {activeTab}
        </div>
      </div>

      {/* Sidebar / Mobile Drawer */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#1A1A2E] text-white flex-shrink-0 z-30 shadow-xl transform transition-transform duration-300 md:relative md:translate-x-0 ${
        isAdminMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between md:block">
          <div>
            <h2 className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-400 rounded-sm"></div>
              ELECTRO
            </h2>
            <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">Admin Console</p>
          </div>
          <button 
            onClick={() => setIsAdminMobileMenuOpen(false)}
            className="md:hidden p-1 text-white/60 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 space-y-1 flex flex-col">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'orders', label: 'Orders', icon: ShoppingCart },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'reviews', label: 'Reviews', icon: Star },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as any); setSearchQuery(''); setIsAdminMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded w-full transition-all whitespace-nowrap ${
                activeTab === item.id 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
          <div className="h-px bg-white/10 my-2"></div>
          <button
            onClick={() => { navigate('/'); setIsAdminMobileMenuOpen(false); }}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded w-full text-white/60 hover:bg-white/5 hover:text-white transition-all whitespace-nowrap"
          >
            <ArrowLeft size={18} />
            Kembali ke Toko
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded w-full text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all whitespace-nowrap"
          >
            <LogOut size={18} />
            Logout
          </button>
        </nav>
      </aside>

      {/* Overlay for mobile drawer */}
      {isAdminMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsAdminMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 capitalize tracking-tight">{activeTab}</h1>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder={`Search ${activeTab}...`} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              />
            </div>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold flex-shrink-0 cursor-pointer shadow-sm">
              AD
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Period Filter Panel */}
                <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Filter Laporan Penjualan</h3>
                    <p className="text-sm text-gray-500">Pilih periode laporan untuk memperbarui statistik dan grafik</p>
                  </div>
                  <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                    <select
                      value={period}
                      onChange={(e) => setPeriod(e.target.value as any)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    >
                      <option value="all">Semua Waktu</option>
                      <option value="today">Hari Ini</option>
                      <option value="weekly">7 Hari Terakhir</option>
                      <option value="monthly">30 Hari Terakhir</option>
                      <option value="yearly">1 Tahun Terakhir</option>
                      <option value="custom">Rentang Tanggal Kustom</option>
                    </select>

                    {period === 'custom' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={dateStart}
                          onChange={(e) => setDateStart(e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                        />
                        <span className="text-gray-500 text-sm">s/d</span>
                        <input
                          type="date"
                          value={dateEnd}
                          onChange={(e) => setDateEnd(e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Sales & Operations Report</h3>
                    <p className="text-sm text-gray-500">Download complete order records in CSV format</p>
                  </div>
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 bg-[#1A1A2E] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-opacity-90 shadow"
                  >
                    <Download size={16} /> Export Sales CSV
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {statItems.map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">{stat.name}</p>
                          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</h3>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg text-primary">
                          <stat.icon size={24} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Top 10 Best Selling Products */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                      <h3 className="font-semibold text-gray-900">Top 10 Produk Terlaris</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Produk</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty Terjual</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Penjualan</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {stats.top_products && stats.top_products.length > 0 ? (
                            stats.top_products.map((item: any, idx: number) => (
                              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 text-right">{item.total_qty}</td>
                                <td className="px-6 py-4 text-sm text-gray-900 font-semibold text-right">{formatRupiah(item.total_sales)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500 italic">
                                Belum ada data penjualan produk untuk periode ini.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Distribution and Breakdown */}
                  <div className="space-y-8">
                    {/* Payment Distribution */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                        <h3 className="font-semibold text-gray-900">Distribusi Metode Pembayaran</h3>
                      </div>
                      <div className="p-6">
                        {stats.payment_distribution && stats.payment_distribution.length > 0 ? (
                          <div className="space-y-4">
                            {stats.payment_distribution.map((item: any, idx: number) => (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="font-medium text-gray-700 uppercase">{item.method}</span>
                                  <span className="text-gray-500">{item.count} order ({formatRupiah(item.total)})</span>
                                </div>
                                <div className="w-full bg-gray-150 h-2 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-primary h-full rounded-full" 
                                    style={{ width: `${stats.total_orders > 0 ? (item.count / stats.total_orders) * 100 : 0}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic text-center py-4">Belum ada data.</p>
                        )}
                      </div>
                    </div>

                    {/* Order Status Distribution */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                        <h3 className="font-semibold text-gray-900">Distribusi Status Pesanan</h3>
                      </div>
                      <div className="p-6">
                        {stats.status_distribution && stats.status_distribution.length > 0 ? (
                          <div className="flex flex-wrap gap-4">
                            {stats.status_distribution.map((item: any, idx: number) => (
                              <div key={idx} className="flex-1 min-w-[120px] bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase mb-2 ${getStatusColor(item.status)}`}>
                                  {item.status}
                                </span>
                                <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic text-center py-4">Belum ada data.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Recent Orders</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.order_number}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.user_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                                {order.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatRupiah(order.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <h3 className="font-semibold text-gray-900">Manage Products</h3>
                  <button 
                    onClick={handleOpenAddProduct}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm"
                  >
                    <Plus size={16} /> Add Product
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 border border-gray-200 rounded overflow-hidden flex items-center justify-center">
                                <img className="h-10 w-10 object-cover" src={getProductImageUrl(product.image)} alt="" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatRupiah(product.price)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              product.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {product.stock} in stock
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-3">
                              <button onClick={() => handleOpenEditProduct(product)} className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded"><Edit size={16} /></button>
                              <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <h3 className="font-semibold text-gray-900">Manage Orders</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.order_number}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.user_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatRupiah(order.total)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                              {order.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <select 
                                value={order.status.toLowerCase()} 
                                onChange={(e) => handleUpdateOrderStatus(order.order_number, e.target.value)}
                                className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="preparing">Preparing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                              <button onClick={() => handleDeleteOrder(order.order_number)} className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded" title="Delete"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <h3 className="font-semibold text-gray-900">Manage Users</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold uppercase">
                              {u.name.charAt(0)}
                            </div>
                            {u.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                              u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <h3 className="font-semibold text-gray-900">Manage Reviews</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Comment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredReviews.map((review) => (
                        <tr key={review.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold uppercase">
                                {review.user_name.charAt(0)}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{review.user_name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{review.product_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-500">
                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{review.comment}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                              review.status === 'approved' ? 'bg-green-100 text-green-800' :
                              review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {review.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-3">
                              {review.status !== 'approved' && (
                                <button onClick={() => handleModerateReview(review.id, 'approved')} className="text-green-600 hover:text-green-900 bg-green-50 p-1.5 rounded" title="Approve"><CheckCircle size={16} /></button>
                              )}
                              {review.status !== 'rejected' && (
                                <button onClick={() => handleModerateReview(review.id, 'rejected')} className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded" title="Reject"><XCircle size={16} /></button>
                              )}
                              <button onClick={() => handleDeleteReview(review.id)} className="text-gray-600 hover:text-gray-900 bg-gray-150 p-1.5 rounded" title="Delete"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {notice && (
        <div className="fixed top-5 right-5 z-[60] max-w-sm">
          <div className={`rounded-lg border px-4 py-3 shadow-lg ${
            notice.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-start gap-3">
              {notice.type === 'success' ? <CheckCircle size={18} className="mt-0.5 flex-shrink-0" /> : <XCircle size={18} className="mt-0.5 flex-shrink-0" />}
              <p className="text-sm font-medium leading-5">{notice.message}</p>
              <button onClick={() => setNotice(null)} className="ml-auto text-current opacity-60 hover:opacity-100">
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDialog && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-500/75" onClick={() => !isConfirming && setConfirmDialog(null)}></div>
          <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{confirmDialog.title}</h3>
              <button disabled={isConfirming} onClick={() => setConfirmDialog(null)} className="text-gray-400 hover:text-gray-600 disabled:opacity-50">
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm leading-6 text-gray-600">{confirmDialog.message}</p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                disabled={isConfirming}
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-white disabled:opacity-60"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isConfirming}
                onClick={runConfirmedAction}
                className={`px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60 ${
                  confirmDialog.tone === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#1A1A2E] hover:bg-opacity-90'
                }`}
              >
                {isConfirming ? 'Memproses...' : confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-500/75 transition-opacity" onClick={() => setIsProductModalOpen(false)}></div>
          <div className="relative z-10 w-full max-w-lg bg-white rounded-xl text-left overflow-hidden shadow-xl">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Produk</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                  <textarea
                    rows={3}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Harga (Rupiah)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stok</label>
                    <input
                      type="number"
                      required
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kategori</label>
                    <select
                      value={productForm.category_id}
                      onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                    >
                      {(categories || []).map((c) => (
                        <option key={c?.id} value={c?.id?.toString()}>{c?.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={productForm.status}
                      onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Image URL</label>
                  <input
                    type="text"
                    value={productForm.image_url}
                    onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1A1A2E] text-white rounded-lg text-sm font-semibold hover:bg-opacity-90"
                  >
                    Simpan
                  </button>
                </div>
              </form>
          </div>
        </div>
      )}
    </div>
  );
}
