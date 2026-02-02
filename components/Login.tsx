
import React, { useState } from 'react';
import { User } from '../types';
import { ICONS } from '../constants';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
  onRefreshUsers: () => void;
  isRefreshing: boolean;
}

const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const user = users.find(u => u.id === selectedUserId);
    if (!user) {
      setError("Please select a user.");
      return;
    }

    if (user.password && password !== user.password) {
      setError("Incorrect password. Please try again.");
      return;
    }

    onLogin(user);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-indigo-900 p-8 text-white flex flex-col items-center gap-4">
          <div className="bg-white/20 p-4 rounded-full text-white">
            <ICONS.Train />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">LocoInspect Cloud</h2>
            <p className="text-indigo-200 text-sm">Real-time Maintenance Data</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 block">Select Operator</label>
            <div className="relative">
              <select 
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                required
              >
                <option value="">{users.length === 0 ? 'Connecting to Cloud...' : 'Choose User...'}</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.username} ({user.hrmsId})</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 block">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={users.length === 0}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all transform active:scale-[0.98] disabled:opacity-50"
          >
            Login to Dashboard
          </button>
          
          <p className="text-center text-xs text-slate-400">
            Internal Railway Use Only. Firebase Encryption Active.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
