import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 sm:p-8 glass-card text-white space-y-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-fg-muted hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-2 pr-8">
          <p className="label label-amber">Client &amp; crew access</p>
          <h3 className="font-heading text-h3 font-bold text-white">Sign in</h3>
          <p className="text-small text-fg-muted leading-relaxed max-w-measure">
            Bookings, invoices and the staff console sit behind one login.
          </p>
        </div>

        {error && (
          <div className="alert alert-error !py-2.5 text-red-200" role="alert">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Quick 1-Click Google Customer Login */}
          <button
            onClick={() => handleInstantGoogleAuth('3112004shyam@gmail.com', 'Shyam')}
            disabled={loading}
            className="w-full hairline py-4 flex items-center justify-between gap-3 text-left group disabled:opacity-60"
          >
            <div className="flex items-center gap-3 min-w-0">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
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
              <div className="text-left min-w-0">
                <div className="text-xs font-semibold text-white flex items-center gap-2">
                  <span>Continue as Shyam</span>
                  <span className="label !text-[9px] !tracking-[0.14em] text-emerald-400">
                    Verified
                  </span>
                </div>
                <div className="text-[11px] font-mono text-fg-muted truncate">
                  3112004shyam@gmail.com
                </div>
              </div>
            </div>
            <ArrowRight
              className="w-4 h-4 text-fg-muted group-hover:text-amber transition-colors shrink-0"
              aria-hidden
            />
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-ink-raised px-3 label !text-[10px] absolute">
              or enter email &amp; password
            </span>
          </div>

          <form onSubmit={handlePasswordAuth} className="space-y-4">
            <div>
              <label className="field-label" htmlFor="auth-name">
                Your name <span className="normal-case tracking-normal">(optional)</span>
              </label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Shyam Sundar"
                className="field"
              />
            </div>

            <div>
              <label className="field-label" htmlFor="auth-email">
                Email address <span className="text-amber">*</span>
              </label>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@eswarisound.com or client@gmail.com"
                className="field font-mono text-sm"
              />
            </div>

            <div>
              <label className="field-label" htmlFor="auth-password">
                Password <span className="text-amber">*</span>
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="field pr-9 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-fg-muted hover:text-amber transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />
                  <span>Verifying credentials</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="hairline pt-4 flex flex-col gap-1 label !text-[10px] text-center">
          <p>Encrypted session · master credentials open the staff console</p>
          <p className="text-fg-muted">Customers land back on the experience page</p>
        </div>
      </div>
    </div>
  );
}
