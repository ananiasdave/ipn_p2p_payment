import { useState, useEffect } from 'react';
import { Plus, Send, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const fmt = (n: number) =>
  n.toLocaleString('en-NA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function HomePage() {
  const [summary, setSummary] = useState({ amountSent: 0, amountReceived: 0 });
  const [quickTransfers, setQuickTransfers] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to extract initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, contactsData, historyData] = await Promise.all([
          api.getSummary(),
          api.getContacts(),
          api.getHistory()
        ]);
        setSummary(summaryData);
        // Take top 4 for quick transfers
        setQuickTransfers(contactsData.slice(0, 4));
        setRecentActivity(historyData.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch home page data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 text-gray-400">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full animate-fade-in pb-10">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            Welcome, David Ananias
        </h2>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium text-sm">
            <Plus size={18} />
            <span>Add Money</span>
          </button>
          <Link to="/send" className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-transparent text-white bg-[#8B3A3A] hover:bg-[#722F2F] transition-colors font-medium text-sm shadow-md">
            <Send size={18} />
            <span>Send Money</span>
          </Link>
        </div>
      </div>

      <div className="bg-[#8B3A3A] rounded-2xl p-8 flex text-white shadow-xl relative overflow-hidden">
        {/* Abstract background decorative element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-black opacity-10 rounded-full translate-y-1/2"></div>
        
        <div className="flex-1 relative z-10">
          <p className="text-sm uppercase tracking-wider text-white/80 font-medium mb-3">Current Balance</p>
          <h3 className="text-5xl font-bold mb-4">N$ {fmt(1265565.39)}</h3>
          <p className="text-sm text-white/70 tracking-wide">
            ACCOUNT NUMBER: <span className="font-semibold text-white">0987654321</span>
          </p>
        </div>
        
        <div className="flex-1 bg-black/10 rounded-xl flex items-center justify-around relative z-10 border border-white/10 backdrop-blur-sm p-4">
             <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                     <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                         <path d="M6 10V2M6 2L2 6M6 2L10 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                     </svg>
                 </div>
                 <div className="flex flex-col">
                     <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Received (MTD)</span>
                     <span className="text-xl font-bold">N$ {fmt(summary.amountReceived)}</span>
                 </div>
             </div>
             <div className="h-12 w-px border-l border-dashed border-white/30"></div>
             <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                     <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                         <path d="M6 2V10M6 10L2 6M6 10L10 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                     </svg>
                 </div>
                 <div className="flex flex-col">
                     <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Sent (MTD)</span>
                     <span className="text-xl font-bold">N$ {fmt(summary.amountSent)}</span>
                 </div>
             </div>
        </div>
      </div>
      
      {/* Decorative / Inspiration Elements Below for 'Real' Dashboard Feel */}
      <div className="grid grid-cols-2 gap-8 mt-10">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
             <div className="flex justify-between items-center mb-4">
                 <h4 className="text-lg font-bold text-gray-800">Recent Activity</h4>
                 <Link to="/history" className="text-sm text-[#8B3A3A] font-semibold hover:underline">View All</Link>
             </div>
             
             {recentActivity.length === 0 ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-8">
                     <p>No recent transactions yet.</p>
                 </div>
             ) : (
                 <div className="space-y-4">
                     {recentActivity.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                  tx.type === 'SUCCESS' ? 'bg-green-100 text-green-700' : 
                                  tx.type === 'FAILED' ? 'bg-red-100 text-red-700' : 
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                    {getInitials(tx.receiverAccountNumber)}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm font-mono truncate max-w-[120px]" title={tx.receiverAccountNumber}>
                                      {tx.receiverAccountNumber}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {tx.createdAt 
                                        ? new Date(tx.createdAt).toLocaleDateString() + ' ' + new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                        : 'Recent'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                 <p className="font-bold text-gray-800 text-sm">
                                   -{tx.currency} {fmt(tx.amount)}
                                 </p>
                                 <p className={`text-xs font-medium ${tx.status === 'SUCCESS' ? 'text-green-600' : tx.status === 'FAILED' ? 'text-red-500' : 'text-gray-500'}`}>
                                   {tx.status}
                                 </p>
                            </div>
                        </div>
                     ))}
                 </div>
             )}
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Quick Transfers</h4>
              <div className="flex gap-4 mb-6">
                    {quickTransfers.map((contact) => (
                        <Link key={contact.account} to="/send" state={{ prefillAccount: contact.account, isInternational: contact.isInternational }} className="flex flex-col items-center gap-2 cursor-pointer group">
                             <div className="relative w-14 h-14 rounded-full bg-gray-100 border-2 border-transparent group-hover:border-[#8B3A3A] transition-all flex items-center justify-center text-gray-400 overflow-hidden p-1 shadow-sm">
                                 <div className="w-full h-full bg-[#8B3A3A]/10 text-[#8B3A3A] rounded-full flex items-center justify-center font-bold text-lg">
                                      {getInitials(contact.name)}
                                 </div>
                                 {contact.isInternational && (
                                     <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-100">
                                         <div className="w-4 h-4 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                             <span className="text-[8px] font-bold text-gray-600">INT</span>
                                         </div>
                                     </div>
                                 )}
                             </div>
                             <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 truncate max-w-[80px]" title={contact.name}>{contact.name}</span>
                        </Link>
                   ))}
                   <Link to="/contacts" className="flex flex-col items-center gap-2 cursor-pointer group">
                        <div className="w-14 h-14 rounded-full bg-gray-50 border border-dashed border-gray-300 group-hover:bg-gray-100 group-hover:border-gray-400 transition-all flex items-center justify-center text-gray-400">
                            <Plus size={20} />
                        </div>
                         <span className="text-xs font-medium text-gray-500">Add</span>
                   </Link>
              </div>
          </div>
      </div>
    </div>
  );
}
