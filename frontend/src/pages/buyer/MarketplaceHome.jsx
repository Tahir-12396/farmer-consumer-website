import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Sparkles, MapPin, X } from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../contexts/CartContext';
import PageBackground from '../../components/common/PageBackground';
import bg6 from '../../assets/images/bg6_hd.jpg';
import api from '../../services/api';

const MarketplaceHome = () => {
  const { t } = useLanguage();
  const { addToCart } = useCart();

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [onlyOrganic, setOnlyOrganic] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    api.get('/api/categories').then(res => {
      setCategories(res.data.categories || []);
    });
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category_id', selectedCategory);
      if (search) params.append('search', search);
      if (sortBy) params.append('sort_by', sortBy);
      if (onlyOrganic) params.append('is_organic', 'true');
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);
      if (locationFilter) params.append('location', locationFilter);

      const res = await api.get(`/api/products?${params.toString()}`);
      setProducts(res.data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy, onlyOrganic]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleQuickAdd = async (product) => {
    const res = await addToCart(product.id, 1);
    if (res.success) {
      setToastMsg(`Added ${product.name} to cart!`);
      setTimeout(() => setToastMsg(''), 2500);
    } else {
      alert(res.error || 'Failed to add');
    }
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 py-4 sm:py-6 space-y-5 pb-20 md:pb-8">
      <PageBackground image={bg6} />
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 bg-kisan-dark text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-float flex items-center space-x-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-kisan-accent" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-kisan-primary to-emerald-900 rounded-3xl p-5 sm:p-8 text-white shadow-card relative overflow-hidden">
        <img
          src={bg6}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay pointer-events-none"
        />
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center text-[10px] sm:text-xs font-bold tracking-wider uppercase bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-emerald-100 mb-2">
            🌱 Direct Farmer Marketplace
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Fresh from Farms, <br />Direct to Your Kitchen.
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-2 font-medium">
            100% genuine agricultural crops sourced directly from verified rural farmers with zero middleman commissions.
          </p>
        </div>
        {/* Background decorative leaf illustration */}
        <div className="absolute right-0 bottom-0 opacity-15 translate-x-10 translate-y-10 pointer-events-none">
          <svg className="w-80 h-80" viewBox="0 0 200 200" fill="currentColor">
            <path d="M40 100 C40 40, 100 20, 160 40 C180 100, 140 160, 40 100 Z" />
          </svg>
        </div>
      </div>

      {/* Search Bar & Filter Button */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-kisan-muted absolute left-3.5 top-3 sm:top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 bg-white border border-kisan-border rounded-2xl text-xs sm:text-sm shadow-sm focus:outline-none focus:border-kisan-primary focus:ring-1 focus:ring-kisan-primary"
          />
        </form>

        <button
          onClick={() => setShowFilterModal(true)}
          className="p-2.5 sm:p-3 bg-white border border-kisan-border rounded-2xl text-kisan-text hover:text-kisan-primary hover:border-kisan-primary shadow-sm flex items-center space-x-1.5 transition-colors"
          title="Filter products"
        >
          <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline text-xs font-bold">{t('filter')}</span>
        </button>
      </div>

      {/* Horizontal Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`
            px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shadow-sm
            ${selectedCategory === null
              ? 'bg-kisan-primary text-white ring-2 ring-kisan-light'
              : 'bg-white text-kisan-text border border-kisan-border hover:bg-gray-50'
            }
          `}
        >
          {t('allCategories')}
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`
              px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shadow-sm
              ${selectedCategory === c.id
                ? 'bg-kisan-primary text-white ring-2 ring-kisan-light'
                : 'bg-white text-kisan-text border border-kisan-border hover:bg-gray-50'
              }
            `}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Sorting & Organic Toggle Bar */}
      <div className="flex items-center justify-between text-xs text-kisan-muted px-1">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setOnlyOrganic(!onlyOrganic)}
            className={`px-3 py-1.5 rounded-full font-bold text-[11px] flex items-center space-x-1 border transition-all ${
              onlyOrganic
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-kisan-text border-kisan-border hover:border-emerald-500'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Organic Only</span>
          </button>
        </div>

        <div className="flex items-center space-x-1.5">
          <span className="hidden sm:inline">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-kisan-border rounded-xl px-2.5 py-1 text-xs font-semibold text-kisan-text focus:outline-none"
          >
            <option value="newest">Recently Added</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-kisan-primary"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-kisan-border">
          <p className="text-base font-bold text-kisan-dark">No crops match your search or filters</p>
          <p className="text-xs text-kisan-muted mt-1">Try resetting the filters or searching for different keywords.</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory(null);
              setOnlyOrganic(false);
              setMinPrice('');
              setMaxPrice('');
              setLocationFilter('');
            }}
            className="mt-4 px-4 py-2 bg-kisan-primary text-white text-xs font-bold rounded-xl"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onQuickAdd={handleQuickAdd} />
          ))}
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-base text-kisan-dark">Filter Produce</h3>
              <button onClick={() => setShowFilterModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block font-bold text-kisan-text mb-1">Price Range (₹)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-kisan-text mb-1">Location / District</label>
              <input
                type="text"
                placeholder="e.g. Sangareddy, Guntur"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setMinPrice('');
                  setMaxPrice('');
                  setLocationFilter('');
                  fetchProducts();
                  setShowFilterModal(false);
                }}
                className="flex-1 py-2.5 font-bold border rounded-xl text-gray-500"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  fetchProducts();
                  setShowFilterModal(false);
                }}
                className="flex-1 py-2.5 font-bold bg-kisan-primary text-white rounded-xl"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceHome;
