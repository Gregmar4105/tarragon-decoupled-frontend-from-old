import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/axios';
import {
  LogIn,
  Settings,
  LogOut,
  LayoutDashboard,
  Calendar,
  Search,
  Bell,
  Wallet,
  Tag,
  BarChart,
} from 'lucide-react';

/**
 * Layout
 *
 * Application shell with navigation bar and main content area.
 * Adapts navigation based on authentication state.
 */
export default function Layout() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const isDashboardOrSettings = pathname === '/dashboard' || pathname === '/settings' || pathname === '/pricing-plans' || pathname === '/add-walk-in' || pathname === '/payments-transaction';

  const [theme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('larable_theme') as 'light' | 'dark') || 'light';
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('larable_theme', theme);
  }, [theme]);

  // Handle outside clicks to close the dropdown menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className={`app-layout ${isDashboardOrSettings ? 'dashboard-shell' : ''}`}>
      {/* ─── Navigation Bar ──────────────────────────────────────── */}
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="/logo.svg" alt="Tarragon Manila Logo" style={{ height: '36px', width: '29px', objectFit: 'cover', objectPosition: 'center', flexShrink: 0 }} />
            <span style={{ fontSize: '1.2rem', fontWeight: 500 }}>
              Tarragon Manila <span className="brand-suffix">Baggage Storage Rentals</span>
            </span>
          </Link>

          <div className="navbar-links" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isDashboardOrSettings ? (
              <>
                <button className="nav-bell-btn" aria-label="Notifications">
                  <Bell size={20} />
                  <span className="nav-bell-dot"></span>
                </button>
                <div className="nav-avatar-container" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="nav-avatar-btn"
                    aria-label="User menu"
                  >
                    {getInitials(user?.name)}
                  </button>
                  {isDropdownOpen && (
                    <div className="nav-avatar-dropdown">
                      <div className="dropdown-user-info">
                        <div className="dropdown-user-name">{user?.name}</div>
                        <div className="dropdown-user-email">{user?.email}</div>
                      </div>
                      <Link
                        to="/settings"
                        onClick={() => setIsDropdownOpen(false)}
                        className="dropdown-item"
                      >
                        <Settings size={16} />
                        <span>Settings</span>
                      </Link>
                      <div className="dropdown-divider"></div>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleLogout();
                        }}
                        className="dropdown-item dropdown-logout"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : isAuthenticated ? (
              <>
                <Link to="/?book=true" className="nav-link">
                  <Calendar size={18} />
                  <span>Book Now</span>
                </Link>
                <Link to="/dashboard" className="nav-link">
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>
                <Link to="/settings" className="nav-link">
                  <Settings size={18} />
                  <span>Settings</span>
                </Link>
                <div className="nav-user">
                  <span className="nav-user-name">{user?.name}</span>
                  <button onClick={handleLogout} className="nav-link nav-logout">
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/?book=true" className="nav-link btn-primary-nav">
                  <Calendar size={18} />
                  <span>Book Now</span>
                </Link>
                <Link to="/dashboard" className="nav-link">
                  <Search size={18} />
                  <span>Track Booking</span>
                </Link>
                <Link to="/login" className="nav-link">
                  <LogIn size={18} />
                  <span>Login</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Main Content ────────────────────────────────────────── */}
      {isDashboardOrSettings ? (
        <div className="dashboard-layout-container">
          <aside className="dashboard-sidebar">
            <Link to="/dashboard" className={`sidebar-link ${pathname === '/dashboard' && !location.search.includes('tab=') ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>
            <Link to="/dashboard?tab=bookings" className={`sidebar-link ${location.search.includes('tab=bookings') ? 'active' : ''}`}>
              <Calendar size={18} />
              <span>Bookings</span>
            </Link>
            <Link to="/payments-transaction" className={`sidebar-link ${pathname === '/payments-transaction' ? 'active' : ''}`}>
              <Wallet size={18} />
              <span>Payment Transactions</span>
            </Link>
            <Link to="/pricing-plans" className={`sidebar-link ${pathname === '/pricing-plans' ? 'active' : ''}`}>
              <Tag size={18} />
              <span>Pricing Plans</span>
            </Link>
            <Link to="/dashboard?tab=reports" className={`sidebar-link ${location.search.includes('tab=reports') ? 'active' : ''}`}>
              <BarChart size={18} />
              <span>Reports</span>
            </Link>
          </aside>
          <main className="dashboard-main-content">
            <Outlet />
          </main>
        </div>
      ) : (
        <main className="main-content">
          <Outlet />
        </main>
      )}

      {/* ─── Temporary Backend Connection Tester ─── */}
      <ConnectionTester />
    </div>
  );
}

function ConnectionTester() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [latency, setLatency] = useState<number | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  const testConnection = async () => {
    setStatus('loading');
    setResponse(null);
    setLatency(null);
    const start = Date.now();
    try {
      const res = await api.get('/health');
      setLatency(Date.now() - start);
      setResponse(res.data);
      setStatus('success');
    } catch (err: any) {
      setLatency(Date.now() - start);
      setResponse({
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setStatus('error');
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success': return '#10b981'; // Green
      case 'error': return '#ef4444'; // Red
      case 'loading': return '#f59e0b'; // Amber
      default: return '#3b82f6'; // Blue
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />

      {/* Test Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && status === 'idle') {
            testConnection();
          }
        }}
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#1f2937',
          border: `2px solid ${getStatusColor()}`,
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease',
          outline: 'none',
        }}
        title="Test Backend Connection"
      >
        {status === 'loading' ? (
          <svg style={{ animation: 'spin 1s linear infinite', width: '20px', height: '20px' }} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="30 150" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        )}
      </button>

      {/* Floating Card */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '60px',
          right: '0',
          width: '300px',
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          color: '#ffffff',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>API Connection Tester</h4>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px' }}
            >
              &times;
            </button>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '12px', wordBreak: 'break-all' }}>
            <strong>Target:</strong> {import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api/v1/health` : '/api/v1/health'}
          </div>

          <div style={{
            padding: '10px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            marginBottom: '12px',
            fontSize: '0.8rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Status:</span>
              <span style={{ fontWeight: 600, color: getStatusColor() }}>
                {status.toUpperCase()}
              </span>
            </div>
            {latency !== null && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Latency:</span>
                <span style={{ color: '#60a5fa' }}>{latency}ms</span>
              </div>
            )}
          </div>

          {response && (
            <div style={{ maxHeight: '100px', overflowY: 'auto', fontSize: '0.7rem', backgroundColor: '#0f172a', padding: '8px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}

          <button
            onClick={testConnection}
            disabled={status === 'loading'}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              backgroundColor: '#3b82f6',
              border: 'none',
              color: '#ffffff',
              fontWeight: 500,
              fontSize: '0.8rem',
              cursor: 'pointer',
              marginTop: '12px',
              transition: 'background-color 0.2s',
            }}
          >
            {status === 'loading' ? 'Testing...' : 'Test Connection Again'}
          </button>
        </div>
      )}
    </div>
  );
}
