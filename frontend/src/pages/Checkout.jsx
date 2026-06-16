import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { ordersAPI, uploadAPI } from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'CASH_ON_DELIVERY', label: 'Cash on Delivery', description: 'Pay when your order arrives', icon: BanknotesIcon, color: 'gray' },
  { id: 'MTN_MOBILE_MONEY', label: 'MTN Mobile Money', description: 'Pay via MTN MoMo', icon: DevicePhoneMobileIcon, color: 'yellow' },
  { id: 'AIRTEL_MONEY', label: 'Airtel Money', description: 'Pay via Airtel Money', icon: DevicePhoneMobileIcon, color: 'red' },
];

const colorMap = {
  gray:   { border: 'border-gray-400',  bg: 'bg-gray-50',   text: 'text-gray-700',   badge: 'bg-gray-100 text-gray-700' },
  yellow: { border: 'border-yellow-400', bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800' },
  red:    { border: 'border-red-400',   bg: 'bg-red-50',    text: 'text-red-700',    badge: 'bg-red-100 text-red-800' },
};

export default function Checkout() {
  const { cart, fetchCart, getTotal, hasPrescriptionRequired } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({ shippingAddress: user?.address || '', phone: user?.phone || '', notes: '' });
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [transactionId, setTransactionId] = useState('');
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [prescriptionUrl, setPrescriptionUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    fetchCart();
  }, [isAuthenticated]);

  const needsPrescription = hasPrescriptionRequired();
  const total = getTotal();
  const items = cart?.items || [];
  const isMobileMoney = paymentMethod === 'MTN_MOBILE_MONEY' || paymentMethod === 'AIRTEL_MONEY';
  const deliveryFee = total >= 10000 ? 0 : 1500;

  const handlePrescriptionUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setPrescriptionFile(file);
    try {
      const { data } = await uploadAPI.prescription(file);
      setPrescriptionUrl(data.url);
      toast.success('Prescription uploaded successfully');
    } catch {
      toast.error('Failed to upload prescription');
      setPrescriptionFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.shippingAddress.trim() || !form.phone.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (isMobileMoney && !transactionId.trim()) {
      toast.error('Please enter your transaction ID');
      return;
    }
    if (needsPrescription && !prescriptionUrl) {
      toast.error('Please upload a prescription for restricted items');
      return;
    }
    setSubmitting(true);
    try {
      const { data: order } = await ordersAPI.create({
        shippingAddress: form.shippingAddress,
        phone: form.phone,
        notes: form.notes,
        prescriptionUrl,
        paymentMethod,
        transactionId: isMobileMoney ? transactionId : null,
      });
      navigate(`/order-confirmation/${order.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart) return <LoadingSpinner text="Loading checkout..." />;
  if (items.length === 0) { navigate('/cart'); return null; }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">

          {/* Delivery Details */}
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 mb-4">Delivery Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input value={user?.name || ''} disabled className="input-field bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input value={user?.email || ''} disabled className="input-field bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+250 7XX XXX XXX"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address *</label>
                <textarea
                  value={form.shippingAddress}
                  onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                  placeholder="Street, District, Province, Rwanda"
                  rows={3}
                  className="input-field resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Special instructions for your order..."
                  rows={2}
                  className="input-field resize-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 mb-4">Payment Method</h2>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => {
                const selected = paymentMethod === method.id;
                const colors = colorMap[method.color];
                const Icon = method.icon;
                return (
                  <label
                    key={method.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selected ? `${colors.border} ${colors.bg}` : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selected}
                      onChange={() => { setPaymentMethod(method.id); setTransactionId(''); }}
                      className="sr-only"
                    />
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${selected ? colors.badge : 'bg-gray-100'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold text-sm ${selected ? colors.text : 'text-gray-800'}`}>{method.label}</p>
                      <p className="text-xs text-gray-500">{method.description}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${selected ? `${colors.border} border-4` : 'border-gray-300'}`} />
                  </label>
                );
              })}
            </div>

            {/* Transaction ID for mobile money */}
            {isMobileMoney && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                  <p className="font-medium text-gray-800 mb-1">How to pay:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Send <span className="font-semibold">{(total + deliveryFee).toLocaleString()} RWF</span> to PharmaCare Rwanda via {paymentMethod === 'MTN_MOBILE_MONEY' ? 'MTN MoMo' : 'Airtel Money'}</li>
                    <li>You will receive an SMS confirmation with a Transaction ID</li>
                    <li>Enter that Transaction ID below and place your order</li>
                  </ol>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID *</label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. 1234567890"
                    className="input-field"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Prescription Upload */}
          {needsPrescription && (
            <div className="card p-6">
              <div className="flex items-start gap-3 mb-4">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-bold text-gray-900">Prescription Required</h2>
                  <p className="text-sm text-gray-500 mt-1">Your cart contains prescription-only medication. Please upload a valid prescription.</p>
                </div>
              </div>
              <label className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors ${prescriptionUrl ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-primary-400 bg-gray-50'}`}>
                <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handlePrescriptionUpload} className="hidden" />
                <CloudArrowUpIcon className={`w-10 h-10 ${prescriptionUrl ? 'text-green-500' : 'text-gray-400'}`} />
                {uploading ? (
                  <span className="text-sm text-gray-600">Uploading...</span>
                ) : prescriptionUrl ? (
                  <div className="text-center">
                    <p className="text-sm font-medium text-green-700 flex items-center gap-1"><CheckCircleIcon className="w-4 h-4" /> Prescription uploaded</p>
                    <p className="text-xs text-gray-500 mt-1">{prescriptionFile?.name}</p>
                    <p className="text-xs text-primary-600 mt-1">Click to change</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">Upload your prescription</p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG or PDF. Max 5MB.</p>
                  </div>
                )}
              </label>
            </div>
          )}

          <button type="submit" disabled={submitting || uploading} className="btn-primary w-full py-3 text-base">
            {submitting ? 'Placing Order...' : `Place Order — ${(total + deliveryFee).toLocaleString()} RWF`}
          </button>
        </form>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="card p-6 sticky top-20">
            <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img
                    src={item.product.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100'}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    <p className="text-sm font-semibold text-gray-900">{(item.product.price * item.quantity).toLocaleString()} RWF</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{total.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                  {deliveryFee === 0 ? 'Free' : '1,500 RWF'}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Payment</span>
                <span className="font-medium text-gray-800">
                  {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}
                </span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{(total + deliveryFee).toLocaleString()} RWF</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
