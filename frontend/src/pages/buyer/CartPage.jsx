import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';
import PageBackground from '../../components/common/PageBackground';
import bg8 from '../../assets/images/bg8_hd.jpg';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-kisan-primary"></div>
      </div>
    );
  }

  const items = cart.items || [];

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-kisan-primary flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-kisan-dark">Your cart is empty</h2>
        <p className="text-xs text-kisan-muted">Browse through fresh farm produce and add vegetables, fruits, and grains.</p>
        <Link
          to="/buyer"
          className="inline-flex items-center space-x-2 bg-kisan-primary text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-sm hover:bg-kisan-dark"
        >
          <span>Explore Farm Marketplace</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const freeDeliveryThreshold = 500;
  const remainingForFree = Math.max(0, freeDeliveryThreshold - cart.subtotal);

  return (
    <div className="relative max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-24 md:pb-8">
      <PageBackground image={bg8} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-kisan-dark">{t('cart')}</h1>
          <p className="text-xs text-kisan-muted">{cart.item_count} items from verified local farmers</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-kisan-danger hover:underline"
        >
          Clear Cart
        </button>
      </div>

      {/* Free Delivery Bar */}
      {remainingForFree > 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 flex items-center justify-between">
          <span>Add <b>₹{remainingForFree.toFixed(2)}</b> more produce to qualify for <b>FREE Delivery</b>!</span>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-900 font-bold flex items-center space-x-1.5">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Congratulations! You unlocked FREE Delivery on this harvest order!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-4 border border-kisan-border shadow-card flex items-center space-x-4">
              <img
                src={item.product?.image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80'}
                alt={item.product?.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-gray-100 flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-kisan-dark truncate">{item.product?.name}</h3>
                <p className="text-[11px] text-kisan-muted truncate">{item.product?.farm_name}</p>
                <div className="mt-1 flex items-baseline space-x-1">
                  <span className="text-xs font-bold text-kisan-dark">₹{item.unit_price.toFixed(2)}</span>
                  <span className="text-[10px] text-kisan-muted">/{item.product?.unit}</span>
                </div>
              </div>

              {/* Quantity Controls & Subtotal */}
              <div className="flex flex-col items-end space-y-2">
                <span className="text-sm font-black text-kisan-dark">
                  ₹{item.subtotal.toFixed(2)}
                </span>

                <div className="flex items-center space-x-2 bg-gray-50 px-2 py-1 rounded-xl border border-kisan-border">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-6 h-6 rounded bg-white border flex items-center justify-center font-bold text-xs"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-6 h-6 rounded bg-white border flex items-center justify-center font-bold text-xs"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 pl-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-3xl p-5 border border-kisan-border shadow-card h-fit space-y-4">
          <h2 className="font-bold text-base text-kisan-dark pb-2 border-b border-gray-100">
            Order Summary
          </h2>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-kisan-muted">
              <span>{t('subtotal')}</span>
              <span className="font-bold text-kisan-dark">₹{cart.subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-kisan-muted">
              <span>{t('deliveryFee')}</span>
              <span className={`font-bold ${cart.delivery_fee === 0 ? 'text-emerald-700' : 'text-kisan-dark'}`}>
                {cart.delivery_fee === 0 ? t('free') : `₹${cart.delivery_fee.toFixed(2)}`}
              </span>
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-between text-sm font-black text-kisan-dark">
              <span>{t('totalAmount')}</span>
              <span>₹{cart.total_amount.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/buyer/checkout')}
            className="w-full bg-kisan-primary text-white py-3.5 rounded-2xl font-bold text-sm shadow-md hover:bg-kisan-dark transition-all flex items-center justify-center space-x-2"
          >
            <span>{t('proceedToCheckout')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
