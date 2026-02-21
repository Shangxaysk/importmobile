import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Shield, Ban, Unlock, Search, Phone, User as UserIcon } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useLanguage();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(import.meta.env.VITE_API_URL + '/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Users error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchUsers();
  }, []);

  const toggleBlockUser = async (id: number, currentStatus: boolean) => {
    if (!window.confirm(currentStatus ? t('unblock_confirm') : t('block_confirm'))) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:3000/users/${id}/toggle-block`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      alert(t('error'));
    }
  };

  const filteredUsers = users.filter(user => 
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phoneNumber?.includes(searchTerm)
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center dark:bg-black font-inter">
      <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-black font-inter pb-32 transition-colors duration-300">
      
      {/* --- STICKY HEADER --- */}
      <div className="sticky top-0 z-30 w-full bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-6xl mx-auto h-[70px] md:h-[90px] px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2.5 md:p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl hidden sm:block">
                <Users size={24} />
             </div>
             <div>
                <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none">{t('customers_title')}</h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  {t('total_count').replace('{{count}}', users.length.toString())}
                </p>
             </div>
          </div>
          
          <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Shield size={14}/> {t('security')}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        
        {/* --- SEARCH BAR --- */}
        <div className="mb-6 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder={t('search_user_placeholder')} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 md:py-5 bg-white dark:bg-gray-900 rounded-[24px] border border-gray-100 dark:border-gray-800 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all text-sm font-bold text-gray-900 dark:text-white shadow-sm"
          />
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[40px] border border-dashed border-gray-200 dark:border-gray-800">
             <Users size={48} className="mx-auto text-gray-200 dark:text-gray-800 mb-4"/>
             <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('user_not_found')}</h3>
          </div>
        ) : (
          <>
            {/* --- MOBILE: CARD LIST --- */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredUsers.map((user) => (
                <div key={user.id} className={`bg-white dark:bg-gray-900 p-5 rounded-[30px] border shadow-sm transition-all flex flex-col gap-4 ${user.isBlocked ? 'border-red-200 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/5' : 'border-gray-100 dark:border-gray-800'}`}>
                  
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center flex-shrink-0 ${user.isBlocked ? 'bg-red-100 text-red-600 dark:bg-red-900/20' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'}`}>
                          <UserIcon size={20} />
                      </div>
                      <div>
                        <h3 className="font-black text-gray-900 dark:text-white text-base leading-tight">{user.fullName || t('status_unknown')}</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">ID: #{user.id}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      {user.role === 'ADMIN' ? (
                        <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-3 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase">{t('role_admin')}</span>
                      ) : (
                        <span className="bg-gray-100 dark:bg-black text-gray-500 px-3 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase">{t('role_customer')}</span>
                      )}
                      {user.isBlocked && <span className="text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">{t('blocked')}</span>}
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-3 px-4 bg-gray-50 dark:bg-black rounded-2xl border dark:border-gray-800">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1.5"><Phone size={14} className="text-emerald-500"/> {user.phoneNumber}</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('orders_label')} <span className="text-emerald-600">{user.orders?.length || 0}</span></span>
                  </div>

                  {user.role !== 'ADMIN' && (
                    <button 
                      onClick={() => toggleBlockUser(user.id, user.isBlocked)}
                      className={`w-full py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg ${
                        user.isBlocked 
                        ? 'bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700' 
                        : 'bg-red-50 dark:bg-red-900/10 text-red-500 shadow-none border border-red-100 dark:border-red-900/30 hover:bg-red-500 hover:text-white'
                      }`}
                    >
                      {user.isBlocked ? <><Unlock size={16}/> {t('unblock')}</> : <><Ban size={16}/> {t('block')}</>}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* --- DESKTOP: TABLE VIEW --- */}
            <div className="hidden md:block bg-white dark:bg-gray-900 rounded-[35px] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-black/20 border-b border-gray-50 dark:border-gray-800">
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t('th_customer')}</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t('th_phone')}</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">{t('orders_count')}</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t('th_status')}</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">{t('th_actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className={`hover:bg-gray-50/50 dark:hover:bg-black/40 transition-colors ${user.isBlocked ? 'bg-red-50/30 dark:bg-red-900/5' : ''}`}>
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center flex-shrink-0 ${user.isBlocked ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-black text-emerald-600 border dark:border-gray-800'}`}>
                              <UserIcon size={20} />
                          </div>
                          <div>
                            <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm">
                              {user.fullName || t('status_unknown')}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: #{user.id}</p>
                                {user.role === 'ADMIN' && <span className="text-[8px] bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded font-black uppercase tracking-widest">{t('role_admin')}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-300 flex items-center gap-2">
                          <Phone size={14} className="text-emerald-500"/> {user.phoneNumber}
                        </span>
                      </td>
                      <td className="p-6 text-center">
                        <span className="px-4 py-1.5 bg-gray-100 dark:bg-black text-gray-900 dark:text-white rounded-xl text-xs font-black">
                          {user.orders?.length || 0}
                        </span>
                      </td>
                      <td className="p-6">
                        {user.isBlocked ? (
                          <span className="text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">{t('blocked')}</span>
                        ) : (
                          <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">{t('active')}</span>
                        )}
                      </td>
                      <td className="p-6 text-right">
                        {user.role !== 'ADMIN' && (
                          <button 
                            onClick={() => toggleBlockUser(user.id, user.isBlocked)}
                            className={`p-3 rounded-xl transition-all active:scale-90 inline-flex items-center justify-center ${
                              user.isBlocked 
                              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                              : 'bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-500 hover:text-white'
                            }`}
                            title={user.isBlocked ? t('unblock') : t('block')}
                          >
                            {user.isBlocked ? <Unlock size={18} strokeWidth={2.5}/> : <Ban size={18} strokeWidth={2.5}/>}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}