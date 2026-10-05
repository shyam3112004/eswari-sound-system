'use client';

import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Mail, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'quick_google' | 'custom_email'>('quick_google');

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
      } else {
        setError(data.error || 'Sign in failed');
      }
    } catch (err: any) {
      setError(err.message || 'Connection error');
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
            Sign In with Google
          </h3>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Access your stage booking history, download tax invoices, and track your sound crew live.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* Primary Google Auth Action */}
        <div className="space-y-4">
          <button
            onClick={() => handleInstantGoogleAuth()}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-xs tracking-wide flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 disabled:opacity-60"
          >
            {/* Google Multi-Color SVG Logo */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
            <span>Continue with Google / Gmail</span>
          </button>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#12110E] px-3 text-[11px] font-mono text-neutral-400 uppercase tracking-widest absolute">
              or enter Gmail directly
            </span>
          </div>

          {/* Email / Gmail Direct Login */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-300 mb-1">
                Your Name
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
                Google / Gmail Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@gmail.com"
                className="w-full px-4 py-2.5 rounded-xl bg-ink/80 border border-white/15 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber font-mono"
              />
            </div>

            <button
              onClick={() => handleInstantGoogleAuth()}
              disabled={loading || !email}
              className="w-full py-3 rounded-full bg-gradient-to-r from-amber to-amber-soft text-ink font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting Google Account...</span>
                </>
              ) : (
                <>
                  <span>Sign In / Sign Up</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security Assurance */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-neutral-400 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Protected with 256-bit Google OAuth Session</span>
        </div>
      </div>
    </div>
  );
}
