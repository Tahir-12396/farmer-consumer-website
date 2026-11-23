import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Layers } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import PageBackground from '../../components/common/PageBackground';
import bg6 from '../../assets/images/bg6_hd.jpg';
import api from '../../services/api';

const CategoriesPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/categories').then(res => {
      setCategories(res.data.categories || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-24 md:pb-8">
      <PageBackground image={bg6} />
      <div>
        <h1 className="text-2xl font-extrabold text-kisan-dark">{t('categories')}</h1>
        <p className="text-xs text-kisan-muted">Browse fresh farm produce by category</p>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-kisan-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/buyer?category_id=${c.id}`)}
              className="group cursor-pointer bg-white rounded-3xl border border-kisan-border shadow-card overflow-hidden hover:shadow-float transition-all duration-300 flex flex-col justify-between"
            >
              <div className="h-44 overflow-hidden bg-gray-100 relative">
                <img
                  src={c.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80'}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-2.5 right-2.5 bg-black/60 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                  {c.product_count} items
                </span>
              </div>

              <div className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-kisan-dark group-hover:text-kisan-primary transition-colors">
                    {c.name}
                  </h3>
                  <p className="text-xs text-kisan-muted mt-0.5 line-clamp-1">{c.description}</p>
                </div>

                <div className="w-8 h-8 rounded-full bg-kisan-light text-kisan-primary flex items-center justify-center group-hover:bg-kisan-primary group-hover:text-white transition-colors flex-shrink-0 ml-3">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
