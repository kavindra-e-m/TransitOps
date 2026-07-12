import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Bus, Truck, MapPin, Shield, TrendingUp, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import transitHero from '../assets/transit_hero.png';

const ROLES = ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'];

const ROLE_ICONS = {
  'Fleet Manager': Bus,
  'Dispatcher': Radio,
  'Safety Officer': Shield,
  'Financial Analyst': TrendingUp,
};

/* ── Floating particle dot ── */
const Particle = ({ style }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={style}
    animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
    transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 3 }}
  />
);

/* ── Animated route line ── */
const RouteLine = ({ className }) => (
  <motion.div
    className={`absolute pointer-events-none ${className}`}
    initial={{ scaleX: 0, opacity: 0 }}
    animate={{ scaleX: [0, 1, 1, 0], opacity: [0, 0.4, 0.4, 0] }}
    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 3 }}
  />
);

/* ── Stats badge ── */
const StatBadge = ({ icon: Icon, label, value, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
    className="flex items-center gap-3 px-4 py-3 rounded-xl"
    style={{
      background: 'rgba(255,193,116,0.07)',
      border: '1px solid rgba(255,193,116,0.15)',
      backdropFilter: 'blur(12px)',
    }}
  >
    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,193,116,0.15)' }}>
      <Icon size={16} style={{ color: '#ffc174' }} />
    </div>
    <div>
      <p className="text-xs font-semibold" style={{ color: '#ffc174' }}>{value}</p>
      <p className="text-xs" style={{ color: 'rgba(216,195,173,0.7)' }}>{label}</p>
    </div>
  </motion.div>
);

const Login = () => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');

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

  // Particles
  const [particles] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      style: {
        width: `${4 + Math.random() * 6}px`,
        height: `${4 + Math.random() * 6}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        background: i % 3 === 0 ? 'rgba(255,193,116,0.6)' : i % 3 === 1 ? 'rgba(173,198,255,0.5)' : 'rgba(81,231,123,0.4)',
        boxShadow: i % 3 === 0 ? '0 0 8px rgba(255,193,116,0.8)' : i % 3 === 1 ? '0 0 8px rgba(173,198,255,0.7)' : '0 0 8px rgba(81,231,123,0.6)',
      },
    }))
  );

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

  const RoleIcon = ROLE_ICONS[role] || Bus;

  return (
    <div className="min-h-screen flex" style={{ background: '#0B0E14', fontFamily: "'Inter', sans-serif" }}>

      {/* ═══ LEFT PANEL — Hero / Branding ═══ */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[58%] relative overflow-hidden flex-col">
        {/* Hero background image */}
        <div className="absolute inset-0">
          <img
            src={transitHero}
            alt="TransitOps fleet management"
            className="w-full h-full object-cover"
            style={{ opacity: 0.75 }}
          />
          {/* Dark gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(11,14,20,0.85) 0%, rgba(11,14,20,0.4) 50%, rgba(11,14,20,0.7) 100%)',
            }}
          />
          {/* Amber glow from bottom-left */}
          <div
            className="absolute bottom-0 left-0 w-96 h-96 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,193,116,0.12) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }}
          />
          {/* Blue glow top-right */}
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(173,198,255,0.1) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
          />
        </div>

        {/* Animated floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((p) => <Particle key={p.id} style={p.style} />)}
        </div>

        {/* Animated route lines */}
        <div className="absolute inset-0 overflow-hidden">
          {[
            'top-1/3 left-0 w-48 h-px origin-left bg-gradient-to-r from-transparent via-amber-400/40 to-transparent',
            'top-2/3 left-1/4 w-32 h-px origin-left bg-gradient-to-r from-transparent via-blue-400/30 to-transparent rotate-12',
            'top-1/2 left-8 w-56 h-px origin-left bg-gradient-to-r from-transparent via-green-400/30 to-transparent -rotate-6',
          ].map((cls, i) => <RouteLine key={i} className={cls} />)}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="flex items-center gap-3"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #ffc174, #f59e0b)', boxShadow: '0 0 20px rgba(255,193,116,0.4)' }}
            >
              <Bus size={20} color="#0B0E14" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-bold text-xl" style={{ color: '#ffc174', fontFamily: "'JetBrains Mono', monospace" }}>
                TransitOps
              </span>
              <div className="text-xs" style={{ color: 'rgba(216,195,173,0.6)' }}>Fleet Intelligence Platform</div>
            </div>
          </motion.div>

          {/* Center hero text */}
          <div className="flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1
                className="text-5xl font-black leading-tight mb-4"
                style={{ color: '#e1e2eb', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
              >
                Command Your
                <br />
                <span
                  style={{
                    background: 'linear-gradient(90deg, #ffc174, #adc6ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Fleet Network
                </span>
              </h1>
              <p className="text-base leading-relaxed max-w-sm" style={{ color: 'rgba(216,195,173,0.8)' }}>
                Real-time fleet tracking, intelligent dispatching, and complete operational visibility — all in one platform.
              </p>
            </motion.div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <StatBadge icon={Bus} label="Active Vehicles" value="240+" delay={0.5} />
              <StatBadge icon={MapPin} label="Live Routes" value="48" delay={0.6} />
              <StatBadge icon={Shield} label="Safety Score" value="98.4%" delay={0.7} />
              <StatBadge icon={TrendingUp} label="Efficiency Up" value="+23%" delay={0.8} />
            </div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full" style={{ background: '#51e77b', boxShadow: '0 0 6px rgba(81,231,123,0.8)', animation: 'status-pulse 2s infinite' }} />
            <span className="text-xs" style={{ color: 'rgba(216,195,173,0.5)' }}>All systems operational · Last updated just now</span>
          </motion.div>
        </div>
      </div>

      {/* ═══ RIGHT PANEL — Login / Signup Form ═══ */}
      <div
        className="w-full lg:w-1/2 xl:w-[42%] flex items-center justify-center px-6 py-12 relative"
        style={{
          background: 'linear-gradient(160deg, rgba(29,32,38,0.98) 0%, rgba(11,14,20,0.99) 100%)',
          borderLeft: '1px solid rgba(31,41,55,0.8)',
        }}
      >
        {/* Subtle ambient glow behind form */}
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,193,116,0.05) 0%, transparent 70%)',
            transform: 'translate(-50%, -50%)',
          }}
        />

        <div className="w-full max-w-[400px] relative z-10">

          {/* Mobile logo (shown only on small screens) */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:hidden flex items-center justify-center gap-3 mb-8"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #ffc174, #f59e0b)', boxShadow: '0 0 20px rgba(255,193,116,0.4)' }}
            >
              <Bus size={20} color="#0B0E14" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-xl" style={{ color: '#ffc174', fontFamily: "'JetBrains Mono', monospace" }}>
              TransitOps
            </span>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-7"
          >
            <h2 className="text-2xl font-bold mb-1" style={{ color: '#e1e2eb' }}>
              {tab === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-sm" style={{ color: 'rgba(160,142,122,0.85)' }}>
              {tab === 'login'
                ? 'Sign in to access your operations dashboard'
                : 'Join your team on TransitOps'}
            </p>
          </motion.div>

          {/* Glassmorphism card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
              padding: '28px',
            }}
          >
            {/* Tab Toggle */}
            <div
              className="flex p-1 mb-6 rounded-xl"
              style={{
                background: 'rgba(11,14,20,0.6)',
                border: '1px solid rgba(31,41,55,0.6)',
              }}
            >
              {['login', 'signup'].map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(''); setSuccess(''); }}
                  className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 relative"
                  style={{
                    color: tab === t ? '#0B0E14' : 'rgba(160,142,122,0.8)',
                    background: tab === t
                      ? 'linear-gradient(135deg, #ffc174, #f59e0b)'
                      : 'transparent',
                    boxShadow: tab === t ? '0 2px 12px rgba(255,193,116,0.3)' : 'none',
                  }}
                >
                  {t === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            {/* Alerts */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm rounded-xl px-4 py-3 mb-4 font-medium"
                  style={{
                    color: '#ffb4ab',
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.25)',
                  }}
                >
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm rounded-xl px-4 py-3 mb-4 font-medium"
                  style={{
                    color: '#51e77b',
                    background: 'rgba(34,197,94,0.08)',
                    border: '1px solid rgba(34,197,94,0.25)',
                  }}
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forms */}
            <AnimatePresence mode="wait">
              {tab === 'login' ? (
                <motion.form
                  key="login"
                  onSubmit={handleLogin}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-4"
                >
                  <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(160,142,122,0.85)' }}>Password</label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full px-3 py-2 pr-10 rounded-lg border transition-all duration-200 input-glow-focus text-sm"
                        style={{
                          background: 'rgba(11,14,20,0.7)',
                          color: '#e1e2eb',
                          border: '1px solid rgba(31,41,55,0.8)',
                        }}
                      />
                      <button type="button" onClick={() => setShowPass((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: 'rgba(160,142,122,0.7)' }}>
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Role selector with icons */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(160,142,122,0.85)' }}>Role</label>
                    <div className="grid grid-cols-2 gap-2">
                      {ROLES.map((r) => {
                        const Icon = ROLE_ICONS[r];
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setRole(r)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200"
                            style={{
                              background: role === r ? 'rgba(255,193,116,0.12)' : 'rgba(11,14,20,0.5)',
                              border: `1px solid ${role === r ? 'rgba(255,193,116,0.4)' : 'rgba(31,41,55,0.6)'}`,
                              color: role === r ? '#ffc174' : 'rgba(160,142,122,0.7)',
                              boxShadow: role === r ? '0 0 10px rgba(255,193,116,0.1)' : 'none',
                            }}
                          >
                            <Icon size={13} />
                            {r}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm select-none">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs" style={{ color: 'rgba(160,142,122,0.8)' }}>
                      <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-amber-400 w-3.5 h-3.5" />
                      Remember me
                    </label>
                    <button type="button" className="text-xs transition-colors hover:text-amber-300" style={{ color: '#ffc174' }}>Forgot password?</button>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="w-full mt-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 relative overflow-hidden"
                    style={{
                      background: loading ? 'rgba(255,193,116,0.4)' : 'linear-gradient(135deg, #ffc174, #f59e0b)',
                      color: '#0B0E14',
                      boxShadow: loading ? 'none' : '0 4px 20px rgba(255,193,116,0.35)',
                    }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span
                          className="inline-block w-4 h-4 border-2 border-current rounded-full border-t-transparent"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        />
                        Signing in…
                      </span>
                    ) : 'Sign In'}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.form
                  key="signup"
                  onSubmit={handleSignup}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-4"
                >
                  <Input label="Full Name" type="text" value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="John Doe" required />
                  <Input label="Email" type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="you@company.com" required />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(160,142,122,0.85)' }}>Password</label>
                    <div className="relative">
                      <input
                        type={showSignupPass ? 'text' : 'password'}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        required
                        className="w-full px-3 py-2 pr-10 rounded-lg border transition-all duration-200 input-glow-focus text-sm"
                        style={{
                          background: 'rgba(11,14,20,0.7)',
                          color: '#e1e2eb',
                          border: '1px solid rgba(31,41,55,0.8)',
                        }}
                      />
                      <button type="button" onClick={() => setShowSignupPass((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: 'rgba(160,142,122,0.7)' }}>
                        {showSignupPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Role selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(160,142,122,0.85)' }}>Role</label>
                    <div className="grid grid-cols-2 gap-2">
                      {ROLES.map((r) => {
                        const Icon = ROLE_ICONS[r];
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setSignupRole(r)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200"
                            style={{
                              background: signupRole === r ? 'rgba(255,193,116,0.12)' : 'rgba(11,14,20,0.5)',
                              border: `1px solid ${signupRole === r ? 'rgba(255,193,116,0.4)' : 'rgba(31,41,55,0.6)'}`,
                              color: signupRole === r ? '#ffc174' : 'rgba(160,142,122,0.7)',
                              boxShadow: signupRole === r ? '0 0 10px rgba(255,193,116,0.1)' : 'none',
                            }}
                          >
                            <Icon size={13} />
                            {r}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="w-full mt-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
                    style={{
                      background: loading ? 'rgba(255,193,116,0.4)' : 'linear-gradient(135deg, #ffc174, #f59e0b)',
                      color: '#0B0E14',
                      boxShadow: loading ? 'none' : '0 4px 20px rgba(255,193,116,0.35)',
                    }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span
                          className="inline-block w-4 h-4 border-2 border-current rounded-full border-t-transparent"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        />
                        Creating account…
                      </span>
                    ) : 'Create Account'}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-xs mt-6 leading-relaxed"
            style={{ color: 'rgba(160,142,122,0.45)' }}
          >
            Fleet Manager · Dispatcher · Safety Officer · Financial Analyst
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default Login;
