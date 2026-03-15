import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  ChevronRight, 
  Loader2, 
  X,
  CreditCard,
  Calendar,
  CheckCircle2,
  FileText
} from 'lucide-react';

const fmt = (n: number) =>
  n.toLocaleString('en-NA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface Transaction {
  id: number;
  senderAccountNumber: string;
  receiverAccountNumber: string;
  amount: number;
  currency: string;
  reference: string;
  status: string;
  transactionId: string;
  clientReference: string;
}

export function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.getHistory();
        setTransactions(data);
      } catch (err) {
        console.error('Failed to fetch history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredTransactions = transactions.filter(tx => 
    tx.receiverAccountNumber.includes(searchTerm) || 
    tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto w-full animate-fade-in flex flex-col h-full relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Transaction History</h2>
        <div className="flex gap-2">
           <div className="relative">
              <input 
                type="text" 
                placeholder="Search Reference, Account or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B3A3A]/20 transition-all w-64"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
           </div>
           <button className="p-2.5 rounded-xl border border-gray-200 text-gray-500 bg-white hover:bg-gray-50 transition-colors">
              <Filter size={18} />
           </button>
        </div>
      </div>

      <div className="flex gap-8 flex-1 min-h-0">
        {/* Transaction List */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-gray-400">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p>Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-gray-400 text-center">
              <FileText size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">No transactions found</p>
              <p className="text-sm">Try searching for something else or make a new transfer.</p>
            </div>
          ) : (
            <div className="overflow-auto flex-1 h-full">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Transaction</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredTransactions.map((tx) => (
                    <tr 
                      key={tx.id} 
                      onClick={() => setSelectedTx(tx)}
                      className={`hover:bg-gray-50 transition-colors cursor-pointer group ${selectedTx?.id === tx.id ? 'bg-[#8B3A3A]/5' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            tx.status === 'SUCCESS' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'
                          }`}>
                            <ArrowUpRight size={18} />
                          </div>
                          <div className="min-w-0">
                             <p className="font-bold text-gray-800 text-sm truncate">To Account</p>
                             <p className="text-xs text-gray-500 font-mono truncate">{tx.receiverAccountNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 truncate max-w-[200px]">{tx.reference}</p>
                        <p className="text-[10px] text-gray-400 font-mono uppercase">{tx.transactionId}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-bold text-gray-900 text-sm">
                          {tx.currency} {fmt(tx.amount)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-tight ${
                          tx.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          <CheckCircle2 size={12} />
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <ChevronRight size={18} className="text-gray-300 group-hover:text-[#8B3A3A] transition-colors ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Transaction Details Sidebar / Popover */}
        {selectedTx && (
          <div className="w-96 bg-white rounded-2xl border border-gray-100 shadow-lg flex flex-col animate-slide-in-right">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Transaction Details</h3>
                <button 
                  onClick={() => setSelectedTx(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-all"
                >
                  <X size={20} />
                </button>
             </div>
             
             <div className="p-8 flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  selectedTx.status === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                   <CheckCircle2 size={32} />
                </div>
                <h4 className="text-2xl font-black text-gray-900 mb-1">
                  {selectedTx.currency} {fmt(selectedTx.amount)}
                </h4>
                <p className="text-sm text-gray-500 mb-6">{selectedTx.status === 'SUCCESS' ? 'Successfully Sent' : 'Failed'}</p>
                
                <div className="w-full space-y-4 text-left">
                   <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                      <div className="flex justify-between items-center text-xs">
                         <span className="text-gray-500 uppercase font-bold tracking-widest">Transaction ID</span>
                         <span className="font-mono text-gray-800">{selectedTx.transactionId}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                         <span className="text-gray-500 uppercase font-bold tracking-widest">Client Reference</span>
                         <span className="font-mono text-gray-800">{selectedTx.clientReference}</span>
                      </div>
                   </div>

                   <div className="space-y-4 px-2">
                       <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                             <CreditCard size={16} />
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Receiver Account</p>
                             <p className="text-sm font-semibold text-gray-800 font-mono">{selectedTx.receiverAccountNumber}</p>
                          </div>
                       </div>
                       
                       <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                             <FileText size={16} />
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment Reference</p>
                             <p className="text-sm font-semibold text-gray-800">{selectedTx.reference}</p>
                          </div>
                       </div>

                       <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                             <Calendar size={16} />
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date & Time</p>
                             <p className="text-sm font-semibold text-gray-800">
                                {new Date().toLocaleDateString('en-NA', { day: '2-digit', month: 'long', year: 'numeric' })}
                             </p>
                          </div>
                       </div>
                   </div>
                </div>
                
                <button className="mt-8 w-full py-3 bg-[#8B3A3A] text-white rounded-xl font-bold hover:bg-[#722F2F] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all">
                   <FileText size={16} />
                   Download Receipt
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
