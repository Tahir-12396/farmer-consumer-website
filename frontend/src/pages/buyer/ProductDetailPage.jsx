import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, MapPin, Plus, Minus, ShoppingCart, User, Calendar, ShieldCheck } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../services/api';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { t } = useLanguage();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    api.get(`/api/products/${id}`)
      .then(res => setProduct(res.data.product))
      .catch(() => alert('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-kisan-primary"></div>
      </div>
    );
  }

  const handleAddToCart = async () => {
    setAdding(true);
    const res = await addToCart(product.id, quantity);
    if (res.success) {
      setToast(`Added ${quantity} ${product.unit} to cart!`);
      setTimeout(() => setToast(''), 3000);
    } else {
      alert(res.error || 'Failed to add');
    }
    setAdding(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-24 md:pb-8">
      {/* Top Bar */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-1.5 text-xs font-bold text-kisan-muted hover:text-kisan-dark bg-white px-3 py-1.5 rounded-xl border border-kisan-border shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Marketplace</span>
      </button>

      {toast && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold text-center animate-pulse">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-3xl p-5 sm:p-8 border border-kisan-border shadow-card">
        {/* Product Image */}
        <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-gray-100">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.is_organic && (
            <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-md">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              100% Organic
            </span>
          )}
          <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-lg">
            Stock: {product.available_quantity} {product.unit}
          </span>
        </div>

        {/* Details & Purchase */}
        <div className="flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center text-xs text-kisan-primary font-bold uppercase tracking-wider">
              <span>{product.category_name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-kisan-dark mt-1">
              {product.name}
            </h1>

            {/* Price Banner */}
            <div className="mt-3 flex items-baseline space-x-1">
              <span className="text-3xl font-black text-kisan-dark">
                ₹{product.price.toFixed(2)}
              </span>
              <span className="text-sm font-semibold text-kisan-muted">
                / {product.unit}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-kisan-text mt-3 leading-relaxed">
              {product.description || 'Farm-fresh harvest grown with natural agricultural practices and verified quality.'}
            </p>

            {/* Farmer Info Box */}
            <div className="mt-5 p-3.5 bg-kisan-bg rounded-2xl border border-kisan-border space-y-2">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-kisan-light text-kisan-dark flex items-center justify-center font-bold text-sm">
                  <User className="w-5 h-5 text-kisan-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-kisan-dark">{product.farmer_name}</h4>
                  <p className="text-[11px] text-kisan-primary font-medium">{product.farm_name}</p>
                </div>
              </div>

              <div className="flex items-center text-xs text-kisan-muted pt-1 border-t border-gray-200/60">
                <MapPin className="w-3.5 h-3.5 text-kisan-secondary mr-1 flex-shrink-0" />
                <span>{product.location}</span>
              </div>

              {product.harvest_date && (
                <div className="flex items-center text-xs text-kisan-muted">
                  <Calendar className="w-3.5 h-3.5 text-kisan-secondary mr-1 flex-shrink-0" />
                  <span>Harvested on: {product.harvest_date}</span>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center space-x-2 text-[11px] font-medium text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Direct farmer deal. 100% of payment goes to the cultivating grower.</span>
            </div>
          </div>

          {/* Quantity and Add to Cart Button */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-kisan-text">Select Quantity:</span>
              <div className="flex items-center space-x-3 bg-gray-50 px-3 py-1.5 rounded-2xl border border-kisan-border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-lg bg-white border flex items-center justify-center font-bold text-kisan-text hover:bg-gray-100"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-extrabold text-sm text-kisan-dark w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.available_quantity, quantity + 1))}
                  className="w-7 h-7 rounded-lg bg-white border flex items-center justify-center font-bold text-kisan-text hover:bg-gray-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!product.is_available || adding}
              className="w-full bg-kisan-primary text-white py-3.5 rounded-2xl font-bold text-sm shadow-card hover:bg-kisan-dark transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{adding ? 'Adding...' : `Add to Cart • ₹${(product.price * quantity).toFixed(2)}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
