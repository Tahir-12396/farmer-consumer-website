import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sprout, ShoppingCart, Bell, User, LogOut, Globe, Plus, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../contexts/CartContext';
import api from '../../services/api';

const Navbar = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/api/notifications').then((res) => {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unread_count || 0);
      }).catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const handleMarkAllRead = async () => {
    try {
      await api.post('/api/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {}
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-kisan-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to={role === 'admin' ? '/admin' : role === 'farmer' ? '/farmer' : '/buyer'} className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-kisan-primary flex items-center justify-center text-white shadow-md group-hover:bg-kisan-dark transition-colors">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-kisan-dark font-sans block leading-none">
                {t('appName')}
              </span>
              <span className="text-[10px] text-kisan-muted tracking-wide font-medium">
                {role === 'admin' ? 'Admin Console' : role === 'farmer' ? t('farmer') : t('tagline')}
              </span>
            </div>
          </Link>

          {/* Location Badge (Desktop) */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center text-xs text-kisan-muted bg-kisan-light/60 px-3 py-1.5 rounded-full border border-kisan-secondary/20">
              <MapPin className="w-3.5 h-3.5 text-kisan-primary mr-1" />
              <span>
                {role === 'admin'
                  ? 'KisanDirect Headquarters'
                  : role === 'farmer' 
                  ? user?.farmer_profile?.location_display || 'Telangana, India'
                  : 'Direct Farm Delivery'}
              </span>
            </div>
          )}

          {/* Action Icons */}
          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center space-x-1 p-2 rounded-lg text-kisan-muted hover:text-kisan-primary hover:bg-kisan-light/50 transition-colors"
                title="Change Language"
              >
                <Globe className="w-5 h-5 text-kisan-primary" />
                <span className="text-xs uppercase font-semibold hidden sm:inline">{language}</span>
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg border border-kisan-border py-1.5 z-50">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'te', label: 'తెలుగు (Telugu)' },
                    { code: 'hi', label: 'हिंदी (Hindi)' }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                        language === lang.code ? 'bg-kisan-light text-kisan-dark font-bold' : 'text-kisan-text hover:bg-gray-50'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Dropdown */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg text-kisan-muted hover:text-kisan-primary hover:bg-kisan-light/50 relative transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-kisan-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-kisan-border p-3 z-50">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="font-semibold text-sm text-kisan-dark">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-kisan-primary font-medium hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 py-1">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-center py-6 text-kisan-muted">No notifications yet</p>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className={`p-2.5 rounded-lg text-xs ${!n.is_read ? 'bg-kisan-light/40' : ''}`}>
                            <p className="font-semibold text-kisan-text">{n.title}</p>
                            <p className="text-kisan-muted mt-0.5">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cart Button (Buyer) */}
            {isAuthenticated && role === 'buyer' && (
              <Link
                to="/buyer/cart"
                className="relative p-2 rounded-lg text-kisan-muted hover:text-kisan-primary hover:bg-kisan-light/50 transition-colors"
                title="View Cart"
              >
                <ShoppingCart className="w-5 h-5 text-kisan-primary" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-kisan-accent text-kisan-dark text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Farmer Add Product Shortcut (Desktop) */}
            {isAuthenticated && role === 'farmer' && (
              <Link
                to="/farmer/add-product"
                className="hidden md:flex items-center space-x-1.5 bg-kisan-primary text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-kisan-dark transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{t('addProduct')}</span>
              </Link>
            )}

            {/* User Profile / Logout */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2 pl-1 border-l border-kisan-border">
                <Link
                  to={role === 'admin' ? '/admin' : role === 'farmer' ? '/farmer/profile' : '/buyer/profile'}
                  className="p-2 rounded-lg text-kisan-muted hover:text-kisan-primary hover:bg-kisan-light/50 transition-colors"
                  title="Profile"
                >
                  <User className="w-5 h-5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-kisan-muted hover:text-kisan-danger hover:bg-red-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs font-medium text-kisan-primary hover:text-kisan-dark px-3 py-1.5"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/select-role"
                  className="text-xs font-semibold bg-kisan-primary text-white px-3.5 py-1.5 rounded-lg hover:bg-kisan-dark shadow-sm"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
