import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowRight, MapPin, Calendar } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const OrderSuccessPage = () => {
  const { state } = useLocation();
  const { t } = useLanguage();
  const order = state?.order;

  if (!order) {
    return <Navigate to="/buyer" replace />;
  }

  return (
    <div className="min-h-[75vh] flex flex-col justify-center items-center px-4 py-10 max-w-lg mx-auto text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-float animate-bounce">
        <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-kisan-dark tracking-tight">
          {t('orderPlaced')}
        </h1>
        <p className="text-xs sm:text-sm text-kisan-muted mt-2 max-w-sm mx-auto leading-relaxed">
          {t('orderPlacedDesc')}
        </p>
      </div>

      {/* Order Snapshot Card */}
      <div className="w-full bg-white rounded-3xl p-5 sm:p-6 border border-kisan-border shadow-card text-left text-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <span className="text-kisan-muted font-bold">Order Reference</span>
          <span className="font-extrabold text-sm text-kisan-primary">{order.order_number}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-kisan-muted">Payment Method</span>
          <span className="font-bold text-kisan-dark">{order.payment_method}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-kisan-muted">Total Amount</span>
          <span className="font-black text-base text-kisan-dark">₹{order.total_amount?.toFixed(2)}</span>
        </div>

        {order.address && (
          <div className="pt-2 border-t border-gray-100">
            <span className="text-kisan-muted font-bold block mb-1">Delivering to:</span>
            <p className="text-kisan-text flex items-start">
              <MapPin className="w-3.5 h-3.5 text-kisan-secondary mr-1 flex-shrink-0 mt-0.5" />
              <span>{order.address.formatted_address}</span>
            </p>
          </div>
        )}
      </div>

      <div className="w-full space-y-2.5">
        <Link
          to="/buyer/orders"
          className="w-full bg-kisan-primary text-white py-3.5 px-6 rounded-2xl font-bold text-sm shadow-md hover:bg-kisan-dark transition-all flex items-center justify-center space-x-2"
        >
          <span>{t('viewOrderHistory')}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          to="/buyer"
          className="w-full bg-white text-kisan-dark py-3 px-6 rounded-2xl font-bold text-xs border border-kisan-border hover:bg-gray-50 block transition-all"
        >
          {t('continueShopping')}
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
