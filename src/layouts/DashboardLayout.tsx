import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, User, DollarSign, TrendingUp, Bell } from 'lucide-react';
import logo from '../assets/Logo.png';

export function DashboardLayout() {
  const location = useLocation();

  const navItems = [
    { icon: <Home size={20} />, path: '/', label: 'Home' },
    { icon: <User size={20} />, path: '/contacts', label: 'Contacts & Beneficiary Accounts' },
    { icon: <DollarSign size={20} />, path: '/send', label: 'Send' },
    { icon: <TrendingUp size={20} />, path: '/history', label: 'Transaction History' },
  ];

  const getPageTitle = () => {
    const currentNavItem = navItems.find((item) => item.path === location.pathname);
    return currentNavItem ? currentNavItem.label : 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-20 bg-white border-r border-gray-100 flex flex-col items-center py-6 flex-shrink-0 z-20">
        <div className="mb-12">
          <img src={logo} alt="IPN Logo" className="w-10 h-10 object-contain" />
        </div>
        
        <nav className="flex-1 flex flex-col gap-6 w-full px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-center p-3 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-[#8B3A3A] text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                title={item.label}
              >
                {item.icon}
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-auto pt-6 w-full px-3">
          <button className="w-full flex items-center justify-center p-3 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
            <User size={20} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 flex-shrink-0 z-10">
          <h1 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h1>
          
          <div className="flex items-center gap-6">
            <button className="relative text-gray-500 hover:text-gray-700">
               <Bell size={20} />
               <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-500">
                <User size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 leading-tight">David Ananias</p>
                <p className="text-xs text-gray-500 leading-tight">Personal Account</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-10 relative">
             <Outlet />
        </main>
      </div>
    </div>
  );
}
