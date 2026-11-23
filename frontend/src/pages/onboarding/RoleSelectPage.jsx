import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sprout, ShoppingBag, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import PageBackground from '../../components/common/PageBackground';
import bg2 from '../../assets/images/bg2_hd.jpg';

const RoleSelectPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('farmer');

  const handleContinue = () => {
    if (selectedRole === 'farmer') {
      navigate('/register/farmer');
    } else {
      navigate('/register/buyer');
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto">
      <PageBackground image={bg2} />
      {/* Header */}
      <div className="pt-6 sm:pt-8 text-center">
        <span className="text-xs font-bold text-kisan-primary tracking-wider uppercase bg-kisan-light px-3 py-1 rounded-full">
          Step 2 of 2
        </span>
        <h1 className="text-xl sm:text-2xl font-extrabold text-kisan-dark mt-3">
          {t('joinAs')}
        </h1>
        <p className="text-xs text-kisan-muted mt-1">
          Choose your account role to proceed
        </p>
      </div>

      {/* Role Cards */}
      <div className="space-y-4 my-6">
        {/* Farmer Card */}
        <div
          onClick={() => setSelectedRole('farmer')}
          className={`
            cursor-pointer p-5 rounded-2xl border-2 transition-all duration-200 relative overflow-hidden bg-white
            ${selectedRole === 'farmer'
              ? 'border-kisan-primary ring-2 ring-kisan-light shadow-card'
              : 'border-kisan-border hover:border-kisan-secondary/50'
            }
          `}
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
              <Sprout className="w-7 h-7 text-kisan-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base text-kisan-dark">{t('farmer')}</h3>
              <p className="text-xs text-kisan-muted mt-1 leading-relaxed">
                {t('farmerDesc')}
              </p>
              <div className="mt-2.5 flex items-center space-x-2 text-[11px] font-semibold text-kisan-primary">
                <span>Direct Marketplace</span>
                <span>•</span>
                <span>Zero Middlemen</span>
                <span>•</span>
                <span>Live Orders</span>
              </div>
            </div>
          </div>
        </div>

        {/* Buyer Card */}
        <div
          onClick={() => setSelectedRole('buyer')}
          className={`
            cursor-pointer p-5 rounded-2xl border-2 transition-all duration-200 relative overflow-hidden bg-white
            ${selectedRole === 'buyer'
              ? 'border-kisan-primary ring-2 ring-kisan-light shadow-card'
              : 'border-kisan-border hover:border-kisan-secondary/50'
            }
          `}
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-7 h-7 text-amber-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base text-kisan-dark">{t('buyer')}</h3>
              <p className="text-xs text-kisan-muted mt-1 leading-relaxed">
                {t('buyerDesc')}
              </p>
              <div className="mt-2.5 flex items-center space-x-2 text-[11px] font-semibold text-amber-700">
                <span>Farm Fresh</span>
                <span>•</span>
                <span>Verified Farmers</span>
                <span>•</span>
                <span>Home Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pb-6 space-y-3">
        <button
          onClick={handleContinue}
          className="w-full bg-kisan-primary text-white py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center space-x-2 shadow-card hover:bg-kisan-dark transition-all duration-200 active:scale-[0.99]"
        >
          <span>{t('continue')}</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="text-center pt-1">
          <Link to="/login" className="text-xs font-semibold text-kisan-primary hover:underline">
            {t('alreadyHaveAccount')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectPage;
