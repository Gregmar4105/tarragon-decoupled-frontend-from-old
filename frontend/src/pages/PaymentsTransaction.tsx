import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '../contexts/ToastContext';
import {
  CreditCard,
  Search,
  FileDown,
  Coins,
  Wallet,
  Building,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  TrendingUp,
} from 'lucide-react';
import api from '../lib/axios';

interface Transaction {
  id: string; // transaction_reference
  date: string; // formatted created_at
  customer: string;
  email: string;
  source: string;
  bookingId: string;
  amount: number;
  method: string;
  status: string;
}

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
  first_name?: string;
  last_name?: string;
  tag_number?: string;
  tagNumber?: string;
  payment_option?: 'check-in' | 'checkout';
  paymentOption?: 'check-in' | 'checkout';
  payment_status?: 'successful' | 'pending' | 'failed';
  payment_method?: string;
  payment_date?: string;
  transaction_id?: string;
  photos?: string[];
}

export default function PaymentsTransaction() {
  const toast = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]); // To resolve details for payment modal
  
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    averageTransaction: 0,
  });

  const getPastDateString = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  // Filter States
  const [startDate, setStartDate] = useState(getPastDateString(30));
  const [endDate, setEndDate] = useState(getPastDateString(0));
  const [sourceFilter, setSourceFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  const [searchQuery, setSearchQuery] = useState('');
  const [processingBooking, setProcessingBooking] = useState<Booking | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'Cash' | 'E-Wallet' | 'Bank Transfer'>('Cash');
  
  const [submitLoading, setSubmitLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch transaction ledger & stats
  const fetchData = async () => {
    try {
      setLoading(true);
      const [txnRes, bookingRes] = await Promise.all([
        api.get('/transactions', {
          params: {
            start_date: startDate,
            end_date: endDate,
            source: sourceFilter,
            method: methodFilter,
          }
        }),
        api.get('/bookings')
      ]);

      if (txnRes.data) {
        setTransactions(txnRes.data.data || []);
        setStats(txnRes.data.stats || { totalRevenue: 0, totalTransactions: 0, averageTransaction: 0 });
      }

      if (bookingRes.data) {
        setBookings(bookingRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch transaction data:', err);
      toast.error('Failed to retrieve transactions ledger data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, sourceFilter, methodFilter]);

  const handleDownloadInvoice = (txnId: string) => {
    toast.success(`Downloading invoice for transaction ${txnId}...`);
  };

  // Export transaction ledger to CSV
  const handleExportCSV = async () => {
    try {
      toast.info('Exporting transaction CSV...');
      const response = await api.get('/transactions/export', {
        params: {
          start_date: startDate,
          end_date: endDate,
          source: sourceFilter,
          method: methodFilter,
        },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions_export_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Transaction history exported successfully!');
    } catch (err) {
      console.error('Error exporting transactions CSV:', err);
      toast.error('Failed to export CSV.');
    }
  };

  const handleOpenProcessPayment = (txn: Transaction) => {
    const booking = bookings.find(b => b.id === txn.bookingId);
    if (booking) {
      setProcessingBooking(booking);
      setSelectedMethod('Cash');
    } else {
      toast.error('Could not load detailed booking data for this transaction.');
    }
  };

  const handleConfirmPayment = async () => {
    if (!processingBooking) return;

    try {
      setSubmitLoading(true);
      const generatedTxnId = 'TXN-' + Math.floor(10000 + Math.random() * 90000);
      const nowString = new Date().toISOString().replace('T', ' ').substring(0, 16);

      const payload = {
        payment_status: 'successful',
        payment_method: selectedMethod,
        payment_date: nowString,
        transaction_id: generatedTxnId,
      };

      await api.put(`/bookings/${processingBooking.id}`, payload);
      toast.success(`Payment of ₱${processingBooking.price} processed successfully via ${selectedMethod}!`);
      setProcessingBooking(null);
      await fetchData();
    } catch (err) {
      console.error('Failed to process payment:', err);
      toast.error('Failed to update payment transaction record.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Search filtering
  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = 
      txn.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      txn.customer.toLowerCase().includes(searchQuery.toLowerCase()) || 
      txn.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (txn.email && txn.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="tab-pane fade-in-panel">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <CreditCard size={28} style={{ color: 'var(--color-primary)' }} />
        <div>
          <h1 style={{ margin: 0 }}>Payment Transactions Ledger</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Verify payments, invoices, and settlement methods.</p>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card glass-panel">
          <div className="stat-icon stat-gradient-purple"><Wallet size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">₱{stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon stat-gradient-blue"><Coins size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Total Transactions</span>
            <span className="stat-value">{stats.totalTransactions} Settled</span>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon stat-gradient-green"><TrendingUp size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Average Transaction</span>
            <span className="stat-value">₱{stats.averageTransaction.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Date range picker */}
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

          {/* Source Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              style={{ padding: '6px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}
            >
              <option value="all">All Channels</option>
              <option value="online">Online</option>
              <option value="walk-in">Walk-in</option>
            </select>
          </div>

          {/* Method Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Method:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              style={{ padding: '6px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="e-wallet">E-Wallet</option>
              <option value="bank transfer">Bank Transfer</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="search-box-wrapper" style={{ position: 'relative', width: '260px' }}>
            <Search size={16} className="search-box-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search Customer / Ref ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '38px', height: '40px', fontSize: '0.9rem' }}
            />
          </div>

          <button className="btn btn-secondary" onClick={handleExportCSV} style={{ height: '40px', padding: '0 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileDown size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            <Clock className="spin-animation" size={32} style={{ margin: '0 auto 1rem', opacity: 0.7 }} />
            <p>Loading ledger records from database...</p>
          </div>
        ) : (
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Ref ID</th>
                  <th>Customer Name</th>
                  <th>Amount</th>
                  <th>Source</th>
                  <th>Payment Method</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Invoice</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((txn) => {
                  const isPaid = txn.status.toLowerCase() === 'completed' || txn.status.toLowerCase() === 'paid';
                  return (
                    <tr key={txn.id}>
                      <td>
                        <strong>{txn.id || '—'}</strong>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                          {txn.bookingId}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 650, color: 'var(--text-primary)' }}>{txn.customer}</span>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-primary)' }}>₱{txn.amount}</strong>
                      </td>
                      <td>
                        <span className={`pill-badge source-${txn.source.toLowerCase() === 'online' ? 'website' : 'walk-in'}`}>
                          {txn.source}
                        </span>
                      </td>
                      <td>
                        {txn.method ? (
                          <span className="badge-method" style={{
                            padding: '4px 8px',
                            background: 'var(--bg-secondary)',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            border: '1px solid var(--border)'
                          }}>
                            {txn.method}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {txn.date}
                      </td>
                      <td>
                        <span className={`pill-badge badge-${isPaid ? 'completed' : 'warning'}`}>
                          {txn.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {isPaid && (
                          <button
                            onClick={() => handleDownloadInvoice(txn.id)}
                            className="btn btn-secondary btn-icon-sm"
                            title="Download Invoice"
                            style={{ padding: '4px 8px', height: 'auto', fontSize: '0.75rem' }}
                          >
                            <FileDown size={12} style={{ marginRight: '4px' }} />
                            Invoice
                          </button>
                        )}
                      </td>
                      <td>
                        {!isPaid ? (
                          <button
                            onClick={() => handleOpenProcessPayment(txn)}
                            className="btn btn-primary"
                            style={{ 
                              padding: '4px 12px', 
                              height: '32px', 
                              fontSize: '0.8rem', 
                              borderRadius: '6px',
                              backgroundColor: 'var(--color-primary)',
                              border: 'none',
                              color: '#fff',
                              cursor: 'pointer'
                            }}
                          >
                            Process Payment
                          </button>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>
                            <CheckCircle2 size={14} /> Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      <AlertCircle size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                      <p>No transactions match the selected criteria.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Process Payment Ticket Modal */}
      {processingBooking && createPortal(
        <div className="modal-overlay" onClick={() => setProcessingBooking(null)}>
          <div className="modal-content-card ticket-card-modal fade-in-panel" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setProcessingBooking(null)} aria-label="Close modal">
              <X size={20} />
            </button>
            
            {/* Ticket Header */}
            <div className="ticket-header">
              <div className="ticket-logo-wrapper">
                <img src="/logo.svg" alt="Tarragon Manila Logo" style={{ height: '36px', width: '29px', objectFit: 'cover' }} />
                <div>
                  <h3>TARRAGON MANILA</h3>
                  <span>Baggage Payment Settlement</span>
                </div>
              </div>
              <span className="pill-badge badge-warning" style={{ textTransform: 'uppercase' }}>
                {(processingBooking.payment_status || 'PENDING').toUpperCase()}
              </span>
            </div>

            <div className="ticket-body" style={{ overflowY: 'auto', flex: 1 }}>
              <div className="ticket-row-grid">
                <div className="ticket-field">
                  <span className="ticket-label">TICKET REFERENCE</span>
                  <span className="ticket-value highlight-ref">{processingBooking.id}</span>
                </div>
                <div className="ticket-field">
                  <span className="ticket-label">CUSTOMER NAME</span>
                  <span className="ticket-value">{processingBooking.name}</span>
                </div>
              </div>

              <div className="ticket-row-grid">
                <div className="ticket-field">
                  <span className="ticket-label">DROP-OFF DATE/TIME</span>
                  <span className="ticket-value">{processingBooking.dropoff}</span>
                </div>
                <div className="ticket-field">
                  <span className="ticket-label">PICK-UP DATE/TIME</span>
                  <span className="ticket-value">{processingBooking.pickup}</span>
                </div>
              </div>

              <div className="ticket-row-grid">
                <div className="ticket-field">
                  <span className="ticket-label">LUGGAGE DESCRIPTION</span>
                  <span className="ticket-value">{processingBooking.bags} {processingBooking.bags === 1 ? 'Bag' : 'Bags'} ({processingBooking.size})</span>
                </div>
                <div className="ticket-field">
                  <span className="ticket-label">CONTACT INFORMATION</span>
                  <span className="ticket-value" style={{ fontSize: '0.8rem' }}>{processingBooking.phone}</span>
                </div>
              </div>

              <div className="ticket-row-grid" style={{ borderTop: '1px dashed var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                <div className="ticket-field">
                  <span className="ticket-label">BOOKING SOURCE</span>
                  <span className="ticket-value">
                    <span className={`pill-badge source-${processingBooking.source || 'website'}`} style={{ display: 'inline-block', fontSize: '0.7rem', padding: '2px 8px' }}>
                      {processingBooking.source === 'walk-in' ? 'Walk-In' : 'Website'}
                    </span>
                  </span>
                </div>
                <div className="ticket-field">
                  <span className="ticket-label">PAYMENT SETTLEMENT TERM</span>
                  <span className="ticket-value" style={{ fontSize: '0.8rem', fontWeight: 700, color: (processingBooking.payment_option || processingBooking.paymentOption) === 'checkout' ? 'var(--warning)' : '#10b981' }}>
                    {(processingBooking.payment_option || processingBooking.paymentOption) === 'checkout' ? 'Pay at Check-Out' : 'Pay at Check-In'}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div style={{ marginTop: '1.25rem', borderTop: '1px dashed var(--border)', paddingTop: '1.25rem' }}>
                <span className="ticket-label" style={{ display: 'block', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>SELECT PAYMENT METHOD</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(['Cash', 'E-Wallet', 'Bank Transfer'] as const).map((method) => {
                    const isSelected = selectedMethod === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setSelectedMethod(method)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.6rem 1.0rem',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border)',
                          background: isSelected ? 'rgba(255, 56, 92, 0.03)' : 'var(--bg-card)',
                          color: isSelected ? 'var(--color-primary)' : 'var(--text-primary)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontWeight: 600,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {method === 'Cash' && <Coins size={16} />}
                        {method === 'E-Wallet' && <Wallet size={16} />}
                        {method === 'Bank Transfer' && <Building size={16} />}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{method}</span>
                            {isSelected && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }}></span>}
                          </div>
                          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
                            {method === 'Cash' && 'Settle with counter physical currency.'}
                            {method === 'E-Wallet' && 'GCash or Maya digital wallet.'}
                            {method === 'Bank Transfer' && 'Clearing via BDO, BPI, or UnionBank.'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Barcode Graphic */}
              <div className="ticket-barcode-wrapper" style={{ marginTop: '1.25rem' }}>
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
                <span className="barcode-number">{processingBooking.id}-2026-TARRAGON</span>
              </div>
            </div>

            {/* Ticket Footer */}
            <div className="ticket-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="ticket-price-box">
                <span className="ticket-label">TOTAL CHARGES</span>
                <span className="ticket-total-price">₱{processingBooking.price}</span>
              </div>
              <div className="ticket-actions" style={{ display: 'flex', gap: '0.5rem', width: 'auto', flex: 'none' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ height: '40px', padding: '0 1rem', fontSize: '0.85rem' }}
                  onClick={() => setProcessingBooking(null)}
                  disabled={submitLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ height: '40px', padding: '0 1.25rem', fontSize: '0.85rem', backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)', color: 'white' }}
                  onClick={handleConfirmPayment}
                  disabled={submitLoading}
                >
                  {submitLoading ? 'Processing...' : 'Confirm Paid'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
