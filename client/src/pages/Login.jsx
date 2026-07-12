import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const ROLES = ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(ROLES[0]);
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    } catch {
      setAttempts((prev) => ({ ...prev, [email]: count }));
      setError(`Invalid credentials. ${5 - count} attempt(s) remaining.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <span className="text-accent font-bold text-2xl font-mono">TransitOps</span>
          <p className="text-text-secondary text-sm mt-1">Fleet & Logistics Management</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-default rounded-xl p-6 flex flex-col gap-4">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-status-retired bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg px-4 py-3"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 pr-10 bg-input text-text-primary rounded-lg border border-default focus:border-border-focus focus:ring-1 focus:ring-accent/20 focus:outline-none transition-all duration-200 input-glow-focus"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-input text-text-primary rounded-lg border border-default focus:border-border-focus focus:outline-none transition-all duration-200"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-text-secondary cursor-pointer select-none">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                className="accent-accent w-3.5 h-3.5" />
              Remember me
            </label>
            <button type="button" className="text-accent hover:text-accent-hover transition-colors text-xs">
              Forgot password?
            </button>
          </div>

          <Button type="submit" disabled={loading} className="w-full mt-1">
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-xs text-text-muted mt-6 leading-relaxed">
          Fleet Manager · Dispatcher · Safety Officer · Financial Analyst
        </p>
      </div>
    </div>
  );
};

export default Login;
