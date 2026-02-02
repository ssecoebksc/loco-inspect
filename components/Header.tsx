
import React from 'react';
import { ICONS, APP_NAME } from '../constants';
import { User, AppView } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onBack?: () => void;
  onNavigate?: (view: AppView) => void;
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onBack, onNavigate, title }) => {
  return (
    <header className="sticky top-0 z-50 bg-indigo-900 text-white px-4 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        {onBack ? (
          <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <ICONS.ChevronLeft />
          </button>
        ) : (
          <div className="text-white">
            <ICONS.Train />
          </div>
        )}
        <h1 className="font-bold text-lg tracking-tight">
          {title || APP_NAME}
        </h1>
      </div>
      {user && (
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate?.(AppView.PROFILE)}
            className="hidden sm:flex flex-col items-end hover:bg-white/5 p-1 rounded transition-colors"
          >
            <span className="text-[10px] opacity-75 uppercase font-bold tracking-wider">{user.role}</span>
            <span className="text-sm font-medium underline decoration-indigo-400/30">{user.username}</span>
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onNavigate?.(AppView.PROFILE)}
              className="sm:hidden p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ICONS.User />
            </button>
            <button 
              onClick={onLogout}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2"
            >
              <ICONS.LogOut />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
