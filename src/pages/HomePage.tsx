import { Plus, Send, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const fmt = (n: number) =>
  n.toLocaleString('en-NA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function HomePage() {
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
                 <span className="text-xl font-bold">N$ {fmt(1263.39)}</span>
             </div>
             <div className="h-12 w-px border-l border-dashed border-white/30"></div>
             <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                     <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                         <path d="M6 2V10M6 10L2 6M6 10L10 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                     </svg>
                 </div>
                 <span className="text-xl font-bold">N$ {fmt(1263.39)}</span>
             </div>
        </div>
      </div>
      
      {/* Decorative / Inspiration Elements Below for 'Real' Dashboard Feel */}
      <div className="grid grid-cols-2 gap-8 mt-10">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
             <h4 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h4>
             <div className="space-y-4">
                 {[1,2,3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                <User size={18} />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800 text-sm">Example Receiver {i}</p>
                                <p className="text-xs text-gray-500">Today, 10:{i}5 AM</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className="font-bold text-gray-800 text-sm">- N$ {fmt(250)}</p>
                             <p className="text-xs text-green-600 font-medium">Completed</p>
                        </div>
                    </div>
                 ))}
             </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Quick Transfers</h4>
              <div className="flex gap-4 mb-6">
                   {[1,2,3,4].map((i) => (
                        <div key={i} className="flex flex-col items-center gap-2 cursor-pointer group">
                             <div className="w-14 h-14 rounded-full bg-gray-100 border-2 border-transparent group-hover:border-[#8B3A3A] transition-all flex items-center justify-center text-gray-400 overflow-hidden p-1">
                                 <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                                      <User size={20} />
                                 </div>
                             </div>
                             <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">User {i}</span>
                        </div>
                   ))}
                   <div className="flex flex-col items-center gap-2 cursor-pointer group">
                        <div className="w-14 h-14 rounded-full bg-gray-50 border border-dashed border-gray-300 group-hover:bg-gray-100 group-hover:border-gray-400 transition-all flex items-center justify-center text-gray-400">
                            <Plus size={20} />
                        </div>
                         <span className="text-xs font-medium text-gray-500">Add</span>
                   </div>
              </div>
          </div>
      </div>
    </div>
  );
}
