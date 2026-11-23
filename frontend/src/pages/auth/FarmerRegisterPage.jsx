import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, User, Lock, Mail, Phone, MapPin, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

// Background Image
import bg2 from '../../assets/images/bg2_hd.jpg';

const FarmerRegisterPage = () => {
  const { register } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile_number: '',
    farm_name: '',
    village: '',
    district: '',
    state: 'Telangana',
    pincode: '',
    password: '',
    confirm_password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.email && !formData.mobile_number) {
      setError('Please provide either an email or mobile number');
      return;
    }

    try {
      setLoading(true);
      await register({
        role: 'farmer',
        language,
        ...formData
      });
      navigate('/farmer');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full relative flex flex-col justify-center items-center p-4 sm:p-6 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bg2})`, backgroundAttachment: 'fixed' }}
    >
      {/* Background Dimmer Overlay - Zero Blur for 100% Crisp Visual Fidelity */}
      <div className="absolute inset-0 bg-black/25 pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 pt-4 flex items-center space-x-2">
        <div className="w-9 h-9 rounded-xl bg-kisan-primary text-white flex items-center justify-center shadow-lg border border-white/20">
          <Sprout className="w-5 h-5" />
        </div>
        <span className="text-xl font-black text-white tracking-tight drop-shadow-md">
          {t('appName')}
        </span>
      </div>

      {/* Registration Card */}
      <div className="relative z-10 w-full max-w-lg my-6 bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/60 shadow-2xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-kisan-primary text-white flex items-center justify-center flex-shrink-0 shadow-md">
            <Sprout className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black text-kisan-dark">{t('farmer')} {t('register')}</h1>
            <p className="text-xs text-kisan-muted">Sell fresh produce directly with Email or Mobile Number</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-kisan-danger">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-kisan-text mb-1">{t('fullName')} *</label>
            <div className="relative">
              <User className="w-4 h-4 text-kisan-muted absolute left-3 top-3" />
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="e.g. Ramesh Patel"
                className="w-full pl-9 pr-3 py-2 bg-gray-50/90 border border-kisan-border rounded-xl focus:outline-none focus:border-kisan-primary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-kisan-text mb-1">Email (Optional)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-kisan-muted absolute left-3 top-3" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ramesh@farm.com"
                  className="w-full pl-9 pr-3 py-2 bg-gray-50/90 border border-kisan-border rounded-xl focus:outline-none focus:border-kisan-primary"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-kisan-text mb-1">Mobile (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-kisan-muted absolute left-3 top-3" />
                <input
                  type="tel"
                  maxLength={10}
                  value={formData.mobile_number}
                  onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value.replace(/\D/g, '') })}
                  placeholder="9876543210"
                  className="w-full pl-9 pr-3 py-2 bg-gray-50/90 border border-kisan-border rounded-xl focus:outline-none focus:border-kisan-primary"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-kisan-text mb-1">Farm Name (Optional)</label>
            <input
              type="text"
              value={formData.farm_name}
              onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
              placeholder="e.g. Patel Organic Farms"
              className="w-full px-3 py-2 bg-gray-50/90 border border-kisan-border rounded-xl focus:outline-none focus:border-kisan-primary"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-kisan-text mb-1">{t('village')} *</label>
              <input
                type="text"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                placeholder="Village / Town"
                className="w-full px-3 py-2 bg-gray-50/90 border border-kisan-border rounded-xl focus:outline-none focus:border-kisan-primary"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-kisan-text mb-1">{t('district')} *</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="District"
                className="w-full px-3 py-2 bg-gray-50/90 border border-kisan-border rounded-xl focus:outline-none focus:border-kisan-primary"
                required
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block font-bold text-kisan-text mb-1">{t('pincode')} *</label>
              <input
                type="text"
                maxLength={6}
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                placeholder="502285"
                className="w-full px-3 py-2 bg-gray-50/90 border border-kisan-border rounded-xl focus:outline-none focus:border-kisan-primary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-kisan-text mb-1">{t('password')} *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-kisan-muted absolute left-3 top-3" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full pl-9 pr-3 py-2 bg-gray-50/90 border border-kisan-border rounded-xl focus:outline-none focus:border-kisan-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-kisan-text mb-1">{t('confirmPassword')} *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-kisan-muted absolute left-3 top-3" />
                <input
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  placeholder="Re-enter password"
                  className="w-full pl-9 pr-3 py-2 bg-gray-50/90 border border-kisan-border rounded-xl focus:outline-none focus:border-kisan-primary"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-kisan-primary text-white py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md hover:bg-kisan-dark transition-all disabled:opacity-50 mt-4"
          >
            <span>{loading ? 'Registering Farm...' : t('register')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link to="/login" className="text-xs font-bold text-kisan-primary hover:underline">
            {t('alreadyHaveAccount')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FarmerRegisterPage;
