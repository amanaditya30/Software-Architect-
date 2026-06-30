import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Terminal, LogOut, LayoutDashboard, PlusCircle, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 px-6 py-4 border-b border-white/5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-accent shadow-md shadow-primary/20">
            <Terminal className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-primary transition-colors">
            Blueprint AI
          </span>
        </Link>

        {user && (
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="flex items-center text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 mr-1.5" />
              Dashboard
            </Link>

            <Link
              to="/project/new"
              className="flex items-center text-sm font-medium text-primary hover:text-primary-hover transition-colors"
            >
              <PlusCircle className="h-4 w-4 mr-1.5" />
              New Blueprint
            </Link>

            <div className="h-4 w-[1px] bg-white/10" />

            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-300">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-white leading-none">{user.fullname}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-none">{user.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center text-slate-400 hover:text-accent-danger transition-colors cursor-pointer text-sm"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline ml-1.5 font-medium">Exit</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
