import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle2, Clock, Truck, Package, XCircle, MapPin, Phone } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../services/api';

const FarmerOrders = () => {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/farmer/orders');
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

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await api.patch(`/api/farmer/orders/${orderId}/status`, { status: newStatus });
      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = activeTab === 'All'
    ? orders
    : orders.filter(o => o.status === activeTab);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-kisan-dark">{t('orders')}</h1>
        <p className="text-xs text-kisan-muted">Manage buyer orders and update fulfilment states</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
        {['All', 'Pending', 'Accepted', 'Preparing', 'Ready for Dispatch', 'Completed', 'Cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap
              ${activeTab === tab
                ? 'bg-kisan-primary text-white shadow-sm'
                : 'bg-white text-kisan-muted border border-kisan-border hover:bg-gray-50'
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-kisan-primary"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-kisan-border">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-kisan-text">No orders found</p>
          <p className="text-xs text-kisan-muted mt-0.5">Orders in this status will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-kisan-border shadow-card p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-sm sm:text-base text-kisan-dark">
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
                  <span className="text-[11px] text-kisan-muted">
                    {order.order_date ? new Date(order.order_date).toLocaleString() : ''}
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-kisan-muted block">Order Value</span>
                  <span className="text-base sm:text-lg font-black text-kisan-dark">
                    ₹{order.subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Buyer & Address Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 text-xs bg-kisan-bg/50 rounded-xl p-3 my-3">
                <div>
                  <span className="text-kisan-muted font-bold block mb-0.5">Buyer Information</span>
                  <p className="font-semibold text-kisan-dark">{order.buyer_name}</p>
                  {order.buyer_phone && (
                    <p className="text-kisan-muted flex items-center mt-0.5">
                      <Phone className="w-3 h-3 mr-1" />
                      {order.buyer_phone}
                    </p>
                  )}
                </div>
                <div>
                  <span className="text-kisan-muted font-bold block mb-0.5">Delivery Location</span>
                  <p className="text-kisan-text flex items-start">
                    <MapPin className="w-3.5 h-3.5 text-kisan-primary mr-1 flex-shrink-0 mt-0.5" />
                    <span>{order.delivery_address || 'Address provided at checkout'}</span>
                  </p>
                </div>
              </div>

              {/* Ordered Items */}
              <div className="space-y-2 py-1">
                <span className="text-xs font-bold text-kisan-muted block">Items in this order:</span>
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-kisan-primary"></span>
                      <span className="font-semibold text-kisan-dark">{item.product_name}</span>
                      <span className="text-kisan-muted">({item.quantity} {item.unit})</span>
                    </div>
                    <span className="font-bold text-kisan-dark">₹{item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Status Action Buttons */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-end gap-2">
                {order.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                      disabled={updatingId === order.id}
                      className="px-3 py-1.5 text-xs font-bold text-kisan-danger hover:bg-red-50 rounded-xl border border-red-200"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'Accepted')}
                      disabled={updatingId === order.id}
                      className="px-4 py-1.5 text-xs font-bold bg-kisan-primary text-white rounded-xl hover:bg-kisan-dark shadow-sm"
                    >
                      Accept Order
                    </button>
                  </>
                )}

                {order.status === 'Accepted' && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'Preparing')}
                    disabled={updatingId === order.id}
                    className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm"
                  >
                    Start Preparing Harvest
                  </button>
                )}

                {order.status === 'Preparing' && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'Ready for Dispatch')}
                    disabled={updatingId === order.id}
                    className="px-4 py-1.5 text-xs font-bold bg-purple-600 text-white rounded-xl hover:bg-purple-700 shadow-sm"
                  >
                    Mark Ready for Dispatch
                  </button>
                )}

                {order.status === 'Ready for Dispatch' && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'Completed')}
                    disabled={updatingId === order.id}
                    className="px-4 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-sm"
                  >
                    Mark Delivered (Completed)
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

export default FarmerOrders;
