import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path d="M12 4v16M4 12h16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-white">Pharma<span className="text-primary-400">Care</span></span>
            </div>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              Rwanda's trusted online pharmacy. Quality medicines, vitamins, and healthcare products delivered to your door across Kigali and beyond.
            </p>
            <div className="mt-4 flex items-center gap-1 text-sm text-gray-400">
              <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
              KK 508 ST, Kigali, Rwanda
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-primary-400 transition-colors">Home</Link></li>
              <li><Link to="/products" className="hover:text-primary-400 transition-colors">All Products</Link></li>
              <li><Link to="/products?category=PAIN_RELIEF" className="hover:text-primary-400 transition-colors">Pain Relief</Link></li>
              <li><Link to="/products?category=VITAMINS_SUPPLEMENTS" className="hover:text-primary-400 transition-colors">Vitamins</Link></li>
              <li><Link to="/products?category=ANTIBIOTICS" className="hover:text-primary-400 transition-colors">Antibiotics</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3">Customer Care</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/profile" className="hover:text-primary-400 transition-colors">My Account</Link></li>
              <li><Link to="/orders" className="hover:text-primary-400 transition-colors">Track Order</Link></li>
              <li><Link to="/cart" className="hover:text-primary-400 transition-colors">Shopping Cart</Link></li>
              <li><a href="tel:+250788000001" className="hover:text-primary-400 transition-colors">+250 788 000 001</a></li>
              <li><a href="mailto:info@pharmacare.rw" className="hover:text-primary-400 transition-colors">info@pharmacare.rw</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">© 2025 PharmaCare Rwanda. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Regulated by Rwanda FDA</span>
            <span>•</span>
            <span>Licensed Pharmacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
