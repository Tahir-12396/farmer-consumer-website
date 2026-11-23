import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, ShoppingBag, Layers, Clock, Plus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import PageBackground from '../../components/common/PageBackground';
import bg7 from '../../assets/images/bg7_hd.jpg';
import api from '../../services/api';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/api/farmer/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load farmer dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-kisan-primary"></div>
      </div>
    );
  }

  const metrics = data?.metrics || {
    total_earnings: 0,
    pending_earnings: 0,
    total_orders: 0,
    pending_orders: 0,
    active_products: 0,
    total_products: 0
  };

  return (
    <div className="relative max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-20 md:pb-8">
      <PageBackground image={bg7} />
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-kisan-primary to-kisan-dark rounded-3xl p-6 sm:p-8 text-white shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <img
          src={bg7}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay pointer-events-none"
        />
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-emerald-200 bg-white/10 px-3 py-1 rounded-full">
            {data?.farmer?.farm_name || 'Farmer Portal'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">
            Welcome, {user?.full_name || 'Kisan'}!
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-lg">
            Manage your harvest inventory, accept direct buyer orders, and track your fair earnings without middlemen.
          </p>
        </div>

        <Link
          to="/farmer/add-product"
          className="bg-white text-kisan-primary hover:bg-emerald-50 px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-md flex items-center justify-center space-x-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addProduct')}</span>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-kisan-border shadow-card">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-kisan-primary flex items-center justify-center mb-3">
            <IndianRupee className="w-5 h-5" />
          </div>
          <span className="text-xs text-kisan-muted font-medium">{t('totalEarnings')}</span>
          <h3 className="text-xl sm:text-2xl font-black text-kisan-dark mt-0.5">
            ₹{metrics.total_earnings.toFixed(2)}
          </h3>
          <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
            + ₹{metrics.pending_earnings.toFixed(2)} pending
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-kisan-border shadow-card">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="text-xs text-kisan-muted font-medium">{t('totalOrders')}</span>
          <h3 className="text-xl sm:text-2xl font-black text-kisan-dark mt-0.5">
            {metrics.total_orders}
          </h3>
          <span className="text-[11px] text-blue-700 font-semibold block mt-1">
            Lifetime orders
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-kisan-border shadow-card">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-xs text-kisan-muted font-medium">{t('pendingOrders')}</span>
          <h3 className="text-xl sm:text-2xl font-black text-kisan-dark mt-0.5">
            {metrics.pending_orders}
          </h3>
          <span className="text-[11px] text-amber-700 font-semibold block mt-1">
            Requires action
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-kisan-border shadow-card">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-xs text-kisan-muted font-medium">{t('activeProducts')}</span>
          <h3 className="text-xl sm:text-2xl font-black text-kisan-dark mt-0.5">
            {metrics.active_products}
          </h3>
          <span className="text-[11px] text-purple-700 font-semibold block mt-1">
            In live marketplace
          </span>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-kisan-border shadow-card">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-kisan-dark">{t('recentOrders')}</h2>
            <p className="text-xs text-kisan-muted">Buyer orders for your harvested items</p>
          </div>
          <Link
            to="/farmer/orders"
            className="text-xs font-bold text-kisan-primary hover:underline flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {(!data?.recent_orders || data.recent_orders.length === 0) ? (
          <div className="text-center py-10">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-kisan-text">{t('noOrdersYet')}</p>
            <p className="text-xs text-kisan-muted mt-0.5">When buyers purchase your products, they appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.recent_orders.map((order) => (
              <div key={order.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-kisan-dark">
                      {order.order_number || `ORD-${order.id}`}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      order.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-kisan-muted mt-0.5">
                    Buyer: <span className="font-medium text-kisan-text">{order.buyer_name}</span> • {order.items?.length || 0} items
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4">
                  <span className="text-base font-extrabold text-kisan-dark">
                    ₹{order.subtotal.toFixed(2)}
                  </span>
                  <Link
                    to="/farmer/orders"
                    className="text-xs font-semibold px-3 py-1.5 bg-kisan-light text-kisan-dark rounded-xl border border-kisan-primary/30 hover:bg-kisan-primary hover:text-white transition-colors"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;
