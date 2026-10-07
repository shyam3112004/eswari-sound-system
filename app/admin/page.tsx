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
  const [matImages, setMatImages] = useState<string[]>([]);
  const [matImageUploading, setMatImageUploading] = useState(false);
  const [matFormOpen, setMatFormOpen] = useState(false);
  const [matCustomCategory, setMatCustomCategory] = useState('');

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const resetMatForm = () => {
    setEditingMaterial(null);
    setMatName('');
    setMatCategory('audio');
    setMatCustomCategory('');
    setMatDescription('');
    setMatPricePerDay(100000);
    setMatUnit('unit');
    setMatIsAvailable(true);
    setMatImages([]);
  };

  const openMatForm = () => {
    setMatFormOpen(true);
    setTimeout(() => {
      window.scrollTo({ top: 340, behavior: 'smooth' });
    }, 50);
  };

  const handleMatImageUpload = async (file: File | null) => {
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      alert('Invalid image type. Please upload JPG, PNG or WebP only.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      alert('Image too large. Maximum allowed size is 5 MB per photo.');
      return;
    }
    setMatImageUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'materials');
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        setMatImages((prev) => [...prev, data.url]);
      } else {
        alert(data.error || 'Image upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Image upload failed');
    } finally {
      setMatImageUploading(false);
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-white/[0.12] gap-5">
        <div>
          <span className="label label-amber">Live admin · staff only</span>
          <h1 className="font-heading text-h2 text-white mt-2">
            Production console
          </h1>
          <p className="mt-2 text-spec text-fg-muted font-mono">
            Logged in as{' '}
            <span className="text-amber">{adminUser?.email || 'admin@eswarisound.com'}</span>
          </p>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={fetchData}
            className="link-arrow"
            title="Refresh Data"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleLogout}
            className="link-arrow hover:!text-red-400"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="alert alert-success mt-6 flex items-center gap-2" role="status">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Stats — open cells on hairlines, no tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 mt-8">
        <div className="border-t border-white/10 py-6 pr-6">
          <span className="label">Total bookings</span>
          <div className="font-heading text-4xl font-black text-white mt-2 tabular-nums">
            {bookings.length}
          </div>
          <span className="label label-amber !text-[9px] mt-1 block">
            Live date reservations
          </span>
        </div>

        <div className="border-t border-white/10 py-6 pr-6">
          <span className="label label-amber">Needing call confirm</span>
          <div className="font-heading text-4xl font-black text-amber mt-2 tabular-nums">
            {bookings.filter((b) => b.status === 'PENDING').length}
          </div>
          <span className="label !text-[9px] mt-1 block">Call customer, then approve</span>
        </div>

        <div className="border-t border-white/10 py-6 pr-6">
          <span className="label">Custom inquiries</span>
          <div className="font-heading text-4xl font-black text-white mt-2 tabular-nums">
            {inquiries.length}
          </div>
          <span className="label !text-[9px] mt-1 block">Concerts &amp; multi-day fests</span>
        </div>

        <div className="border-t border-white/10 py-6 pr-6">
          <span className="label">Calendar blackouts</span>
          <div className="font-heading text-4xl font-black text-white mt-2 tabular-nums">
            {blockedDates.length}
          </div>
          <span className="label !text-[9px] mt-1 block">Holidays &amp; locked dates</span>
        </div>

        <button
          onClick={() => setActiveTab('portfolio')}
          className="border-t border-white/10 py-6 pr-6 text-left group"
          title="Click to manage Portfolio"
        >
          <span className="label group-hover:text-amber transition-colors">
            Portfolio →
          </span>
          <div className="font-heading text-4xl font-black text-white mt-2 tabular-nums">
            {portfolioItems.length}
          </div>
          <span className="label !text-[9px] mt-1 block">Live photos &amp; videos</span>
        </button>

        <button
          onClick={() => setActiveTab('materials')}
          className="border-t border-white/10 py-6 pr-6 text-left group"
          title="Click to manage Materials"
        >
          <span className="label group-hover:text-amber transition-colors">
            Materials →
          </span>
          <div className="font-heading text-4xl font-black text-white mt-2 tabular-nums">
            {materials.length}
          </div>
          <span className="label !text-[9px] mt-1 block">Rental items catalog</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-start gap-2 border-b border-white/[0.12] mt-8 mb-10 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[
          { id: 'overview', label: 'Production Queue', icon: Layers },
          { id: 'bookings', label: 'All Bookings & Status', icon: Calendar },
          { id: 'inquiries', label: 'Festival Inquiries & Quotes', icon: FileText },
          { id: 'calendar', label: 'Blackout Calendar Manager', icon: Clock },
          { id: 'portfolio', label: `Portfolio (${portfolioItems.length})`, icon: Film },
          { id: 'materials', label: `Materials (${materials.length})`, icon: Package },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`tab ${isActive ? 'is-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.label}
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
                <div className="hairline pt-6 pb-8 space-y-4">
                  <div>
                    <span className="label label-amber">
                      Action required · {bookings.filter((b) => b.status === 'PENDING').length} waiting
                    </span>
                    <h3 className="font-heading text-h4 text-white mt-2">
                      Call the customer to confirm the order
                    </h3>
                    <p className="mt-1.5 text-small text-fg-muted leading-relaxed max-w-measure">
                      Verify venue, power and stage clearance before the 25%
                      payment link goes out.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
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
                          <article
                            key={b.id}
                            className="border-t border-white/10 py-5 flex flex-col gap-4"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-heading text-base font-bold text-white truncate">
                                  {b.customerName}
                                </span>
                                <span className="label !text-[9px] shrink-0">
                                  #{b.id.slice(0, 8)}
                                </span>
                              </div>
                              <div className="text-small text-fg-soft">
                                <span className="font-mono text-white">{dateStr}</span> • Rig: <span className="text-amber font-semibold">{b.package?.name}</span>
                              </div>
                              <div className="text-small text-fg-muted">
                                Venue: <span className="text-fg-soft">{b.venueAddress}</span>
                              </div>
                              {b.notes && (
                                <div className="text-spec text-fg-muted font-mono italic border-l border-white/15 pl-3">
                                  &ldquo;{b.notes}&rdquo;
                                </div>
                              )}
                              <div className="pt-2 text-small flex justify-between gap-4 border-t border-white/10 font-mono">
                                <span className="label">25% advance</span>
                                <span className="text-amber font-bold tabular-nums">{formatINR(b.advanceAmount)}</span>
                              </div>
                            </div>

                            {/* Direct call & WhatsApp actions */}
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                                <a
                                  href={`tel:${b.customerPhone}`}
                                  className="link-arrow label-amber"
                                >
                                  <span>Call {b.customerPhone}</span>
                                </a>

                                <a
                                  href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="link-arrow"
                                >
                                  <span>WhatsApp</span>
                                </a>

                              <button
                                onClick={() => handleConfirmOrder(b.id)}
                                className="link-arrow !text-emerald-400"
                              >
                                <span>Confirm Order & Unlock 25% Payment</span>
                              </button>
                            </div>
                          </article>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Portfolio Quick Access Banner (Admin Only) */}
              <div className="hairline py-6 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
                <div>
                  <span className="label label-amber">
                    Portfolio · {portfolioItems.length} uploaded
                  </span>
                  <h4 className="font-heading text-h4 text-white mt-2">
                    Live stage proofs, admin only
                  </h4>
                  <p className="mt-1.5 text-small text-fg-muted leading-relaxed max-w-measure">
                    Photos and video from finished builds. These are what the
                    public gallery shows.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('portfolio')}
                  className="link-arrow shrink-0"
                >
                  <span>Open portfolio manager</span>
                </button>
              </div>

              {/* Main Deployments Table */}
              <div className="hairline pt-6 pb-8 space-y-6">
                <h3 className="font-heading text-h4 text-white">
                  Upcoming stage deployments
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.12] label">
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
                              className={`text-[10px] font-mono font-semibold ${
                                b.paymentStatus === 'ADVANCE_PAID'
                                  ? 'text-emerald-400'
                                  : 'text-amber'
                              }`}
                            >
                              {b.paymentStatus === 'ADVANCE_PAID' ? 'Date Locked' : 'Unpaid'}
                            </span>
                          </td>
                          <td className="py-3">
                            <span
                              className={`font-mono text-[10px] uppercase font-bold ${
                                b.status === 'PENDING'
                                  ? 'text-amber'
                                  : b.status === 'APPROVED'
                                  ? 'text-sky-400'
                                  : b.status === 'CONFIRMED'
                                  ? 'text-emerald-400'
                                  : 'text-fg-soft'
                              }`}
                            >
                              {b.status === 'PENDING' ? 'Call Pending' : b.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            {b.status === 'PENDING' ? (
                              <button
                                onClick={() => handleConfirmOrder(b.id)}
                                className="link-arrow !text-[9px] label-amber"
                              >
                                Confirm
                              </button>
                            ) : (
                              <button
                                onClick={() => handleCopyPaymentLink(b.id)}
                                className="link-arrow !text-[9px]"
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
            <div className="hairline pt-6 pb-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-heading text-h4 text-white">
                    All Bookings Registry & Operations Flow ({bookings.length})
                  </h3>
                  <p className="mt-1.5 text-small text-fg-muted">
                    Step 1: Booking Submitted → Step 2: Call & Confirm → Step 3: 25% Advance Paid → Step 4: Gig Complete
                  </p>
                </div>
              </div>

              <div>
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
                    <article
                      key={b.id}
                      className="border-t border-white/10 py-7"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Booking Info */}
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                            <span className="font-heading text-lg font-bold text-white">
                              {b.customerName}
                            </span>
                            <span className="label !text-[9px]">
                              #{b.id.slice(0, 8)}
                            </span>
                            <span
                              className={`text-[10px] font-mono uppercase font-bold ${
                                b.status === 'PENDING'
                                  ? 'text-amber'
                                  : b.status === 'APPROVED'
                                  ? 'text-sky-400'
                                  : b.status === 'CONFIRMED'
                                  ? 'text-emerald-400'
                                  : 'text-fg-soft'
                              }`}
                            >
                              {b.status === 'PENDING'
                                ? 'Needs Phone Call'
                                : b.status === 'APPROVED'
                                ? 'Call Confirmed • Awaiting Deposit'
                                : b.status}
                            </span>
                            <span
                              className={`text-[10px] font-mono uppercase font-bold ${
                                b.paymentStatus === 'ADVANCE_PAID'
                                  ? 'text-emerald-400'
                                  : 'text-amber'
                              }`}
                            >
                              {b.paymentStatus === 'ADVANCE_PAID' ? 'Date Locked' : '25% Advance Unpaid'}
                            </span>
                          </div>

                          <div className="text-spec text-fg-soft font-mono flex flex-wrap items-center gap-3">
                            <span>Date: <strong className="text-white">{dateStr}</strong></span>
                            <span>•</span>
                            <span>Rig: <strong className="text-amber">{b.package?.name}</strong></span>
                            <span>•</span>
                            <span>Phone: <strong className="text-white">{b.customerPhone}</strong></span>
                          </div>

                          <div className="text-small text-fg-muted">
                            Venue: <span className="text-fg-soft">{b.venueAddress}</span>
                          </div>

                          {b.notes && (
                            <div className="text-spec text-fg-muted font-mono border-l border-amber/40 pl-3 mt-2">
                              Customer Notes: &ldquo;{b.notes}&rdquo;
                            </div>
                          )}

                          {b.bookingMaterials && b.bookingMaterials.length > 0 && (
                            <div className="mt-3 border-t border-white/10 pt-3 space-y-1.5">
                              <div className="label">
                                <span>Selected Equipment / Materials ({b.bookingMaterials.length} items):</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 text-spec text-fg-soft font-mono">
                                {b.bookingMaterials.map((bm: any) => (
                                  <div key={bm.id} className="flex justify-between gap-3 py-0.5">
                                    <span>{bm.material?.name || 'Material'} × {bm.quantity}</span>
                                    <span className="text-amber tabular-nums">{formatINR(bm.totalPrice || bm.pricePerDay * bm.quantity)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Financials Breakdown */}
                        <div className="text-left lg:text-right border-t lg:border-t-0 border-white/10 pt-3 lg:pt-0 lg:pl-8 shrink-0">
                          <div className="text-xl font-bold text-white font-mono tabular-nums">{formatINR(b.totalAmount)}</div>
                          <div className="text-spec text-amber font-mono tabular-nums">
                            25% Advance: {formatINR(b.advanceAmount)}
                          </div>
                          <div className="text-spec text-fg-muted font-mono tabular-nums">
                            Balance: {formatINR(b.balanceAmount)}
                          </div>
                        </div>
                      </div>

                      {/* Interactive Actions Grid */}
                      <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
                        {/* Call & WhatsApp direct buttons */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                          <a
                            href={`tel:${b.customerPhone}`}
                            className="link-arrow label-amber"
                          >
                            <span>Call Customer</span>
                          </a>

                          <a
                            href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                              `Hello ${b.customerName}, this is Eswari Sound System regarding your booking #${b.id.slice(0, 8)} for ${b.package?.name} on ${dateStr}. We are calling to confirm your venue power supply and timing.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-arrow"
                          >
                            <span>WhatsApp</span>
                          </a>

                          {/* Order Confirmation toggle */}
                          {b.status === 'PENDING' && (
                            <button
                              onClick={() => handleConfirmOrder(b.id)}
                              className="link-arrow !text-emerald-400"
                            >
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
                                className="link-arrow"
                                title="Copy 25% Advance Payment URL"
                              >
                                <span>Copy Pay Link</span>
                              </button>

                              <a
                                href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(whatsappPaymentMsg)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link-arrow label-amber"
                                title="Send payment link on WhatsApp"
                              >
                                <span>WhatsApp Pay Link</span>
                              </a>

                              <button
                                onClick={() => handleMarkAdvancePaid(b.id)}
                                className="link-arrow !text-sky-400"
                                title="Customer paid via cash, GPay, or bank transfer"
                              >
                                <span>Record Advance Paid</span>
                              </button>
                            </>
                          )}

                          {b.status !== 'COMPLETED' && b.paymentStatus === 'ADVANCE_PAID' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'COMPLETED')}
                              className="link-arrow !text-emerald-400"
                            >
                              Mark Gig Completed
                            </button>
                          )}

                          {b.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'CANCELLED')}
                              className="link-arrow hover:!text-red-400"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM INQUIRIES & QUOTE ISSUANCE */}
          {activeTab === 'inquiries' && (
            <div className="hairline pt-6 pb-8 space-y-6">
              <h3 className="font-heading text-h4 text-white">
                Custom Festival Inquiries & Quotes ({inquiries.length})
              </h3>
              <div>
                {inquiries.map((inq) => (
                  <div key={inq.id} className="border-t border-white/10 py-6 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-heading text-base font-bold text-white">
                          {inq.name}
                        </span>
                        <span className="text-spec font-mono text-amber ml-2">
                          [{inq.eventType}]
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase ${
                          inq.status === 'QUOTED'
                            ? 'text-emerald-400'
                            : 'text-amber'
                        }`}
                      >
                        Status: {inq.status}
                      </span>
                    </div>

                    <div className="text-spec text-fg-muted font-mono">
                      Email: {inq.email} • Phone: {inq.phone} • Venue: {inq.venue || 'N/A'}
                    </div>

                    <div className="text-small text-fg-soft border-l border-white/15 pl-4 whitespace-pre-line max-w-measure leading-relaxed">
                      {inq.message}
                    </div>

                    {inq.quoteAmount && (
                      <div className="border-t border-white/10 pt-3 flex justify-between items-baseline gap-4">
                        <span className="label">Quoted day rate</span>
                        <span className="font-mono font-bold text-amber tabular-nums">
                          {formatINR(inq.quoteAmount)}
                        </span>
                      </div>
                    )}

                    {/* Quoting Box */}
                    {quotingInquiryId === inq.id ? (
                      <div className="pt-3 border-t border-white/10 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="field-label">
                              Quote Amount in Paise (e.g. 4500000 = ₹45,000)
                            </label>
                            <input
                              type="number"
                              value={quoteAmount}
                              onChange={(e) => setQuoteAmount(Number(e.target.value))}
                              className="field text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="field-label">
                              Rig Inclusions Note
                            </label>
                            <input
                              type="text"
                              value={quoteDetails}
                              onChange={(e) => setQuoteDetails(e.target.value)}
                              placeholder="16-Box Line Array, 24 Moving Heads, Dual Silent Generator synch..."
                              className="field text-xs"
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-5">
                          <button
                            onClick={() => handleSendQuote(inq.id)}
                            className="btn-primary btn-primary-sm"
                          >
                            <span>Issue quotation</span>
                          </button>
                          <button
                            onClick={() => setQuotingInquiryId(null)}
                            className="link-arrow"
                          >
                            <span>Cancel</span>
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
              <div className="hairline pt-6 pb-8 space-y-4">
                <h3 className="font-heading text-h4 text-white">
                  <span className="label label-amber block mb-1.5">Calendar</span>
                  Add a blackout or maintenance day
                </h3>
                <form onSubmit={handleAddBlackout} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="date"
                    required
                    value={newBlackoutDate}
                    onChange={(e) => setNewBlackoutDate(e.target.value)}
                    className="field w-full text-xs font-mono"
                  />
                  <input
                    type="text"
                    required
                    value={newBlackoutReason}
                    onChange={(e) => setNewBlackoutReason(e.target.value)}
                    placeholder="Reason (e.g. Depot Maintenance, Holiday)..."
                    className="flex-1 field w-full text-xs"
                  />
                  <button
                    type="submit"
                    className="btn-primary btn-primary-sm shrink-0"
                  >
                    Block Date
                  </button>
                </form>
              </div>

              {/* Active Blackouts List */}
              <div className="hairline pt-6 pb-8">
                <h3 className="font-heading text-h4 text-white mb-4">
                  Current Blocked Dates ({blockedDates.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8">
                  {blockedDates.map((b, i) => (
                    <div
                      key={i}
                      className="border-t border-white/10 py-4 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="font-mono text-small text-white">{b.date}</div>
                        <div className="label label-amber !text-[9px] capitalize">{b.reason}</div>
                      </div>
                      <button
                        onClick={() => handleDeleteBlackout(b.date)}
                        className="link-arrow hover:!text-red-400"
                        title="Delete Blackout"
                      >
                        <span>Remove</span>
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
              <div className="hairline pt-6 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className="label label-amber">Admin only · publishing console</span>
                  <h3 className="font-heading text-h3 text-white">
                    Finished Projects, Stage Proof & Video Footage
                  </h3>
                  <p className="text-small text-fg-muted leading-relaxed max-w-measure">
                    Upload high-res concert photos, line-array setup images, and live event video clips. Only verified admins can publish. All items appear immediately on the public <span className="text-amber font-mono">/gallery</span> page.
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <a
                    href="/gallery"
                    target="_blank"
                    rel="noreferrer"
                    className="link-arrow"
                  >
                    <span>View Public Gallery</span>
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                  </a>
                </div>
              </div>

              {/* Form & Live Preview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Column */}
                <div className="lg:col-span-7 hairline pt-6 pb-8 space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <span className="label label-amber">New entry</span>
                    <h4 className="font-heading text-h4 text-white mt-1.5">
                      Upload &amp; publish finished project
                    </h4>
                    <p className="mt-1 text-small text-fg-muted">
                      Photos or video from a completed event
                    </p>
                  </div>

                  <form onSubmit={handleCreatePortfolioItem} className="space-y-5">
                    {/* Media Type Selection */}
                    <div>
                      <span className="field-label">Media format *</span>
                      <div className="flex items-start gap-6 border-b border-white/[0.12]">
                        <button
                          type="button"
                          onClick={() => setPortMediaType('image')}
                          className={`tab ${portMediaType === 'image' ? 'is-active' : ''}`}
                        >
                          Stage photo / rig image
                        </button>
                        <button
                          type="button"
                          onClick={() => setPortMediaType('video')}
                          className={`tab ${portMediaType === 'video' ? 'is-active' : ''}`}
                        >
                          Concert video footage
                        </button>
                      </div>
                    </div>

                    {/* File Upload Dropzone */}
                    <div>
                      <label className="field-label">
                        {portMediaType === 'video' ? 'Upload Video Clip (.mp4, .webm, .mov)' : 'Upload Photo (.jpg, .png, .webp)'} *
                      </label>
                      <div className="border border-dashed border-white/[0.18] hover:border-amber/60 p-7 text-center transition-colors">
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
                          <div className="flex items-center justify-center text-amber">
                            {portfolioUploading ? (
                              <RefreshCw className="w-6 h-6 animate-spin text-amber" />
                            ) : (
                              <Upload className="w-6 h-6 text-amber" />
                            )}
                          </div>
                          <div className="text-small text-white">
                            {portfolioUploading ? (
                              <span className="text-amber animate-pulse">{uploadProgress || 'Uploading media file...'}</span>
                            ) : (
                              <span>Click to browse or drop {portMediaType === 'video' ? 'video' : 'photo'} file</span>
                            )}
                          </div>
                          <p className="label mt-1">
                            Stored in high-speed local storage (/uploads/portfolio/)
                          </p>
                        </label>
                      </div>

                      {/* Direct URL Fallback */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between label mb-1">
                          <span>Or enter media file path / URL directly:</span>
                        </div>
                        <input
                          type="text"
                          value={portMediaUrl}
                          onChange={(e) => setPortMediaUrl(e.target.value)}
                          placeholder="/uploads/portfolio/... or /assets/Viedos/... or https://..."
                          className="field text-xs font-mono"
                          required
                        />
                      </div>
                    </div>

                    {/* Project Title */}
                    <div>
                      <label className="field-label">
                        Event / Project Title *
                      </label>
                      <input
                        type="text"
                        value={portTitle}
                        onChange={(e) => setPortTitle(e.target.value)}
                        placeholder="e.g. Anirudh Live Arena Tour 2026"
                        className="field text-xs"
                        required
                      />
                    </div>

                    {/* Category & Tag */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="field-label">
                          Category *
                        </label>
                        <select
                          value={portCategory}
                          onChange={(e) => setPortCategory(e.target.value)}
                          className="field text-xs"
                        >
                          <option value="concert">Live Concerts & Music Tours</option>
                          <option value="wedding">Grand Destination Weddings</option>
                          <option value="college">College Cultural Fests</option>
                          <option value="corporate">Corporate Summits & Keynotes</option>
                          <option value="temple">Heritage & Temple Festivals</option>
                        </select>
                      </div>

                      <div>
                        <label className="field-label">
                          Event Tag / Badge
                        </label>
                        <input
                          type="text"
                          value={portTag}
                          onChange={(e) => setPortTag(e.target.value)}
                          placeholder="e.g. Arena Concert, Luxury Wedding"
                          className="field text-xs"
                        />
                      </div>
                    </div>

                    {/* Location & Crowd */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="field-label">
                          Location / Venue *
                        </label>
                        <input
                          type="text"
                          value={portLocation}
                          onChange={(e) => setPortLocation(e.target.value)}
                          placeholder="e.g. YMCA Grounds, Chennai"
                          className="field text-xs"
                          required
                        />
                      </div>

                      <div>
                        <label className="field-label">
                          Audience / Crowd Count
                        </label>
                        <input
                          type="text"
                          value={portCrowd}
                          onChange={(e) => setPortCrowd(e.target.value)}
                          placeholder="e.g. 10,000+ Attendees"
                          className="field text-xs"
                        />
                      </div>
                    </div>

                    {/* Rig Specifications */}
                    <div>
                      <label className="field-label">
                        Rig Specifications (Gear deployed)
                      </label>
                      <input
                        type="text"
                        value={portSpecs}
                        onChange={(e) => setPortSpecs(e.target.value)}
                        placeholder="e.g. 16-Box Flown Line Array, 24 Moving Heads, Dual 18-inch Subs"
                        className="field text-xs"
                      />
                    </div>

                    {/* Date */}
                    <div>
                      <label className="field-label">
                        Event Execution Date
                      </label>
                      <input
                        type="date"
                        value={portEventDate}
                        onChange={(e) => setPortEventDate(e.target.value)}
                        className="field text-xs font-mono"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={portfolioSubmitting || portfolioUploading}
                      className="btn-primary w-full"
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
                    <span className="label label-amber flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Live Public Card Preview</span>
                    </span>
                    <span className="label">
                      Real-time rendering
                    </span>
                  </div>

                  <div className="border-t border-white/[0.12] pt-4 flex flex-col">
                    {/* Media Block */}
                    <div className="h-64 w-full bg-ink-raised relative overflow-hidden flex items-center justify-center">
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
                            <div className="absolute top-3 left-3 px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.14em] bg-black/75 text-amber flex items-center gap-1.5 pointer-events-none">
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
                            <div className="absolute top-3 left-3 px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.14em] bg-black/75 text-amber flex items-center gap-1.5 pointer-events-none">
                              <ImageIcon className="w-3 h-3 text-amber" />
                              <span>{portTag || 'Stage Photo'}</span>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="text-center p-6 space-y-2">
                          <Film className="w-8 h-8 text-fg-muted mx-auto" />
                          <p className="text-small text-fg-muted">
                            Upload a photo or video to preview here
                          </p>
                        </div>
                      )}

                      {/* Crowd Badge if entered */}
                      {portCrowd && (
                        <span className="absolute top-3 right-3 text-[11px] font-mono text-fg bg-black/75 px-2 py-1 flex items-center gap-1">
                          <Users className="w-3 h-3 text-amber" />
                          <span>{portCrowd}</span>
                        </span>
                      )}

                      {/* Location Badge if entered */}
                      {portLocation && (
                        <div className="absolute bottom-3 left-3 text-xs text-fg font-mono bg-black/75 px-2 py-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber" />
                          <span className="truncate max-w-[200px]">{portLocation}</span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="pt-4 space-y-3">
                      <h4 className="font-heading text-lg font-bold text-white">
                        {portTitle || 'Project Title Appears Here'}
                      </h4>
                      <div className="text-spec font-mono text-fg-muted border-l-2 border-amber/50 pl-3">
                        <span className="text-amber font-semibold block mb-0.5">Rig specifications</span>
                        {portSpecs || 'Gear details will be displayed here...'}
                      </div>
                      <div className="pt-3 border-t border-white/[0.12] flex items-center justify-between text-spec">
                        <span className="label">100% in-house gear</span>
                        <span className="label label-amber">Ready for live view</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Uploaded Finished Projects List */}
              <div className="hairline pt-6 pb-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <h4 className="font-heading text-h4 text-white">
                      Live Portfolio Gallery Items ({portfolioItems.length})
                    </h4>
                    <p className="text-small text-fg-muted">
                      Manage, inspect, and delete already finished projects visible on the public gallery
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      const res = await fetch('/api/admin/portfolio');
                      const data = await res.json();
                      if (data.success) setPortfolioItems(data.items);
                    }}
                    className="link-arrow shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh Projects</span>
                  </button>
                </div>

                {portfolioItems.length === 0 ? (
                  <div className="py-16 text-center label">
                    No portfolio projects uploaded yet. Use the form above to add your first finished stage setup!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolioItems.map((item) => (
                      <div
                        key={item.id}
                        className="group border-t border-white/[0.12] hover:border-amber/60 transition-colors pt-4 flex flex-col justify-between"
                      >
                        {/* Media Thumbnail */}
                        <div className="h-48 w-full bg-ink-raised relative overflow-hidden">
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
                                <div className="w-11 h-11 bg-amber text-ink flex items-center justify-center transition-transform">
                                  <Play className="w-5 h-5 fill-current ml-0.5" />
                                </div>
                              </div>
                              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-[0.14em] bg-black/80 text-amber flex items-center gap-1">
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
                              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-[0.14em] bg-black/80 text-amber flex items-center gap-1">
                                <ImageIcon className="w-3 h-3 text-amber" />
                                <span>Photo</span>
                              </span>
                            </div>
                          )}

                          {item.tag && (
                            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-[0.14em] bg-black/80 text-fg">
                              {item.tag}
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="pt-4 pb-1 space-y-3 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="label label-amber mb-1.5">
                              {item.category} • {item.location}
                            </div>
                            <h5 className="font-heading text-h4 text-white group-hover:text-amber transition-colors line-clamp-1">
                              {item.title}
                            </h5>
                            {item.specs && (
                              <p className="text-spec font-mono text-fg-muted mt-2 line-clamp-2">
                                {item.specs}
                              </p>
                            )}
                          </div>

                          <div className="pt-3 border-t border-white/[0.12] flex items-center justify-between">
                            <button
                              onClick={() => setActiveMediaPreview(item)}
                              className="link-arrow"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect Media</span>
                            </button>

                            <button
                              onClick={() => handleDeletePortfolioItem(item.id, item.title)}
                              className="link-arrow hover:!text-red-400"
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
              <div className="hairline pt-6 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className="label label-amber">
                    Admin · materials rental catalog
                  </span>
                  <h3 className="font-heading text-h3 text-white">
                    Manage Rentable Materials & Day Rates
                  </h3>
                  <p className="text-small text-fg-muted leading-relaxed max-w-measure">
                    Add, edit, or disable individual rental items. Customers can browse and add materials to their bookings through the custom packages system.
                  </p>
                </div>
                <div className="shrink-0">
                  <a
                    href="/packages"
                    target="_blank"
                    rel="noreferrer"
                    className="link-arrow"
                  >
                    <span>View Public Catalog</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Add / Edit Form */}
              {matFormOpen && (
              <div className="hairline pt-6 pb-8 space-y-6">
                <div className="flex items-start justify-between gap-4 border-b border-white/[0.12] pb-4">
                  <div>
                    <span className="label label-amber">
                      {editingMaterial ? 'Editing catalog entry' : 'New catalog entry'}
                    </span>
                    <h4 className="font-heading text-h4 text-white mt-1.5">
                      {editingMaterial ? 'Edit Equipment' : 'Add New Equipment'}
                    </h4>
                    <p className="text-small text-fg-muted mt-1">
                      {editingMaterial ? 'Update equipment details, photos and pricing' : 'Add a new equipment item to the rental catalog'}
                    </p>
                  </div>
                  {editingMaterial && (
                    <button
                      onClick={resetMatForm}
                      className="link-arrow shrink-0"
                      title="Cancel editing"
                    >
                      <span>Cancel</span>
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
                    if (matCategory === '__custom__' && !matCustomCategory.trim()) {
                      alert('Please type a name for the new category');
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
                          category: matCategory === '__custom__' ? matCustomCategory.trim() : matCategory,
                          description: matDescription,
                          pricePerDay: matPricePerDay,
                          unit: matUnit,
                          isAvailable: matIsAvailable,
                          images: matImages,
                        }),
                      });

                      const data = await res.json();
                      if (data.success) {
                        setActionMessage(
                          editingMaterial 
                            ? `Updated "${matName}" successfully!`
                            : `Added "${matName}" to rental catalog!`
                        );
                        
                        // Reset form and stay open so more items can be added
                        resetMatForm();
                        
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
                      <label className="field-label">
                        Material Name *
                      </label>
                      <input
                        type="text"
                        value={matName}
                        onChange={(e) => setMatName(e.target.value)}
                        placeholder="e.g. Line Array Speaker Box"
                        className="field text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="field-label">
                        Category *
                      </label>
                      <select
                        value={matCategory}
                        onChange={(e) => setMatCategory(e.target.value)}
                        className="field text-xs"
                      >
                          <option value="audio">Audio Equipment</option>
                          <option value="lighting">Lighting & Effects</option>
                          <option value="staging">Staging & Structure</option>
                          <option value="power">Power & Generators</option>
                          <option value="effects">Special Effects</option>
                          <option value="__custom__">New Category…</option>
                      </select>
                      {matCategory === '__custom__' && (
                        <input
                          type="text"
                          value={matCustomCategory}
                          onChange={(e) => setMatCustomCategory(e.target.value)}
                          placeholder="Type the new category name, e.g. Acoustics"
                          className="field text-xs mt-2"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="field-label">
                      Description *
                    </label>
                    <textarea
                      rows={2}
                      value={matDescription}
                      onChange={(e) => setMatDescription(e.target.value)}
                      placeholder="e.g. Professional grade dual 12-inch line array speaker with rigging hardware"
                      className="field text-xs resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="field-label">
                      Equipment Photos (optional) — upload multiple angles
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      {matImages.map((url, idx) => (
                        <div
                          key={url}
                          className="relative w-24 h-24 rounded-[2px] overflow-hidden border border-white/[0.15] bg-ink-raised shrink-0"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`Equipment photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/75 text-[9px] font-mono text-fg">
                            {idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setMatImages((prev) => prev.filter((u) => u !== url))
                            }
                            className="absolute top-1 right-1 p-1 bg-black/75 text-fg hover:text-red-400 transition-colors"
                            title="Remove this photo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      <label
                        className={`w-24 h-24 rounded-[2px] border border-dashed border-white/[0.2] flex flex-col items-center justify-center gap-1 text-fg-muted hover:text-amber hover:border-amber/60 transition-colors cursor-pointer shrink-0 ${
                          matImageUploading ? 'opacity-60 pointer-events-none' : ''
                        }`}
                        title="Add another photo"
                      >
                        {matImageUploading ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <Upload className="w-5 h-5" />
                        )}
                        <span className="text-[9px] font-mono uppercase tracking-wider">
                          {matImageUploading ? 'Uploading…' : 'Add Photo'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={matImageUploading}
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleMatImageUpload(e.target.files[0]);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                    <p className="label mt-2">
                      JPEG, PNG or WebP. All photos appear on the public Materials
                      Rent catalog card for this equipment.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="field-label">
                        Price Per Day (₹) *
                      </label>
                      <input
                        type="number"
                        value={matPricePerDay / 100}
                        onChange={(e) => setMatPricePerDay(Number(e.target.value) * 100)}
                        placeholder="2500"
                        className="field text-xs font-mono"
                        step="0.01"
                        min="0"
                        required
                      />
                      <p className="label mt-1">
                        Enter in rupees (e.g., 2500 for ₹2,500)
                      </p>
                    </div>

                    <div>
                      <label className="field-label">
                        Unit Type
                      </label>
                      <select
                        value={matUnit}
                        onChange={(e) => setMatUnit(e.target.value)}
                        className="field text-xs"
                      >
                        <option value="unit">Unit</option>
                        <option value="set">Set</option>
                        <option value="piece">Piece</option>
                        <option value="box">Box</option>
                        <option value="pair">Pair</option>
                      </select>
                    </div>

                    <div>
                      <label className="field-label">
                        Availability Status
                      </label>
                      <button
                        type="button"
                        onClick={() => setMatIsAvailable(!matIsAvailable)}
                        className={`w-full py-2.5 border text-xs font-mono uppercase tracking-[0.14em] transition-colors flex items-center justify-center gap-2 ${
                          matIsAvailable
                            ? 'border-emerald-500/40 text-emerald-300 hover:border-emerald-400'
                            : 'border-red-500/40 text-red-300 hover:border-red-400'
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
                    className="btn-primary w-full"
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
              )}

              {/* Materials List */}
              <div className="hairline pt-6 pb-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <h4 className="font-heading text-h4 text-white">
                      Materials Catalog ({materials.length})
                    </h4>
                    <p className="text-small text-fg-muted">
                      All rental items organized by category with current pricing
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      resetMatForm();
                      openMatForm();
                    }}
                    className="btn-primary btn-primary-sm shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Equipment</span>
                  </button>
                </div>

                {materials.length === 0 ? (
                  <div className="py-16 text-center text-neutral-400 font-mono text-xs">
                    No equipment in the catalog yet. Click “Add New Equipment” above to add your first rental item!
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
                        audio: <Volume2 className="w-4 h-4 text-fg-muted" />,
                        lighting: <Lightbulb className="w-4 h-4 text-fg-muted" />,
                        staging: <Layers className="w-4 h-4 text-fg-muted" />,
                        power: <Battery className="w-4 h-4 text-fg-muted" />,
                        effects: <Wind className="w-4 h-4 text-fg-muted" />,
                      };

                      return (
                        <div key={category} className="space-y-3">
                          <div className="flex items-center gap-2.5 py-2 border-b border-white/[0.12]">
                            {categoryIcons[category]}
                            <h5 className="font-heading text-h4 text-white capitalize">
                              {category === 'audio' ? 'Audio Equipment' :
                               category === 'lighting' ? 'Lighting & Effects' :
                               category === 'staging' ? 'Staging & Structure' :
                               category === 'power' ? 'Power & Generators' :
                               category === 'effects' ? 'Special Effects' : category}
                            </h5>
                            <span className="label">
                              ({items.length} items)
                            </span>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10">
                            {items.map((material) => (
                              <div
                                key={material.id}
                                className={`border-t border-white/[0.12] py-4 ${
                                  material.isAvailable ? '' : 'opacity-70'
                                }`}
                              >
                                {material.images && material.images.length > 0 && (
                                  <div className="relative mb-3 h-28 rounded-[2px] overflow-hidden bg-ink-raised">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={material.images[0]}
                                      alt={material.name}
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                    />
                                    {material.images.length > 1 && (
                                      <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/75 text-[10px] font-mono text-fg">
                                        +{material.images.length - 1} more
                                      </span>
                                    )}
                                  </div>
                                )}
                                <div className="flex items-start justify-between gap-4 mb-2">
                                  <div className="flex-1">
                                    <h6 className="font-heading text-base font-bold text-white">
                                      {material.name}
                                    </h6>
                                    <p className="text-small text-fg-muted mt-1 line-clamp-2">
                                      {material.description}
                                    </p>
                                  </div>
                                  <span className={`label shrink-0 ${material.isAvailable ? 'label-amber' : 'text-red-400'}`}>
                                    {material.isAvailable ? 'Available' : 'Disabled'}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/[0.12]">
                                  <div className="text-spec font-mono">
                                    <span className="label">Rate </span>
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
                                      className={`p-1 transition-colors ${
                                        material.isAvailable
                                          ? 'text-emerald-400 hover:text-emerald-300'
                                          : 'text-fg-muted hover:text-emerald-400'
                                      }`}
                                      title={material.isAvailable ? 'Click to disable / hide' : 'Click to enable / show'}
                                    >
                                      {material.isAvailable ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                    </button>

                                    <button
                                      onClick={() => {
                                        setEditingMaterial(material);
                                        setMatName(material.name);
                                        const isStandard = ['audio', 'lighting', 'staging', 'power', 'effects'].includes(material.category);
                                        setMatCategory(isStandard ? material.category : '__custom__');
                                        setMatCustomCategory(isStandard ? '' : (material.category || ''));
                                        setMatDescription(material.description);
                                        setMatPricePerDay(material.pricePerDay);
                                        setMatUnit(material.unit);
                                        setMatIsAvailable(material.isAvailable);
                                        setMatImages(
                                          Array.isArray(material.images) ? [...material.images] : []
                                        );
                                        openMatForm();
                                      }}
                                      className="p-1 text-fg-muted hover:text-amber transition-colors"
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
                                      className="p-1 text-fg-muted hover:text-red-400 transition-colors"
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
          <div className="relative max-w-4xl w-full glass-card overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="label label-amber">
                  {activeMediaPreview.category} • {activeMediaPreview.location}
                </span>
                <h4 className="font-heading text-h3 text-white mt-1">
                  {activeMediaPreview.title}
                </h4>
              </div>
              <button
                onClick={() => setActiveMediaPreview(null)}
                aria-label="Close preview"
                className="p-2 text-fg-muted hover:text-amber transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-[2px] overflow-hidden bg-black max-h-[65vh] flex items-center justify-center">
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
              <div className="alert">
                <span className="text-amber font-semibold">Rig deployed — </span>
                {activeMediaPreview.specs}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
