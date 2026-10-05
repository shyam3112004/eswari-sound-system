'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut, Calendar, Film, Shield, ChevronDown, Sparkles } from 'lucide-react';
import { AuthModal } from './AuthModal';

export function AuthButton() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/auth/user')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setDropdownOpen(false);
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };


  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
    );
  }

  return (
    <>
      {!user ? (
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 hover:border-amber/40 transition-all shadow-sm group"
        >
          {/* Google G Icon */}
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
          <span className="hidden sm:inline">Google Sign In</span>
          <span className="sm:hidden">Login</span>
        </button>
      ) : (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-full glass-card hover:bg-white/10 border border-white/20 transition-all text-xs"
          >
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-6 h-6 rounded-full object-cover border border-amber/40"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber to-amber-soft text-ink font-bold flex items-center justify-center text-[11px]">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
            )}
            <span className="max-w-[100px] truncate text-white font-medium hidden sm:inline">
              {user.name.split(' ')[0]}
            </span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          {/* User Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl glass-card-amber border border-amber/30 text-white shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 text-xs">
              <div className="px-3 py-2 border-b border-white/10 space-y-0.5">
                <div className="font-bold text-white truncate">{user.name}</div>
                <div className="text-[11px] font-mono text-neutral-400 truncate">{user.email}</div>
              </div>

              <div className="py-1">
                <Link
                  href={`/my-bookings?query=${encodeURIComponent(user.email)}`}
                  onClick={() => setDropdownOpen(false)}
                  className="w-full px-3 py-2 rounded-xl text-neutral-200 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber" />
                  <span>My Bookings & Receipts</span>
                </Link>

                <Link
                  href="/book"
                  onClick={() => setDropdownOpen(false)}
                  className="w-full px-3 py-2 rounded-xl text-neutral-200 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber" />
                  <span>Book Stage Rig</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-white/10">
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 rounded-xl text-red-400 hover:bg-red-950/40 flex items-center gap-2.5 transition-colors text-left font-mono"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
          router.push('/');
          router.refresh();
        }}

      />
    </>
  );
}
