import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  ChartBarIcon, ShoppingBagIcon, CubeIcon, ArrowLeftOnRectangleIcon, HomeIcon,
} from '@heroicons/react/24/outline';
import useAuthStore from '../../store/authStore';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: ChartBarIcon, exact: true },
  { to: '/admin/products', label: 'Products', icon: CubeIcon },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBagIcon },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                <path d="M12 4v16M4 12h16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-sm">PharmaCare</span>
          </Link>
          <div className="mt-3 px-2 py-1.5 bg-purple-50 rounded-lg">
            <p className="text-xs font-semibold text-purple-700">Admin Panel</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? location.pathname === to : location.pathname.startsWith(to) && !exact ? location.pathname !== '/admin' || to === '/admin' : false;
            const isActive = exact ? location.pathname === to : location.pathname === to || location.pathname.startsWith(to + '/');
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <HomeIcon className="w-5 h-5" /> View Store
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <ArrowLeftOnRectangleIcon className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
