import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FunnelIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ui/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const CATEGORIES = [
  { key: '', label: 'All Products' },
  { key: 'PAIN_RELIEF', label: 'Pain Relief' },
  { key: 'ANTIBIOTICS', label: 'Antibiotics' },
  { key: 'VITAMINS_SUPPLEMENTS', label: 'Vitamins & Supplements' },
  { key: 'CARDIOVASCULAR', label: 'Cardiovascular' },
  { key: 'DIABETES', label: 'Diabetes' },
  { key: 'RESPIRATORY', label: 'Respiratory' },
  { key: 'DIGESTIVE', label: 'Digestive' },
  { key: 'DERMATOLOGY', label: 'Dermatology' },
  { key: 'MENTAL_HEALTH', label: 'Mental Health' },
  { key: 'FIRST_AID', label: 'First Aid' },
  { key: 'BABY_CARE', label: 'Baby Care' },
  { key: 'PERSONAL_CARE', label: 'Personal Care' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const [prescriptionOnly, setPrescriptionOnly] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (category) params.category = category;
      if (search) params.search = search;
      const { data } = await productsAPI.getAll(params);
      let products = data.products;
      if (prescriptionOnly) products = products.filter((p) => p.prescriptionRequired);
      setProducts(products);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, search, page, prescriptionOnly]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const setCategory = (cat) => {
    const params = new URLSearchParams(searchParams);
    if (cat) params.set('category', cat);
    else params.delete('category');
    params.delete('page');
    setSearchParams(params);
  };

  const setPage = (p) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', p);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {search ? `Results for "${search}"` : category ? CATEGORIES.find((c) => c.key === category)?.label : 'All Products'}
          </h1>
          {!loading && <p className="text-sm text-gray-500 mt-1">{total} products found</p>}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 btn-secondary text-sm lg:hidden"
        >
          <FunnelIcon className="w-4 h-4" /> Filters
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-56 flex-shrink-0`}>
          <div className="card p-4 sticky top-20">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="w-4 h-4" /> Filters
            </h3>

            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</p>
              <ul className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <li key={cat.key}>
                    <button
                      onClick={() => setCategory(cat.key)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors ${category === cat.key ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {cat.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prescriptionOnly}
                  onChange={(e) => setPrescriptionOnly(e.target.checked)}
                  className="w-4 h-4 accent-primary-600"
                />
                <span className="text-sm text-gray-700">Prescription only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <LoadingSpinner text="Loading products..." />
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <MagnifyingGlassIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 text-sm">Try a different search term or category</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button onClick={() => setPage(page - 1)} disabled={page === 1} className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40">
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-primary-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40">
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
