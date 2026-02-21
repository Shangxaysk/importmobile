import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ShoppingBag, DollarSign, Package, Users, 
  TrendingUp, Activity, ChevronRight, Clock, Eye 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    orders: 0,
    products: 0,
    users: 0,
    revenue: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [ordersRes, productsRes, usersRes] = await Promise.all([
          axios.get('http://localhost:3000/orders', { headers }),
          axios.get('http://localhost:3000/products'),
          axios.get('http://localhost:3000/users', { headers })
        ]);

        const orders = ordersRes.data;
        const products = productsRes.data;
        const users = usersRes.data;

        const totalRevenue = orders
          .filter((o: any) => o.status === 'APPROVED' || o.status === 'CONFIRMED')
          .reduce((sum: number, order: any) => sum + Number(order.totalPrice || 0), 0);

        setStats({
          orders: orders.length,
          products: products.length,
          users: users.length,
          revenue: totalRevenue
        });

        setRecentOrders(orders.slice(0, 5));

      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusBadge = (status: string) => {
    const config: any = {
      NEW: { label: t('status_new'), style: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900/30" },
      APPROVED: { label: t('status_approved'), style: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900/30" },
      CONFIRMED: { label: t('status_confirmed'), style: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900/30" },
      WAITING_CHECK: { label: t('status_waiting'), style: "bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-900/30" },
      REJECTED: { label: t('status_rejected'), style: "bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/30" },
      CANCELLED: { label: t('status_cancelled'), style: "bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/30" },
    };
    const item = config[status] || { label: status || t('status_unknown'), style: "bg-gray-100 text-gray-600" };
    return <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${item.style}`}>{item.label}</span>;
  };

  const cards = [
    { 
      title: t('total_revenue'), 
      value: `${stats.revenue.toLocaleString()} $`, 
      icon: <DollarSign size={24} className="text-emerald-500"/>, 
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      border: 'border-emerald-100 dark:border-emerald-500/20' 
    },
    { 
      title: t('orders_count'), 
      value: stats.orders, 
      icon: <ShoppingBag size={24} className="text-blue-500"/>, 
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      border: 'border-blue-100 dark:border-blue-500/20' 
    },
    { 
      title: t('products_count'), 
      value: stats.products, 
      icon: <Package size={24} className="text-orange-500"/>, 
      bg: 'bg-orange-50 dark:bg-orange-500/10',
      border: 'border-orange-100 dark:border-orange-500/20' 
    },
    { 
      title: t('users_count'), 
      value: stats.users, 
      icon: <Users size={24} className="text-purple-500"/>, 
      bg: 'bg-purple-50 dark:bg-purple-500/10',
      border: 'border-purple-100 dark:border-purple-500/20' 
    },
  ];

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB] dark:bg-black font-inter">
      <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('analytics_loading')}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-black font-inter pb-32 transition-colors duration-300">
      
      {/* --- HEADER --- */}
      <div className="sticky top-0 z-30 w-full bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-6xl mx-auto h-[70px] md:h-[90px] px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-2xl hidden sm:block">
                <Activity size={24} />
             </div>
             <div>
                <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none">{t('dashboard_title')}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{t('live_stats')}</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8 mt-4">
        
        {/* --- STATISTIKA KARTALARI --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {cards.map((card, index) => (
            <div key={index} className={`bg-white dark:bg-gray-900 p-6 rounded-[32px] border shadow-sm flex flex-col justify-between gap-6 transition-transform hover:scale-[1.02] border-gray-100 dark:border-gray-800`}>
              <div className="flex justify-between items-start">
                <div className={`p-4 rounded-2xl border ${card.bg} ${card.border}`}>
                  {card.icon}
                </div>
                <div className="bg-gray-50 dark:bg-black px-2 py-1 rounded-lg flex items-center gap-1">
                  <TrendingUp size={12} className="text-emerald-500"/>
                  <span className="text-[9px] font-black text-gray-500 dark:text-gray-400">{t('all_time')}</span>
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mb-1 leading-none">{card.value}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{card.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* --- OXIRGI BUYURTMALAR --- */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-lg md:text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <Clock className="text-emerald-500" size={20}/> {t('recent_orders')}
            </h2>
            <Link to="/admin/orders" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl transition-colors">
              {t('view_all')} <ChevronRight size={14}/>
            </Link>
          </div>

          {recentOrders.length === 0 ? (
             <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-[35px] border border-dashed border-gray-200 dark:border-gray-800">
               <ShoppingBag size={48} className="mx-auto text-gray-200 dark:text-gray-800 mb-4"/>
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('no_orders_yet')}</p>
             </div>
          ) : (
            <>
              {/* MOBILE KO'RINISH */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {recentOrders.map((order) => (
                  <div key={order.id} className="bg-white dark:bg-gray-900 p-5 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black uppercase tracking-tighter text-gray-500">{order.id}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <h4 className="font-black text-gray-900 dark:text-white text-sm mb-1">{order.user?.fullName || t('status_unknown')}</h4>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-4">{order.contactPhone}</p>
                    <div className="flex justify-between items-end pt-4 border-t border-gray-50 dark:border-gray-800">
                      <span className="text-lg font-black text-emerald-600">{Number(order.totalPrice).toLocaleString()} $</span>
                      <Link to="/admin/orders" className="p-2.5 bg-gray-50 dark:bg-black text-gray-600 dark:text-gray-300 rounded-xl active:scale-95 transition-all">
                        <Eye size={18}/>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP KO'RINISH */}
              <div className="hidden md:block bg-white dark:bg-gray-900 rounded-[35px] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-black/20 border-b border-gray-50 dark:border-gray-800">
                      <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t('th_id_date')}</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t('th_customer')}</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t('th_amount')}</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t('th_status')}</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">{t('th_details')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-black/40 transition-colors">
                        <td className="p-6">
                          <p className="text-sm font-black text-gray-900 dark:text-white">{order.id}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-widest">
                            {new Date(order.createdAt).toLocaleDateString('uz-UZ')}
                          </p>
                        </td>
                        <td className="p-6">
                          <p className="text-sm font-black text-gray-900 dark:text-white uppercase">{order.user?.fullName || t('status_unknown')}</p>
                          <p className="text-[10px] font-bold text-gray-500 uppercase mt-1 tracking-widest">{order.contactPhone}</p>
                        </td>
                        <td className="p-6">
                          <span className="text-base font-black text-emerald-600 tracking-tighter">
                            {Number(order.totalPrice).toLocaleString()} $
                          </span>
                        </td>
                        <td className="p-6">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="p-6 text-center">
                          <Link to="/admin/orders" className="inline-flex p-3 bg-blue-50 dark:bg-blue-900/10 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-90">
                            <Eye size={18} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}