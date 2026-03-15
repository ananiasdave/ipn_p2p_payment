import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  User,
  Globe,
  MoreVertical,
  ShieldCheck,
  Building,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

export interface Contact {
  name: string;
  account: string;
  bank: string;
  bic: string;
  isInternational: boolean;
  country?: string;
}

export function ContactsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const data = await api.getContacts();
        setContacts(data);
      } catch (err) {
        console.error('Failed to fetch contacts', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.account.includes(searchTerm) ||
    c.bank.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 text-gray-400">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full animate-fade-in pb-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Contacts & Beneficiaries</h2>
          <p className="text-gray-500 mt-1">Manage your local and international recipients</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white bg-[#8B3A3A] hover:bg-[#722F2F] transition-all font-medium text-sm shadow-lg shadow-[#8B3A3A]/10">
          <Plus size={18} />
          <span>Add Beneficiary</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 mb-8 flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search contacts by name, bank or account number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-transparent rounded-xl text-sm focus:outline-none transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 text-center hover:bg-gray-100 hover:border-gray-300 transition-all cursor-pointer min-h-[250px]">
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 mb-4 bg-white shadow-sm">
            <Plus size={24} />
          </div>
          <p className="font-bold text-gray-700 text-lg">Add New Beneficiary</p>
          <p className="text-xs text-gray-500 mt-2 max-w-[150px]">Securely save accounts for quick access</p>
        </div>

        {filteredContacts.map((contact) => (
          <div key={contact.account} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col group overflow-hidden">
            <div className="p-6 pb-4 flex items-start justify-between">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-4 overflow-hidden shadow-inner">
                  {contact.isInternational ? (
                    <Globe size={28} className="text-blue-500 opacity-80" />
                  ) : (
                    <User size={28} className="opacity-80" />
                  )}
                </div>
                {contact.isInternational && (
                  <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 border border-blue-100 shadow-sm">
                    <span className="text-[8px] font-black text-blue-600">INT</span>
                  </span>
                )}
              </div>
              <button className="text-gray-300 hover:text-gray-600 p-1">
                <MoreVertical size={20} />
              </button>
            </div>

            <div className="px-6 flex-1">
              <h3 className="font-bold text-gray-900 text-lg mb-0.5">{contact.name}</h3>
              <div className="flex items-center gap-1.5 mb-4">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${contact.isInternational ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'
                  }`}>
                  {contact.isInternational ? contact.country : 'Local'}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <p className="text-xs text-gray-500 font-mono">{contact.account}</p>
              </div>

              <div className="space-y-3 py-4 border-t border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                    <Building size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bank Name</p>
                    <p className="text-xs font-semibold text-gray-700 truncate">{contact.bank}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                    <ShieldCheck size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">BIC / SWIFT</p>
                    <p className="text-xs font-semibold text-gray-700 font-mono tracking-tight">{contact.bic}</p>
                  </div>
                </div>
              </div>
            </div>

            <Link
              to="/send"
              state={{ prefillAccount: contact.account, isInternational: contact.isInternational }}
              className="mt-2 bg-gray-50 group-hover:bg-[#8B3A3A] p-4 flex items-center justify-center gap-2 transition-all"
            >
              <span className="text-xs font-bold text-gray-500 group-hover:text-white transition-colors">Send Money Now</span>
              <ArrowRight size={16} className="text-gray-400 group-hover:text-white transition-colors" />
            </Link>
          </div>
        ))}

      </div>
    </div>
  );
}
