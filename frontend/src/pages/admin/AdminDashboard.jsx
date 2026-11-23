import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, ShoppingBag, Package, TrendingUp, 
  CheckCircle2, XCircle, Search, Filter, RefreshCw, 
  ChevronRight, Phone, Mail, MapPin, Eye, AlertCircle, Headphones,
  Trash2, Edit, Plus, Layers, Send, AlertTriangle, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import PageBackground from '../../components/common/PageBackground';
import bg9 from '../../assets/images/bg9_hd.jpg';
import api from '../../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // overview, users, products, orders, categories, system, support
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' });

  // Modals state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    full_name: '', email: '', mobile_number: '', password: '', role: 'buyer',
    farm_name: '', village: '', district: '', state: 'Telangana', pincode: '500001'
  });

  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [productFormData, setProductFormData] = useState({
    name: '', category_id: '', farmer_id: '', price: '', unit: 'kg',
    available_quantity: 10, location: 'Farm Hub', description: '',
    image_url: '', is_organic: false
  });

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '', description: '', image: ''
  });

  const [broadcastData, setBroadcastData] = useState({
    title: '', message: '', target: 'all'
  });

  const showNotification = (text, type = 'success') => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg({ type: '', text: '' }), 4500);
  };

  const fetchOverview = async () => {
    try {
      const res = await api.get('/api/admin/overview');
      setStats(res.data.stats);
      setRecentOrders(res.data.recent_orders || []);
    } catch (e) { console.error(e); }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/admin/users');
      setUsersList(res.data.users || []);
    } catch (e) { console.error(e); }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/api/admin/products');
      setProductsList(res.data.products || []);
    } catch (e) { console.error(e); }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/admin/orders');
      setOrdersList(res.data.orders || []);
    } catch (e) { console.error(e); }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/admin/categories');
      setCategoriesList(res.data.categories || []);
    } catch (e) { console.error(e); }
  };

  const fetchSupport = async () => {
    try {
      const res = await api.get('/api/admin/support');
      setSupportTickets(res.data.tickets || []);
    } catch (e) { console.error(e); }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchOverview(),
      fetchUsers(),
      fetchProducts(),
      fetchOrders(),
      fetchCategories(),
      fetchSupport()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  // ==========================================
  // USER ACTIONS
  // ==========================================
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/admin/users', userFormData);
      showNotification(res.data.message);
      setShowAddUserModal(false);
      setUserFormData({
        full_name: '', email: '', mobile_number: '', password: '', role: 'buyer',
        farm_name: '', village: '', district: '', state: 'Telangana', pincode: '500001'
      });
      fetchUsers();
      fetchOverview();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to create user', 'error');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/api/admin/users/${selectedUser.id}`, userFormData);
      showNotification(res.data.message);
      setShowEditUserModal(false);
      fetchUsers();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to update user', 'error');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to PERMANENTLY delete user "${userName}"? All their products, addresses, and orders will also be deleted.`)) {
      return;
    }
    try {
      const res = await api.delete(`/api/admin/users/${userId}`);
      showNotification(res.data.message);
      fetchUsers();
      fetchProducts();
      fetchOrders();
      fetchOverview();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to delete user', 'error');
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      const res = await api.patch(`/api/admin/users/${userId}/toggle-status`);
      showNotification(res.data.message);
      fetchUsers();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to update user', 'error');
    }
  };

  // ==========================================
  // PRODUCT ACTIONS
  // ==========================================
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/admin/products', productFormData);
      showNotification(res.data.message);
      setShowAddProductModal(false);
      setProductFormData({
        name: '', category_id: '', farmer_id: '', price: '', unit: 'kg',
        available_quantity: 10, location: 'Farm Hub', description: '',
        image_url: '', is_organic: false
      });
      fetchProducts();
      fetchOverview();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to create product', 'error');
    }
  };

  const handleDeleteProduct = async (productId, prodName) => {
    if (!window.confirm(`Permanently delete produce "${prodName}" from marketplace?`)) {
      return;
    }
    try {
      const res = await api.delete(`/api/admin/products/${productId}`);
      showNotification(res.data.message);
      fetchProducts();
      fetchOverview();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to delete product', 'error');
    }
  };

  const handleToggleProductStatus = async (productId) => {
    try {
      const res = await api.patch(`/api/admin/products/${productId}/toggle-status`);
      showNotification(res.data.message);
      fetchProducts();
      fetchOverview();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to update product', 'error');
    }
  };

  // ==========================================
  // ORDER ACTIONS
  // ==========================================
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/api/admin/orders/${orderId}/status`, { status: newStatus });
      showNotification(res.data.message);
      fetchOrders();
      fetchOverview();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to update order', 'error');
    }
  };

  const handleUpdateOrderPayment = async (orderId, newPayment) => {
    try {
      const res = await api.patch(`/api/admin/orders/${orderId}/payment`, { payment_status: newPayment });
      showNotification(res.data.message);
      fetchOrders();
      fetchOverview();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to update payment', 'error');
    }
  };

  const handleDeleteOrder = async (orderId, orderNum) => {
    if (!window.confirm(`Permanently delete order #${orderNum}? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await api.delete(`/api/admin/orders/${orderId}`);
      showNotification(res.data.message);
      fetchOrders();
      fetchOverview();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to delete order', 'error');
    }
  };

  // ==========================================
  // CATEGORY ACTIONS
  // ==========================================
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/admin/categories', categoryFormData);
      showNotification(res.data.message);
      setShowAddCategoryModal(false);
      setCategoryFormData({ name: '', description: '', image: '' });
      fetchCategories();
      fetchOverview();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to create category', 'error');
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (!window.confirm(`Delete category "${catName}"?`)) return;
    try {
      const res = await api.delete(`/api/admin/categories/${catId}`);
      showNotification(res.data.message);
      fetchCategories();
      fetchOverview();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to delete category', 'error');
    }
  };

  // ==========================================
  // SYSTEM ACTIONS
  // ==========================================
  const handlePurgeData = async () => {
    const confirmation = window.prompt('Type "PURGE" to permanently remove all non-admin users, orders, and products:');
    if (confirmation !== 'PURGE') {
      showNotification('Purge cancelled', 'error');
      return;
    }
    try {
      const res = await api.post('/api/admin/system/purge-demo-data');
      showNotification(res.data.message);
      loadAll();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Purge failed', 'error');
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastData.message.trim()) return;
    try {
      const res = await api.post('/api/admin/system/broadcast', broadcastData);
      showNotification(res.data.message);
      setBroadcastData({ title: '', message: '', target: 'all' });
    } catch (err) {
      showNotification(err.response?.data?.error || 'Broadcast failed', 'error');
    }
  };

  const handleResolveTicket = async (ticketId) => {
    try {
      const res = await api.patch(`/api/admin/support/${ticketId}/resolve`);
      showNotification(res.data.message);
      fetchSupport();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to resolve ticket', 'error');
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    try {
      const res = await api.delete(`/api/admin/support/${ticketId}`);
      showNotification(res.data.message);
      fetchSupport();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to delete ticket', 'error');
    }
  };

  // Filtered views
  const filteredUsers = usersList.filter(u => {
    const matchSearch = (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (u.mobile_number || '').includes(searchTerm);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const filteredProducts = productsList.filter(p => {
    return (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (p.farmer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (p.category_name || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredOrders = ordersList.filter(o => {
    return (o.order_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (o.buyer_name || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kisan-bg">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-kisan-primary"></div>
          <p className="text-xs font-semibold text-kisan-muted">Loading KisanDirect Super Admin...</p>
        </div>
      </div>
    );
  }

  const farmersList = usersList.filter(u => u.role === 'farmer');

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <PageBackground image={bg9} />
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-kisan-dark via-kisan-primary to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <img
          src={bg9}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay pointer-events-none"
        />
        <div>
          <div className="flex items-center space-x-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Full Access Administrator Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Platform Command Center</h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
            Logged in as <span className="font-bold underline">{user?.email || 'admin@gmail.com'}</span>. You have master privileges to manage, edit, and delete any user, product, or order.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadAll}
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-2xl text-xs font-bold border border-white/20 backdrop-blur transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionMsg.text && (
        <div className={`p-4 rounded-2xl flex items-center space-x-3 text-xs font-bold animate-fade-in shadow-sm ${
          actionMsg.type === 'error'
            ? 'bg-red-50 border border-red-200 text-red-800'
            : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
        }`}>
          {actionMsg.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          )}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Key Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-kisan-border shadow-card">
          <div className="flex items-center justify-between text-kisan-muted text-xs font-semibold mb-1">
            <span>Sales GMV</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-kisan-dark">₹{Number(stats?.total_gmv || 0).toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-emerald-700 font-bold">Platform Gross</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-kisan-border shadow-card">
          <div className="flex items-center justify-between text-kisan-muted text-xs font-semibold mb-1">
            <span>Orders</span>
            <Package className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-black text-kisan-dark">{stats?.total_orders || 0}</p>
          <span className="text-[10px] text-amber-700 font-bold">Total Placed</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-kisan-border shadow-card">
          <div className="flex items-center justify-between text-kisan-muted text-xs font-semibold mb-1">
            <span>Products</span>
            <ShoppingBag className="w-4 h-4 text-kisan-primary" />
          </div>
          <p className="text-xl font-black text-kisan-dark">{stats?.active_products || 0}</p>
          <span className="text-[10px] text-kisan-primary font-bold">Of {stats?.total_products || 0} Listed</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-kisan-border shadow-card">
          <div className="flex items-center justify-between text-kisan-muted text-xs font-semibold mb-1">
            <span>Farmers</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-kisan-dark">{stats?.total_farmers || 0}</p>
          <span className="text-[10px] text-emerald-700 font-bold">Producers</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-kisan-border shadow-card">
          <div className="flex items-center justify-between text-kisan-muted text-xs font-semibold mb-1">
            <span>Buyers</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-black text-kisan-dark">{stats?.total_buyers || 0}</p>
          <span className="text-[10px] text-blue-700 font-bold">Consumers</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-kisan-border shadow-card">
          <div className="flex items-center justify-between text-kisan-muted text-xs font-semibold mb-1">
            <span>Categories</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl font-black text-kisan-dark">{stats?.total_categories || 0}</p>
          <span className="text-[10px] text-purple-700 font-bold">Active Sections</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-kisan-border pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'users', label: `Users (${usersList.length})`, icon: Users },
          { id: 'products', label: `Produce (${productsList.length})`, icon: ShoppingBag },
          { id: 'orders', label: `Orders (${ordersList.length})`, icon: Package },
          { id: 'categories', label: `Categories (${categoriesList.length})`, icon: Layers },
          { id: 'support', label: `Support (${supportTickets.length})`, icon: Headphones },
          { id: 'system', label: 'System Controls', icon: ShieldCheck },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-kisan-primary text-white shadow-md'
                  : 'bg-white text-kisan-muted hover:text-kisan-dark hover:bg-gray-100 border border-kisan-border'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Subheader Search & Quick Action Buttons */}
      {['users', 'products', 'orders'].includes(activeTab) && (
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-kisan-muted" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-kisan-border rounded-2xl text-xs text-kisan-dark focus:outline-none focus:border-kisan-primary"
            />
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            {activeTab === 'users' && (
              <>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-white border border-kisan-border rounded-xl text-xs px-3 py-2 font-semibold text-kisan-dark"
                >
                  <option value="all">All Roles</option>
                  <option value="farmer">Farmers</option>
                  <option value="buyer">Buyers</option>
                  <option value="admin">Admins</option>
                </select>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="flex items-center space-x-1.5 bg-kisan-primary text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-kisan-dark shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add User</span>
                </button>
              </>
            )}

            {activeTab === 'products' && (
              <button
                onClick={() => setShowAddProductModal(true)}
                className="flex items-center space-x-1.5 bg-kisan-primary text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-kisan-dark shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Produce</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: OVERVIEW                                          */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Action Bar */}
          <div className="bg-white rounded-3xl p-6 border border-kisan-border shadow-card space-y-3">
            <h2 className="text-sm font-bold text-kisan-dark">Quick Administrative Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => { setActiveTab('users'); setShowAddUserModal(true); }}
                className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-left transition-colors"
              >
                <Users className="w-5 h-5 text-emerald-700 mb-1" />
                <p className="text-xs font-bold text-emerald-900">Add New User</p>
                <p className="text-[10px] text-emerald-700">Create farmer, buyer or admin</p>
              </button>

              <button
                onClick={() => { setActiveTab('products'); setShowAddProductModal(true); }}
                className="p-3 rounded-2xl bg-amber-50 border border-amber-200 hover:bg-amber-100 text-left transition-colors"
              >
                <ShoppingBag className="w-5 h-5 text-amber-700 mb-1" />
                <p className="text-xs font-bold text-amber-900">Add Agricultural Listing</p>
                <p className="text-[10px] text-amber-700">Publish crop or produce</p>
              </button>

              <button
                onClick={() => { setActiveTab('categories'); setShowAddCategoryModal(true); }}
                className="p-3 rounded-2xl bg-purple-50 border border-purple-200 hover:bg-purple-100 text-left transition-colors"
              >
                <Layers className="w-5 h-5 text-purple-700 mb-1" />
                <p className="text-xs font-bold text-purple-900">New Category</p>
                <p className="text-[10px] text-purple-700">Expand marketplace catalog</p>
              </button>

              <button
                onClick={() => setActiveTab('system')}
                className="p-3 rounded-2xl bg-red-50 border border-red-200 hover:bg-red-100 text-left transition-colors"
              >
                <AlertTriangle className="w-5 h-5 text-red-700 mb-1" />
                <p className="text-xs font-bold text-red-900">System Maintenance</p>
                <p className="text-[10px] text-red-700">Purge demo data or broadcast</p>
              </button>
            </div>
          </div>

          {/* Fulfillment Matrix */}
          <div className="bg-white rounded-3xl p-6 border border-kisan-border shadow-card space-y-4">
            <h2 className="text-base font-bold text-kisan-dark">Order Pipeline Status</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Placed', count: stats?.status_counts?.placed || 0, color: 'bg-blue-50 text-blue-700 border-blue-200' },
                { label: 'Confirmed', count: stats?.status_counts?.confirmed || 0, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                { label: 'Packed', count: stats?.status_counts?.packed || 0, color: 'bg-amber-50 text-amber-700 border-amber-200' },
                { label: 'Shipped', count: stats?.status_counts?.shipped || 0, color: 'bg-purple-50 text-purple-700 border-purple-200' },
                { label: 'Delivered', count: stats?.status_counts?.delivered || 0, color: 'bg-green-50 text-green-700 border-green-200' },
                { label: 'Cancelled', count: stats?.status_counts?.cancelled || 0, color: 'bg-red-50 text-red-700 border-red-200' },
              ].map(st => (
                <div key={st.label} className={`p-3 rounded-2xl border ${st.color} text-center`}>
                  <p className="text-xs font-semibold">{st.label}</p>
                  <p className="text-xl font-black mt-1">{st.count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-3xl p-6 border border-kisan-border shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-kisan-dark">Recent Platform Transactions</h2>
              <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-kisan-primary hover:underline">
                View All Orders
              </button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-12 text-kisan-muted">
                <Package className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <p className="text-xs font-semibold">No orders currently on the platform.</p>
                <p className="text-[11px] text-gray-400">Orders placed by customers will appear here in real-time.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-kisan-muted font-bold">
                      <th className="pb-3">Order #</th>
                      <th className="pb-3">Buyer</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentOrders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50/50">
                        <td className="py-3 font-bold text-kisan-dark">{order.order_number}</td>
                        <td className="py-3">{order.buyer_name || 'Customer'}</td>
                        <td className="py-3 font-bold text-kisan-dark">₹{order.total_amount}</td>
                        <td className="py-3">
                          <span className="capitalize px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            {order.order_status}
                          </span>
                        </td>
                        <td className="py-3 text-kisan-muted">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => setActiveTab('orders')}
                            className="text-xs font-bold text-kisan-primary hover:underline"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: USER MANAGEMENT (Full CRUD: Add, Edit, Delete)    */}
      {/* ======================================================== */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 border border-kisan-border shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-kisan-dark">
              Registered Accounts ({filteredUsers.length})
            </h2>
            <span className="text-xs text-kisan-muted">Admin can create, edit, suspend, or permanently delete any account.</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-kisan-muted font-bold">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Farm / Location</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Manage Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/50">
                    <td className="py-3 font-bold text-kisan-dark flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-xl bg-kisan-light text-kisan-primary flex items-center justify-center font-black text-xs shadow-sm">
                        {u.full_name ? u.full_name[0] : 'U'}
                      </div>
                      <div>
                        <span>{u.full_name}</span>
                        {u.id === user?.id && <span className="ml-1 text-[9px] text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded font-bold">You</span>}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`capitalize px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'farmer' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-kisan-muted">{u.email || '-'}</td>
                    <td className="py-3 text-kisan-muted">{u.mobile_number || '-'}</td>
                    <td className="py-3 text-kisan-muted">
                      {u.farmer_profile?.farm_name || u.farmer_profile?.village || 'Customer Delivery'}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-2">
                      {u.id !== user?.id && (
                        <>
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${
                              u.is_active
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                            title={u.is_active ? 'Suspend User' : 'Activate User'}
                          >
                            {u.is_active ? 'Suspend' : 'Activate'}
                          </button>

                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setUserFormData({
                                full_name: u.full_name || '',
                                email: u.email || '',
                                mobile_number: u.mobile_number || '',
                                password: '',
                                role: u.role || 'buyer',
                                farm_name: u.farmer_profile?.farm_name || '',
                                village: u.farmer_profile?.village || '',
                                district: u.farmer_profile?.district || '',
                                state: u.farmer_profile?.state || 'Telangana',
                                pincode: u.farmer_profile?.pincode || '500001'
                              });
                              setShowEditUserModal(true);
                            }}
                            className="text-[10px] font-bold px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg inline-flex items-center space-x-1"
                            title="Edit User"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u.id, u.full_name)}
                            className="text-[10px] font-bold px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg inline-flex items-center space-x-1"
                            title="Delete User Permanently"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: PRODUCE & INVENTORY MANAGEMENT                    */}
      {/* ======================================================== */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl p-6 border border-kisan-border shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-kisan-dark">
              Marketplace Agricultural Produce ({filteredProducts.length})
            </h2>
            <span className="text-xs text-kisan-muted">Admin can add, publish, delist, or permanently remove products.</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-kisan-muted">
              <ShoppingBag className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-xs font-semibold">No agricultural produce listed currently.</p>
              <p className="text-[11px] text-gray-400">Farmers can add their produce, or you can click "Add Produce" above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-kisan-muted font-bold">
                    <th className="pb-3">Produce</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Farmer</th>
                    <th className="pb-3">Price / Unit</th>
                    <th className="pb-3">Available Qty</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="py-3 font-bold text-kisan-dark flex items-center space-x-3">
                        <img
                          src={p.image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200'}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover border border-kisan-border"
                        />
                        <div>
                          <p>{p.name}</p>
                          {p.is_organic && <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">Organic</span>}
                        </div>
                      </td>
                      <td className="py-3 text-kisan-muted">{p.category_name}</td>
                      <td className="py-3">
                        <p className="font-semibold text-kisan-dark">{p.farmer_name}</p>
                        <p className="text-[10px] text-kisan-muted">{p.farm_name}</p>
                      </td>
                      <td className="py-3 font-bold text-kisan-primary">₹{p.price} / {p.unit}</td>
                      <td className="py-3 font-semibold">{p.available_quantity} {p.unit}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {p.is_available ? 'Listed' : 'Delisted'}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-2">
                        <button
                          onClick={() => handleToggleProductStatus(p.id)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${
                            p.is_available
                              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {p.is_available ? 'Delist' : 'Publish'}
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="text-[10px] font-bold px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg inline-flex items-center space-x-1"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: ORDER FULFILLMENT & MANAGEMENT                    */}
      {/* ======================================================== */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 border border-kisan-border shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-kisan-dark">
              Platform Orders ({filteredOrders.length})
            </h2>
            <span className="text-xs text-kisan-muted">Admin can update status, payment state, or permanently purge orders.</span>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-kisan-muted">
              <Package className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-xs font-semibold">No orders currently in the system.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-kisan-muted font-bold">
                    <th className="pb-3">Order Number</th>
                    <th className="pb-3">Buyer Name</th>
                    <th className="pb-3">Address</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Order Status</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50/50">
                      <td className="py-3 font-bold text-kisan-dark">{order.order_number}</td>
                      <td className="py-3 font-semibold">{order.buyer_name || 'Customer'}</td>
                      <td className="py-3 text-kisan-muted max-w-xs truncate">{order.delivery_address || 'Hyderabad'}</td>
                      <td className="py-3 font-bold text-kisan-primary">₹{order.total_amount}</td>
                      <td className="py-3">
                        <select
                          value={order.order_status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="bg-gray-50 border border-gray-200 text-[11px] font-bold rounded-lg px-2 py-1 text-kisan-dark"
                        >
                          <option value="placed">Placed</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="packed">Packed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3">
                        <select
                          value={order.payment_status}
                          onChange={(e) => handleUpdateOrderPayment(order.id, e.target.value)}
                          className="bg-gray-50 border border-gray-200 text-[11px] font-bold rounded-lg px-2 py-1 text-kisan-dark"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Successful">Successful</option>
                          <option value="completed">Completed</option>
                          <option value="Refunded">Refunded</option>
                          <option value="Failed">Failed</option>
                        </select>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDeleteOrder(order.id, order.order_number)}
                          className="text-[10px] font-bold px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg inline-flex items-center space-x-1"
                          title="Delete Order"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: CATEGORY MANAGEMENT                               */}
      {/* ======================================================== */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-3xl p-6 border border-kisan-border shadow-card space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-kisan-dark">Marketplace Categories ({categoriesList.length})</h2>
              <p className="text-xs text-kisan-muted">Manage product classifications available to farmers.</p>
            </div>
            <button
              onClick={() => setShowAddCategoryModal(true)}
              className="flex items-center space-x-1.5 bg-kisan-primary text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-kisan-dark shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoriesList.map(cat => (
              <div key={cat.id} className="p-4 rounded-2xl border border-kisan-border bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={cat.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200'}
                    alt={cat.name}
                    className="w-12 h-12 rounded-xl object-cover border border-kisan-border shadow-sm"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-kisan-dark">{cat.name}</h3>
                    <p className="text-[11px] text-kisan-muted line-clamp-1">{cat.description || 'Agricultural products'}</p>
                    <span className="text-[10px] font-bold text-kisan-primary mt-1 inline-block">
                      {cat.product_count || 0} produce listed
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: SUPPORT DESK                                      */}
      {/* ======================================================== */}
      {activeTab === 'support' && (
        <div className="bg-white rounded-3xl p-6 border border-kisan-border shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-kisan-dark">Help & Support Inquiries ({supportTickets.length})</h2>
          </div>

          {supportTickets.length === 0 ? (
            <p className="text-xs text-center py-10 text-kisan-muted">No pending support requests</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {supportTickets.map(t => (
                <div key={t.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-kisan-dark text-sm">{t.subject}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        t.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="text-kisan-muted mt-1">{t.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">Submitted on {new Date(t.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {t.status !== 'resolved' && (
                      <button
                        onClick={() => handleResolveTicket(t.id)}
                        className="bg-kisan-primary hover:bg-kisan-dark text-white px-3 py-1.5 rounded-xl font-bold transition-colors"
                      >
                        Resolve
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteTicket(t.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Ticket"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 7: SYSTEM CONTROLS & BROADCAST                       */}
      {/* ======================================================== */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Broadcast Announcement */}
          <div className="bg-white rounded-3xl p-6 border border-kisan-border shadow-card space-y-4">
            <div className="flex items-center space-x-2">
              <Send className="w-5 h-5 text-kisan-primary" />
              <h2 className="text-base font-bold text-kisan-dark">Broadcast Announcement</h2>
            </div>
            <p className="text-xs text-kisan-muted">Send in-app notifications directly to all farmers or consumers.</p>
            <form onSubmit={handleBroadcast} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-kisan-dark mb-1">Target Audience</label>
                <select
                  value={broadcastData.target}
                  onChange={(e) => setBroadcastData({ ...broadcastData, target: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-kisan-dark"
                >
                  <option value="all">Everyone (All Farmers & Buyers)</option>
                  <option value="farmer">Farmers Only</option>
                  <option value="buyer">Buyers Only</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-kisan-dark mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Seasonal Mandi Rates Update"
                  value={broadcastData.title}
                  onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-kisan-dark"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-kisan-dark mb-1">Message</label>
                <textarea
                  rows="3"
                  placeholder="Enter notification text to broadcast..."
                  value={broadcastData.message}
                  onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-kisan-dark"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-kisan-primary hover:bg-kisan-dark text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm"
              >
                Send Broadcast Notification
              </button>
            </form>
          </div>

          {/* Master Data Purge */}
          <div className="bg-white rounded-3xl p-6 border border-red-200 shadow-card space-y-4">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-base font-bold">Platform Data Reset</h2>
            </div>
            <p className="text-xs text-kisan-muted">
              Use this action to purge all non-admin users, testing orders, cart items, and uploaded products from MySQL. The admin account (<span className="font-bold">admin@gmail.com</span>) and catalog categories will be permanently preserved.
            </p>
            <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-900 space-y-1">
              <p className="font-bold">Warning: This action is irreversible.</p>
              <p>Type "PURGE" when prompted to execute the reset.</p>
            </div>
            <button
              onClick={handlePurgeData}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm"
            >
              Purge All Test & Dummy Data
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD USER                                          */}
      {/* ======================================================== */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-base text-kisan-dark">Create New User</h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-kisan-dark mb-1">Role</label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl px-3 py-2 font-bold"
                >
                  <option value="buyer">Buyer (Consumer)</option>
                  <option value="farmer">Farmer (Producer)</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-kisan-dark mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Reddy"
                  value={userFormData.full_name}
                  onChange={(e) => setUserFormData({ ...userFormData, full_name: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-kisan-dark mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="name@mail.com"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-kisan-dark mb-1">Mobile</label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    value={userFormData.mobile_number}
                    onChange={(e) => setUserFormData({ ...userFormData, mobile_number: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-kisan-dark mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl px-3 py-2"
                />
              </div>

              {userFormData.role === 'farmer' && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <p className="font-bold text-kisan-primary">Farm Location Details</p>
                  <div>
                    <input
                      type="text"
                      placeholder="Farm Name (e.g. Green Valley Farm)"
                      value={userFormData.farm_name}
                      onChange={(e) => setUserFormData({ ...userFormData, farm_name: e.target.value })}
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Village / Town"
                      value={userFormData.village}
                      onChange={(e) => setUserFormData({ ...userFormData, village: e.target.value })}
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="District"
                      value={userFormData.district}
                      onChange={(e) => setUserFormData({ ...userFormData, district: e.target.value })}
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-kisan-primary hover:bg-kisan-dark text-white font-bold py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  Save & Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT USER                                         */}
      {/* ======================================================== */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-base text-kisan-dark">Edit User #{selectedUser.id}</h3>
              <button onClick={() => setShowEditUserModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-kisan-dark mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={userFormData.full_name}
                  onChange={(e) => setUserFormData({ ...userFormData, full_name: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-kisan-dark mb-1">Email</label>
                  <input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-kisan-dark mb-1">Mobile</label>
                  <input
                    type="text"
                    value={userFormData.mobile_number}
                    onChange={(e) => setUserFormData({ ...userFormData, mobile_number: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-kisan-dark mb-1">Reset Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Leave empty to keep current password"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl px-3 py-2"
                />
              </div>

              {selectedUser.role === 'farmer' && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <p className="font-bold text-kisan-primary">Farm Location</p>
                  <input
                    type="text"
                    placeholder="Farm Name"
                    value={userFormData.farm_name}
                    onChange={(e) => setUserFormData({ ...userFormData, farm_name: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl px-3 py-2"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Village"
                      value={userFormData.village}
                      onChange={(e) => setUserFormData({ ...userFormData, village: e.target.value })}
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="District"
                      value={userFormData.district}
                      onChange={(e) => setUserFormData({ ...userFormData, district: e.target.value })}
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-kisan-primary hover:bg-kisan-dark text-white font-bold py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  Update User Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD PRODUCE                                       */}
      {/* ======================================================== */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-base text-kisan-dark">Add Marketplace Produce</h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-kisan-dark mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Red Tomatoes"
                  value={productFormData.name}
                  onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-kisan-dark mb-1">Category</label>
                  <select
                    required
                    value={productFormData.category_id}
                    onChange={(e) => setProductFormData({ ...productFormData, category_id: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl px-3 py-2 font-semibold"
                  >
                    <option value="">Select Category</option>
                    {categoriesList.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-kisan-dark mb-1">Assign Farmer</label>
                  <select
                    value={productFormData.farmer_id}
                    onChange={(e) => setProductFormData({ ...productFormData, farmer_id: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl px-3 py-2 font-semibold"
                  >
                    <option value="">Default (First Available)</option>
                    {farmersList.map(f => (
                      <option key={f.id} value={f.farmer_profile?.id}>{f.full_name} ({f.farmer_profile?.farm_name || 'Farm'})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-kisan-dark mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="40"
                    value={productFormData.price}
                    onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-kisan-dark mb-1">Quantity</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={productFormData.available_quantity}
                    onChange={(e) => setProductFormData({ ...productFormData, available_quantity: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-kisan-dark mb-1">Unit</label>
                  <select
                    value={productFormData.unit}
                    onChange={(e) => setProductFormData({ ...productFormData, unit: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl px-3 py-2 font-semibold"
                  >
                    <option value="kg">kg</option>
                    <option value="gram">gram</option>
                    <option value="dozen">dozen</option>
                    <option value="bunch">bunch</option>
                    <option value="litre">litre</option>
                    <option value="piece">piece</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-kisan-dark mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={productFormData.image_url}
                  onChange={(e) => setProductFormData({ ...productFormData, image_url: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_organic"
                  checked={productFormData.is_organic}
                  onChange={(e) => setProductFormData({ ...productFormData, is_organic: e.target.checked })}
                  className="rounded text-kisan-primary"
                />
                <label htmlFor="is_organic" className="font-bold text-kisan-dark">Certified Organic</label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-kisan-primary hover:bg-kisan-dark text-white font-bold py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  Publish Produce Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD CATEGORY                                      */}
      {/* ======================================================== */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-base text-kisan-dark">Add New Category</h3>
              <button onClick={() => setShowAddCategoryModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-kisan-dark mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dairy & Honey"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-bold text-kisan-dark mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Brief description of the produce category..."
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-bold text-kisan-dark mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={categoryFormData.image}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, image: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl px-3 py-2"
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-kisan-primary hover:bg-kisan-dark text-white font-bold py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
