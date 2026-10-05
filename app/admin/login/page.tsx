'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Volume2, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
          Staff Email
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@eswarisound.com"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-ink/80 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
          Master Security Key / Password
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full pl-10 pr-11 py-3 rounded-xl bg-ink/80 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-all"
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
        disabled={loading}
        className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-amber to-amber-soft text-ink font-semibold text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber/25 disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Verifying Session...</span>
          </>
        ) : (
          <>
            <span>Sign In To Console</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-amber/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="glass-card-amber rounded-3xl p-8 sm:p-10 border border-amber/20 shadow-2xl relative">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-amber/15 border border-amber/30 items-center justify-center text-amber mb-4 shadow-lg shadow-amber/10">
              <Volume2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-white tracking-tight">
              Staff Operations Portal
            </h1>
            <p className="text-xs text-neutral-400 font-mono mt-1">
              Eswari Sound System • Internal Dispatch & Rigging
            </p>
          </div>

          <Suspense
            fallback={
              <div className="py-12 flex justify-center items-center text-amber">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>

          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-neutral-500 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-amber" />
            <span>Encrypted 7-Day Session • Eswari Sound System</span>
          </div>
        </div>
      </div>
    </div>
  );
}
