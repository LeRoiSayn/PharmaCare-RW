import { Link } from 'react-router-dom';
import { ShoppingCartIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CATEGORY_LABELS = {
  PAIN_RELIEF: 'Pain Relief', ANTIBIOTICS: 'Antibiotics', VITAMINS_SUPPLEMENTS: 'Vitamins',
  CARDIOVASCULAR: 'Cardiovascular', DIABETES: 'Diabetes', RESPIRATORY: 'Respiratory',
  DIGESTIVE: 'Digestive', DERMATOLOGY: 'Dermatology', MENTAL_HEALTH: 'Mental Health',
  FIRST_AID: 'First Aid', BABY_CARE: 'Baby Care', PERSONAL_CARE: 'Personal Care',
};

const CATEGORY_COLORS = {
  PAIN_RELIEF: 'bg-red-100 text-red-700', ANTIBIOTICS: 'bg-orange-100 text-orange-700',
  VITAMINS_SUPPLEMENTS: 'bg-yellow-100 text-yellow-700', CARDIOVASCULAR: 'bg-pink-100 text-pink-700',
  DIABETES: 'bg-purple-100 text-purple-700', RESPIRATORY: 'bg-blue-100 text-blue-700',
  DIGESTIVE: 'bg-teal-100 text-teal-700', DERMATOLOGY: 'bg-lime-100 text-lime-700',
  MENTAL_HEALTH: 'bg-indigo-100 text-indigo-700', FIRST_AID: 'bg-cyan-100 text-cyan-700',
  BABY_CARE: 'bg-rose-100 text-rose-700', PERSONAL_CARE: 'bg-emerald-100 text-emerald-700',
};

export default function ProductCard({ product }) {
  const { addToCart, loading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    await addToCart(product.id, 1, product.name);
  };

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;

  return (
    <Link to={`/products/${product.id}`} className="card group hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden">
      <div className="relative overflow-hidden bg-gray-50 aspect-square">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400'; }}
        />
        {product.prescriptionRequired && (
          <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
            <ExclamationTriangleIcon className="w-3 h-3" />
            Rx
          </div>
        )}
        {product.featured && (
          <div className="absolute top-2 right-2 bg-primary-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
            Featured
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-900 text-sm font-semibold px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <span className={`badge ${CATEGORY_COLORS[product.category]} mb-2 self-start`}>
          {CATEGORY_LABELS[product.category]}
        </span>
        <h3 className="font-semibold text-gray-900 text-sm group-hover:text-primary-600 transition-colors line-clamp-2 mb-1">
          {product.name}
        </h3>
        {product.manufacturer && (
          <p className="text-xs text-gray-400 mb-2">{product.manufacturer}</p>
        )}
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{product.description}</p>

        {isLowStock && !isOutOfStock && (
          <p className="text-xs text-amber-600 font-medium mb-2">Only {product.stock} left!</p>
        )}

        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-lg font-bold text-gray-900">
              {product.price.toLocaleString()} <span className="text-sm font-normal text-gray-500">RWF</span>
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || loading}
            className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <ShoppingCartIcon className="w-3.5 h-3.5" />
            {isOutOfStock ? 'Sold Out' : 'Add'}
          </button>
        </div>
      </div>
    </Link>
  );
}
