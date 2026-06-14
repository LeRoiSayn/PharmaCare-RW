import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRightIcon, ShieldCheckIcon, TruckIcon, ClockIcon, PhoneIcon,
  BoltIcon, SunIcon, HeartIcon, BeakerIcon, PlusCircleIcon,
  SparklesIcon, UserCircleIcon, FireIcon,
} from '@heroicons/react/24/outline';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ui/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const CATEGORIES = [
  { key: 'PAIN_RELIEF',          label: 'Pain Relief',   icon: BoltIcon },
  { key: 'ANTIBIOTICS',          label: 'Antibiotics',   icon: ShieldCheckIcon },
  { key: 'VITAMINS_SUPPLEMENTS', label: 'Vitamins',      icon: SunIcon },
  { key: 'CARDIOVASCULAR',       label: 'Heart Health',  icon: HeartIcon },
  { key: 'DIABETES',             label: 'Diabetes',      icon: BeakerIcon },
  { key: 'BABY_CARE',            label: 'Baby Care',     icon: UserCircleIcon },
  { key: 'FIRST_AID',            label: 'First Aid',     icon: PlusCircleIcon },
  { key: 'PERSONAL_CARE',        label: 'Personal Care', icon: SparklesIcon },
];

const FEATURES = [
  { icon: ShieldCheckIcon, title: 'Licensed Pharmacy',  desc: 'All products certified and regulated by Rwanda FDA.' },
  { icon: TruckIcon,       title: 'Fast Delivery',      desc: 'Same-day delivery across Kigali and next-day nationwide.' },
  { icon: ClockIcon,       title: '24/7 Support',       desc: 'Our pharmacists are always available to help you.' },
  { icon: PhoneIcon,       title: 'Easy Ordering',      desc: 'Order from anywhere. Upload your prescription easily.' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    productsAPI.getAll({ featured: true, limit: 8 })
      .then(({ data }) => setFeatured(data.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="bg-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-medium px-3 py-1.5 rounded-full mb-6 border border-white/20">
              <span className="w-2 h-2 bg-green-300 rounded-full" />
              Rwanda's Trusted Online Pharmacy
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Your Health,<br />
              <span className="text-primary-200">Our Priority</span>
            </h1>
            <p className="text-lg text-primary-100 mb-8 max-w-xl leading-relaxed">
              Browse thousands of medicines, vitamins, and healthcare products. Get genuine medications delivered safely to your doorstep across Rwanda.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/products" className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors">
                Shop Now <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <Link to="/products?category=VITAMINS_SUPPLEMENTS" className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition-colors border border-white/20">
                View Vitamins
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-5 mt-10 text-sm text-primary-200">
              <span className="flex items-center gap-1.5"><ShieldCheckIcon className="w-4 h-4" /> Free delivery over 10,000 RWF</span>
              <span className="flex items-center gap-1.5"><ShieldCheckIcon className="w-4 h-4" /> Genuine products</span>
              <span className="flex items-center gap-1.5"><ShieldCheckIcon className="w-4 h-4" /> Easy prescription upload</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 mb-3">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
            <p className="text-gray-500 text-sm mt-1">Find exactly what you need</p>
          </div>
          <Link to="/products" className="text-primary-600 text-sm font-medium hover:text-primary-700 flex items-center gap-1">
            View All <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => navigate(`/products?category=${cat.key}`)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 bg-white hover:border-primary-400 hover:bg-primary-50 transition-all group"
            >
              <cat.icon className="w-6 h-6 text-gray-500 group-hover:text-primary-600 transition-colors" />
              <span className="text-xs font-medium text-gray-600 group-hover:text-primary-700 text-center leading-tight transition-colors">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-gray-500 text-sm mt-1">Top-selling medicines and health products</p>
          </div>
          <Link to="/products" className="text-primary-600 text-sm font-medium hover:text-primary-700 flex items-center gap-1">
            View All <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <LoadingSpinner text="Loading products..." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="bg-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <PlusCircleIcon className="w-10 h-10 mx-auto mb-3 text-primary-200" />
          <h2 className="text-2xl font-bold mb-3">Need a Prescription Filled?</h2>
          <p className="text-primary-100 mb-6 max-w-lg mx-auto">Upload your prescription and we'll prepare your order. Delivery across all of Rwanda.</p>
          <Link to="/products" className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors">
            Start Shopping <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
