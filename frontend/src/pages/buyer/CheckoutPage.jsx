import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Banknote, Smartphone, Check, Plus, AlertCircle, ArrowLeft } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';
import PageBackground from '../../components/common/PageBackground';
import bg8 from '../../assets/images/bg8_hd.jpg';
import api from '../../services/api';

const CheckoutPage = () => {
  const { cart, fetchCart } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  // Add Address Form
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({
    door_number: '',
    street: '',
    village: '',
    district: '',
    state: 'Telangana',
    pincode: '',
    landmark: ''
  });

  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.get('/api/addresses');
        const list = res.data.addresses || [];
        setAddresses(list);
        const def = list.find(a => a.is_default) || list[0];
        if (def) setSelectedAddressId(def.id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/addresses', newAddr);
      setAddresses(prev => [res.data.address, ...prev]);
      setSelectedAddressId(res.data.address.id);
      setShowAddAddr(false);
      setNewAddr({ door_number: '', street: '', village: '', district: '', state: 'Telangana', pincode: '', landmark: '' });
    } catch (err) {
      alert('Failed to save address');
    }
  };

  const handlePlaceOrder = async () => {
    setError('');
    if (!selectedAddressId) {
      setError('Please select or add a delivery address');
      return;
    }

    try {
      setPlacing(true);
      const res = await api.post('/api/orders', {
        address_id: selectedAddressId,
        payment_method: paymentMethod
      });
      await fetchCart();
      navigate('/buyer/order-success', { state: { order: res.data.order } });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-kisan-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-24 md:pb-8">
      <PageBackground image={bg8} />
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-1.5 text-xs font-bold text-kisan-muted hover:text-kisan-dark bg-white px-3 py-1.5 rounded-xl border border-kisan-border shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Cart</span>
      </button>

      <div>
        <h1 className="text-2xl font-extrabold text-kisan-dark">{t('checkout')}</h1>
        <p className="text-xs text-kisan-muted">Confirm delivery destination and payment method</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-kisan-danger">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Address Selection */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-kisan-border shadow-card space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h2 className="font-bold text-sm sm:text-base text-kisan-dark flex items-center">
            <MapPin className="w-4 h-4 text-kisan-primary mr-1.5" />
            <span>{t('deliveryAddress')}</span>
          </h2>
          <button
            onClick={() => setShowAddAddr(!showAddAddr)}
            className="text-xs font-bold text-kisan-primary hover:underline flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Address</span>
          </button>
        </div>

        {/* Existing Addresses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              onClick={() => setSelectedAddressId(addr.id)}
              className={`
                cursor-pointer p-3.5 rounded-2xl border-2 transition-all relative text-xs
                ${selectedAddressId === addr.id
                  ? 'border-kisan-primary bg-kisan-light/30 shadow-sm'
                  : 'border-kisan-border hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-kisan-dark">{addr.door_number}</span>
                {selectedAddressId === addr.id && (
                  <Check className="w-4 h-4 text-kisan-primary font-bold" />
                )}
              </div>
              <p className="text-kisan-text">{addr.street}</p>
              <p className="text-kisan-muted">{addr.village}, {addr.district} - {addr.pincode}</p>
            </div>
          ))}
        </div>

        {/* Add Address Form Toggle */}
        {showAddAddr && (
          <form onSubmit={handleCreateAddress} className="mt-3 p-4 bg-gray-50 rounded-2xl border space-y-2.5 text-xs">
            <h4 className="font-bold text-kisan-dark">Add New Delivery Location</h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Door / Flat No."
                value={newAddr.door_number}
                onChange={(e) => setNewAddr({ ...newAddr, door_number: e.target.value })}
                className="p-2 border rounded-xl"
                required
              />
              <input
                type="text"
                placeholder="Street / Colony"
                value={newAddr.street}
                onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                className="p-2 border rounded-xl"
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Village / Area"
                value={newAddr.village}
                onChange={(e) => setNewAddr({ ...newAddr, village: e.target.value })}
                className="p-2 border rounded-xl"
                required
              />
              <input
                type="text"
                placeholder="District"
                value={newAddr.district}
                onChange={(e) => setNewAddr({ ...newAddr, district: e.target.value })}
                className="p-2 border rounded-xl"
                required
              />
              <input
                type="text"
                placeholder="Pincode"
                value={newAddr.pincode}
                onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                className="p-2 border rounded-xl"
                required
              />
            </div>
            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddAddr(false)}
                className="px-3 py-1.5 border rounded-xl font-bold text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-kisan-primary text-white rounded-xl font-bold"
              >
                Save & Select
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2. Payment Options */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-kisan-border shadow-card space-y-3">
        <h2 className="font-bold text-sm sm:text-base text-kisan-dark pb-2 border-b border-gray-100">
          {t('paymentMethod')}
        </h2>

        <div className="space-y-2.5">
          <label className={`
            flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all
            ${paymentMethod === 'COD' ? 'border-kisan-primary bg-kisan-light/30' : 'border-kisan-border'}
          `}>
            <div className="flex items-center space-x-3">
              <Banknote className="w-5 h-5 text-emerald-700" />
              <div>
                <span className="font-bold text-xs text-kisan-dark block">{t('cashOnDelivery')}</span>
                <span className="text-[11px] text-kisan-muted">Pay in cash when fresh produce arrives at your doorstep</span>
              </div>
            </div>
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === 'COD'}
              onChange={() => setPaymentMethod('COD')}
              className="text-kisan-primary focus:ring-kisan-primary"
            />
          </label>

          <label className={`
            flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all
            ${paymentMethod === 'UPI' ? 'border-kisan-primary bg-kisan-light/30' : 'border-kisan-border'}
          `}>
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-blue-700" />
              <div>
                <span className="font-bold text-xs text-kisan-dark block">{t('upiDirect')}</span>
                <span className="text-[11px] text-kisan-muted">Direct Google Pay, PhonePe, Paytm QR transfer</span>
              </div>
            </div>
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === 'UPI'}
              onChange={() => setPaymentMethod('UPI')}
              className="text-kisan-primary focus:ring-kisan-primary"
            />
          </label>

          <label className={`
            flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all
            ${paymentMethod === 'ONLINE_SANDBOX' ? 'border-kisan-primary bg-kisan-light/30' : 'border-kisan-border'}
          `}>
            <div className="flex items-center space-x-3">
              <CreditCard className="w-5 h-5 text-purple-700" />
              <div>
                <span className="font-bold text-xs text-kisan-dark block">Online Sandbox Payment</span>
                <span className="text-[11px] text-kisan-muted">Simulate test card / netbanking verification</span>
              </div>
            </div>
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === 'ONLINE_SANDBOX'}
              onChange={() => setPaymentMethod('ONLINE_SANDBOX')}
              className="text-kisan-primary focus:ring-kisan-primary"
            />
          </label>
        </div>
      </div>

      {/* 3. Items Summary */}
      <div className="bg-white rounded-3xl p-5 border border-kisan-border shadow-card space-y-3">
        <h3 className="font-bold text-sm text-kisan-dark">Order Items ({cart.item_count})</h3>
        <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
          {cart.items?.map((it) => (
            <div key={it.id} className="py-2 flex items-center justify-between text-xs">
              <span className="text-kisan-text font-medium">{it.product?.name} ({it.quantity} {it.product?.unit})</span>
              <span className="font-bold text-kisan-dark">₹{it.subtotal.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-sm font-black text-kisan-dark">
          <span>{t('totalAmount')}</span>
          <span className="text-lg text-kisan-primary">₹{cart.total_amount.toFixed(2)}</span>
        </div>
      </div>

      {/* Place Order CTA */}
      <button
        onClick={handlePlaceOrder}
        disabled={placing}
        className="w-full bg-kisan-primary text-white py-4 rounded-2xl font-bold text-base shadow-card hover:bg-kisan-dark transition-all disabled:opacity-50"
      >
        {placing ? 'Confirming Harvest Order...' : `${t('placeOrder')} • ₹${cart.total_amount.toFixed(2)}`}
      </button>
    </div>
  );
};

export default CheckoutPage;
