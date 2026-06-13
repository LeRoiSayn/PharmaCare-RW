import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCartIcon, ArrowLeftIcon, ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { productsAPI } from '../services/api';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const CATEGORY_LABELS = {
  PAIN_RELIEF: 'Pain Relief', ANTIBIOTICS: 'Antibiotics', VITAMINS_SUPPLEMENTS: 'Vitamins & Supplements',
  CARDIOVASCULAR: 'Cardiovascular', DIABETES: 'Diabetes', RESPIRATORY: 'Respiratory',
  DIGESTIVE: 'Digestive', DERMATOLOGY: 'Dermatology', MENTAL_HEALTH: 'Mental Health',
  FIRST_AID: 'First Aid', BABY_CARE: 'Baby Care', PERSONAL_CARE: 'Personal Care',
};

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, loading: cartLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    productsAPI.getOne(id)
      .then(({ data }) => setProduct(data))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    const ok = await addToCart(product.id, quantity, product.name);
    if (ok) navigate('/cart');
  };

  if (loading) return <LoadingSpinner text="Loading product..." />;
  if (!product) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Product not found</p>
      <Link to="/products" className="btn-primary mt-4 inline-block">Back to Products</Link>
    </div>
  );

  const isOutOfStock = product.stock === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/products" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeftIcon className="w-4 h-4" /> Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-50 aspect-square max-h-96 lg:max-h-none">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600'}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600'; }}
          />
          {product.prescriptionRequired && (
            <div className="absolute top-4 left-4 bg-amber-500 text-white text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1.5">
              <ExclamationTriangleIcon className="w-4 h-4" /> Prescription Required
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <span className="badge bg-primary-50 text-primary-700 mb-3">{CATEGORY_LABELS[product.category]}</span>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            {product.manufacturer && (
              <p className="text-gray-500">by <span className="font-medium text-gray-700">{product.manufacturer}</span></p>
            )}
          </div>

          <div className="text-3xl font-bold text-gray-900">
            {product.price.toLocaleString()} <span className="text-lg font-normal text-gray-500">RWF</span>
          </div>

          {product.prescriptionRequired && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800 text-sm">Prescription Required</p>
                <p className="text-amber-700 text-xs mt-0.5">You will need to upload a valid prescription during checkout.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-500 text-xs mb-1">Stock</p>
              <p className={`font-semibold ${isOutOfStock ? 'text-red-600' : product.stock <= 10 ? 'text-amber-600' : 'text-green-600'}`}>
                {isOutOfStock ? 'Out of stock' : `${product.stock} available`}
              </p>
            </div>
            {product.dosage && (
              <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                <p className="text-gray-500 text-xs mb-1">Dosage</p>
                <p className="font-medium text-gray-800">{product.dosage}</p>
              </div>
            )}
          </div>

          {!isOutOfStock && (
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors text-lg font-medium">−</button>
                <span className="px-4 py-2 font-semibold text-gray-900 min-w-[3rem] text-center">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors text-lg font-medium">+</button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={cartLoading}
                className="flex-1 btn-primary flex items-center justify-center gap-2 py-3"
              >
                <ShoppingCartIcon className="w-5 h-5" />
                {cartLoading ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          )}

          {/* Info tabs */}
          <div className="border-t border-gray-100 pt-6 space-y-4">
            {product.description && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <InformationCircleIcon className="w-4 h-4 text-primary-600" /> Description
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}
            {product.activeIngredient && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">Active Ingredient</h3>
                <p className="text-sm text-gray-600">{product.activeIngredient}</p>
              </div>
            )}
            {product.sideEffects && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm flex items-center gap-1.5">
                  <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" /> Side Effects
                </h3>
                <p className="text-sm text-gray-600">{product.sideEffects}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 bg-green-50 rounded-xl p-3">
            <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
            Genuine product. Verified by Rwanda FDA licensed pharmacists.
          </div>
        </div>
      </div>
    </div>
  );
}
