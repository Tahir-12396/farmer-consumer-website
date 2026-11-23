import React, { useState, useEffect } from 'react';
import { User, MapPin, Globe, Headphones, LogOut, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../services/api';

const BuyerProfilePage = () => {
  const { user, logout, updateUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [addresses, setAddresses] = useState([]);
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({
    door_number: '', street: '', village: '', district: '', state: 'Telangana', pincode: '', landmark: ''
  });

  const [supportSubject, setSupportSubject] = useState('');
  const [supportMsg, setSupportMsg] = useState('');
  const [ticketStatus, setTicketStatus] = useState('');

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/api/addresses');
      setAddresses(res.data.addresses || []);
    } catch (e) {}
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/addresses', newAddr);
      setShowAddAddr(false);
      setNewAddr({ door_number: '', street: '', village: '', district: '', state: 'Telangana', pincode: '', landmark: '' });
      fetchAddresses();
    } catch (err) {
      alert('Failed to save address');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(`/api/addresses/${id}`);
      fetchAddresses();
    } catch (e) {}
  };

  const handleSetDefault = async (id) => {
    try {
      await api.patch(`/api/addresses/${id}/default`);
      fetchAddresses();
    } catch (e) {}
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/support', { subject: supportSubject, message: supportMsg });
      setTicketStatus('Message submitted. Customer support will reply soon.');
      setSupportSubject('');
      setSupportMsg('');
      setTimeout(() => setTicketStatus(''), 4000);
    } catch (e) {}
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-24 md:pb-8">
      <div>
        <h1 className="text-2xl font-extrabold text-kisan-dark">{t('profile')}</h1>
        <p className="text-xs text-kisan-muted">Manage your addresses and shopping preferences</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 border border-kisan-border shadow-card flex items-center space-x-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-2xl shadow-md">
          {user?.full_name ? user.full_name[0] : 'U'}
        </div>
        <div>
          <h2 className="text-lg font-bold text-kisan-dark">{user?.full_name}</h2>
          {user?.email && <p className="text-xs text-kisan-muted mt-0.5">{user.email}</p>}
          {user?.mobile_number && <p className="text-xs text-kisan-muted mt-0.5">{user.mobile_number}</p>}
          <span className="inline-block mt-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            Verified Customer
          </span>
        </div>
      </div>

      {/* Saved Addresses */}
      <div className="bg-white rounded-3xl p-6 border border-kisan-border shadow-card space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-kisan-primary" />
            <h3 className="font-bold text-sm text-kisan-dark">{t('savedAddresses')}</h3>
          </div>
          <button
            onClick={() => setShowAddAddr(!showAddAddr)}
            className="text-xs font-bold text-kisan-primary hover:underline flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New</span>
          </button>
        </div>

        {addresses.map((a) => (
          <div key={a.id} className="p-3 bg-gray-50 rounded-2xl border flex items-center justify-between text-xs">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-kisan-dark">{a.door_number}, {a.street}</span>
                {a.is_default && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Default</span>
                )}
              </div>
              <p className="text-kisan-muted text-[11px]">{a.village}, {a.district} - {a.pincode}</p>
            </div>
            <div className="flex items-center space-x-2">
              {!a.is_default && (
                <button
                  onClick={() => handleSetDefault(a.id)}
                  className="text-[11px] text-kisan-primary font-bold hover:underline"
                >
                  Set Default
                </button>
              )}
              <button
                onClick={() => handleDeleteAddress(a.id)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {showAddAddr && (
          <form onSubmit={handleAddAddress} className="p-4 bg-kisan-bg rounded-2xl border space-y-2 text-xs">
            <input
              type="text"
              placeholder="Door No. / House"
              value={newAddr.door_number}
              onChange={(e) => setNewAddr({ ...newAddr, door_number: e.target.value })}
              className="w-full p-2 border rounded-xl"
              required
            />
            <input
              type="text"
              placeholder="Street / Area"
              value={newAddr.street}
              onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
              className="w-full p-2 border rounded-xl"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Town / City"
                value={newAddr.village}
                onChange={(e) => setNewAddr({ ...newAddr, village: e.target.value })}
                className="w-full p-2 border rounded-xl"
                required
              />
              <input
                type="text"
                placeholder="Pincode"
                value={newAddr.pincode}
                onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                className="w-full p-2 border rounded-xl"
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
                Save Address
              </button>
            </div>
          </form>
        )}
      </div>

      {/* App Language */}
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
          <input
            type="text"
            value={supportSubject}
            onChange={(e) => setSupportSubject(e.target.value)}
            placeholder="Subject (e.g. Delivery status question)"
            className="w-full px-3 py-2 border rounded-xl"
            required
          />
          <textarea
            value={supportMsg}
            onChange={(e) => setSupportMsg(e.target.value)}
            placeholder="How can we help you?"
            rows={2}
            className="w-full px-3 py-2 border rounded-xl"
            required
          />
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

export default BuyerProfilePage;
