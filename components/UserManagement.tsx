
import React, { useState } from 'react';
import { User } from '../types';
import { ICONS } from '../constants';

interface UserManagementProps {
  currentUser: User;
  users: User[];
  onAddUser: (user: User) => void;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
  onDeleteUser: (userId: string) => void;
  isSyncing?: boolean;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser, users, onAddUser, onUpdateUser, onDeleteUser, isSyncing }) => {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    hrmsId: '',
    password: '',
    role: 'technician' as const
  });

  const validateHrmsId = (id: string) => {
    const regex = /^[A-Z]{6}$/;
    if (!regex.test(id)) {
      return "HRMS ID must be exactly 6 uppercase alphabets (A-Z).";
    }
    const exists = users.some(u => u.hrmsId === id);
    if (exists) {
      return "This HRMS ID is already assigned to another user.";
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateHrmsId(formData.hrmsId);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (formData.password.length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }

    const newUser: User = {
      id: Math.random().toString(36).substring(7),
      ...formData
    };
    
    onAddUser(newUser);
    setFormData({ username: '', hrmsId: '', password: '', role: 'technician' });
    setShowForm(false);
  };

  const handleResetPassword = (userId: string) => {
    if (newPassword.length < 4) {
      alert("Password must be at least 4 characters.");
      return;
    }
    onUpdateUser(userId, { password: newPassword });
    setResettingId(null);
    setNewPassword('');
    alert("Password reset successfully.");
  };

  const handleDeleteClick = (user: User) => {
    if (user.id === currentUser.id) {
      alert("You cannot delete your own account.");
      return;
    }
    if (confirm(`Are you sure you want to delete account for ${user.username} (${user.hrmsId})?`)) {
      onDeleteUser(user.id);
    }
  };

  const formatRoleLabel = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const handleHrmsInput = (val: string) => {
    const cleaned = val.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 6);
    setFormData({...formData, hrmsId: cleaned});
    if (error) setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Staff Management</h2>
          <div className="flex items-center gap-2">
            <p className="text-slate-500 text-sm">Create and manage access for inspection crews.</p>
            {isSyncing && (
              <span className="text-[10px] font-bold text-indigo-600 uppercase animate-pulse">Syncing Cloud...</span>
            )}
          </div>
        </div>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            setError(null);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
        >
          {showForm ? 'Cancel' : (
            <>
              <ICONS.Plus />
              Add New Staff
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
              <input 
                type="text"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. John Doe"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">HRMS ID (6 Caps)</label>
              <input 
                type="text"
                required
                maxLength={6}
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono tracking-widest ${error && error.includes('HRMS') ? 'border-rose-300' : 'border-slate-200'}`}
                placeholder="ABCDEF"
                value={formData.hrmsId}
                onChange={e => handleHrmsInput(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
              <input 
                type="password"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 appearance-none"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value as any})}
              >
                <option value="supervisor">Supervisor</option>
                <option value="officer">Officer</option>
                <option value="technician">Technician</option>
              </select>
            </div>
            {error && <div className="md:col-span-full text-rose-500 text-xs font-medium bg-rose-50 p-3 rounded-lg border border-rose-100">{error}</div>}
            <div className="md:col-span-full"><button className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100">Create Account</button></div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">HRMS ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        {u.username.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{u.username}</p>
                        {u.id === currentUser.id && <span className="text-[10px] text-indigo-500 font-bold uppercase">(You)</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded border border-indigo-100">{u.hrmsId}</code>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                      u.role === 'admin' || u.role === 'officer' ? 'bg-amber-100 text-amber-700' : 
                      u.role === 'supervisor' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {formatRoleLabel(u.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {resettingId === u.id ? (
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                          <input 
                            type="password" 
                            placeholder="New Pass"
                            className="px-2 py-1 text-xs border rounded w-24"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                          />
                          <button onClick={() => handleResetPassword(u.id)} className="text-emerald-600 p-1 hover:bg-emerald-50 rounded"><ICONS.Plus /></button>
                          <button onClick={() => setResettingId(null)} className="text-slate-400 p-1">×</button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setResettingId(u.id)}
                          className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100"
                        >
                          Reset Pass
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleDeleteClick(u)}
                        disabled={u.id === currentUser.id}
                        className={`p-2 rounded-lg transition-colors ${u.id === currentUser.id ? 'text-slate-200 cursor-not-allowed' : 'text-rose-500 hover:bg-rose-50 border border-rose-50'}`}
                        title="Delete User"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
