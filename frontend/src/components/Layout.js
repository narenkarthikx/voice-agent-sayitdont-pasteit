import React, { useContext } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Users, Phone, LogOut, Target, Bot, Bell } from 'lucide-react';

const Layout = () => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      className={`flex items-center px-4 py-3 mb-2 rounded-xl transition-all duration-200 group ${isActive(to)
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
        : 'text-gray-400 hover:bg-white/5 hover:text-white'
        }`}
    >
      <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive(to) ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
      <span className="font-medium">{label}</span>
      {isActive(to) && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      )}
    </Link>
  );

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Sidebar */}
      <div className="w-72 bg-slate-900 border-r border-white/5 flex flex-col relative z-20">
        {/* Logo Area */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 leading-tight">
                DinoDial
              </h1>
              <p className="text-xs text-indigo-400 font-medium tracking-wide">AI RECRUITER</p>
            </div>
          </div>
        </div>

        {/* User Profile Snippet */}
        <div className="px-6 py-6">
          <div className="flex items-center p-3 rounded-xl bg-gradient-to-r from-slate-800 to-slate-800/50 border border-white/5">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.username || 'User'}</p>
              <p className="text-xs text-green-400 flex items-center">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                Online
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-2">Main Menu</p>
          <NavItem to="/app/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/app/jobs" icon={Target} label="Open Positions" />
          <NavItem to="/app/candidates" icon={Users} label="Candidates" />
          <NavItem to="/app/calls" icon={Phone} label="Call History" />
        </nav>

        {/* Footer */}
        <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/10 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center text-indigo-300 mb-1">
              <Bot className="w-4 h-4 mr-2" />
              <span className="text-xs font-bold uppercase">System Status</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Voice Agent</span>
              <span className="text-green-400 font-mono">IDLE</span>
            </div>
          </div>
          {/* Decorative blur */}
          <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-indigo-500/20 blur-xl rounded-full"></div>
        </div>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 bg-slate-950 overflow-hidden">

        {/* Top Header */}
        <header className="h-16 border-b border-white/5 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-8 z-20">
          <div className="flex items-center text-gray-400 text-sm">
            <Link to="/app/dashboard" className="hover:text-white transition-colors">App</Link>
            <span className="mx-2">/</span>
            <span className="text-white capitalize">{location.pathname.split('/').pop()}</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border border-slate-900 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <Outlet />
        </main>

        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] opacity-50 mix-blend-screen transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] opacity-30 mix-blend-screen transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
