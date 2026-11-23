import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Layers, PlusCircle, ShoppingBag, ShoppingCart, User, IndianRupee } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../contexts/CartContext';

const BottomNav = () => {
  const { isAuthenticated, role } = useAuth();
  const { t } = useLanguage();
  const { itemCount } = useCart();

  if (!isAuthenticated) return null;

  const farmerLinks = [
    { to: '/farmer', icon: Home, label: t('home'), end: true },
    { to: '/farmer/products', icon: Layers, label: t('myProducts') },
    { to: '/farmer/add-product', icon: PlusCircle, label: t('addProduct'), isAction: true },
    { to: '/farmer/orders', icon: ShoppingBag, label: t('orders') },
    { to: '/farmer/earnings', icon: IndianRupee, label: t('earnings') },
  ];

  const buyerLinks = [
    { to: '/buyer', icon: Home, label: t('home'), end: true },
    { to: '/buyer/categories', icon: Layers, label: t('categories') },
    { to: '/buyer/orders', icon: ShoppingBag, label: t('orders') },
    { to: '/buyer/cart', icon: ShoppingCart, label: t('cart'), badge: itemCount },
    { to: '/buyer/profile', icon: User, label: t('profile') },
  ];

  const links = role === 'farmer' ? farmerLinks : buyerLinks;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-kisan-border z-40 shadow-lg px-2 py-1 safe-area-inset-bottom">
      <div className="flex items-center justify-around">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `
                flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all relative
                ${link.isAction 
                  ? 'bg-kisan-primary text-white -mt-5 p-3 rounded-full shadow-lg border-2 border-white hover:bg-kisan-dark' 
                  : isActive 
                    ? 'text-kisan-primary font-bold' 
                    : 'text-kisan-muted hover:text-kisan-text'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={link.isAction ? 'w-6 h-6' : 'w-5 h-5'} />
                    {link.badge > 0 && (
                      <span className="absolute -top-1 -right-2 bg-kisan-accent text-kisan-dark text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                        {link.badge}
                      </span>
                    )}
                  </div>
                  {!link.isAction && (
                    <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[56px]">
                      {link.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
