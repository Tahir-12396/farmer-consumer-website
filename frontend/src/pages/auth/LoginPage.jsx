import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Lock, Mail, Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

// Background Image
import bg1 from '../../assets/images/bg1_hd.jpg';

const LoginPage = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSelectBg = (img) => {
    setSelectedBg(img);
    localStorage.setItem('kisan_login_bg', img);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier || !password) {
      setError('Please enter your email or mobile number and password');
      return;
    }

    try {
      setLoading(true);
      const user = await login(identifier, password);
      if (user.role === 'farmer') {
        navigate('/farmer');
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/buyer');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (ident, pass) => {
    setIdentifier(ident);
    setPassword(pass);
    try {
      setLoading(true);
      const user = await login(ident, pass);
      if (user.role === 'farmer') {
        navigate('/farmer');
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/buyer');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed demo login');
    } finally {
      setLoading(false);
    }
  };

  const isEmailInput = identifier.includes('@');

  return (
    <div
      className="min-h-screen w-full relative flex flex-col justify-center items-center p-4 sm:p-6 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bg1})`, backgroundAttachment: 'fixed' }}
    >
      {/* Background Dimmer Overlay - Zero Blur for 100% Crisp Visual Fidelity */}
      <div className="absolute inset-0 bg-black/25 pointer-events-none" />

      {/* Top Brand Bar */}
      <div className="relative z-10 pt-4 flex items-center space-x-2">
        <div className="w-9 h-9 rounded-xl bg-kisan-primary text-white flex items-center justify-center shadow-lg border border-white/20">
          <Sprout className="w-5 h-5" />
        </div>
        <span className="text-xl font-black text-white tracking-tight drop-shadow-md">
          {t('appName')}
        </span>
      </div>

      {/* Center Auth Card with Frosted Glass */}
      <div className="relative z-10 w-full max-w-md my-auto bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/60 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-kisan-dark">{t('login')}</h2>
          <p className="text-xs text-kisan-muted mt-1">{t('tagline')}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-kisan-danger">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-kisan-text mb-1">
              Email Address or 10-Digit Mobile Number
            </label>
            <div className="relative">
              {isEmailInput ? (
                <Mail className="w-4 h-4 text-kisan-muted absolute left-3.5 top-3.5" />
              ) : (
                <Phone className="w-4 h-4 text-kisan-muted absolute left-3.5 top-3.5" />
              )}
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. farmer@farm.com or 9876543210"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/90 border border-kisan-border rounded-xl text-xs text-kisan-dark focus:outline-none focus:border-kisan-primary focus:bg-white transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-kisan-text">{t('password')}</label>
              <button type="button" className="text-[11px] text-kisan-primary hover:underline font-semibold">
                {t('forgotPassword')}
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-kisan-muted absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/90 border border-kisan-border rounded-xl text-xs text-kisan-dark focus:outline-none focus:border-kisan-primary focus:bg-white transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-kisan-primary text-white py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md hover:bg-kisan-dark transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Logging in...' : t('login')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Super Admin Quick Access */}
        <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
          <button
            onClick={() => handleDemoLogin('admin@gmail.com', 'admin123')}
            className="w-full text-xs bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 py-2.5 px-3 rounded-xl font-bold transition-colors flex items-center justify-center space-x-2 shadow-sm"
          >
            <span>🛡️ Quick Admin Login (admin@gmail.com / admin123)</span>
          </button>

          <div className="text-center pt-2">
            <Link to="/select-role" className="text-xs font-bold text-kisan-primary hover:underline">
              {t('dontHaveAccount')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
