'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Calendar, MonitorPlay, ChevronDown, ArrowUpRight } from 'lucide-react';
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
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
    }
  };


  if (loading) {
    return (
      <div className="w-16 h-4 bg-white/5 animate-pulse" aria-hidden />
    );
  }

  return (
    <>
      {!user ? (
        <button
          onClick={() => setModalOpen(true)}
          className="link-arrow !text-[11px]"
        >
          <span className="hidden sm:inline">Sign In / Sign Up</span>
          <span className="sm:hidden">Sign In</span>
        </button>
      ) : (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 py-1 text-xs text-fg-soft hover:text-white transition-colors"
            aria-expanded={dropdownOpen}
          >
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-amber text-ink font-bold flex items-center justify-center text-[11px]">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
            )}
            <span className="max-w-[100px] truncate font-medium hidden sm:inline">
              {user.name.split(' ')[0]}
            </span>
            <ChevronDown
              className={`w-3 h-3 text-fg-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* User Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-64 p-5 glass-card text-white z-50 text-xs">
              <div className="pb-4 border-b border-white/10 space-y-1">
                <div className="font-bold text-white truncate">{user.name}</div>
                <div className="text-[11px] font-mono text-fg-muted truncate">{user.email}</div>
                {user.isAdmin && (
                  <span className="label label-amber !text-[10px]">Master admin</span>
                )}
              </div>

              <div className="pt-2">
                <Link
                  href={`/my-bookings?query=${encodeURIComponent(user.email)}`}
                  onClick={() => setDropdownOpen(false)}
                  className="w-full py-2.5 flex items-center justify-between gap-2 text-fg-soft hover:text-amber transition-colors"
                >
                  <span>My bookings &amp; receipts</span>
                  <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden />
                </Link>

                <Link
                  href="/book"
                  onClick={() => setDropdownOpen(false)}
                  className="w-full py-2.5 flex items-center justify-between gap-2 text-fg-soft hover:text-amber transition-colors border-t border-white/10"
                >
                  <span>Book stage rig</span>
                  <ArrowUpRight className="w-3.5 h-3.5 shrink-0" aria-hidden />
                </Link>

                {user.isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full py-2.5 flex items-center justify-between gap-2 text-amber border-t border-white/10 transition-colors font-mono"
                  >
                    <span>Staff console</span>
                    <MonitorPlay className="w-3.5 h-3.5 shrink-0" aria-hidden />
                  </Link>
                )}
              </div>

              <div className="mt-2 pt-3 border-t border-white/10">
                <button
                  onClick={handleLogout}
                  className="w-full py-2 flex items-center justify-between gap-2 text-red-400 hover:text-red-300 transition-colors text-left font-mono"
                >
                  <span>Log Out</span>
                  <LogOut className="w-3.5 h-3.5" aria-hidden />
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
          if (loggedUser?.isAdmin) {
            window.location.href = '/admin';
          } else {
            window.location.href = '/';
          }
        }}
      />
    </>
  );
}
