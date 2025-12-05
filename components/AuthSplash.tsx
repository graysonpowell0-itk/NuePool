import React, { useState } from 'react';
import { User } from '../types';
import { FlaskConical, UserPlus, LogIn, ShieldCheck, CheckCircle } from 'lucide-react';

interface AuthSplashProps {
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (username: string, password: string) => void;
}

const AuthSplash: React.FC<AuthSplashProps> = ({ users, onLogin, onRegister }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'admin'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (mode === 'register') {
      const exists = users.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (exists) {
        setError('Username already taken');
        return;
      }
      onRegister(username, password);
      setSuccess('Account created! Please log in.');
      setMode('login');
      setPassword('');
      return;
    }

    // Login Logic
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    
    if (user) {
      if (mode === 'admin' && user.role !== 'admin') {
        setError('This account does not have admin privileges.');
        return;
      }
      onLogin(user);
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex flex-col items-center animate-fade-in-down">
        <div className="flex items-center space-x-1 mb-2">
            <span className="text-blue-500 font-bold text-3xl select-none">-</span>
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
                <FlaskConical className="text-white w-10 h-10" />
            </div>
            <span className="text-blue-500 font-bold text-3xl select-none">+</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">NeuPool</h1>
        <p className="text-slate-500 mt-2 text-center max-w-xs">Professional Pool Maintenance & AI Chemistry Assistant</p>
      </div>

      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in-up">
        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${mode === 'login' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'}`}
          >
            User Login
          </button>
          <button 
             onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
             className={`flex-1 py-4 text-sm font-medium transition-colors ${mode === 'register' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Create Account
          </button>
          <button 
             onClick={() => { setMode('admin'); setError(''); setSuccess(''); }}
             className={`flex-1 py-4 text-sm font-medium transition-colors ${mode === 'admin' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Admin
          </button>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            {mode === 'login' && <><LogIn className="mr-2 text-blue-500" /> User Sign In</>}
            {mode === 'register' && <><UserPlus className="mr-2 text-green-500" /> New User Registration</>}
            {mode === 'admin' && <><ShieldCheck className="mr-2 text-purple-500" /> Admin Portal</>}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Enter password"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg flex items-center">
                <CheckCircle size={16} className="mr-2" />
                {success}
              </div>
            )}

            <button 
              type="submit"
              className={`w-full py-3.5 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 ${
                mode === 'admin' 
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' 
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
              }`}
            >
              {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Access Dashboard'}
            </button>
          </form>

          {mode === 'register' && (
            <p className="mt-4 text-xs text-slate-400 text-center">
              New accounts require Admin approval to access specific pool data.
            </p>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} NeuPool Systems
      </div>
    </div>
  );
};

export default AuthSplash;
