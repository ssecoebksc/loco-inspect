
import React, { useState } from 'react';
import { User } from '../types';
import { ICONS } from '../constants';

interface ProfileProps {
  user: User;
  onUpdatePassword: (newPass: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdatePassword }) => {
  const [passwords, setPasswords] = useState({
    old: '',
    new: '',
    confirm: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (passwords.old !== user.password) {
      setError("Current password is incorrect.");
      return;
    }

    if (passwords.new.length < 4) {
      setError("New password must be at least 4 characters.");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setError("Passwords do not match.");
      return;
    }

    onUpdatePassword(passwords.new);
    setSuccess(true);
    setPasswords({ old: '', new: '', confirm: '' });
  };

  return (
    <div className="max-w-md mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
            {user.username.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{user.username}</h2>
            <p className="text-slate-500 font-mono text-xs">{user.hrmsId} &bull; {user.role.toUpperCase()}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Change Password</h3>
          
          {error && <div className="p-3 bg-rose-50 text-rose-600 text-xs rounded-xl border border-rose-100">{error}</div>}
          {success && <div className="p-3 bg-emerald-50 text-emerald-600 text-xs rounded-xl border border-emerald-100">Password updated successfully!</div>}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Current Password</label>
            <input 
              type="password"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              value={passwords.old}
              onChange={e => setPasswords({...passwords, old: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">New Password</label>
            <input 
              type="password"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              value={passwords.new}
              onChange={e => setPasswords({...passwords, new: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Confirm New Password</label>
            <input 
              type="password"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              value={passwords.confirm}
              onChange={e => setPasswords({...passwords, confirm: e.target.value})}
            />
          </div>

          <button className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
