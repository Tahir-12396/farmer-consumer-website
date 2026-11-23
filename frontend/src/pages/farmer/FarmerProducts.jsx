import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit3, Sparkles, MapPin, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../services/api';

const FarmerProducts = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [msg, setMsg] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/farmer/products');
      setProducts(res.data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
      setDeleteConfirmId(null);
      setMsg('Product deleted successfully');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/products/${editingProduct.id}`, {
        name: editingProduct.name,
        price: editingProduct.price,
        available_quantity: editingProduct.available_quantity,
        is_available: editingProduct.is_available,
        description: editingProduct.description
      });
      setEditingProduct(null);
      fetchProducts();
      setMsg('Product updated successfully');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert('Failed to update product');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-20 md:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-kisan-dark">{t('myProducts')}</h1>
          <p className="text-xs text-kisan-muted">Manage all produce listed from your farm</p>
        </div>
        <Link
          to="/farmer/add-product"
          className="bg-kisan-primary text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 shadow-sm hover:bg-kisan-dark transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addProduct')}</span>
        </Link>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold">
          {msg}
        </div>
      )}

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-kisan-primary"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-kisan-border">
          <p className="text-sm font-semibold text-kisan-text">No products added yet</p>
          <p className="text-xs text-kisan-muted mt-1">Start listing your harvested produce to reach local buyers!</p>
          <Link
            to="/farmer/add-product"
            className="mt-4 inline-flex items-center space-x-1.5 bg-kisan-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-kisan-dark"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Product</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-kisan-border shadow-card overflow-hidden flex flex-col justify-between">
              <div>
                <div className="relative h-44 bg-gray-100">
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  {p.is_organic && (
                    <span className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center shadow-sm">
                      <Sparkles className="w-3 h-3 mr-0.5" />
                      Organic
                    </span>
                  )}
                  <span className={`absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${
                    p.is_available ? 'bg-white text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {p.is_available ? 'Active' : 'Hidden'}
                  </span>
                </div>

                <div className="p-4">
                  <span className="text-[10px] uppercase font-bold text-kisan-muted tracking-wide">{p.category_name}</span>
                  <h3 className="font-bold text-sm sm:text-base text-kisan-dark mt-0.5 line-clamp-1">{p.name}</h3>
                  <div className="flex items-center text-xs text-kisan-muted mt-1">
                    <MapPin className="w-3.5 h-3.5 text-kisan-secondary mr-1" />
                    <span>{p.location}</span>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-gray-100">
                    <div>
                      <span className="text-lg font-black text-kisan-dark">₹{p.price.toFixed(2)}</span>
                      <span className="text-xs text-kisan-muted font-normal ml-0.5">/{p.unit}</span>
                    </div>
                    <span className="text-xs font-semibold text-kisan-text bg-gray-100 px-2.5 py-1 rounded-md">
                      Stock: {p.available_quantity} {p.unit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => setEditingProduct({ ...p })}
                  className="text-xs font-bold text-kisan-primary hover:text-kisan-dark flex items-center space-x-1 px-3 py-1.5 rounded-lg hover:bg-white"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => setDeleteConfirmId(p.id)}
                  className="text-xs font-bold text-kisan-danger hover:text-red-700 flex items-center space-x-1 px-3 py-1.5 rounded-lg hover:bg-white"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-xl">
            <AlertCircle className="w-12 h-12 text-kisan-danger mx-auto mb-3" />
            <h3 className="font-bold text-base text-kisan-dark">{t('deleteProduct')}</h3>
            <p className="text-xs text-kisan-muted mt-1">{t('confirmDelete')}</p>
            <div className="flex space-x-2 mt-5">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 text-xs font-bold text-kisan-muted border border-gray-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2 text-xs font-bold bg-kisan-danger text-white rounded-xl hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-kisan-dark mb-4">{t('updateProduct')}</h3>
            <form onSubmit={handleUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Product Name</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Available Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.available_quantity}
                    onChange={(e) => setEditingProduct({ ...editingProduct, available_quantity: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Description</label>
                <textarea
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="avail"
                  checked={editingProduct.is_available}
                  onChange={(e) => setEditingProduct({ ...editingProduct, is_available: e.target.checked })}
                  className="rounded text-kisan-primary focus:ring-kisan-primary w-4 h-4"
                />
                <label htmlFor="avail" className="font-bold text-kisan-text">Active for Sale in Marketplace</label>
              </div>

              <div className="flex space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-2.5 font-bold border rounded-xl text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 font-bold bg-kisan-primary text-white rounded-xl hover:bg-kisan-dark"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerProducts;
