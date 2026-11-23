import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../services/api';

const FarmerEarnings = () => {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/farmer/earnings').then(res => {
      setData(res.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-kisan-primary"></div>
      </div>
    );
  }

  const summary = data?.summary || {
    total_sales: 0,
    completed_revenue: 0,
    pending_revenue: 0,
    cancelled_revenue: 0,
    orders_count: 0
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-20 md:pb-8">
      <div>
        <h1 className="text-2xl font-extrabold text-kisan-dark">{t('earnings')}</h1>
        <p className="text-xs text-kisan-muted">Track your direct harvest payouts and completed sales</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-kisan-border shadow-card">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
            <CheckCircle className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-kisan-muted">{t('completedRevenue')}</span>
          <h2 className="text-2xl font-black text-emerald-800 mt-1">₹{summary.completed_revenue.toFixed(2)}</h2>
          <span className="text-[11px] text-emerald-600 font-medium">Deposited to bank</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-kisan-border shadow-card">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-kisan-muted">{t('pendingPayouts')}</span>
          <h2 className="text-2xl font-black text-amber-800 mt-1">₹{summary.pending_revenue.toFixed(2)}</h2>
          <span className="text-[11px] text-amber-600 font-medium">In active delivery</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-kisan-border shadow-card">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-kisan-muted">Total Gross Bookings</span>
          <h2 className="text-2xl font-black text-purple-800 mt-1">₹{summary.total_sales.toFixed(2)}</h2>
          <span className="text-[11px] text-purple-600 font-medium">{summary.orders_count} orders total</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-kisan-border shadow-card">
        <h3 className="font-bold text-base text-kisan-dark mb-4">Payout Transaction History</h3>

        {(!data?.transactions || data.transactions.length === 0) ? (
          <p className="text-xs text-kisan-muted text-center py-8">No transaction history recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-kisan-muted font-bold uppercase text-[10px] tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3 px-3">Order Number</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Buyer</th>
                  <th className="py-3 px-3">Items</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.transactions.map((t) => (
                  <tr key={t.order_id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-3 font-bold text-kisan-dark">{t.order_number}</td>
                    <td className="py-3 px-3 text-kisan-muted">
                      {t.date ? new Date(t.date).toLocaleDateString() : ''}
                    </td>
                    <td className="py-3 px-3 font-medium text-kisan-text">{t.buyer_name}</td>
                    <td className="py-3 px-3 text-kisan-muted">{t.items_count} items</td>
                    <td className="py-3 px-3 font-extrabold text-kisan-dark">₹{t.amount.toFixed(2)}</td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                        t.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerEarnings;
