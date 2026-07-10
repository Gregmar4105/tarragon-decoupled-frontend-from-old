import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  LayoutDashboard,
  User,
  Shield,
  Key,
  Activity,
  Calendar,
  CreditCard,
  Tag,
  BarChart,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  X,
  TrendingUp,
  Clock,
  Compass,
  ShieldAlert,
  Plus,
  Check,
  Download,
  Sparkles,
  Loader2,
} from 'lucide-react';
import api from '../lib/axios';

/**
 * Dynamically resolve the backend API URL.
 */
const getBackendUrl = () => {
  if (typeof window !== 'undefined') {
    const { hostname, protocol } = window.location;
    if (hostname.endsWith('.test') && hostname.includes('-frontend')) {
      const backendHost = hostname.replace('-frontend', '');
      return `${protocol}//${backendHost}:8000`;
    }
  }
  return 'http://localhost:8000';
};

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  dropoff: string;
  pickup: string;
  bags: number;
  size: string;
  price: number;
  status: 'active' | 'completed' | 'cancelled' | 'checked-in';
  source?: 'walk-in' | 'website';
  firstName?: string;
  lastName?: string;
  tagNumber?: string;
  tag_number?: string;
  photos?: string[];
  paymentOption?: 'check-in' | 'checkout';
  payment_option?: 'check-in' | 'checkout';
  payment_status?: 'successful' | 'pending' | 'failed';
  payment_method?: string;
  payment_date?: string;
  transaction_id?: string;
  sizeCounts?: {
    small: number;
    regular: number;
    large: number;
    plus: number;
  };
  size_counts?: {
    small: number;
    regular: number;
    large: number;
    plus: number;
  };
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  type: 'daily' | 'hourly' | 'per trip';
  description: string;
  features: string[];
  active: boolean;
}

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
  const [isDebug, setIsDebug] = useState<boolean>(false);

  // ─── Interactive React States for Mock Data ───────────────────────
  const [bookings, setBookings] = useState<Booking[]>([]);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data.data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // ─── Dynamic Reports & AI Insights State ───────────────────────
  const [reportsData, setReportsData] = useState<any>(null);
  const [reportsLoading, setReportsLoading] = useState(false);

  const getPastDateString = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState(getPastDateString(6));
  const [endDate, setEndDate] = useState(getPastDateString(0));

  // AI Insights State
  const [isAiInsightsOpen, setIsAiInsightsOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiRawText, setAiRawText] = useState('');
  const [aiActiveTab, setAiActiveTab] = useState<'descriptive' | 'diagnostic' | 'predictive' | 'prescriptive'>('descriptive');
  const [hasGeneratedAi, setHasGeneratedAi] = useState(false);

  const fetchReports = async () => {
    try {
      setReportsLoading(true);
      const res = await api.get('/reports', {
        params: { start_date: startDate, end_date: endDate }
      });
      setReportsData(res.data.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      toast.error('Failed to load report analytics.');
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    if (currentTab === 'reports') {
      fetchReports();
    }
  }, [currentTab, startDate, endDate]);

  const handleExportReportsCSV = async () => {
    try {
      toast.info('Exporting report CSV...');
      const response = await api.get('/reports/export', {
        params: { start_date: startDate, end_date: endDate },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reports_export_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report CSV exported successfully!');
    } catch (err) {
      console.error('Error exporting reports CSV:', err);
      toast.error('Failed to export report CSV.');
    }
  };

  const handleCheckOutBooking = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Confirm check-out for booking ${id}?`)) {
      try {
        await api.put(`/bookings/${id}`, { status: 'checked-out' });
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'completed' } : b));
        setSelectedBooking(prev => prev && prev.id === id ? { ...prev, status: 'completed' } : prev);
        toast.success(`Booking ${id} is now checked out (completed).`);
      } catch (err) {
        toast.error('Failed to check out booking.');
        console.error(err);
      }
    }
  };

  const handleGenerateAiAnalysis = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiRawText('');
    setHasGeneratedAi(true);
    setAiActiveTab('descriptive');

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const token = localStorage.getItem('larable_token');
      
      const res = await fetch(`${baseUrl}/api/v1/reports/ai-analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Authorization': `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || `Request failed with status ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error('No response stream');
      }

      const decoder = new TextDecoder();
      let accumulated = '';
      let lineBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = (lineBuffer + chunk).split('\n');
        lineBuffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ')) {
            const jsonStr = trimmedLine.slice(6).trim();
            if (jsonStr === '[DONE]') continue;
            try {
              const data = JSON.parse(jsonStr);
              if (data.text) {
                accumulated += data.text;
                setAiRawText(accumulated);

                if (data.text.includes('##')) {
                  const lowerAcc = accumulated.toLowerCase();
                  const lastHeaderIndex = lowerAcc.lastIndexOf('##');
                  const lastHeader = lowerAcc.slice(lastHeaderIndex);
                  
                  if (lastHeader.includes('prescriptive')) setAiActiveTab('prescriptive');
                  else if (lastHeader.includes('predictive')) setAiActiveTab('predictive');
                  else if (lastHeader.includes('diagnostic')) setAiActiveTab('diagnostic');
                }
              }
            } catch {
              // Ignore partial/malformed JSON
            }
          }
        }
      }
    } catch (err: any) {
      setAiError(err.message || 'Failed to generate AI insights.');
    } finally {
      setAiLoading(false);
    }
  };

  const aiSections = (() => {
    const sections = {
      descriptive: '',
      diagnostic: '',
      predictive: '',
      prescriptive: '',
    };
    if (!aiRawText) return sections;

    const chunks = aiRawText.split(/(?=^##\s+)/m);
    for (const chunk of chunks) {
      const trimmed = chunk.trim();
      if (!trimmed.startsWith('##')) continue;
      const lines = trimmed.split('\n');
      const header = lines[0].toLowerCase();
      const content = lines.slice(1).join('\n').trim();
      if (header.includes('descriptive')) sections.descriptive = content;
      else if (header.includes('diagnostic')) sections.diagnostic = content;
      else if (header.includes('predictive')) sections.predictive = content;
      else if (header.includes('prescriptive')) sections.prescriptive = content;
    }

    if (!sections.descriptive || !sections.prescriptive) {
      const getMatch = (keyword: string) => {
        const regex = new RegExp(`##\\s*.*?${keyword}.*?\\n?([\\s\\S]*?)(?=##\\s*|$)`, 'i');
        const match = aiRawText.match(regex);
        return match ? match[1].trim() : '';
      };
      if (!sections.descriptive) sections.descriptive = getMatch('descriptive');
      if (!sections.diagnostic) sections.diagnostic = getMatch('diagnostic');
      if (!sections.predictive) sections.predictive = getMatch('predictive');
      if (!sections.prescriptive) sections.prescriptive = getMatch('prescriptive');
    }
    return sections;
  })();

  const formatMarkdownText = (text: string) => {
    if (!text) return null;
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const lines = formatted.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        return (
          <li key={idx} style={{ marginLeft: '1.25rem', listStyleType: 'disc', marginBottom: '0.4rem', fontSize: '0.85rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
            <span dangerouslySetInnerHTML={{ __html: trimmed.substring(1).trim() }} />
          </li>
        );
      }
      if (trimmed === '') return <br key={idx} />;
      return <p key={idx} style={{ marginBottom: '0.5rem', fontSize: '0.85rem', lineHeight: '1.5', color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: trimmed }} />;
    });
  };

  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([
    { id: 'flat-rate', name: 'Flat Rate Daily Storage', price: 290, type: 'daily', description: 'Flat daily rate for luggage of any size or weight.', features: ['Secure security tag', '24/7 CCTV monitoring', 'Safety insurance included', 'No size limits'], active: true },
    { id: 'hourly-locker', name: 'Hourly Lockers', price: 50, type: 'hourly', description: 'Locker rental billed by the hour. Best for quick layovers.', features: ['Self-service PIN code', 'Varying sizes', 'CCTV monitoring', 'Unlimited accesses'], active: true },
    { id: 'special-cargo', name: 'Special Item Storage', price: 450, type: 'daily', description: 'Daily rate for surfboards, golf sets, or bicycles.', features: ['Oversized racks', 'Padding protections', 'Safety insurance', 'Inspected drop-off'], active: true },
    { id: 'vip-courier', name: 'VIP Bag Delivery', price: 800, type: 'per trip', description: 'Send your luggage direct to/from NAIA Terminal 3.', features: ['Door-to-door courier', 'Real-time GPS tracking', 'Instant delivery confirmation', 'Insured transport'], active: false },
  ]);

  // Search & Filter state
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<'all' | 'active' | 'checked-in' | 'completed' | 'cancelled'>('all');
  
  // Selected Detail View Modal State
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);



  // Check health and set debug
  useEffect(() => {
    api.get('/health')
      .then(response => {
        setIsDebug(!!response.data.debug);
      })
      .catch(() => {
        setIsDebug(false);
      });
  }, []);

  // ─── Actions handlers ──────────────────────────────────────────────
  const handleCheckInBooking = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Confirm check-in for booking ${id}?`)) {
      try {
        await api.put(`/bookings/${id}`, { status: 'checked-in' });
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'checked-in' } : b));
        setSelectedBooking(prev => prev && prev.id === id ? { ...prev, status: 'checked-in' } : prev);
        toast.success(`Booking ${id} is now checked in.`);
      } catch (err) {
        toast.error('Failed to check in booking.');
        console.error(err);
      }
    }
  };

  const handleCancelBooking = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to cancel booking ${id}?`)) {
      try {
        await api.put(`/bookings/${id}`, { status: 'cancelled' });
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
        toast.warning(`Booking ${id} has been cancelled.`);
      } catch (err) {
        toast.error('Failed to cancel booking.');
        console.error(err);
      }
    }
  };



  const handleUpdatePrice = (planId: string, newPrice: number) => {
    setPricingPlans(prev => prev.map(p => p.id === planId ? { ...p, price: newPrice } : p));
  };

  const handleTogglePlan = (planId: string) => {
    setPricingPlans(prev => prev.map(p => {
      if (p.id === planId) {
        const nextActive = !p.active;
        toast.info(`${p.name} is now ${nextActive ? 'Active' : 'Inactive'}`);
        return { ...p, active: nextActive };
      }
      return p;
    }));
  };

  const handleSavePlanChanges = (planId: string) => {
    const plan = pricingPlans.find(p => p.id === planId);
    if (plan) {
      toast.success(`${plan.name} configuration saved successfully!`);
    }
  };

  // ─── Stats definition ──────────────────────────────────────────────
  const activeCount = bookings.filter(b => b.status === 'active').length;
  const checkedInCount = bookings.filter(b => b.status === 'checked-in').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const totalRevenue = bookings.filter(b => b.payment_status === 'successful').reduce((acc, curr) => acc + curr.price, 0);

  const stats = [
    { id: 'account', icon: <User size={20} />, label: 'Account', value: user?.name || '—', color: 'pink' },
    { id: user?.two_factor_enabled ? '2fa-enabled' : '2fa-disabled', icon: <Shield size={20} />, label: '2FA Status', value: user?.two_factor_enabled ? 'Enabled' : 'Disabled', color: user?.two_factor_enabled ? 'green' : 'orange' },
    { id: 'member', icon: <Key size={20} />, label: 'Active Bookings', value: `${activeCount} Pending / ${checkedInCount} Stored`, color: 'blue' },
    { id: 'api', icon: <Activity size={20} />, label: 'Month Revenue', value: `₱${totalRevenue}`, color: 'purple' },
  ];

  return (
    <div className="dashboard-page">
      
      {/* ─── Render Tab Content based on activeTab ────────────────────── */}
      {currentTab === 'overview' && (
        <div className="tab-pane fade-in-panel">
          {/* Welcome Banner */}
          <div className="dashboard-welcome-banner">
            <div className="welcome-banner-content">
              <h2>Welcome back, {user?.name}! 👋</h2>
              <p>Here is what is happening at your Tarragon Manila baggage hub today. You have {activeCount} incoming drop-offs, {checkedInCount} checked-in, and {completedCount} bags retrieved.</p>
              <div className="banner-stats">
                <div className="banner-stat-item">
                  <span className="banner-stat-num">{checkedInCount}</span>
                  <span className="banner-stat-lbl">Checked-In</span>
                </div>
                <div className="banner-stat-divider"></div>
                <div className="banner-stat-item">
                  <span className="banner-stat-num">85%</span>
                  <span className="banner-stat-lbl">Locker Occupancy</span>
                </div>
                <div className="banner-stat-divider"></div>
                <div className="banner-stat-item">
                  <span className="banner-stat-num">5.0 ★</span>
                  <span className="banner-stat-lbl">Google Rating</span>
                </div>
              </div>
            </div>
            <div className="welcome-banner-glow"></div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid" style={{ marginTop: '2rem' }}>
            {stats.map((stat, i) => (
              <div key={i} className="stat-card glass-panel">
                <div className={`stat-icon stat-gradient-${stat.color}`}>{stat.icon}</div>
                <div className="stat-info">
                  <span className="stat-label">{stat.label}</span>
                  <span className="stat-value">{stat.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Storage Capacity Section & Recent Activities */}
          <div className="dashboard-overview-split" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.25rem', marginTop: '1.5rem' }}>
            
            {/* Storage Occupancy Progress Card */}
            <div className="dashboard-card glass-panel flex-col" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Compass size={18} style={{ color: 'var(--color-primary)' }} />
                Locker Hub Occupancy Monitor
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Real-time storage space utilization near NAIA Terminal 3 Locker Hub.
              </p>
              
              <div className="occupancy-progress-container" style={{ marginBottom: '1rem' }}>
                <div className="progress-labels" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  <span>17 / 20 Large Lockers Used</span>
                  <span style={{ color: 'var(--color-primary)' }}>85% Capacity</span>
                </div>
                <div className="progress-track" style={{ width: '100%', height: '10px', background: 'var(--bg-secondary)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div className="progress-bar-fill" style={{ width: '85%', height: '100%', background: 'linear-gradient(90deg, var(--color-primary), #ff7a93)', borderRadius: '10px' }}></div>
                </div>
              </div>

              <div className="occupancy-legend" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(255, 56, 92, 0.05)', borderRadius: '8px', border: '1px solid rgba(255, 56, 92, 0.1)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)' }}></span>
                  <div>
                    <strong>17 Reserved</strong>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Bags safely locked</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)' }}></span>
                  <div>
                    <strong>3 Available</strong>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Ready for check-in</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activities Log */}
            <div className="dashboard-card glass-panel" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} style={{ color: '#3b82f6' }} />
                Recent Operations Feed
              </h3>
              <div className="activities-feed" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="activity-item" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div className="activity-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '6px', borderRadius: '50%', display: 'flex' }}>
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block' }}>Check-in Confirmed: Michael Chen</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TM-9421 • 2 Bags • 10 mins ago</span>
                  </div>
                </div>
                
                <div className="activity-item" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div className="activity-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '6px', borderRadius: '50%', display: 'flex' }}>
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block' }}>Payment Received: ₱870 GCash</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TXN-87611 • Patricia Alunan • 2 hours ago</span>
                  </div>
                </div>

                <div className="activity-item" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div className="activity-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '6px', borderRadius: '50%', display: 'flex' }}>
                    <Key size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block' }}>Luggage Retrieved: David Miller</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TM-1102 • 3 Bags • 4 hours ago</span>
                  </div>
                </div>

                <div className="activity-item" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div className="activity-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '6px', borderRadius: '50%', display: 'flex' }}>
                    <AlertCircle size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block' }}>Booking Cancelled: Hiroshi Tanaka</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TM-5520 • 4 Bags • 1 day ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions (Debug Mode only) */}
          {isDebug && (
            <div className="dashboard-section" style={{ marginTop: '3rem' }}>
              <h2>Developer Diagnostics</h2>
              <div className="quick-links">
                <a href={`${getBackendUrl()}/larable`} target="_blank" rel="noopener noreferrer" className="quick-link-card glass-panel">
                  <Activity size={24} />
                  <span>API Playground</span>
                  <p>Test API endpoints in the backend GUI</p>
                </a>
                <a href="http://localhost:8025" target="_blank" rel="noopener noreferrer" className="quick-link-card glass-panel">
                  <LayoutDashboard size={24} />
                  <span>Mailpit Inbox</span>
                  <p>View sent emails in the test inbox</p>
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {currentTab === 'bookings' && (
        <div className="tab-pane fade-in-panel">
          <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Calendar size={28} style={{ color: 'var(--color-primary)' }} />
              <div>
                <h1 style={{ margin: 0 }}>Baggage Rentals & Bookings</h1>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Manage reservations, drop-offs, and retrievals.</p>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/add-walk-in')} style={{ height: '42px', padding: '0 1.25rem' }}>
              <Plus size={18} style={{ marginRight: '6px' }} />
              Add Walk-In
            </button>
          </div>

          {/* Filter and Search Bar */}
          <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div className="booking-filters" style={{ display: 'flex', gap: '0.5rem' }}>
              {(['all', 'active', 'checked-in', 'completed', 'cancelled'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setBookingStatusFilter(filter)}
                  className={`btn-filter ${bookingStatusFilter === filter ? 'active' : ''}`}
                >
                  {filter === 'checked-in' ? 'Checked-In' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            <div className="search-box-wrapper" style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
              <Search size={16} className="search-box-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search customer name or ID..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                style={{ paddingLeft: '38px', height: '40px', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          {/* Bookings Table */}
          <div className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Customer Details</th>
                    <th>Luggage</th>
                    <th>Storage Interval</th>
                    <th>Total Pay</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings
                    .filter(b => {
                      const matchesStatus = bookingStatusFilter === 'all' || b.status === bookingStatusFilter;
                      const matchesQuery = b.name.toLowerCase().includes(bookingSearch.toLowerCase()) || b.id.toLowerCase().includes(bookingSearch.toLowerCase());
                      return matchesStatus && matchesQuery;
                    })
                    .map((booking) => (
                      <tr key={booking.id} onClick={() => setSelectedBooking(booking)} style={{ cursor: 'pointer' }}>
                        <td><strong style={{ color: 'var(--text-primary)' }}>{booking.id}</strong></td>
                        <td>
                          <div>
                            <span style={{ fontWeight: 650, display: 'block', color: 'var(--text-primary)' }}>{booking.name}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{booking.email}</span>
                          </div>
                        </td>
                        <td>
                          <div>
                            <span style={{ fontWeight: 600 }}>{booking.bags} {booking.bags === 1 ? 'Bag' : 'Bags'}</span>
                            <span className="badge-bag-size" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700 }}>{booking.size}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                            <div><span style={{ color: 'var(--text-muted)' }}>In:</span> {booking.dropoff}</div>
                            <div><span style={{ color: 'var(--text-muted)' }}>Out:</span> {booking.pickup}</div>
                          </div>
                        </td>
                        <td><strong style={{ color: 'var(--text-primary)' }}>₱{booking.price}</strong></td>
                        <td>
                          <span className={`pill-badge source-${booking.source || 'website'}`}>
                            {booking.source === 'walk-in' ? 'Walk-In' : 'Website'}
                          </span>
                        </td>
                        <td>
                          <span className={`pill-badge badge-${booking.status}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedBooking(booking)}
                              className="btn btn-icon-sm"
                              title="View Ticket Details"
                            >
                              <Eye size={14} />
                            </button>
                            {booking.status === 'active' && booking.source === 'website' && (
                              <button
                                onClick={(e) => handleCheckInBooking(booking.id, e)}
                                className="btn btn-success-sm"
                                title="Check In Booking"
                              >
                                <Check size={14} />
                              </button>
                            )}
                            {booking.status === 'checked-in' && (
                              <button
                                onClick={(e) => handleCheckOutBooking(booking.id, e)}
                                className="btn btn-success-sm"
                                title="Check Out / Retrieve"
                                style={{ backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}
                              >
                                <CheckCircle2 size={14} />
                              </button>
                            )}
                            {booking.status === 'active' && (
                              <button
                                onClick={(e) => handleCancelBooking(booking.id, e)}
                                className="btn btn-danger-sm"
                                title="Cancel Reservation"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  {bookings.filter(b => {
                    const matchesStatus = bookingStatusFilter === 'all' || b.status === bookingStatusFilter;
                    const matchesQuery = b.name.toLowerCase().includes(bookingSearch.toLowerCase()) || b.id.toLowerCase().includes(bookingSearch.toLowerCase());
                    return matchesStatus && matchesQuery;
                  }).length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <ShieldAlert size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                        <p>No bookings matching the current filters were found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}



      {currentTab === 'pricing' && (
        <div className="tab-pane fade-in-panel">
          <div className="page-header" style={{ marginBottom: '1.5rem' }}>
            <Tag size={28} style={{ color: 'var(--color-primary)' }} />
            <div>
              <h1>Baggage Storage Pricing Config</h1>
              <p>Set daily rates, hourly rates, and customize promotional offers.</p>
            </div>
          </div>

          <div className="pricing-config-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {pricingPlans.map((plan) => (
              <div key={plan.id} className="pricing-card glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', position: 'relative', border: plan.active ? '1px solid rgba(255, 56, 92, 0.15)' : '1px solid var(--border)' }}>
                {!plan.active && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.02)', backdropFilter: 'grayscale(1) opacity(0.3)', borderRadius: '20px', zIndex: 1, pointerEvents: 'none' }}></div>}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', position: 'relative', zIndex: 2 }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>{plan.name}</h3>
                  <button
                    onClick={() => handleTogglePlan(plan.id)}
                    className={`btn-toggle-switch ${plan.active ? 'active' : ''}`}
                    title={plan.active ? 'Disable Plan' : 'Enable Plan'}
                  ></button>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5', flexGrow: 1, position: 'relative', zIndex: 2 }}>
                  {plan.description}
                </p>

                <div className="price-inputs-block" style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', position: 'relative', zIndex: 2 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Base Price (₱)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 750 }}>₱</span>
                    <input
                      type="number"
                      value={plan.price}
                      onChange={(e) => handleUpdatePrice(plan.id, parseInt(e.target.value) || 0)}
                      disabled={!plan.active}
                      style={{ height: '36px', fontSize: '1rem', fontWeight: 700, padding: '0 8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                    />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>/ {plan.type}</span>
                  </div>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', position: 'relative', zIndex: 2 }}>
                  {plan.features.map((feat, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSavePlanChanges(plan.id)}
                  className="btn btn-primary"
                  style={{ width: '100%', height: '40px', fontSize: '0.9rem', position: 'relative', zIndex: 2 }}
                  disabled={!plan.active}
                >
                  Save Config
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentTab === 'reports' && (
        <div className="tab-pane fade-in-panel">
          <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <BarChart size={28} style={{ color: 'var(--color-primary)' }} />
              <div>
                <h1 style={{ margin: 0 }}>Analytics & Revenue Reports</h1>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Visual statistics and revenue progress dashboards.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.25rem 0.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}
                />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <button className="btn btn-secondary" onClick={handleExportReportsCSV} style={{ height: '40px', padding: '0 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Download size={14} /> Export CSV
              </button>

              <button
                className="btn btn-primary"
                onClick={() => {
                  setIsAiInsightsOpen(true);
                  if (!hasGeneratedAi) {
                    handleGenerateAiAnalysis();
                  }
                }}
                style={{
                  height: '40px',
                  padding: '0 1.25rem',
                  fontSize: '0.85rem',
                  background: 'linear-gradient(135deg, #ff385c 0%, #e61e4d 100%)',
                  border: 'none',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(255, 56, 92, 0.2)'
                }}
              >
                <Sparkles size={14} /> AI Insights
              </button>
            </div>
          </div>

          {reportsLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', color: 'var(--text-secondary)' }}>
              <Loader2 className="spin-animation" size={36} style={{ marginBottom: '1rem', color: 'var(--color-primary)' }} />
              <p>Fetching analytics data from database...</p>
            </div>
          ) : reportsData ? (
            <>
              {/* Analytics Summary Stats */}
              <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                <div className="stat-card glass-panel">
                  <div className="stat-icon stat-gradient-purple"><TrendingUp size={20} /></div>
                  <div className="stat-info">
                    <span className="stat-label">Est. Revenue</span>
                    <span className="stat-value">₱{Number(reportsData.summary.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div className="stat-card glass-panel">
                  <div className="stat-icon stat-gradient-blue"><Calendar size={20} /></div>
                  <div className="stat-info">
                    <span className="stat-label">Total Bookings</span>
                    <span className="stat-value">{reportsData.summary.totalBookings} Renters</span>
                  </div>
                </div>
                <div className="stat-card glass-panel">
                  <div className="stat-icon stat-gradient-green"><CheckCircle2 size={20} /></div>
                  <div className="stat-info">
                    <span className="stat-label">Bags Stored</span>
                    <span className="stat-value">{reportsData.summary.totalBags} Luggage</span>
                  </div>
                </div>
                <div className="stat-card glass-panel">
                  <div className="stat-icon stat-gradient-pink"><User size={20} /></div>
                  <div className="stat-info">
                    <span className="stat-label">Avg. Value</span>
                    <span className="stat-value">₱{Number(reportsData.summary.avgBookingValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Visual SVG Bar Chart Card */}
                <div className="dashboard-card glass-panel" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Daily Bookings Trend</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Number of bags checked in per day.</p>
                  
                  {reportsData.dailyTrend && reportsData.dailyTrend.length > 0 ? (
                    <div style={{ width: '100%', height: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '180px', borderBottom: '1px solid var(--border)', padding: '0 0.5rem' }}>
                        {reportsData.dailyTrend.map((d: any, idx: number) => {
                          const maxBookings = Math.max(...reportsData.dailyTrend.map((x: any) => x.bookings), 5);
                          const barHeight = Math.max(5, (d.bookings / maxBookings) * 150);
                          return (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '6px', minWidth: 0 }} title={`${d.name}: ${d.bookings} bags`}>
                              <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{d.bookings > 0 ? d.bookings : ''}</span>
                              <div style={{
                                height: `${barHeight}px`,
                                width: '40%',
                                minWidth: '16px',
                                maxWidth: '36px',
                                background: d.bookings > 0 ? 'linear-gradient(180deg, var(--color-primary), #ff7a93)' : 'var(--bg-secondary)',
                                borderRadius: '4px 4px 0 0',
                                transition: 'height 0.3s ease'
                              }}></div>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>
                                {d.name.split(',')[0]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No data for the selected range</div>
                  )}
                </div>

                {/* Booking Sources Distribution */}
                <div className="dashboard-card glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Booking Channels</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Breakdown of reservations source.</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flexGrow: 1, justifyContent: 'center' }}>
                    {reportsData.sourceDistribution && (
                      (() => {
                        const online = reportsData.sourceDistribution.find((s: any) => s.name.toLowerCase().includes('online'))?.value || 0;
                        const walkin = reportsData.sourceDistribution.find((s: any) => s.name.toLowerCase().includes('walk'))?.value || 0;
                        const total = online + walkin || 1;
                        const onlinePct = Math.round((online / total) * 100);
                        const walkinPct = Math.round((walkin / total) * 100);

                        return (
                          <>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                                <span>Online Booking ({online})</span>
                                <span style={{ color: 'var(--color-primary)' }}>{onlinePct}%</span>
                              </div>
                              <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '10px', overflow: 'hidden' }}>
                                <div style={{ width: `${onlinePct}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary), #ff7a93)', borderRadius: '10px' }}></div>
                              </div>
                            </div>

                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                                <span>Walk-ins ({walkin})</span>
                                <span style={{ color: '#3b82f6' }}>{walkinPct}%</span>
                              </div>
                              <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '10px', overflow: 'hidden' }}>
                                <div style={{ width: `${walkinPct}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', borderRadius: '10px' }}></div>
                              </div>
                            </div>
                          </>
                        );
                      })()
                    )}
                  </div>
                </div>
              </div>

              {/* Detailed Activity Table */}
              <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Detailed Activity</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Individual booking records for the selected period.</p>
                </div>
                <div className="table-responsive" style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>Customer</th>
                        <th>Bags Stored</th>
                        <th>Amount Paid</th>
                        <th>Status</th>
                        <th>Channel</th>
                        <th>Date & Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportsData.recentBookings && reportsData.recentBookings.length > 0 ? (
                        reportsData.recentBookings.map((b: any) => (
                          <tr key={b.id}>
                            <td><strong style={{ color: 'var(--color-primary)' }}>{b.reference}</strong></td>
                            <td>
                              <div>
                                <span style={{ fontWeight: 650, display: 'block', color: 'var(--text-primary)' }}>{b.customer_name}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{b.customer_email}</span>
                              </div>
                            </td>
                            <td><strong style={{ color: 'var(--text-primary)' }}>{b.bags} {b.bags === 1 ? 'Bag' : 'Bags'}</strong></td>
                            <td><strong style={{ color: 'var(--text-primary)' }}>₱{b.total_price}</strong></td>
                            <td>
                              <span className={`pill-badge badge-${b.status === 'checked-out' ? 'completed' : b.status}`}>
                                {b.status}
                              </span>
                            </td>
                            <td>
                              <span className={`pill-badge source-${b.source === 'online' ? 'website' : 'walk-in'}`}>
                                {b.source === 'online' ? 'Online' : 'Walk-in'}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{b.created_at}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <ShieldAlert size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                            <p>No bookings found for the selected date range.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
              <AlertCircle size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <p>No data retrieved. Please choose another date range.</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Detail Ticket Dialog Modal ──────────────────────────────── */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content-card ticket-card-modal fade-in-panel" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedBooking(null)} aria-label="Close modal">
              <X size={20} />
            </button>
            
            {/* Ticket Graphic layout */}
            <div className="ticket-header">
              <div className="ticket-logo-wrapper">
                <img src="/logo.svg" alt="Tarragon Manila Logo" />
                <div>
                  <h3>TARRAGON MANILA</h3>
                  <span>Baggage Storage Ticket</span>
                </div>
              </div>
              <span className={`pill-badge badge-${selectedBooking.status}`}>
                {selectedBooking.status}
              </span>
            </div>

            <div className="ticket-body">
              <div className="ticket-row-grid">
                <div className="ticket-field">
                  <span className="ticket-label">TICKET REFERENCE</span>
                  <span className="ticket-value highlight-ref">{selectedBooking.id}</span>
                </div>
                <div className="ticket-field">
                  <span className="ticket-label">CUSTOMER NAME</span>
                  <span className="ticket-value">{selectedBooking.name}</span>
                </div>
              </div>

              <div className="ticket-row-grid">
                <div className="ticket-field">
                  <span className="ticket-label">DROP-OFF DATE/TIME</span>
                  <span className="ticket-value">{selectedBooking.dropoff}</span>
                </div>
                <div className="ticket-field">
                  <span className="ticket-label">PICK-UP DATE/TIME</span>
                  <span className="ticket-value">{selectedBooking.pickup}</span>
                </div>
              </div>

              <div className="ticket-row-grid">
                <div className="ticket-field">
                  <span className="ticket-label">LUGGAGE DESCRIPTION</span>
                  <span className="ticket-value">{selectedBooking.bags} {selectedBooking.bags === 1 ? 'Bag' : 'Bags'} ({selectedBooking.size})</span>
                </div>
                <div className="ticket-field">
                  <span className="ticket-label">CONTACT INFORMATION</span>
                  <span className="ticket-value" style={{ fontSize: '0.8rem' }}>{selectedBooking.phone}</span>
                </div>
              </div>

              {/* Walk-in details row */}
              <div className="ticket-row-grid" style={{ borderTop: '1px dashed var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                <div className="ticket-field">
                  <span className="ticket-label">BOOKING SOURCE</span>
                  <span className="ticket-value">
                    <span className={`pill-badge source-${selectedBooking.source || 'website'}`} style={{ display: 'inline-block', fontSize: '0.7rem', padding: '2px 8px' }}>
                      {selectedBooking.source === 'walk-in' ? 'Walk-In' : 'Website'}
                    </span>
                  </span>
                </div>
                <div className="ticket-field">
                  <span className="ticket-label">PAYMENT SETTLEMENT</span>
                  <span className="ticket-value" style={{ fontSize: '0.8rem', fontWeight: 700, color: (selectedBooking.payment_option || selectedBooking.paymentOption) === 'checkout' ? 'var(--warning)' : 'var(--success)' }}>
                    {selectedBooking.source === 'walk-in'
                      ? ((selectedBooking.payment_option || selectedBooking.paymentOption) === 'checkout' ? 'Pay at Check-Out' : 'Paid at Check-In')
                      : 'Paid Online'}
                  </span>
                </div>
              </div>

              {(selectedBooking.tag_number || selectedBooking.tagNumber) && (
                <div className="ticket-row-grid" style={{ paddingTop: '0.5rem' }}>
                  <div className="ticket-field">
                    <span className="ticket-label">BAG SECURITY TAG NUMBER</span>
                    <span className="ticket-value" style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{selectedBooking.tag_number || selectedBooking.tagNumber}</span>
                  </div>
                </div>
              )}

              {/* Baggage photos row */}
              {selectedBooking.photos && selectedBooking.photos.length > 0 && (
                <div style={{ marginTop: '0.75rem', borderTop: '1px dashed var(--border)', paddingTop: '0.75rem' }}>
                  <span className="ticket-label" style={{ display: 'block', marginBottom: '0.35rem' }}>BAGGAGE PHOTOS</span>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {selectedBooking.photos.map((pUrl, pIdx) => (
                      <div key={pIdx} onClick={() => window.open(pUrl, '_blank')} style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)', cursor: 'pointer' }}>
                        <img src={pUrl} alt={`Baggage Photo ${pIdx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Barcode graphic */}
              <div className="ticket-barcode-wrapper">
                <div className="mock-barcode-lines">
                  <div className="bar w-1"></div>
                  <div className="bar w-3"></div>
                  <div className="bar w-2"></div>
                  <div className="bar w-1"></div>
                  <div className="bar w-4"></div>
                  <div className="bar w-2"></div>
                  <div className="bar w-1"></div>
                  <div className="bar w-3"></div>
                  <div className="bar w-4"></div>
                  <div className="bar w-1"></div>
                  <div className="bar w-2"></div>
                  <div className="bar w-3"></div>
                  <div className="bar w-1"></div>
                  <div className="bar w-4"></div>
                  <div className="bar w-1"></div>
                  <div className="bar w-2"></div>
                  <div className="bar w-3"></div>
                  <div className="bar w-1"></div>
                  <div className="bar w-4"></div>
                  <div className="bar w-1"></div>
                  <div className="bar w-2"></div>
                  <div className="bar w-3"></div>
                  <div className="bar w-4"></div>
                  <div className="bar w-1"></div>
                  <div className="bar w-2"></div>
                </div>
                <span className="barcode-number">{selectedBooking.id}-2026-TARRAGON</span>
              </div>
            </div>

            <div className="ticket-footer">
              <div className="ticket-price-box">
                <span className="ticket-label">TOTAL CHARGES</span>
                <span className="ticket-total-price">₱{selectedBooking.price}</span>
              </div>
              <div className="ticket-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    toast.success("Print job queued successfully!");
                  }}
                  className="btn btn-secondary"
                  style={{ height: '40px', flex: 1, padding: '0 8px', fontSize: '0.85rem' }}
                >
                  Print Ticket
                </button>
                {selectedBooking.status === 'active' && selectedBooking.source === 'website' && (
                  <button
                    onClick={(e) => handleCheckInBooking(selectedBooking.id, e)}
                    className="btn btn-primary"
                    style={{ height: '40px', flex: 1, padding: '0 8px', fontSize: '0.85rem', backgroundColor: '#10b981', borderColor: '#10b981', color: 'white' }}
                  >
                    Check In
                  </button>
                )}
                {selectedBooking.status === 'checked-in' && (
                  <button
                    onClick={(e) => handleCheckOutBooking(selectedBooking.id, e)}
                    className="btn btn-primary"
                    style={{ height: '40px', flex: 1, padding: '0 8px', fontSize: '0.85rem', backgroundColor: '#3b82f6', borderColor: '#3b82f6', color: 'white' }}
                  >
                    Check Out
                  </button>
                )}
                {selectedBooking.status === 'active' && (
                  <button
                    onClick={(e) => {
                      handleCancelBooking(selectedBooking.id, e);
                      setSelectedBooking(null);
                    }}
                    className="btn btn-danger"
                    style={{ height: '40px', flex: 1, padding: '0 8px', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── AI Insights Modal (Side Drawer) ────────────────────────── */}
      {isAiInsightsOpen && (
        <div className="modal-overlay" onClick={() => setIsAiInsightsOpen(false)} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'stretch', zIndex: 1100 }}>
          <div
            className="fade-in-panel glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '640px',
              backgroundColor: 'var(--bg-card)',
              borderLeft: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              padding: '2.5rem',
              boxShadow: 'var(--shadow-lg)',
              height: '100vh',
              boxSizing: 'border-box',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setIsAiInsightsOpen(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                padding: '6px',
                borderRadius: '50%',
                display: 'flex'
              }}
              aria-label="Close panel"
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <div style={{ padding: '8px', background: 'linear-gradient(135deg, #ff385c 0%, #e61e4d 100%)', borderRadius: '10px', color: 'white', display: 'flex' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>AI Insights Analysis</h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Powered by your backend LLM model</p>
              </div>
            </div>

            {aiLoading && !aiRawText ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, color: 'var(--text-secondary)' }}>
                <Loader2 className="spin-animation" size={32} style={{ marginBottom: '1rem', color: 'var(--color-primary)' }} />
                <p>Generating reports intelligence...</p>
              </div>
            ) : aiError ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, gap: '1rem', textAlign: 'center' }}>
                <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '12px' }}>
                  <AlertCircle size={24} />
                </div>
                <p style={{ fontSize: '0.9rem', color: '#ef4444', fontWeight: 600 }}>{aiError}</p>
                <button className="btn btn-secondary" onClick={handleGenerateAiAnalysis}>Retry Generation</button>
              </div>
            ) : !hasGeneratedAi ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, textAlign: 'center', gap: '1rem' }}>
                <Sparkles size={48} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                <h4 style={{ margin: 0 }}>Ready to analyze</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '320px', margin: 0 }}>Click the button to request a comprehensive diagnostic, predictive and prescriptive analysis of your bag rentals for this range.</p>
                <button className="btn btn-primary" onClick={handleGenerateAiAnalysis}>Generate Insights</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
                {/* Tabs selection */}
                <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '8px', marginBottom: '1.25rem' }}>
                  {(['descriptive', 'diagnostic', 'predictive', 'prescriptive'] as const).map((tab) => {
                    const isActive = aiActiveTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setAiActiveTab(tab)}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          borderRadius: '6px',
                          border: 'none',
                          background: isActive ? 'var(--bg-card)' : 'transparent',
                          color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                          fontSize: '0.75rem',
                          fontWeight: isActive ? 700 : 500,
                          cursor: 'pointer',
                          textTransform: 'capitalize',
                          boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>

                {/* Tab content area */}
                <div style={{ flexGrow: 1, overflowY: 'auto', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '1.25rem', border: '1px solid var(--border)' }}>
                  {aiLoading && !aiSections[aiActiveTab] ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                      <Loader2 className="spin-animation" size={24} style={{ marginBottom: '8px', color: 'var(--color-primary)' }} />
                      <p style={{ fontSize: '0.8rem' }}>AI is writing details...</p>
                    </div>
                  ) : aiSections[aiActiveTab] ? (
                    <div style={{ animation: 'fade-in 0.2s ease' }}>
                      {formatMarkdownText(aiSections[aiActiveTab])}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', margin: '2rem 0' }}>No insights streaming under this section yet...</p>
                  )}
                </div>

                {aiLoading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '1rem', padding: '6px 12px', background: 'rgba(255, 56, 92, 0.05)', borderRadius: '8px', border: '1px solid rgba(255, 56, 92, 0.1)' }}>
                    <span style={{ display: 'block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', animation: 'pulse 1.2s infinite' }}></span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>Streaming responses live...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
