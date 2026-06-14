import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  CurrencyDollarIcon, ShoppingBagIcon, UsersIcon, ClockIcon,
  ExclamationTriangleIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, CheckCircleIcon, ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { analyticsAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const STATUS_COLORS = {
  PENDING: '#f59e0b', CONFIRMED: '#3b82f6', PROCESSING: '#8b5cf6',
  SHIPPED: '#6366f1', DELIVERED: '#22c55e', CANCELLED: '#ef4444',
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getDashboard()
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading analytics..." />;
  if (!data) return <div className="text-center py-20 text-gray-500">Failed to load analytics</div>;

  const { summary, lowStockProducts, recentOrders, topProducts, ordersByStatus, salesLast7Days } = data;

  const revenueGrowth = summary.lastMonthRevenue > 0
    ? ((summary.monthRevenue - summary.lastMonthRevenue) / summary.lastMonthRevenue * 100).toFixed(1)
    : 0;

  const stats = [
    {
      title: 'Total Revenue',
      value: `${summary.totalRevenue.toLocaleString()} RWF`,
      sub: `${summary.monthRevenue.toLocaleString()} RWF this month`,
      icon: CurrencyDollarIcon,
      color: 'text-green-600 bg-green-50',
      trend: revenueGrowth,
    },
    {
      title: 'Total Orders',
      value: summary.totalOrders,
      sub: `${summary.monthOrders} this month`,
      icon: ShoppingBagIcon,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Customers',
      value: summary.totalCustomers,
      sub: `${summary.monthCustomers} new this month`,
      icon: UsersIcon,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      title: 'Pending Orders',
      value: summary.pendingOrders,
      sub: 'Need attention',
      icon: ClockIcon,
      color: 'text-amber-600 bg-amber-50',
    },
  ];

  const pieData = ordersByStatus.map((s) => ({
    name: s.status.charAt(0) + s.status.slice(1).toLowerCase(),
    value: s._count.status,
    color: STATUS_COLORS[s.status],
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">PharmaCare Rwanda — Business Overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.title} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              {stat.trend !== undefined && (
                <div className={`flex items-center gap-1 text-xs font-medium ${parseFloat(stat.trend) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(stat.trend) >= 0 ? <ArrowTrendingUpIcon className="w-3 h-3" /> : <ArrowTrendingDownIcon className="w-3 h-3" />}
                  {Math.abs(stat.trend)}%
                </div>
              )}
            </div>
            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.sub}</p>
            <p className="text-xs font-medium text-gray-600 mt-1">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Revenue — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={salesLast7Days}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.split('-').slice(1).join('/')} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`${v.toLocaleString()} RWF`, 'Revenue']} labelFormatter={(l) => `Date: ${l}`} />
              <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by Status Pie */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Orders by Status</h3>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No orders yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Top Products</h3>
            <Link to="/admin/products" className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-0.5">Manage <ArrowRightIcon className="w-3 h-3" /></Link>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No sales data yet</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.product?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{item._sum.quantity} units sold</p>
                  </div>
                  <span className="text-xs font-medium text-gray-700 flex-shrink-0">{((item._sum.quantity * (item.product?.price || 0)) / 1000).toFixed(1)}k RWF</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-gray-900">Low Stock Alert</h3>
          </div>
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-green-600 text-sm font-medium flex items-center gap-1 justify-center"><CheckCircleIcon className="w-4 h-4" /> All products well-stocked</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <p className="text-sm text-gray-800 truncate flex-1">{product.name}</p>
                  <span className={`badge ml-2 flex-shrink-0 ${product.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-0.5">View all <ArrowRightIcon className="w-3 h-3" /></Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link key={order.id} to="/admin/orders" className="flex items-center justify-between hover:bg-gray-50 -mx-2 px-2 py-1 rounded-lg transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{order.user?.name}</p>
                    <p className="text-xs text-gray-500">#{order.id.slice(-6).toUpperCase()}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-sm font-semibold text-gray-900">{order.total.toLocaleString()} RWF</p>
                    <span className={`text-xs font-medium ${STATUS_COLORS[order.status] ? 'text-amber-600' : 'text-gray-500'}`}>{order.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
