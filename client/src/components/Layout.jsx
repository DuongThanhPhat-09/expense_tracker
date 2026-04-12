import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineChartPie,
  HiOutlineCreditCard,
  HiOutlineTag,
  HiOutlineCurrencyDollar,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBell,
} from 'react-icons/hi2';

const navItems = [
  { to: '/dashboard', label: 'Tổng quan', icon: HiOutlineChartPie },
  { to: '/transactions', label: 'Giao dịch', icon: HiOutlineCreditCard },
  { to: '/categories', label: 'Danh mục', icon: HiOutlineTag },
  { to: '/budgets', label: 'Ngân sách', icon: HiOutlineCurrencyDollar },
];

const pageTitles = {
  '/dashboard': 'Tổng quan',
  '/transactions': 'Giao dịch',
  '/categories': 'Danh mục',
  '/budgets': 'Ngân sách',
};

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPageTitle = pageTitles[location.pathname] || 'Tổng quan';

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const formattedDate = currentTime.toLocaleDateString('vi-VN', {
    weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric',
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700/50">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <HiOutlineCurrencyDollar className="w-6 h-6 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Expense Tracker</span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600/10 text-indigo-400 border-l-[3px] border-indigo-400 pl-[9px]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-[3px] border-transparent pl-[9px]'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}

          {/* Separator */}
          <div className="my-3 mx-3 border-t border-gray-700/50" />
        </nav>

        {/* User Info */}
        <div className="px-3 py-4 border-t border-gray-700/50">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-medium shadow-md">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-200"
          >
            <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        {/* Top Header Bar */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{currentPageTitle}</h1>
              <p className="text-xs text-gray-500 -mt-0.5">
                Xin chào, {user?.name || 'User'} · {formattedDate}
              </p>
            </div>
            <button
              className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
              aria-label="Thông báo"
            >
              <HiOutlineBell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-30">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-indigo-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 transition-all duration-200 ${isActive ? 'scale-110' : ''}`} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium text-gray-400 hover:text-gray-600 transition-all duration-200"
          >
            <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
            <span>Thoát</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
