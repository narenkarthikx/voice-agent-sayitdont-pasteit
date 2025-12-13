import React, { useContext } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Users, Phone, LogOut, Target, Bot } from 'lucide-react';

const Layout = () => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar */}
      <div className="w-72 bg-gradient-to-b from-indigo-900 to-blue-900 shadow-2xl">
        <div className="p-6 border-b border-blue-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white leading-tight">Say It!<br/>Don't Paste It</h1>
              <p className="text-xs text-blue-200">AI Voice Screening</p>
            </div>
          </div>
          <div className="mt-4 px-3 py-2 bg-blue-800 bg-opacity-50 rounded-lg">
            <p className="text-sm text-blue-100">👋 {user?.username}</p>
          </div>
        </div>
        <nav className="mt-6 px-3">
          <Link to="/dashboard" className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-all ${
            isActive('/dashboard') 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-blue-100 hover:bg-blue-800 hover:text-white'
          }`}>
            <LayoutDashboard className="w-5 h-5 mr-3" />
            <span className="font-medium">Screening Dashboard</span>
          </Link>
          <Link to="/jobs" className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-all ${
            isActive('/jobs') 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-blue-100 hover:bg-blue-800 hover:text-white'
          }`}>
            <Target className="w-5 h-5 mr-3" />
            <span className="font-medium">Open Positions</span>
          </Link>
          <Link to="/candidates" className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-all ${
            isActive('/candidates') 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-blue-100 hover:bg-blue-800 hover:text-white'
          }`}>
            <Users className="w-5 h-5 mr-3" />
            <span className="font-medium">Candidate Pool</span>
          </Link>
          <Link to="/calls" className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-all ${
            isActive('/calls') 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-blue-100 hover:bg-blue-800 hover:text-white'
          }`}>
            <Phone className="w-5 h-5 mr-3" />
            <span className="font-medium">Screening History</span>
          </Link>
        </nav>
        
        <div className="absolute bottom-0 w-72 p-6 border-t border-blue-700 bg-indigo-950">
          <div className="mb-4 p-3 bg-green-900 bg-opacity-30 rounded-lg border border-green-700">
            <p className="text-xs text-green-300 font-semibold">🤖 AI Voice Agent Active</p>
            <p className="text-xs text-green-200 mt-1">Ready to screen candidates</p>
          </div>
          <button onClick={handleLogout} className="flex items-center text-blue-200 hover:text-white hover:bg-red-600 transition-all w-full px-4 py-2 rounded-lg">
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
