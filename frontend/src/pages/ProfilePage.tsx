import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { User as UserIcon, Settings, LogOut, BarChart3, ShoppingBag, Clock, ArrowLeft } from 'lucide-react';
import { formatRupiah } from '../utils';

export function ProfilePage() {
  const { user, token, logout, apiUrl, login, isAuthLoading } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'info' | 'password' | 'stats'>('info');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [stats, setStats] = useState<any>({
    member_since: '',
    total_orders: 0,
    completed_orders: 0,
    active_orders: 0,
    total_spent: 0,
    recent_orders: []
  });

  useEffect(() => {
    if (isAuthLoading) return;

    if (!token) {
      navigate('/login');
    } else if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user, token, isAuthLoading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${apiUrl}/api/profile/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });
        if (res.ok) {
          setStats(await res.json());
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, [token, apiUrl]);

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await fetch(`${apiUrl}/api/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ name, phone, address })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Profil berhasil diperbarui!');
        // Update user state
        login(data, token!);
      } else {
        setError(data.message || 'Gagal memperbarui profil');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Password baru dan konfirmasi password tidak cocok');
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name,
          current_password: currentPassword,
          password: newPassword,
          password_confirmation: confirmPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Password berhasil diperbarui!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.message || 'Gagal memperbarui password');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi');
    }
  };

  const initialNameParts = name.split(' ');
  const initials = initialNameParts.length > 1 
    ? `${initialNameParts[0][0]}${initialNameParts[1][0]}`
    : initialNameParts[0] ? initialNameParts[0][0] : 'U';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-w-0">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary transition-colors">
          <ArrowLeft size={16} />
          <span>Kembali ke Toko</span>
        </Link>
      </div>
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Profile</h1>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      {message && (
        <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl border border-green-150 text-sm">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl border border-red-150 text-sm">
          {error}
        </div>
      )}

      <div className="w-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        
        {/* Header Profile Info */}
        <div className="bg-gray-50 px-4 py-6 sm:px-8 sm:py-10 border-b border-gray-200 flex flex-col md:flex-row items-center gap-4 sm:gap-6">
          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold shadow-md uppercase flex-shrink-0">
            {initials}
          </div>
          <div className="text-center md:text-left min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 truncate">{name}</h2>
            <p className="text-gray-500 truncate">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                {user.role} user
              </span>
              {stats.member_since && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Member sejak: {stats.member_since}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex w-full border-b border-gray-200 bg-white overflow-x-auto whitespace-nowrap scrollbar-none">
          <button
            onClick={() => { setActiveTab('info'); setMessage(''); setError(''); }}
            className={`flex-1 min-w-max px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'info' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <UserIcon size={18} /> Personal Info
          </button>
          <button
            onClick={() => { setActiveTab('stats'); setMessage(''); setError(''); }}
            className={`flex-1 min-w-max px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'stats' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <BarChart3 size={18} /> Statistik & Riwayat
          </button>
          <button
            onClick={() => { setActiveTab('password'); setMessage(''); setError(''); }}
            className={`flex-1 min-w-max px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'password' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Settings size={18} /> Change Password
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-8">
          {activeTab === 'info' && (
            <form className="space-y-6 max-w-xl mx-auto" onSubmit={handleUpdateProfile}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={user.email}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none text-gray-500 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 081234567890"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Jl. Merdeka No. 12"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-hover transition-colors shadow-sm">
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form className="space-y-6 max-w-xl mx-auto" onSubmit={handleUpdatePassword}>
              <div className="space-y-2">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-hover transition-colors shadow-sm">
                  Update Password
                </button>
              </div>
            </form>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Pesanan</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.total_orders}</h3>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <p className="text-sm font-medium text-gray-500 mb-1">Pesanan Selesai</p>
                  <h3 className="text-3xl font-bold text-green-650">{stats.completed_orders}</h3>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <p className="text-sm font-medium text-gray-500 mb-1">Pesanan Aktif</p>
                  <h3 className="text-3xl font-bold text-blue-650">{stats.active_orders}</h3>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Belanja</p>
                  <h3 className="text-2xl font-bold text-primary">{formatRupiah(stats.total_spent)}</h3>
                </div>
              </div>

              {/* Recent Orders List */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">5 Pesanan Terakhir</h3>
                {stats.recent_orders && stats.recent_orders.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recent_orders.map((order: any) => (
                      <div key={order.id} className="border border-gray-200 rounded-xl p-6 space-y-4 bg-white hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center flex-wrap gap-2 border-b border-gray-100 pb-3">
                          <div>
                            <span className="font-semibold text-gray-900 text-sm">{order.order_number}</span>
                            <span className="text-gray-400 text-xs mx-2">|</span>
                            <span className="text-gray-500 text-xs">{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                            order.status.toLowerCase() === 'delivered' ? 'bg-green-150 text-green-800' :
                            order.status.toLowerCase() === 'cancelled' ? 'bg-red-150 text-red-800' :
                            'bg-yellow-150 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-4 items-center">
                              <img src={item.product.image} alt={item.product.name} className="w-12 h-12 object-cover rounded border border-gray-200 flex-shrink-0" />
                              <div className="flex-grow min-w-0">
                                <h5 className="text-sm font-medium text-gray-900 truncate">{item.product.name}</h5>
                                <p className="text-xs text-gray-500">Qty: {item.quantity} x {formatRupiah(item.product.price)}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-sm">
                          <span className="text-gray-500">Total Pembayaran</span>
                          <span className="font-bold text-gray-900">{formatRupiah(order.total_amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-500 italic">Belum ada riwayat pesanan.</p>
                    <Link to="/" className="mt-4 inline-block text-sm text-primary font-semibold hover:underline">
                      Mulai Belanja Sekarang
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
