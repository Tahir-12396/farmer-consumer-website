import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Plus, Check, Sparkles } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';

const ProductCard = ({ product, onQuickAdd }) => {
  const { addToCart, cart } = useCart();
  const { t } = useLanguage();

  const cartItem = cart.items.find(item => item.product_id === product.id);
  const isInCart = !!cartItem;

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickAdd) {
      onQuickAdd(product);
    } else {
      await addToCart(product.id, 1);
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-kisan-border shadow-card hover:shadow-float transition-all duration-200 flex flex-col group">
      {/* Product Image & Badges */}
      <Link to={`/buyer/product/${product.id}`} className="relative h-44 sm:h-48 overflow-hidden bg-gray-100 block">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {product.is_organic && (
          <span className="absolute top-2.5 left-2.5 bg-emerald-600/95 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center shadow-sm">
            <Sparkles className="w-3 h-3 mr-0.5" />
            {t('organic')}
          </span>
        )}
        <span className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
          {product.unit}
        </span>
      </Link>

      {/* Product Details */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center text-[11px] text-kisan-muted mb-1 truncate">
            <MapPin className="w-3 h-3 mr-1 text-kisan-secondary flex-shrink-0" />
            <span className="truncate">{product.location || product.farm_name}</span>
          </div>

          <Link to={`/buyer/product/${product.id}`}>
            <h3 className="font-semibold text-sm sm:text-base text-kisan-text hover:text-kisan-primary transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-kisan-muted mt-0.5 truncate">
            {product.farm_name}
          </p>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-base sm:text-lg font-extrabold text-kisan-dark">
              ₹{product.price.toFixed(2)}
            </span>
            <span className="text-[11px] text-kisan-muted font-normal ml-0.5">
              /{product.unit}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={!product.is_available}
            className={`
              flex items-center justify-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm
              ${!product.is_available 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isInCart 
                  ? 'bg-kisan-light text-kisan-dark border border-kisan-primary/30 hover:bg-kisan-primary hover:text-white'
                  : 'bg-kisan-primary text-white hover:bg-kisan-dark'
              }
            `}
          >
            {isInCart ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{cartItem.quantity} in Cart</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>{t('addToCart')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
