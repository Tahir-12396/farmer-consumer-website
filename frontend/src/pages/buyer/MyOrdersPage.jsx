import React, { useState, useEffect } from 'react';
import { ShoppingBag, AlertCircle, XCircle } from 'lucide-react';
import OrderTimeline from '../../components/order/OrderTimeline';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../services/api';

const MyOrdersPage = () => {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      setCancellingId(orderId);
      await api.post(`/api/orders/${orderId}/cancel`);
      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel order');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-24 md:pb-8">
      <div>
        <h1 className="text-2xl font-extrabold text-kisan-dark">{t('myOrders')}</h1>
        <p className="text-xs text-kisan-muted">Track your deliveries and review farm harvest purchases</p>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-kisan-primary"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-kisan-border">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-kisan-text">No orders placed yet</p>
          <p className="text-xs text-kisan-muted mt-0.5">Explore the marketplace and order fresh agricultural produce directly from farmers!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl border border-kisan-border shadow-card p-5 sm:p-6 space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-base text-kisan-dark">{order.order_number}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      order.order_status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                      order.order_status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {order.order_status}
                    </span>
                  </div>
                  <span className="text-[11px] text-kisan-muted">
                    Placed on {order.created_at ? new Date(order.created_at).toLocaleString() : ''}
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-kisan-muted block">Total Paid</span>
                  <span className="text-lg font-black text-kisan-primary">₹{order.total_amount?.toFixed(2)}</span>
                </div>
              </div>

              {/* Progress Stepper Timeline */}
              <div className="px-2 py-1">
                <OrderTimeline currentStatus={order.order_status} />
              </div>

              {/* Items List */}
              <div className="bg-kisan-bg/50 rounded-2xl p-3.5 space-y-2 text-xs">
                <span className="font-bold text-kisan-dark block">Items ({order.items?.length || 0}):</span>
                {order.items?.map((it) => (
                  <div key={it.id} className="flex items-center justify-between py-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-kisan-primary"></span>
                      <span className="font-semibold text-kisan-dark">{it.product_name}</span>
                      <span className="text-kisan-muted">({it.quantity} {it.unit} @ ₹{it.unit_price}/unit)</span>
                    </div>
                    <span className="font-bold text-kisan-dark">₹{it.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Footer with Cancellation (if Pending) */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                <span className="text-kisan-muted">
                  Delivery to: <b className="text-kisan-text">{order.address?.street}, {order.address?.pincode}</b>
                </span>

                {order.order_status === 'Pending' && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    disabled={cancellingId === order.id}
                    className="text-xs font-bold text-kisan-danger hover:bg-red-50 px-3 py-1.5 rounded-xl border border-red-200 transition-colors"
                  >
                    {cancellingId === order.id ? 'Cancelling...' : t('cancelOrder')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
