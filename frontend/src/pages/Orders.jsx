import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClockIcon, TruckIcon, CheckCircleIcon, XCircleIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { ordersAPI } from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: ClockIcon },
  CONFIRMED: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700', icon: CheckCircleIcon },
  PROCESSING: { label: 'Processing', color: 'bg-purple-100 text-purple-700', icon: ClockIcon },
  SHIPPED: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-700', icon: TruckIcon },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircleIcon },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircleIcon },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.getMy()
      .then(({ data }) => setOrders(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading orders..." />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">Start shopping to see your orders here.</p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const config = STATUS_CONFIG[order.status];
            const Icon = config.icon;
            return (
              <div key={order.id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Order #{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-RW', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <span className={`badge ${config.color} flex items-center gap-1`}>
                    <Icon className="w-3.5 h-3.5" />
                    {config.label}
                  </span>
                </div>

                <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
                  {order.items.slice(0, 4).map((item) => (
                    <img
                      key={item.id}
                      src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100'}
                      alt={item.product?.name}
                      className="w-14 h-14 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100'; }}
                    />
                  ))}
                  {order.items.length > 4 && (
                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs font-medium text-gray-500">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                    <p className="font-bold text-gray-900">{order.total.toLocaleString()} RWF</p>
                  </div>
                  <Link to={`/order-confirmation/${order.id}`} className="btn-secondary text-sm py-1.5">
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
