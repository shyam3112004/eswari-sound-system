'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <div>
        <label className="field-label" htmlFor="admin-email">
          Staff email
        </label>
        <input
          id="admin-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@eswarisound.com"
          className="field"
          autoComplete="username"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="admin-password">
          Master security key
        </label>
        <div className="relative">
          <input
            id="admin-password"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="field pr-10"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 text-fg-muted hover:text-amber transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            <span>Verifying session</span>
          </>
        ) : (
          <>
            <span>Sign in to console</span>
            <ArrowRight className="w-4 h-4" aria-hidden />
          </>
        )}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-ink text-white">
      <div className="container-page pt-28 lg:pt-36 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-x-14 gap-y-12 max-w-5xl">
        {/* Left: what this door is, plain text on a hairline */}
        <div className="lg:col-span-5">
          <div className="border-b border-white/[0.12] pb-4">
            <span className="label label-amber">Staff only · internal dispatch</span>
          </div>
          <h1 className="font-heading text-h1 text-white mt-6">
            Production console
          </h1>
          <p className="mt-4 text-body text-fg-muted leading-relaxed max-w-measure">
            Booking queue, blackout calendar, portfolio and the rental catalog.
            Access is limited to accounts on the operations team.
          </p>

          <div className="mt-8 border-t border-white/[0.12] pt-5 space-y-2.5">
            <p className="label">Encrypted 7-day session</p>
            <p className="label">Eswari Sound System · Madurai depot</p>
          </div>
        </div>

        {/* Right: underline form behind a vertical hairline */}
        <div className="lg:col-span-7 lg:border-l lg:border-white/10 lg:pl-14">
          <div className="border-b border-white/[0.12] pb-4">
            <span className="label">Credentials</span>
          </div>

          <div className="pt-8 max-w-md">
            <Suspense
              fallback={
                <div className="py-12 flex items-center gap-2 text-amber font-mono text-spec">
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                  <span>Preparing sign-in…</span>
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>

          <p className="mt-10 pt-5 border-t border-white/[0.12] label">
            Customer bookings live in the{' '}
            <a href="/my-bookings" className="text-amber hover:underline">
              order tracker
            </a>
            , not here.
          </p>
        </div>
      </div>
    </div>
  );
}
