
import React from 'react';
import { ICONS } from '../constants';
import { User, AppView } from '../types';

interface DashboardProps {
  user: User;
  onNavigate: (view: AppView) => void;
  showInstallBtn?: boolean;
  onInstallApp?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate, showInstallBtn, onInstallApp }) => {
  const isAdminOrSupervisor = user.role === 'admin' || user.role === 'supervisor';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-slate-800">Hello, {user.username}</h2>
          <p className="text-slate-500">Locomotive Status & Control</p>
        </div>
        {showInstallBtn && (
          <button 
            onClick={onInstallApp}
            className="hidden sm:flex px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs items-center gap-2 hover:bg-indigo-200 transition-all border border-indigo-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Install App
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button 
          onClick={() => onNavigate(AppView.NEW_INSPECTION)}
          className="group relative bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center gap-4 hover:shadow-xl hover:shadow-indigo-50 hover:-translate-y-1 transition-all duration-300"
        >
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
            <ICONS.Plus />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">New File</h3>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              Create a new inspection record.
            </p>
          </div>
        </button>

        <button 
          onClick={() => onNavigate(AppView.HISTORY)}
          className="group relative bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center gap-4 hover:shadow-xl hover:shadow-amber-50 hover:-translate-y-1 transition-all duration-300"
        >
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
            <ICONS.History />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Previous Files</h3>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              View and search stored reports.
            </p>
          </div>
        </button>

        {isAdminOrSupervisor && (
          <button 
            onClick={() => onNavigate(AppView.USER_MANAGEMENT)}
            className="group relative bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center gap-4 hover:shadow-xl hover:shadow-emerald-50 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
              <ICONS.User />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Staff Control</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Manage user access levels.
              </p>
            </div>
          </button>
        )}
      </div>

      <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-slate-200 border border-slate-800">
        <div className="space-y-4 flex-1">
          <div>
            <h4 className="text-indigo-400 uppercase tracking-widest text-[10px] font-bold">Cloud Repository Status</h4>
            <p className="text-xl font-bold">Supabase PostgreSQL Active</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm opacity-90 bg-white/5 px-4 py-3 rounded-2xl border border-white/5">
              <div className="p-1.5 bg-indigo-500 rounded-lg text-white"><ICONS.Check /></div>
              <span>Status: <strong>Real-time Streaming</strong></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              All inspection data is stored in a structured relational database with secure photo hosting.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 w-full md:w-auto">
          <div className="bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/5 text-center">
              <p className="text-[10px] uppercase font-bold text-indigo-400">Sync Status</p>
              <p className="text-xs font-semibold text-emerald-400">Operational</p>
          </div>
          <button 
            onClick={() => onNavigate(AppView.HISTORY)}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/40 active:scale-95"
          >
            Access History
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
