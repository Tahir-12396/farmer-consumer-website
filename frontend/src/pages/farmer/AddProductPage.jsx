import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, Sparkles, MapPin, AlertCircle, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../services/api';

const AddProductPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    unit: 'kg',
    available_quantity: '',
    location: '',
    description: '',
    harvest_date: new Date().toISOString().split('T')[0],
    is_organic: false,
    image_url: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/categories').then(res => {
      setCategories(res.data.categories || []);
      if (res.data.categories?.length > 0) {
        setFormData(prev => ({ ...prev, category_id: res.data.categories[0].id }));
      }
    });
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));

    // Upload immediately
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      setUploading(true);
      const res = await api.post('/api/products/upload-image', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, image_url: res.data.image_url }));
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.price || !formData.available_quantity) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/api/products', {
        ...formData,
        price: parseFloat(formData.price),
        available_quantity: parseFloat(formData.available_quantity),
        category_id: parseInt(formData.category_id)
      });
      navigate('/farmer/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to list product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-20 md:pb-8">
      {/* Top Bar */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white border border-kisan-border text-kisan-muted hover:text-kisan-dark"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-kisan-dark">{t('addProduct')}</h1>
          <p className="text-xs text-kisan-muted">List your harvested produce directly in the marketplace</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-kisan-danger">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 sm:p-7 border border-kisan-border shadow-card space-y-4 text-xs">
        {/* Photo Upload Box */}
        <div>
          <label className="block font-bold text-kisan-text mb-1.5">{t('uploadPhoto')}</label>
          <div className="border-2 border-dashed border-kisan-border rounded-2xl p-4 text-center hover:border-kisan-primary transition-colors bg-kisan-bg/50 relative overflow-hidden">
            {imagePreview ? (
              <div className="relative h-44 rounded-xl overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <label className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer">
                  Change Photo
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center py-6">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-kisan-primary flex items-center justify-center mb-2">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="font-bold text-kisan-dark text-sm">Click to upload harvest photograph</span>
                <span className="text-[11px] text-kisan-muted mt-1">PNG, JPG, WEBP up to 10MB</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center font-bold text-kisan-primary">
                Uploading photo...
              </div>
            )}
          </div>
        </div>

        {/* Product Name */}
        <div>
          <label className="block font-bold text-kisan-text mb-1">{t('productName')} *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Fresh Desi Tomatoes"
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-kisan-border rounded-xl focus:outline-none focus:border-kisan-primary text-sm font-medium"
            required
          />
        </div>

        {/* Category & Unit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-kisan-text mb-1">{t('category')} *</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 border border-kisan-border rounded-xl focus:outline-none focus:border-kisan-primary text-xs font-medium"
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-kisan-text mb-1">{t('unit')} *</label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 border border-kisan-border rounded-xl focus:outline-none focus:border-kisan-primary text-xs font-medium"
            >
              <option value="kg">kg (Kilogram)</option>
              <option value="gram">gram</option>
              <option value="bunch">bunch (Katta)</option>
              <option value="piece">piece</option>
              <option value="dozen">dozen</option>
              <option value="litre">litre</option>
            </select>
          </div>
        </div>

        {/* Price & Quantity */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-kisan-text mb-1">{t('pricePerUnit')} *</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="e.g. 35.00"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-kisan-border rounded-xl focus:outline-none focus:border-kisan-primary text-sm font-bold"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-kisan-text mb-1">{t('availableQuantity')} *</label>
            <input
              type="number"
              step="0.01"
              value={formData.available_quantity}
              onChange={(e) => setFormData({ ...formData, available_quantity: e.target.value })}
              placeholder="e.g. 50"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-kisan-border rounded-xl focus:outline-none focus:border-kisan-primary text-sm font-bold"
              required
            />
          </div>
        </div>

        {/* Location & Harvest Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-kisan-text mb-1">{t('location')}</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Sangareddy, Telangana"
              className="w-full px-3 py-2.5 bg-gray-50 border border-kisan-border rounded-xl focus:outline-none focus:border-kisan-primary text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-kisan-text mb-1">{t('harvestDate')}</label>
            <input
              type="date"
              value={formData.harvest_date}
              onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 border border-kisan-border rounded-xl focus:outline-none focus:border-kisan-primary text-xs"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block font-bold text-kisan-text mb-1">{t('productDescription')}</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Details about quality, cultivation technique, freshness..."
            rows={3}
            className="w-full px-3.5 py-2 bg-gray-50 border border-kisan-border rounded-xl focus:outline-none focus:border-kisan-primary text-xs"
          />
        </div>

        {/* Organic Checkbox */}
        <div className="flex items-center space-x-2.5 py-1">
          <input
            type="checkbox"
            id="organic_check"
            checked={formData.is_organic}
            onChange={(e) => setFormData({ ...formData, is_organic: e.target.checked })}
            className="w-4 h-4 text-kisan-primary rounded focus:ring-kisan-primary"
          />
          <label htmlFor="organic_check" className="font-bold text-kisan-text flex items-center cursor-pointer">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 mr-1" />
            100% Naturally Grown / Organic Produce
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || uploading}
          className="w-full mt-2 bg-kisan-primary text-white py-3.5 rounded-xl font-bold text-sm shadow-md hover:bg-kisan-dark transition-all disabled:opacity-50"
        >
          {submitting ? 'Publishing Produce...' : t('saveProduct')}
        </button>
      </form>
    </div>
  );
};

export default AddProductPage;
