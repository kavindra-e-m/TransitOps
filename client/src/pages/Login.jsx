import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const ROLES = ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'];

const Login = () => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login'); // 'login' | 'signup'

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(ROLES[0]);
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [attempts, setAttempts] = useState({});

  // Signup state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState(ROLES[0]);
  const [showSignupPass, setShowSignupPass] = useState(false);

  // Shared state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const count = (attempts[email] || 0) + 1;
    if (count >= 5) {
      setError('Account locked. Too many failed attempts. Contact your administrator.');
      setAttempts((prev) => ({ ...prev, [email]: count }));
      return;
    }
    setLoading(true);
    try {
      await login(email, password, role);
      navigate('/dashboard');
    } catch (err) {
      setAttempts((prev) => ({ ...prev, [email]: count }));
      setError(err.message || `Invalid credentials. ${5 - count} attempt(s) remaining.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!signupName.trim()) return setError('Full name is required.');
    if (signupPassword.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await signup(signupName, signupEmail, signupPassword, signupRole);
      setSuccess('Account created! You can now sign in.');
      setSignupName(''); setSignupEmail(''); setSignupPassword('');
      setTab('login');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <span className="text-accent font-bold text-2xl font-mono">TransitOps</span>
          <p className="text-secondary text-sm mt-1">Fleet & Logistics Management</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-card border border-default rounded-xl p-1 mb-4">
          {['login', 'signup'].map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                tab === t ? 'bg-accent text-[#0B0E14]' : 'text-secondary hover:text-primary'
              }`}
            >
              {t === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <div className="bg-card border border-default rounded-xl p-6 flex flex-col gap-4">
          {/* Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
                className="text-sm text-status-retired bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg px-4 py-3">
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
                className="text-sm text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-lg px-4 py-3">
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-secondary">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" required
                    className="w-full px-3 py-2 pr-10 bg-input text-primary rounded-lg border border-default focus:border-focus focus:ring-1 focus:ring-accent/20 focus:outline-none transition-all duration-200 input-glow-focus" />
                  <button type="button" onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-secondary">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-input text-primary rounded-lg border border-default focus:border-focus focus:outline-none transition-all duration-200">
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-secondary cursor-pointer select-none">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-accent w-3.5 h-3.5" />
                  Remember me
                </label>
                <button type="button" className="text-accent hover:text-accent-hover transition-colors text-xs">Forgot password?</button>
              </div>

              <Button type="submit" disabled={loading} className="w-full mt-1">
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="flex flex-col gap-4">
              <Input label="Full Name" type="text" value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="John Doe" required />
              <Input label="Email" type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="you@company.com" required />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-secondary">Password</label>
                <div className="relative">
                  <input type={showSignupPass ? 'text' : 'password'} value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Min. 6 characters" required
                    className="w-full px-3 py-2 pr-10 bg-input text-primary rounded-lg border border-default focus:border-focus focus:ring-1 focus:ring-accent/20 focus:outline-none transition-all duration-200 input-glow-focus" />
                  <button type="button" onClick={() => setShowSignupPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors">
                    {showSignupPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-secondary">Role</label>
                <select value={signupRole} onChange={(e) => setSignupRole(e.target.value)}
                  className="w-full px-3 py-2 bg-input text-primary rounded-lg border border-default focus:border-focus focus:outline-none transition-all duration-200">
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <Button type="submit" disabled={loading} className="w-full mt-1">
                {loading ? 'Creating account…' : 'Create Account'}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted mt-6 leading-relaxed">
          Fleet Manager · Dispatcher · Safety Officer · Financial Analyst
        </p>
      </div>
    </div>
  );
};

export default Login;
