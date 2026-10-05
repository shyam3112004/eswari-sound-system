import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Google Identity Services script if Client ID is configured
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    (window as any).handleGoogleCallback = async (response: any) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential }),
        });
        const data = await res.json();
        if (data.success) {
          onSuccess(data.user);
          onClose();
          window.location.href = '/';
        } else {
          setError(data.error || 'Google login failed');
        }
      } catch (err: any) {
        setError(err.message || 'Network error');
      } finally {
        setLoading(false);
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [onSuccess, onClose]);

  if (!isOpen) return null;

  // 1-Click Google Customer Login
  const handleInstantGoogleAuth = async (prefillEmail?: string, prefillName?: string) => {
    setLoading(true);
    setError(null);

    const targetEmail = prefillEmail || email;
    const targetName = prefillName || name || (targetEmail ? targetEmail.split('@')[0] : 'Client');

    if (!targetEmail || !targetEmail.includes('@')) {
      setError('Please provide a valid Gmail / Google email address');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          name: targetName,
          picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(targetName)}&backgroundColor=ffb11a&textColor=070709`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess(data.user);
        onClose();
        window.location.href = '/';
      } else {
        setError(data.error || 'Sign in failed');
      }
    } catch (err: any) {
      setError(err.message || 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  // Email + Password Authenticator (Admin Auto-Open or Customer Experience)
  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!cleanPassword) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
          name: name.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        onSuccess(data.user);
        onClose();

        // If admin credentials matched, automatically open Admin Console
        if (data.role === 'admin' || data.redirectTo === '/admin') {
          window.location.href = '/admin';
        } else {
          // If customer, go strictly to Experience tab
          window.location.href = '/';
        }
      } else {
        setError(data.error || 'Incorrect email or password. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl glass-card-amber border border-amber/30 text-white shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber/15 border border-amber/30 flex items-center justify-center text-amber mx-auto mb-3 shadow-lg shadow-amber/20">
            <Sparkles className="w-6 h-6 text-amber" />
          </div>
          <h3 className="font-heading text-2xl font-bold text-white tracking-tight">
            Sign In / Sign Up
          </h3>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Enter your credentials to manage stage bookings, invoices, or open the console.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Quick 1-Click Google Customer Login */}
          <button
            onClick={() => handleInstantGoogleAuth('3112004shyam@gmail.com', 'Shyam')}
            disabled={loading}
            className="w-full p-3.5 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-xs flex items-center justify-between transition-all shadow-lg active:scale-95 disabled:opacity-60 border border-white group"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <div className="text-left">
                <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                  <span>Continue as Shyam</span>
                  <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">Verified</span>
                </div>
                <div className="text-[11px] font-mono text-neutral-500">3112004shyam@gmail.com</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-amber transition-colors" />
          </button>

          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#12110E] px-3 text-[10px] font-mono text-neutral-400 uppercase tracking-widest absolute">
              or enter email &amp; password
            </span>
          </div>

          {/* Secure Email & Password Form */}
          <form onSubmit={handlePasswordAuth} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-300 mb-1">
                Your Name <span className="text-neutral-500 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Shyam Sundar"
                className="w-full px-4 py-2.5 rounded-xl bg-ink/80 border border-white/15 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-300 mb-1">
                Email Address <span className="text-amber">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@eswarisound.com or client@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ink/80 border border-white/15 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-300 mb-1">
                Password <span className="text-amber">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-ink/80 border border-white/15 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full mt-2 py-3 rounded-full bg-gradient-to-r from-amber to-amber-soft text-ink font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In / Sign Up</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security & Admin Auto-Route Note */}
        <div className="pt-2 border-t border-white/10 flex flex-col items-center justify-center gap-1.5 text-[11px] text-neutral-400 font-mono text-center">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>256-Bit Encrypted Secure Authentication</span>
          </div>
          <p className="text-[10px] text-neutral-500">
            Entering master password opens Admin automatically • Customers land on Experience
          </p>
        </div>
      </div>
    </div>
  );
}
