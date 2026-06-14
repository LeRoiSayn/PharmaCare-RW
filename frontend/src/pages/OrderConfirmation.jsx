import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircleIcon, ClockIcon, TruckIcon } from '@heroicons/react/24/outline';
import { ordersAPI } from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
const STATUS_LABELS = { PENDING: 'Pending', CONFIRMED: 'Confirmed', PROCESSING: 'Processing', SHIPPED: 'Shipped', DELIVERED: 'Delivered' };

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.getOne(id)
      .then(({ data }) => setOrder(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading order..." />;
  if (!order) return <div className="text-center py-20"><p className="text-gray-500">Order not found</p></div>;

  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircleIcon className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h1>
        <p className="text-gray-500">Thank you for your purchase. Your order has been received.</p>
        <p className="text-sm text-gray-400 mt-2">Order #{order.id.slice(-8).toUpperCase()}</p>
      </div>

      {/* Status Tracker */}
      <div className="card p-6 mb-6">
        <h2 className="font-bold text-gray-900 mb-6">Order Status</h2>
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200 -z-0" />
          <div
            className="absolute left-0 top-4 h-0.5 bg-primary-500 -z-0 transition-all duration-500"
            style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
          />
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className="flex flex-col items-center gap-2 relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors ${i <= currentStep ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {i < currentStep ? <CheckCircleIcon className="w-4 h-4" /> : i === currentStep ? (step === 'SHIPPED' ? <TruckIcon className="w-4 h-4" /> : <ClockIcon className="w-4 h-4" />) : <span className="w-2 h-2 rounded-full bg-current" />}
              </div>
              <span className="text-xs text-gray-600 font-medium hidden sm:block">{STATUS_LABELS[step]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Order Details */}
      <div className="card p-6 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">Order Details</h2>
        <div className="space-y-3 mb-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <img
                src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100'}
                alt={item.product?.name}
                className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100'; }}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.product?.name}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity} × {item.price.toLocaleString()} RWF</p>
              </div>
              <p className="text-sm font-semibold">{(item.price * item.quantity).toLocaleString()} RWF</p>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-3 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Shipping to</span>
            <span className="font-medium text-gray-900 max-w-xs text-right">{order.shippingAddress}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900">
            <span>Total Paid</span>
            <span>{order.total.toLocaleString()} RWF</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Link to="/orders" className="flex-1 btn-secondary text-center py-3">View All Orders</Link>
        <Link to="/products" className="flex-1 btn-primary text-center py-3">Continue Shopping</Link>
      </div>
    </div>
  );
}
