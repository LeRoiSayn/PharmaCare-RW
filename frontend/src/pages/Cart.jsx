import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrashIcon, ShoppingBagIcon, ArrowRightIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Cart() {
  const { cart, fetchCart, updateQuantity, removeItem, getTotal, loading } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <ShoppingBagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Please login first</h2>
        <p className="text-gray-500 mb-6">You need to be logged in to view your cart.</p>
        <Link to="/login" className="btn-primary">Login</Link>
      </div>
    );
  }

  if (!cart) return <LoadingSpinner text="Loading cart..." />;

  const items = cart.items || [];
  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <ShoppingBagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some products to get started.</p>
        <Link to="/products" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart ({items.length} item{items.length !== 1 ? 's' : ''})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card p-4 flex gap-4">
              <Link to={`/products/${item.productId}`} className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
                <img
                  src={item.product.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200'}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200'; }}
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.productId}`} className="font-semibold text-gray-900 hover:text-primary-600 text-sm line-clamp-2">
                  {item.product.name}
                </Link>
                {item.product.prescriptionRequired && (
                  <span className="text-xs text-amber-600 font-medium flex items-center gap-1"><ExclamationTriangleIcon className="w-3 h-3" /> Prescription Required</span>
                )}
                <p className="text-primary-600 font-semibold mt-1">{item.product.price.toLocaleString()} RWF</p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1 text-gray-600 hover:bg-gray-50 transition-colors"
                    >−</button>
                    <span className="px-3 py-1 text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="px-2.5 py-1 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
                    >+</button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900 text-sm">
                      {(item.product.price * item.quantity).toLocaleString()} RWF
                    </span>
                    <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 transition-colors">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="card p-6 sticky top-20">
            <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-gray-600">
                  <span className="truncate mr-2">{item.product.name} ×{item.quantity}</span>
                  <span className="flex-shrink-0">{(item.product.price * item.quantity).toLocaleString()} RWF</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 mb-6">
              <div className="flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span>{total.toLocaleString()} RWF</span>
              </div>
              {total >= 10000 && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircleIcon className="w-3 h-3" /> Free delivery included</p>
              )}
            </div>
            <Link to="/checkout" className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              Proceed to Checkout <ArrowRightIcon className="w-4 h-4" />
            </Link>
            <Link to="/products" className="btn-secondary w-full mt-3 flex items-center justify-center text-sm">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
