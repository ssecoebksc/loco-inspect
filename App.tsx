
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import NewInspectionForm from './components/NewInspectionForm';
import InspectionList from './components/InspectionList';
import UserManagement from './components/UserManagement';
import Profile from './components/Profile';
import { User, AppView, Inspection } from './types';
import { storageService } from './services/storageService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Real-time listener for inspections
    const { data: unsubInspections } = storageService.subscribeToInspections((data) => {
      setInspections(data);
    });

    // Real-time listener for users
    const { data: unsubUsers } = storageService.subscribeToUsers((data) => {
      setUsers(data);
    });

    // PWA & Connectivity logic
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW Failed', err));
      });
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (unsubInspections) unsubInspections.unsubscribe();
      if (unsubUsers) unsubUsers.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    }
  };

  const handleLogin = (u: User) => {
    setUser(u);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView(AppView.LOGIN);
  };

  const handleSaveInspection = async (newInspection: any) => {
    setIsSyncing(true);
    try {
      await storageService.saveInspection(newInspection);
      setCurrentView(AppView.DASHBOARD);
    } catch (e) {
      alert("Failed to upload to Supabase. Check your connection or API keys.");
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteInspection = async (id: string) => {
    await storageService.deleteInspection(id);
  };

  const handleAddUser = async (newUser: User) => {
    await storageService.saveUser(newUser);
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    await storageService.updateUser(userId, updates);
    if (user?.id === userId) {
      setUser({ ...user, ...updates });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    await storageService.deleteUser(userId);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.LOGIN:
        return <Login users={users} onLogin={handleLogin} onRefreshUsers={() => {}} isRefreshing={false} />;
      case AppView.DASHBOARD:
        return user ? (
          <Dashboard 
            user={user} 
            onNavigate={setCurrentView} 
            showInstallBtn={!!deferredPrompt}
            onInstallApp={handleInstallApp}
          />
        ) : null;
      case AppView.NEW_INSPECTION:
        return user ? <NewInspectionForm user={user} onSave={handleSaveInspection} onCancel={() => setCurrentView(AppView.DASHBOARD)} /> : null;
      case AppView.HISTORY:
        return user ? <InspectionList inspections={inspections} users={users} currentUser={user} onDeleteInspection={handleDeleteInspection} /> : null;
      case AppView.USER_MANAGEMENT:
        return user?.role === 'admin' || user?.role === 'supervisor' ? (
          <UserManagement 
            currentUser={user}
            users={users} 
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            isSyncing={isSyncing}
          />
        ) : null;
      case AppView.PROFILE:
        return user ? <Profile user={user} onUpdatePassword={(p) => handleUpdateUser(user.id, {password: p})} /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header 
        user={user} 
        onLogout={handleLogout} 
        onNavigate={setCurrentView}
        onBack={
          currentView !== AppView.LOGIN && currentView !== AppView.DASHBOARD 
            ? () => setCurrentView(AppView.DASHBOARD) 
            : undefined
        }
        title={
          currentView === AppView.NEW_INSPECTION ? "Create New File" : 
          currentView === AppView.HISTORY ? "Previous Files" : 
          currentView === AppView.USER_MANAGEMENT ? "Manage Access" :
          undefined
        }
      />
      
      {user && (
        <div className={`px-4 py-2 text-[10px] font-bold flex items-center justify-between transition-colors ${
          !isOnline ? 'bg-amber-500 text-white' : isSyncing ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-white'
        }`}>
          <div className="flex items-center gap-2 uppercase tracking-widest">
            {!isOnline ? 'Offline Mode' : isSyncing ? 'Uploading to Supabase Storage...' : `Supabase SQL Live`}
            {isOnline && !isSyncing && <span className="opacity-50 ml-2">Synced in Real-time</span>}
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-400'}`} />
            {isOnline ? 'SQL Cloud Active' : 'Offline'}
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>

      {user && (
        <div className="p-3 text-[10px] text-slate-400 bg-white border-t border-slate-100 flex justify-center uppercase tracking-widest font-bold">
          Supabase Backend &bull; Protected SQL Access
        </div>
      )}
    </div>
  );
};

export default App;
