'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Volume2,
  Calendar,
  Layers,
  FileText,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  ShieldCheck,
  Plus,
  RefreshCw,
  Trash2,
  Send,
  Edit3,
  Phone,
  MessageSquare,
  Copy,
  ExternalLink,
  Check,
  DollarSign,
  Image as ImageIcon,
  Video,
  Upload,
  Film,
  Play,
  Eye,
  Sparkles,
  FolderPlus,
  X,
  MapPin,
  Package,
  Wrench,
  ToggleLeft,
  ToggleRight,
  Lightbulb,
  Wind,
  Battery,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<{ email: string } | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [blockedDates, setBlockedDates] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'inquiries' | 'calendar' | 'portfolio' | 'materials'>('overview');

  // Form states for admin actions
  const [newBlackoutDate, setNewBlackoutDate] = useState('');
  const [newBlackoutReason, setNewBlackoutReason] = useState('Festival Maintenance');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Quoting state
  const [quotingInquiryId, setQuotingInquiryId] = useState<string | null>(null);
  const [quoteAmount, setQuoteAmount] = useState<number>(4500000);
  const [quoteDetails, setQuoteDetails] = useState('');

  // Portfolio management state
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const [portfolioSubmitting, setPortfolioSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const [portTitle, setPortTitle] = useState('');
  const [portCategory, setPortCategory] = useState('concert');
  const [portLocation, setPortLocation] = useState('');
  const [portCrowd, setPortCrowd] = useState('');
  const [portSpecs, setPortSpecs] = useState('');
  const [portTag, setPortTag] = useState('');
  const [portMediaType, setPortMediaType] = useState<'image' | 'video'>('image');
  const [portMediaUrl, setPortMediaUrl] = useState('');
  const [portEventDate, setPortEventDate] = useState('');
  const [activeMediaPreview, setActiveMediaPreview] = useState<any | null>(null);

  // Materials management state
  const [materials, setMaterials] = useState<any[]>([]);
  const [matSubmitting, setMatSubmitting] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any | null>(null);
  const [matName, setMatName] = useState('');
  const [matCategory, setMatCategory] = useState('audio');
  const [matDescription, setMatDescription] = useState('');
  const [matPricePerDay, setMatPricePerDay] = useState<number>(100000);
  const [matUnit, setMatUnit] = useState('unit');
  const [matIsAvailable, setMatIsAvailable] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    setActionMessage(null);
    try {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) {
        router.push('/admin/login');
        return;
      }
      const meData = await meRes.json();
      setAdminUser(meData.user);

      const bookRes = await fetch('/api/bookings');
      const bookData = await bookRes.json();
      if (bookData.success) setBookings(bookData.bookings);

      const inqRes = await fetch('/api/inquiries');
      const inqData = await inqRes.json();
      if (inqData.success) setInquiries(inqData.inquiries);

      const availRes = await fetch('/api/availability');
      const availData = await availRes.json();
      if (availData.success) setBlockedDates(availData.blockedDates);

      const portRes = await fetch('/api/admin/portfolio');
      const portData = await portRes.json();
      if (portData.success) setPortfolioItems(portData.items);

      const matRes = await fetch('/api/admin/materials');
      const matData = await matRes.json();
      if (matData.success) setMaterials(matData.materials);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPortfolioUploading(true);
    setUploadProgress(`Uploading ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setPortMediaUrl(data.url);
        setPortMediaType(data.mediaType);
        setActionMessage(`Uploaded "${file.name}" successfully! Media attached.`);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('File upload error:', err);
      alert('Failed to upload media file');
    } finally {
      setPortfolioUploading(false);
      setUploadProgress(null);
    }
  };

  const handleCreatePortfolioItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portTitle || !portLocation || !portMediaUrl) {
      alert('Please fill Title, Location, and Upload Image/Video or provide Media URL');
      return;
    }
    setPortfolioSubmitting(true);
    try {
      const res = await fetch('/api/admin/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: portTitle,
          category: portCategory,
          location: portLocation,
          crowd: portCrowd || null,
          specs: portSpecs || null,
          tag: portTag || null,
          mediaType: portMediaType,
          mediaUrl: portMediaUrl,
          eventDate: portEventDate || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Published "${portTitle}" to Live Portfolio Gallery!`);
        setPortTitle('');
        setPortLocation('');
        setPortCrowd('');
        setPortSpecs('');
        setPortTag('');
        setPortMediaUrl('');
        setPortEventDate('');
        
        // Refresh items
        const portRes = await fetch('/api/admin/portfolio');
        const portData = await portRes.json();
        if (portData.success) setPortfolioItems(portData.items);
      } else {
        alert(data.error || 'Failed to create portfolio item');
      }
    } catch (err) {
      console.error('Error creating portfolio item:', err);
      alert('Server error creating portfolio item');
    } finally {
      setPortfolioSubmitting(false);
    }
  };

  const handleDeletePortfolioItem = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}" from the portfolio?`)) return;
    try {
      const res = await fetch(`/api/admin/portfolio?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Deleted "${title}" from portfolio.`);
        setPortfolioItems(portfolioItems.filter((i) => i.id !== id));
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      alert('Delete error');
    }
  };

  useEffect(() => {
    fetchData();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['overview', 'bookings', 'inquiries', 'calendar', 'portfolio', 'materials'].includes(tabParam)) {
        setActiveTab(tabParam as any);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleAddBlackout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlackoutDate) return;
    try {
      const res = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: newBlackoutDate, reason: newBlackoutReason }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Date ${newBlackoutDate} blacked out successfully.`);
        setNewBlackoutDate('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBlackout = async (dateStr: string) => {
    try {
      const res = await fetch(`/api/admin/availability?date=${dateStr}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Blackout for ${dateStr} removed.`);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: string, paymentStatus?: string) => {
    try {
      const payload: any = { bookingId, status };
      if (paymentStatus) payload.paymentStatus = paymentStatus;

      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Booking status updated to ${status}${paymentStatus ? ' & ' + paymentStatus : ''}.`);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmOrder = async (bookingId: string) => {
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status: 'APPROVED' }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage('Order confirmed over call! 25% Advance payment link is now unlocked.');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAdvancePaid = async (bookingId: string) => {
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status: 'CONFIRMED', paymentStatus: 'ADVANCE_PAID' }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage('Advance payment recorded! Date has been locked on the calendar schedule.');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyPaymentLink = (bookingId: string) => {
    const url = `${window.location.origin}/pay?bookingId=${bookingId}`;
    navigator.clipboard.writeText(url);
    setActionMessage(`Payment link copied to clipboard: ${url}`);
  };

  const handleSendQuote = async (inquiryId: string) => {
    try {
      const res = await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiryId,
          quoteAmount,
          quoteDetails: quoteDetails || '16-Box Line Array, 24 Moving Heads, Dual Silent Generator synch, FOH engineer',
          status: 'QUOTED',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Quotation of ${formatINR(quoteAmount)} issued for inquiry.`);
        setQuotingInquiryId(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-white px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-white/10 gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber/20 border border-amber/30 flex items-center justify-center text-amber">
            <Volume2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Staff Production Console
              <span className="text-[11px] font-mono font-normal uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-400">
                Live Admin
              </span>
            </h1>
            <p className="text-xs text-neutral-400 font-mono">
              Logged in as: <span className="text-amber">{adminUser?.email || 'admin@eswarisound.com'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl glass-card hover:bg-white/10 text-neutral-300 hover:text-white transition-all"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card border border-red-500/20 text-red-400 hover:bg-red-950/30 text-xs font-semibold transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="my-4 p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 my-8">
        <div className="glass-card rounded-2xl p-5 border border-white/10">
          <span className="text-xs text-neutral-400 font-mono uppercase tracking-wider">
            Total Bookings
          </span>
          <div className="font-heading text-3xl font-bold text-white mt-1">
            {bookings.length}
          </div>
          <span className="text-[11px] text-amber mt-1 block">Live date reservations</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-amber/30 bg-amber-950/20">
          <span className="text-xs text-amber font-mono uppercase tracking-wider flex items-center gap-1.5 font-bold">
            <Phone className="w-3.5 h-3.5" />
            <span>Needing Call Confirm</span>
          </span>
          <div className="font-heading text-3xl font-bold text-amber mt-1">
            {bookings.filter((b) => b.status === 'PENDING').length}
          </div>
          <span className="text-[11px] text-neutral-300 mt-1 block">Call customer & approve</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10">
          <span className="text-xs text-neutral-400 font-mono uppercase tracking-wider">
            Custom Inquiries
          </span>
          <div className="font-heading text-3xl font-bold text-haze mt-1">
            {inquiries.length}
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">Concerts & multi-day fests</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10">
          <span className="text-xs text-neutral-400 font-mono uppercase tracking-wider">
            Calendar Blackouts
          </span>
          <div className="font-heading text-3xl font-bold text-neutral-200 mt-1">
            {blockedDates.length}
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">Holidays & locked dates</span>
        </div>

        <div
          onClick={() => setActiveTab('portfolio')}
          className="glass-card rounded-2xl p-5 border border-amber/30 bg-amber/5 hover:border-amber hover:bg-amber/10 transition-all cursor-pointer group"
          title="Click to manage Portfolio"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber font-mono uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <Film className="w-3.5 h-3.5" />
              <span>Portfolio</span>
            </span>
            <span className="text-[10px] text-amber/70 font-mono group-hover:text-amber transition-colors">
              Manage →
            </span>
          </div>
          <div className="font-heading text-3xl font-bold text-white mt-1">
            {portfolioItems.length}
          </div>
          <span className="text-[11px] text-neutral-300 mt-1 block">Live photos & videos (Admin)</span>
        </div>

        <div
          onClick={() => setActiveTab('materials')}
          className="glass-card rounded-2xl p-5 border border-haze/30 bg-haze/5 hover:border-haze hover:bg-haze/10 transition-all cursor-pointer group"
          title="Click to manage Materials"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-haze font-mono uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <Package className="w-3.5 h-3.5" />
              <span>Materials</span>
            </span>
            <span className="text-[10px] text-haze/70 font-mono group-hover:text-haze transition-colors">
              Manage →
            </span>
          </div>
          <div className="font-heading text-3xl font-bold text-white mt-1">
            {materials.length}
          </div>
          <span className="text-[11px] text-neutral-300 mt-1 block">Rental items catalog</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-6 overflow-x-auto">
        {[
          { id: 'overview', label: 'Production Queue', icon: Layers },
          { id: 'bookings', label: 'All Bookings & Status', icon: Calendar },
          { id: 'inquiries', label: 'Festival Inquiries & Quotes', icon: FileText },
          { id: 'calendar', label: 'Blackout Calendar Manager', icon: Clock },
          { id: 'portfolio', label: `Portfolio (${portfolioItems.length})`, icon: Film },
          { id: 'materials', label: `Materials (${materials.length})`, icon: Package },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber text-ink font-semibold shadow-md shadow-amber/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="py-20 text-center text-neutral-400 font-mono text-xs">
          Loading production dashboard records...
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Call Confirmation Priority Queue */}
              {bookings.filter((b) => b.status === 'PENDING').length > 0 && (
                <div className="glass-card-amber rounded-3xl p-6 border border-amber/40 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber text-ink flex items-center justify-center font-bold">
                        <Phone className="w-4 h-4 animate-bounce" />
                      </div>
                      <div>
                        <h3 className="font-heading text-base font-bold text-white">
                          Action Required: Call Customers To Confirm Orders ({bookings.filter((b) => b.status === 'PENDING').length})
                        </h3>
                        <p className="text-xs text-neutral-300">
                          Call customer to verify venue, power, and acoustic setup before unlocking advance payment.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {bookings
                      .filter((b) => b.status === 'PENDING')
                      .map((b) => {
                        const cleanPhone = b.customerPhone.replace(/\D/g, '');
                        const dateStr = new Date(b.eventDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        });
                        const whatsappMsg = `Hello ${b.customerName}, this is Eswari Sound System regarding your booking for ${b.package?.name} on ${dateStr} at ${b.venueAddress}. We are calling to confirm your venue power supply and timing.`;

                        return (
                          <div
                            key={b.id}
                            className="p-4 rounded-2xl bg-ink/80 border border-amber/30 space-y-3 flex flex-col justify-between"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-heading text-base font-bold text-white">
                                  {b.customerName}
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber/20 text-amber font-bold">
                                  #{b.id.slice(0, 8)}
                                </span>
                              </div>
                              <div className="text-xs text-neutral-300">
                                📅 <span className="font-mono text-white">{dateStr}</span> • Rig: <span className="text-amber font-semibold">{b.package?.name}</span>
                              </div>
                              <div className="text-xs text-neutral-400">
                                📍 Venue: <span className="text-neutral-200">{b.venueAddress}</span>
                              </div>
                              {b.notes && (
                                <div className="text-[11px] text-neutral-300 bg-white/5 p-2 rounded-lg font-mono italic">
                                  "{b.notes}"
                                </div>
                              )}
                              <div className="pt-2 text-xs flex justify-between border-t border-white/10 font-mono">
                                <span className="text-neutral-400">25% Advance:</span>
                                <span className="text-amber font-bold">{formatINR(b.advanceAmount)}</span>
                              </div>
                            </div>

                            {/* Direct Call & WhatsApp Action Buttons */}
                            <div className="pt-2 space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <a
                                  href={`tel:${b.customerPhone}`}
                                  className="py-2.5 px-3 rounded-xl bg-amber text-ink text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:brightness-110 transition-all text-center"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                  <span>Call {b.customerPhone}</span>
                                </a>

                                <a
                                  href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="py-2.5 px-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-center"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>WhatsApp</span>
                                </a>
                              </div>

                              <button
                                onClick={() => handleConfirmOrder(b.id)}
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-ink font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:brightness-110 shadow-lg shadow-emerald-950/40 transition-all"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                <span>Confirm Order & Unlock 25% Payment</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Portfolio Quick Access Banner (Admin Only) */}
              <div className="glass-card rounded-2xl p-5 border border-amber/30 bg-gradient-to-r from-amber/15 via-amber/5 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber/20 border border-amber/40 flex items-center justify-center text-amber shrink-0">
                    <Film className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                      Portfolio & Live Stage Proofs (Admin Only)
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber/20 text-amber font-bold">
                        {portfolioItems.length} Uploaded
                      </span>
                    </h4>
                    <p className="text-xs text-neutral-300">
                      Upload photos and live videos for finished stage projects. Manage or delete gallery items displayed on the public website.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('portfolio')}
                  className="px-4 py-2.5 rounded-xl bg-amber text-ink text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-lg shadow-amber/25 transition-all shrink-0 flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Open Portfolio Manager →</span>
                </button>
              </div>

              {/* Main Deployments Table */}
              <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-6">
                <h3 className="font-heading text-lg font-bold text-white">
                  Upcoming Stage Deployments & Schedule
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-neutral-400 font-mono uppercase tracking-wider">
                        <th className="pb-3">Client</th>
                        <th className="pb-3">Event Date</th>
                        <th className="pb-3">Rig Package</th>
                        <th className="pb-3">Advance (25%)</th>
                        <th className="pb-3">Balance (75%)</th>
                        <th className="pb-3">Payment</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 font-medium text-white">
                            <div>{b.customerName}</div>
                            <div className="text-[10px] text-neutral-400 font-mono">{b.customerPhone}</div>
                          </td>
                          <td className="py-3 text-neutral-300 font-mono">
                            {new Date(b.eventDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3 text-amber font-medium">{b.package?.name}</td>
                          <td className="py-3 font-mono text-emerald-400">{formatINR(b.advanceAmount)}</td>
                          <td className="py-3 font-mono text-neutral-300">{formatINR(b.balanceAmount)}</td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                                b.paymentStatus === 'ADVANCE_PAID'
                                  ? 'bg-emerald-950/70 border border-emerald-500/30 text-emerald-400'
                                  : 'bg-amber-950/70 border border-amber-500/30 text-amber-400'
                              }`}
                            >
                              {b.paymentStatus === 'ADVANCE_PAID' ? 'Date Locked' : 'Unpaid'}
                            </span>
                          </td>
                          <td className="py-3">
                            <span
                              className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                                b.status === 'PENDING'
                                  ? 'bg-amber-500/20 text-amber'
                                  : b.status === 'APPROVED'
                                  ? 'bg-sky-500/20 text-sky-400'
                                  : b.status === 'CONFIRMED'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-white/10 text-white'
                              }`}
                            >
                              {b.status === 'PENDING' ? 'Call Pending' : b.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            {b.status === 'PENDING' ? (
                              <button
                                onClick={() => handleConfirmOrder(b.id)}
                                className="px-2.5 py-1 rounded-lg bg-amber text-ink text-[11px] font-bold"
                              >
                                Confirm
                              </button>
                            ) : (
                              <button
                                onClick={() => handleCopyPaymentLink(b.id)}
                                className="px-2.5 py-1 rounded-lg glass-card border border-white/20 text-[11px] font-mono hover:text-white"
                                title="Copy Payment Link"
                              >
                                Link
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ALL BOOKINGS & STATUS MANAGEMENT */}
          {activeTab === 'bookings' && (
            <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-heading text-lg font-bold text-white">
                    All Bookings Registry & Operations Flow ({bookings.length})
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Step 1: Booking Submitted → Step 2: Call & Confirm → Step 3: 25% Advance Paid → Step 4: Gig Complete
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {bookings.map((b) => {
                  const cleanPhone = b.customerPhone.replace(/\D/g, '');
                  const dateStr = new Date(b.eventDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                  const paymentUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/pay?bookingId=${b.id}`;
                  const whatsappPaymentMsg = `Hello ${b.customerName}, your stage booking for ${b.package?.name} on ${dateStr} is confirmed! Please pay your 25% advance of ${formatINR(b.advanceAmount)} here to officially lock your date: ${paymentUrl}`;

                  return (
                    <div
                      key={b.id}
                      className={`p-6 rounded-3xl border transition-all ${
                        b.status === 'PENDING'
                          ? 'bg-amber-950/15 border-amber/40 shadow-xl'
                          : b.paymentStatus === 'ADVANCE_PAID'
                          ? 'bg-emerald-950/10 border-emerald-500/25'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Booking Info */}
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-heading text-lg font-bold text-white">
                              {b.customerName}
                            </span>
                            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber/15 text-amber font-semibold">
                              #{b.id.slice(0, 8)}
                            </span>
                            <span
                              className={`text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full ${
                                b.status === 'PENDING'
                                  ? 'bg-amber-500 text-ink animate-pulse'
                                  : b.status === 'APPROVED'
                                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                  : b.status === 'CONFIRMED'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-white/10 text-white'
                              }`}
                            >
                              {b.status === 'PENDING'
                                ? '📞 Needs Phone Call'
                                : b.status === 'APPROVED'
                                ? 'Call Confirmed • Awaiting Deposit'
                                : b.status}
                            </span>
                            <span
                              className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full ${
                                b.paymentStatus === 'ADVANCE_PAID'
                                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                                  : 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
                              }`}
                            >
                              {b.paymentStatus === 'ADVANCE_PAID' ? 'Date Locked' : '25% Advance Unpaid'}
                            </span>
                          </div>

                          <div className="text-xs text-neutral-300 font-mono flex flex-wrap items-center gap-3">
                            <span>📅 Date: <strong className="text-white">{dateStr}</strong></span>
                            <span>•</span>
                            <span>🎪 Rig: <strong className="text-amber">{b.package?.name}</strong></span>
                            <span>•</span>
                            <span>📞 Phone: <strong className="text-white">{b.customerPhone}</strong></span>
                          </div>

                          <div className="text-xs text-neutral-400">
                            📍 Venue: <span className="text-neutral-200">{b.venueAddress}</span>
                          </div>

                          {b.notes && (
                            <div className="text-xs text-amber-300/90 font-mono bg-black/40 p-2 rounded-xl border border-amber/20 mt-2">
                              Customer Notes: "{b.notes}"
                            </div>
                          )}

                          {b.bookingMaterials && b.bookingMaterials.length > 0 && (
                            <div className="mt-2.5 p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1.5">
                              <div className="text-[11px] font-mono text-haze uppercase font-semibold flex items-center gap-1.5">
                                <Package className="w-3.5 h-3.5 text-haze" />
                                <span>Selected Equipment / Materials ({b.bookingMaterials.length} items):</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px] text-neutral-300 font-mono">
                                {b.bookingMaterials.map((bm: any) => (
                                  <div key={bm.id} className="flex justify-between bg-black/40 px-2 py-1 rounded border border-white/5">
                                    <span>{bm.material?.name || 'Material'} × {bm.quantity}</span>
                                    <span className="text-amber">{formatINR(bm.totalPrice || bm.pricePerDay * bm.quantity)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Financials Breakdown */}
                        <div className="text-left lg:text-right border-t lg:border-t-0 border-white/10 pt-3 lg:pt-0 shrink-0">
                          <div className="text-base font-bold text-white font-mono">{formatINR(b.totalAmount)}</div>
                          <div className="text-xs text-amber font-mono">
                            25% Advance: {formatINR(b.advanceAmount)}
                          </div>
                          <div className="text-xs text-neutral-400 font-mono">
                            Balance: {formatINR(b.balanceAmount)}
                          </div>
                        </div>
                      </div>

                      {/* Interactive Actions Grid */}
                      <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                        {/* Call & WhatsApp direct buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href={`tel:${b.customerPhone}`}
                            className="px-3.5 py-2 rounded-xl bg-amber text-ink text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:brightness-110 transition-all shadow-md shadow-amber/20"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call Customer</span>
                          </a>

                          <a
                            href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                              `Hello ${b.customerName}, this is Eswari Sound System regarding your booking #${b.id.slice(0, 8)} for ${b.package?.name} on ${dateStr}. We are calling to confirm your venue power supply and timing.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/50 text-xs font-semibold flex items-center gap-1.5 transition-all"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>

                          {/* Order Confirmation toggle */}
                          {b.status === 'PENDING' && (
                            <button
                              onClick={() => handleConfirmOrder(b.id)}
                              className="px-4 py-2 rounded-xl bg-emerald-500 text-ink font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Confirm Order (Call Done)</span>
                            </button>
                          )}
                        </div>

                        {/* Payment & Life-Cycle Management */}
                        <div className="flex flex-wrap items-center gap-2">
                          {b.paymentStatus === 'UNPAID' && (
                            <>
                              <button
                                onClick={() => handleCopyPaymentLink(b.id)}
                                className="px-3 py-2 rounded-xl glass-card border border-white/20 text-xs font-mono text-neutral-300 hover:text-white flex items-center gap-1.5 hover:bg-white/10"
                                title="Copy 25% Advance Payment URL"
                              >
                                <Copy className="w-3.5 h-3.5 text-amber" />
                                <span>Copy Pay Link</span>
                              </button>

                              <a
                                href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(whatsappPaymentMsg)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 rounded-xl glass-card border border-amber/30 text-xs font-mono text-amber hover:bg-amber/10 flex items-center gap-1.5"
                                title="Send payment link on WhatsApp"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>WhatsApp Pay Link</span>
                              </a>

                              <button
                                onClick={() => handleMarkAdvancePaid(b.id)}
                                className="px-3 py-2 rounded-xl bg-sky-950/70 border border-sky-500/30 text-sky-400 hover:bg-sky-900/50 text-xs font-mono flex items-center gap-1.5"
                                title="Customer paid via cash, GPay, or bank transfer"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>Record Advance Paid</span>
                              </button>
                            </>
                          )}

                          {b.status !== 'COMPLETED' && b.paymentStatus === 'ADVANCE_PAID' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'COMPLETED')}
                              className="px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 text-xs font-mono"
                            >
                              Mark Gig Completed
                            </button>
                          )}

                          {b.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'CANCELLED')}
                              className="px-3 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 text-xs font-mono"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM INQUIRIES & QUOTE ISSUANCE */}
          {activeTab === 'inquiries' && (
            <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-6">
              <h3 className="font-heading text-lg font-bold text-white">
                Custom Festival Inquiries & Quotes ({inquiries.length})
              </h3>
              <div className="space-y-4">
                {inquiries.map((inq) => (
                  <div key={inq.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-heading text-base font-bold text-white">{inq.name}</span>
                        <span className="text-xs font-mono text-amber ml-2">[{inq.eventType}]</span>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                          inq.status === 'QUOTED'
                            ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-950/70 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        Status: {inq.status}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-400 font-mono">
                      Email: {inq.email} • Phone: {inq.phone} • Venue: {inq.venue || 'N/A'}
                    </div>

                    <div className="text-xs text-neutral-300 bg-black/40 p-3 rounded-xl border border-white/5 font-mono whitespace-pre-line">
                      {inq.message}
                    </div>

                    {inq.quoteAmount && (
                      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono text-emerald-300 flex justify-between items-center">
                        <span>Official Quoted Day Rate:</span>
                        <span className="font-bold text-sm text-emerald-400">{formatINR(inq.quoteAmount)}</span>
                      </div>
                    )}

                    {/* Quoting Box */}
                    {quotingInquiryId === inq.id ? (
                      <div className="pt-3 border-t border-white/10 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-mono text-neutral-300 block mb-1">
                              Quote Amount in Paise (e.g. 4500000 = ₹45,000)
                            </label>
                            <input
                              type="number"
                              value={quoteAmount}
                              onChange={(e) => setQuoteAmount(Number(e.target.value))}
                              className="w-full px-3 py-2 rounded-xl bg-ink border border-white/20 text-white text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-mono text-neutral-300 block mb-1">
                              Rig Inclusions Note
                            </label>
                            <input
                              type="text"
                              value={quoteDetails}
                              onChange={(e) => setQuoteDetails(e.target.value)}
                              placeholder="16-Box Line Array, 24 Moving Heads, Dual Silent Generator synch..."
                              className="w-full px-3 py-2 rounded-xl bg-ink border border-white/20 text-white text-xs"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSendQuote(inq.id)}
                            className="px-4 py-2 rounded-xl bg-amber text-ink font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Save & Issue Quotation</span>
                          </button>
                          <button
                            onClick={() => setQuotingInquiryId(null)}
                            className="px-4 py-2 rounded-xl glass-card text-neutral-300 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setQuotingInquiryId(inq.id);
                          setQuoteAmount(inq.quoteAmount || 3500000);
                          setQuoteDetails(inq.quoteDetails || '');
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-amber hover:underline"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{inq.status === 'QUOTED' ? 'Revise Quotation' : 'Issue Itemized Quotation'}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BLACKOUT CALENDAR MANAGER */}
          {activeTab === 'calendar' && (
            <div className="space-y-6">
              {/* Add Blackout Date */}
              <div className="glass-card-amber rounded-3xl p-6 border border-amber/30 space-y-4">
                <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-amber" />
                  <span>Add Blackout or Maintenance Holiday</span>
                </h3>
                <form onSubmit={handleAddBlackout} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="date"
                    required
                    value={newBlackoutDate}
                    onChange={(e) => setNewBlackoutDate(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-ink border border-white/20 text-white text-xs font-mono"
                  />
                  <input
                    type="text"
                    required
                    value={newBlackoutReason}
                    onChange={(e) => setNewBlackoutReason(e.target.value)}
                    placeholder="Reason (e.g. Depot Maintenance, Holiday)..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-ink border border-white/20 text-white text-xs"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber text-ink font-bold text-xs uppercase tracking-wider hover:brightness-110 shrink-0"
                  >
                    Block Date
                  </button>
                </form>
              </div>

              {/* Active Blackouts List */}
              <div className="glass-card rounded-3xl p-6 border border-white/10">
                <h3 className="font-heading text-lg font-bold text-white mb-4">
                  Current Blocked Dates ({blockedDates.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {blockedDates.map((b, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-mono text-xs text-white">{b.date}</div>
                        <div className="text-[11px] text-amber capitalize">{b.reason}</div>
                      </div>
                      <button
                        onClick={() => handleDeleteBlackout(b.date)}
                        className="p-2 text-neutral-400 hover:text-red-400 transition-colors"
                        title="Delete Blackout"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PORTFOLIO & FINISHED PROJECTS MANAGER */}
          {activeTab === 'portfolio' && (
            <div className="space-y-8">
              {/* Header card */}
              <div className="glass-card-amber rounded-3xl p-6 sm:p-8 border border-amber/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber/20 border border-amber/40 text-amber text-[11px] font-mono uppercase tracking-wider font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Admin Only Publishing Console</span>
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-white">
                    Finished Projects, Stage Proof & Video Footage
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl">
                    Upload high-res concert photos, line-array setup images, and live event video clips. Only verified admins can publish. All items appear immediately on the public <span className="text-amber font-mono">/gallery</span> page.
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <a
                    href="/gallery"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass-card border border-amber/30 text-amber font-mono text-xs uppercase tracking-wider hover:bg-amber hover:text-ink transition-all font-semibold"
                  >
                    <span>View Public Gallery</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Form & Live Preview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Column */}
                <div className="lg:col-span-7 glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber/10 border border-amber/30 flex items-center justify-center text-amber">
                      <FolderPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-heading text-lg font-bold text-white">
                        Upload & Publish Finished Project
                      </h4>
                      <p className="text-xs text-neutral-400">
                        Add live photos or video footage from completed events
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleCreatePortfolioItem} className="space-y-5">
                    {/* Media Type Selection */}
                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-400 mb-2">
                        Media Format *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPortMediaType('image')}
                          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-mono uppercase tracking-wider transition-all ${
                            portMediaType === 'image'
                              ? 'bg-amber text-ink font-bold border-amber shadow-lg shadow-amber/20'
                              : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <ImageIcon className="w-4 h-4" />
                          <span>Stage Photo / Rig Image</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPortMediaType('video')}
                          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-mono uppercase tracking-wider transition-all ${
                            portMediaType === 'video'
                              ? 'bg-amber text-ink font-bold border-amber shadow-lg shadow-amber/20'
                              : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <Video className="w-4 h-4" />
                          <span>Concert Video Footage</span>
                        </button>
                      </div>
                    </div>

                    {/* File Upload Dropzone */}
                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-400 mb-2">
                        {portMediaType === 'video' ? 'Upload Video Clip (.mp4, .webm, .mov)' : 'Upload Photo (.jpg, .png, .webp)'} *
                      </label>
                      <div className="border-2 border-dashed border-white/20 hover:border-amber/50 rounded-2xl p-6 text-center transition-all bg-white/[0.02]">
                        <input
                          type="file"
                          id="portfolioFileInput"
                          accept={portMediaType === 'video' ? 'video/mp4,video/webm,video/ogg,video/quicktime' : 'image/jpeg,image/png,image/webp,image/avif'}
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={portfolioUploading}
                        />
                        <label
                          htmlFor="portfolioFileInput"
                          className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                        >
                          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-amber group-hover:scale-110 transition-transform">
                            {portfolioUploading ? (
                              <RefreshCw className="w-6 h-6 animate-spin text-amber" />
                            ) : (
                              <Upload className="w-6 h-6 text-amber" />
                            )}
                          </div>
                          <div className="text-xs font-medium text-white">
                            {portfolioUploading ? (
                              <span className="text-amber animate-pulse">{uploadProgress || 'Uploading media file...'}</span>
                            ) : (
                              <span>Click to browse or drop {portMediaType === 'video' ? 'video' : 'photo'} file</span>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-400">
                            Stored in high-speed local storage (/uploads/portfolio/)
                          </p>
                        </label>
                      </div>

                      {/* Direct URL Fallback */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                          <span>Or enter media file path / URL directly:</span>
                        </div>
                        <input
                          type="text"
                          value={portMediaUrl}
                          onChange={(e) => setPortMediaUrl(e.target.value)}
                          placeholder="/uploads/portfolio/... or /assets/Viedos/... or https://..."
                          className="w-full px-4 py-2.5 rounded-xl bg-ink border border-white/20 text-white text-xs font-mono"
                          required
                        />
                      </div>
                    </div>

                    {/* Project Title */}
                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">
                        Event / Project Title *
                      </label>
                      <input
                        type="text"
                        value={portTitle}
                        onChange={(e) => setPortTitle(e.target.value)}
                        placeholder="e.g. Anirudh Live Arena Tour 2026"
                        className="w-full px-4 py-2.5 rounded-xl bg-ink border border-white/20 text-white text-xs"
                        required
                      />
                    </div>

                    {/* Category & Tag */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">
                          Category *
                        </label>
                        <select
                          value={portCategory}
                          onChange={(e) => setPortCategory(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-ink border border-white/20 text-white text-xs"
                        >
                          <option value="concert">Live Concerts & Music Tours</option>
                          <option value="wedding">Grand Destination Weddings</option>
                          <option value="college">College Cultural Fests</option>
                          <option value="corporate">Corporate Summits & Keynotes</option>
                          <option value="temple">Heritage & Temple Festivals</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">
                          Event Tag / Badge
                        </label>
                        <input
                          type="text"
                          value={portTag}
                          onChange={(e) => setPortTag(e.target.value)}
                          placeholder="e.g. Arena Concert, Luxury Wedding"
                          className="w-full px-4 py-2.5 rounded-xl bg-ink border border-white/20 text-white text-xs"
                        />
                      </div>
                    </div>

                    {/* Location & Crowd */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">
                          Location / Venue *
                        </label>
                        <input
                          type="text"
                          value={portLocation}
                          onChange={(e) => setPortLocation(e.target.value)}
                          placeholder="e.g. YMCA Grounds, Chennai"
                          className="w-full px-4 py-2.5 rounded-xl bg-ink border border-white/20 text-white text-xs"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">
                          Audience / Crowd Count
                        </label>
                        <input
                          type="text"
                          value={portCrowd}
                          onChange={(e) => setPortCrowd(e.target.value)}
                          placeholder="e.g. 10,000+ Attendees"
                          className="w-full px-4 py-2.5 rounded-xl bg-ink border border-white/20 text-white text-xs"
                        />
                      </div>
                    </div>

                    {/* Rig Specifications */}
                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">
                        Rig Specifications (Gear deployed)
                      </label>
                      <input
                        type="text"
                        value={portSpecs}
                        onChange={(e) => setPortSpecs(e.target.value)}
                        placeholder="e.g. 16-Box Flown Line Array, 24 Moving Heads, Dual 18-inch Subs"
                        className="w-full px-4 py-2.5 rounded-xl bg-ink border border-white/20 text-white text-xs"
                      />
                    </div>

                    {/* Date */}
                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">
                        Event Execution Date
                      </label>
                      <input
                        type="date"
                        value={portEventDate}
                        onChange={(e) => setPortEventDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-ink border border-white/20 text-white text-xs font-mono"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={portfolioSubmitting || portfolioUploading}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber to-amber-soft text-ink font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-amber/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {portfolioSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Publishing to Live Gallery...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Publish Finished Project To Gallery</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Live Preview Card Column */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-amber font-bold flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Live Public Card Preview</span>
                    </span>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      Real-time rendering
                    </span>
                  </div>

                  <div className="rounded-3xl overflow-hidden glass-card border border-amber/30 shadow-2xl flex flex-col justify-between">
                    {/* Media Block */}
                    <div className="h-64 w-full bg-neutral-900 relative overflow-hidden flex items-center justify-center">
                      {portMediaUrl ? (
                        portMediaType === 'video' ? (
                          <div className="w-full h-full relative group">
                            <video
                              src={portMediaUrl}
                              className="w-full h-full object-cover"
                              controls
                              muted
                              playsInline
                            />
                            <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/70 text-amber border border-amber/40 flex items-center gap-1.5 pointer-events-none">
                              <Video className="w-3 h-3 text-red-500 animate-pulse" />
                              <span>Live Concert Video</span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={portMediaUrl}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/70 text-amber border border-amber/40 flex items-center gap-1.5 pointer-events-none">
                              <ImageIcon className="w-3 h-3 text-amber" />
                              <span>{portTag || 'Stage Photo'}</span>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="text-center p-6 space-y-2">
                          <Film className="w-10 h-10 text-neutral-600 mx-auto" />
                          <p className="text-xs text-neutral-500">
                            Upload a photo or video to preview here
                          </p>
                        </div>
                      )}

                      {/* Crowd Badge if entered */}
                      {portCrowd && (
                        <span className="absolute top-3 right-3 text-[11px] font-mono text-neutral-200 bg-black/70 px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
                          <Users className="w-3 h-3 text-amber" />
                          <span>{portCrowd}</span>
                        </span>
                      )}

                      {/* Location Badge if entered */}
                      {portLocation && (
                        <div className="absolute bottom-3 left-3 text-xs text-neutral-200 font-mono bg-black/70 px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber" />
                          <span className="truncate max-w-[200px]">{portLocation}</span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-6 space-y-3 bg-neutral-950/60">
                      <h4 className="font-heading text-lg font-bold text-white">
                        {portTitle || 'Project Title Appears Here'}
                      </h4>
                      <div className="text-xs text-neutral-400 font-mono bg-white/5 p-3 rounded-xl border border-white/5">
                        <span className="text-amber font-semibold block mb-0.5">Rig Specifications:</span>
                        {portSpecs || 'Gear details will be displayed here...'}
                      </div>
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                        <span className="text-neutral-400 font-mono">100% In-House Gear</span>
                        <span className="text-amber font-mono font-medium">Ready For Live View</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Uploaded Finished Projects List */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <h4 className="font-heading text-xl font-bold text-white">
                      Live Portfolio Gallery Items ({portfolioItems.length})
                    </h4>
                    <p className="text-xs text-neutral-400">
                      Manage, inspect, and delete already finished projects visible on the public gallery
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      const res = await fetch('/api/admin/portfolio');
                      const data = await res.json();
                      if (data.success) setPortfolioItems(data.items);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh Projects</span>
                  </button>
                </div>

                {portfolioItems.length === 0 ? (
                  <div className="py-16 text-center text-neutral-400 font-mono text-xs">
                    No portfolio projects uploaded yet. Use the form above to add your first finished stage setup!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolioItems.map((item) => (
                      <div
                        key={item.id}
                        className="group rounded-2xl overflow-hidden glass-card border border-white/10 hover:border-amber/40 transition-all flex flex-col justify-between"
                      >
                        {/* Media Thumbnail */}
                        <div className="h-48 w-full bg-neutral-900 relative overflow-hidden">
                          {item.mediaType === 'video' ? (
                            <div className="w-full h-full relative bg-neutral-950 flex items-center justify-center">
                              <video
                                src={item.mediaUrl}
                                className="w-full h-full object-cover opacity-80"
                                preload="metadata"
                                muted
                              />
                              <div
                                onClick={() => setActiveMediaPreview(item)}
                                className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all cursor-pointer"
                              >
                                <div className="w-12 h-12 rounded-full bg-amber text-ink flex items-center justify-center shadow-lg shadow-amber/30 group-hover:scale-110 transition-transform">
                                  <Play className="w-5 h-5 fill-current ml-0.5" />
                                </div>
                              </div>
                              <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/80 text-amber border border-amber/30 flex items-center gap-1">
                                <Video className="w-3 h-3 text-red-500" />
                                <span>Video</span>
                              </span>
                            </div>
                          ) : (
                            <div
                              onClick={() => setActiveMediaPreview(item)}
                              className="w-full h-full cursor-pointer relative"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.mediaUrl}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/80 text-amber border border-amber/30 flex items-center gap-1">
                                <ImageIcon className="w-3 h-3 text-amber" />
                                <span>Photo</span>
                              </span>
                            </div>
                          )}

                          {item.tag && (
                            <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/80 text-white border border-white/20">
                              {item.tag}
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="text-[11px] font-mono text-amber uppercase tracking-wider mb-1">
                              {item.category} • {item.location}
                            </div>
                            <h5 className="font-heading text-base font-bold text-white group-hover:text-amber transition-colors line-clamp-1">
                              {item.title}
                            </h5>
                            {item.specs && (
                              <p className="text-xs text-neutral-400 font-mono mt-2 line-clamp-2 bg-white/5 p-2 rounded-lg">
                                {item.specs}
                              </p>
                            )}
                          </div>

                          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                            <button
                              onClick={() => setActiveMediaPreview(item)}
                              className="inline-flex items-center gap-1.5 text-xs text-neutral-300 hover:text-amber font-mono transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect Media</span>
                            </button>

                            <button
                              onClick={() => handleDeletePortfolioItem(item.id, item.title)}
                              className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-mono p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                              title="Delete project from portfolio"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: MATERIALS MANAGER */}
          {activeTab === 'materials' && (
            <div className="space-y-8">
              {/* Header */}
              <div className="glass-card-amber rounded-3xl p-6 sm:p-8 border border-haze/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-haze/10 border border-haze/30 text-haze text-[11px] font-mono uppercase tracking-wider font-bold">
                    <Package className="w-3.5 h-3.5" />
                    <span>Admin • Materials Rental Catalog</span>
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-white">
                    Manage Rentable Materials & Day Rates
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl">
                    Add, edit, or disable individual rental items. Customers can browse and add materials to their bookings through the custom packages system.
                  </p>
                </div>
                <div className="shrink-0">
                  <a
                    href="/packages"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass-card border border-haze/30 text-haze font-mono text-xs uppercase tracking-wider hover:bg-haze/10 transition-all font-semibold"
                  >
                    <span>View Public Catalog</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Add / Edit Form */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-haze/10 border border-haze/30 flex items-center justify-center text-haze">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-heading text-lg font-bold text-white">
                      {editingMaterial ? 'Edit Material' : 'Add New Rental Material'}
                    </h4>
                    <p className="text-xs text-neutral-400">
                      {editingMaterial ? 'Update material details and pricing' : 'Add individual items to the rentable materials catalog'}
                    </p>
                  </div>
                  {editingMaterial && (
                    <button
                      onClick={() => {
                        setEditingMaterial(null);
                        setMatName('');
                        setMatCategory('audio');
                        setMatDescription('');
                        setMatPricePerDay(100000);
                        setMatUnit('unit');
                        setMatIsAvailable(true);
                      }}
                      className="ml-auto p-2 rounded-xl glass-card text-neutral-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!matName || !matDescription) {
                      alert('Please fill in name and description');
                      return;
                    }

                    setMatSubmitting(true);
                    try {
                      const url = editingMaterial 
                        ? `/api/materials/${editingMaterial.id}`
                        : '/api/admin/materials';
                      const method = editingMaterial ? 'PUT' : 'POST';

                      const res = await fetch(url, {
                        method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          name: matName,
                          category: matCategory,
                          description: matDescription,
                          pricePerDay: matPricePerDay,
                          unit: matUnit,
                          isAvailable: matIsAvailable,
                        }),
                      });

                      const data = await res.json();
                      if (data.success) {
                        setActionMessage(
                          editingMaterial 
                            ? `Updated "${matName}" successfully!`
                            : `Added "${matName}" to rental catalog!`
                        );
                        
                        // Reset form
                        setEditingMaterial(null);
                        setMatName('');
                        setMatDescription('');
                        setMatPricePerDay(100000);
                        setMatUnit('unit');
                        setMatIsAvailable(true);
                        
                        // Refresh materials
                        fetchData();
                      } else {
                        alert(data.error || 'Failed to save material');
                      }
                    } catch (err) {
                      console.error(err);
                      alert('Server error saving material');
                    } finally {
                      setMatSubmitting(false);
                    }
                  }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">
                        Material Name *
                      </label>
                      <input
                        type="text"
                        value={matName}
                        onChange={(e) => setMatName(e.target.value)}
                        placeholder="e.g. Line Array Speaker Box"
                        className="w-full px-4 py-2.5 rounded-xl bg-ink border border-white/20 text-white text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">
                        Category *
                      </label>
                      <select
                        value={matCategory}
                        onChange={(e) => setMatCategory(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-ink border border-white/20 text-white text-xs"
                      >
                        <option value="audio">🔊 Audio Equipment</option>
                        <option value="lighting">💡 Lighting & Effects</option>
                        <option value="staging">🎭 Staging & Structure</option>
                        <option value="power">⚡ Power & Generators</option>
                        <option value="effects">✨ Special Effects</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">
                      Description *
                    </label>
                    <textarea
                      rows={2}
                      value={matDescription}
                      onChange={(e) => setMatDescription(e.target.value)}
                      placeholder="e.g. Professional grade dual 12-inch line array speaker with rigging hardware"
                      className="w-full px-4 py-2.5 rounded-xl bg-ink border border-white/20 text-white text-xs resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">
                        Price Per Day (₹) *
                      </label>
                      <input
                        type="number"
                        value={matPricePerDay / 100}
                        onChange={(e) => setMatPricePerDay(Number(e.target.value) * 100)}
                        placeholder="2500"
                        className="w-full px-4 py-2.5 rounded-xl bg-ink border border-white/20 text-white text-xs font-mono"
                        step="0.01"
                        min="0"
                        required
                      />
                      <p className="text-[11px] text-neutral-500 mt-1">
                        Enter in rupees (e.g., 2500 for ₹2,500)
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">
                        Unit Type
                      </label>
                      <select
                        value={matUnit}
                        onChange={(e) => setMatUnit(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-ink border border-white/20 text-white text-xs"
                      >
                        <option value="unit">Unit</option>
                        <option value="set">Set</option>
                        <option value="piece">Piece</option>
                        <option value="box">Box</option>
                        <option value="pair">Pair</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">
                        Availability Status
                      </label>
                      <button
                        type="button"
                        onClick={() => setMatIsAvailable(!matIsAvailable)}
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                          matIsAvailable
                            ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400'
                            : 'bg-red-950/60 border-red-500/30 text-red-400'
                        }`}
                      >
                        {matIsAvailable ? (
                          <>
                            <ToggleRight className="w-4 h-4" />
                            <span>Available for Rent</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4" />
                            <span>Disabled / Out of Stock</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={matSubmitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-haze to-haze-soft text-ink font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-haze/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {matSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{editingMaterial ? 'Updating...' : 'Adding...'}</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{editingMaterial ? 'Update Material' : 'Add To Catalog'}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Materials List */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <h4 className="font-heading text-xl font-bold text-white">
                      Materials Catalog ({materials.length})
                    </h4>
                    <p className="text-xs text-neutral-400">
                      All rental items organized by category with current pricing
                    </p>
                  </div>
                </div>

                {materials.length === 0 ? (
                  <div className="py-16 text-center text-neutral-400 font-mono text-xs">
                    No materials in catalog yet. Use the form above to add your first rental item!
                  </div>
                ) : (
                  <div className="space-y-6">
                    {(
                      Object.entries(
                        materials.reduce((acc, material) => {
                          const category = material.category;
                          if (!acc[category]) acc[category] = [];
                          acc[category].push(material);
                          return acc;
                        }, {} as Record<string, any[]>)
                      ) as [string, any[]][]
                    ).map(([category, items]) => {
                      const categoryIcons: Record<string, React.ReactNode> = {
                        audio: <Volume2 className="w-4 h-4 text-blue-400" />,
                        lighting: <Lightbulb className="w-4 h-4 text-yellow-400" />,
                        staging: <Layers className="w-4 h-4 text-purple-400" />,
                        power: <Battery className="w-4 h-4 text-green-400" />,
                        effects: <Wind className="w-4 h-4 text-pink-400" />,
                      };

                      return (
                        <div key={category} className="space-y-3">
                          <div className="flex items-center gap-2 py-2 border-b border-white/5">
                            {categoryIcons[category]}
                            <h5 className="font-heading text-base font-bold text-white capitalize">
                              {category === 'audio' ? 'Audio Equipment' :
                               category === 'lighting' ? 'Lighting & Effects' :
                               category === 'staging' ? 'Staging & Structure' :
                               category === 'power' ? 'Power & Generators' :
                               category === 'effects' ? 'Special Effects' : category}
                            </h5>
                            <span className="text-xs text-neutral-400 font-mono">
                              ({items.length} items)
                            </span>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {items.map((material) => (
                              <div
                                key={material.id}
                                className={`p-4 rounded-2xl border transition-all ${
                                  material.isAvailable
                                    ? 'bg-white/5 border-white/10 hover:border-white/20'
                                    : 'bg-red-950/10 border-red-500/20'
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h6 className="font-heading text-sm font-bold text-white">
                                      {material.name}
                                    </h6>
                                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                                      {material.description}
                                    </p>
                                  </div>
                                  <span
                                    className={`ml-3 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                                      material.isAvailable
                                        ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-red-950/70 text-red-400 border border-red-500/30'
                                    }`}
                                  >
                                    {material.isAvailable ? 'Available' : 'Disabled'}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                  <div className="text-xs font-mono">
                                    <span className="text-neutral-400">Rate: </span>
                                    <span className="text-amber font-bold">
                                      {formatINR(material.pricePerDay)}/{material.unit}/day
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={async () => {
                                        try {
                                          const res = await fetch('/api/admin/materials', {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                              id: material.id,
                                              isAvailable: !material.isAvailable,
                                            }),
                                          });
                                          const data = await res.json();
                                          if (data.success) {
                                            setActionMessage(`"${material.name}" is now ${!material.isAvailable ? 'available' : 'disabled'}.`);
                                            fetchData();
                                          }
                                        } catch (err) {
                                          console.error(err);
                                        }
                                      }}
                                      className={`p-1.5 rounded-lg transition-colors ${
                                        material.isAvailable
                                          ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                                          : 'text-neutral-500 hover:text-emerald-400 hover:bg-white/10'
                                      }`}
                                      title={material.isAvailable ? 'Click to disable / hide' : 'Click to enable / show'}
                                    >
                                      {material.isAvailable ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                    </button>

                                    <button
                                      onClick={() => {
                                        setEditingMaterial(material);
                                        setMatName(material.name);
                                        setMatCategory(material.category);
                                        setMatDescription(material.description);
                                        setMatPricePerDay(material.pricePerDay);
                                        setMatUnit(material.unit);
                                        setMatIsAvailable(material.isAvailable);
                                        window.scrollTo({ top: 400, behavior: 'smooth' });
                                      }}
                                      className="p-1.5 rounded-lg text-neutral-400 hover:text-amber hover:bg-amber/10 transition-colors"
                                      title="Edit material"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      onClick={async () => {
                                        if (!confirm(`Delete "${material.name}" from catalog?`)) return;
                                        try {
                                          const res = await fetch(`/api/materials/${material.id}`, {
                                            method: 'DELETE',
                                          });
                                          const data = await res.json();
                                          if (data.success) {
                                            setActionMessage(`Deleted "${material.name}" from catalog.`);
                                            fetchData();
                                          } else {
                                            alert(data.error || 'Failed to delete');
                                          }
                                        } catch (err) {
                                          console.error(err);
                                          alert('Delete error');
                                        }
                                      }}
                                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                      title="Delete material"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Admin Media Inspection Modal */}
      {activeMediaPreview && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full glass-card rounded-3xl border border-white/20 overflow-hidden shadow-2xl space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-amber">
                  {activeMediaPreview.category} • {activeMediaPreview.location}
                </span>
                <h4 className="font-heading text-xl font-bold text-white">
                  {activeMediaPreview.title}
                </h4>
              </div>
              <button
                onClick={() => setActiveMediaPreview(null)}
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black max-h-[65vh] flex items-center justify-center">
              {activeMediaPreview.mediaType === 'video' ? (
                <video
                  src={activeMediaPreview.mediaUrl}
                  controls
                  autoPlay
                  className="w-full max-h-[60vh] object-contain"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={activeMediaPreview.mediaUrl}
                  alt={activeMediaPreview.title}
                  className="w-full max-h-[60vh] object-contain"
                />
              )}
            </div>

            {activeMediaPreview.specs && (
              <div className="text-xs font-mono text-neutral-300 bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-amber font-semibold">Rig Deployed: </span>
                {activeMediaPreview.specs}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
