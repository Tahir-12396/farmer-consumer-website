import React, { useState } from 'react';
import { User, MapPin, Globe, Headphones, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../services/api';

const FarmerProfile = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [supportSubject, setSupportSubject] = useState('');
  const [supportMsg, setSupportMsg] = useState('');
  const [ticketStatus, setTicketStatus] = useState('');

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/support', { subject: supportSubject, message: supportMsg });
      setTicketStatus('Support request submitted. Our team will contact you shortly!');
      setSupportSubject('');
      setSupportMsg('');
      setTimeout(() => setTicketStatus(''), 4000);
    } catch (err) {
      alert('Failed to submit ticket');
    }
  };

  const farmer = user?.farmer_profile || {};

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-20 md:pb-8">
      <div>
        <h1 className="text-2xl font-extrabold text-kisan-dark">{t('profile')}</h1>
        <p className="text-xs text-kisan-muted">Manage farm details and app preferences</p>
      </div>

      {/* Farmer Card */}
      <div className="bg-white rounded-3xl p-6 border border-kisan-border shadow-card flex items-center space-x-4">
        <div className="w-16 h-16 rounded-2xl bg-kisan-primary text-white flex items-center justify-center font-black text-2xl shadow-md">
          {user?.full_name ? user.full_name[0] : 'K'}
        </div>
        <div>
          <h2 className="text-lg font-bold text-kisan-dark">{user?.full_name}</h2>
          <p className="text-xs font-semibold text-kisan-primary">{farmer.farm_name || 'Kisan Direct Farmer'}</p>
          {user?.email && <p className="text-xs text-kisan-muted mt-0.5">{user.email}</p>}
          {user?.mobile_number && <p className="text-xs text-kisan-muted mt-0.5">{user.mobile_number}</p>}
          <div className="flex items-center text-xs text-kisan-muted mt-1">
            <MapPin className="w-3.5 h-3.5 text-kisan-secondary mr-1" />
            <span>{farmer.village}, {farmer.district}, {farmer.state} - {farmer.pincode}</span>
          </div>
        </div>
      </div>

      {/* Language Preferences */}
      <div className="bg-white rounded-3xl p-6 border border-kisan-border shadow-card">
        <div className="flex items-center space-x-2 mb-3">
          <Globe className="w-5 h-5 text-kisan-primary" />
          <h3 className="font-bold text-sm text-kisan-dark">{t('appLanguage')}</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { code: 'en', label: 'English' },
            { code: 'te', label: 'తెలుగు' },
            { code: 'hi', label: 'हिंदी' }
          ].map((item) => (
            <button
              key={item.code}
              onClick={() => setLanguage(item.code)}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                language === item.code
                  ? 'bg-kisan-primary text-white border-kisan-primary'
                  : 'bg-gray-50 text-kisan-text border-kisan-border hover:bg-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Support Section */}
      <div className="bg-white rounded-3xl p-6 border border-kisan-border shadow-card">
        <div className="flex items-center space-x-2 mb-3">
          <Headphones className="w-5 h-5 text-kisan-primary" />
          <h3 className="font-bold text-sm text-kisan-dark">{t('helpSupport')}</h3>
        </div>

        {ticketStatus && (
          <div className="mb-3 p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl flex items-center space-x-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>{ticketStatus}</span>
          </div>
        )}

        <form onSubmit={handleSupportSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold mb-1">{t('subject')}</label>
            <input
              type="text"
              value={supportSubject}
              onChange={(e) => setSupportSubject(e.target.value)}
              placeholder="e.g. Issue with payout or order dispatch"
              className="w-full px-3 py-2 border rounded-xl"
              required
            />
          </div>
          <div>
            <label className="block font-bold mb-1">{t('message')}</label>
            <textarea
              value={supportMsg}
              onChange={(e) => setSupportMsg(e.target.value)}
              placeholder="Describe your question or issue in detail..."
              rows={2}
              className="w-full px-3 py-2 border rounded-xl"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-kisan-light text-kisan-dark font-bold py-2.5 rounded-xl border border-kisan-primary/30 hover:bg-kisan-primary hover:text-white transition-colors"
          >
            {t('sendSupportMessage')}
          </button>
        </form>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full bg-red-50 text-kisan-danger hover:bg-red-100 py-3 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition-colors border border-red-200"
      >
        <LogOut className="w-4 h-4" />
        <span>{t('logout')}</span>
      </button>
    </div>
  );
};

export default FarmerProfile;
