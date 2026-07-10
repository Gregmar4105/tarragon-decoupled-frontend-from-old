import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import {
  ArrowLeft,
  Upload,
  User,
  Mail,
  Phone,
  Tag,
  CreditCard,
  Percent,
} from 'lucide-react';
import api from '../lib/axios';

export default function AddWalkIn() {
  const toast = useToast();
  const navigate = useNavigate();

  // Form input states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Default date strings
  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [dropoffDate, setDropoffDate] = useState(getTodayDateString());
  const [dropoffTime, setDropoffTime] = useState('10:00');
  const [pickupDate, setPickupDate] = useState(getTomorrowDateString());
  const [pickupTime, setPickupTime] = useState('18:00');

  const [sizeCounts, setSizeCounts] = useState({
    small: 0,
    regular: 0,
    large: 0,
    plus: 0
  });

  const [tagNumber, setTagNumber] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [payOption, setPayOption] = useState<'check-in' | 'checkout'>('check-in');

  // Backend/Seeded Pricing plans loaded dynamically
  const [dbPricingPlans, setDbPricingPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | number>('default');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    api.get('/pricing-plans')
      .then(res => {
        if (res.data && Array.isArray(res.data.data)) {
          const activePlans = res.data.data.filter((p: any) => p.is_active);
          setDbPricingPlans(activePlans);
        }
      })
      .catch(err => {
        console.error('Error fetching pricing plans:', err);
      });
  }, []);

  const DEFAULT_RATES = {
    price_small: 100,
    price_regular: 200,
    price_large: 300,
    price_plus: 400
  };

  const getActiveRates = () => {
    const plan = dbPricingPlans.find(p => p.id === Number(selectedPlanId) || p.id === selectedPlanId);
    if (plan) {
      return {
        price_small: plan.price_small ?? 100,
        price_regular: plan.price_regular ?? 200,
        price_large: plan.price_large ?? 300,
        price_plus: plan.price_plus ?? 400
      };
    }
    return DEFAULT_RATES;
  };

  const calculateDays = () => {
    if (!dropoffDate || !pickupDate) return 1;
    const start = new Date(`${dropoffDate}T${dropoffTime}`);
    const end = new Date(`${pickupDate}T${pickupTime}`);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
    const diffTime = end.getTime() - start.getTime();
    if (diffTime <= 0) return 1;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 1 : diffDays;
  };

  const handleAutoGenerateTag = () => {
    const rand = Math.floor(10000 + Math.random() * 90000);
    setTagNumber(`TM-W${rand}`);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      fileList.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setPhotos(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalBags = sizeCounts.small + sizeCounts.regular + sizeCounts.large + sizeCounts.plus;
    if (totalBags === 0) {
      toast.warning('Please select at least one bag size and quantity.');
      return;
    }

    const rates = getActiveRates();
    const days = calculateDays();
    const calculatedPrice = days * (
      (sizeCounts.small * rates.price_small) +
      (sizeCounts.regular * rates.price_regular) +
      (sizeCounts.large * rates.price_large) +
      (sizeCounts.plus * rates.price_plus)
    );

    const sizeSummaryParts = [];
    if (sizeCounts.small > 0) sizeSummaryParts.push(`Small (x${sizeCounts.small})`);
    if (sizeCounts.regular > 0) sizeSummaryParts.push(`Regular (x${sizeCounts.regular})`);
    if (sizeCounts.large > 0) sizeSummaryParts.push(`Large (x${sizeCounts.large})`);
    if (sizeCounts.plus > 0) sizeSummaryParts.push(`Plus (x${sizeCounts.plus})`);
    const sizeSummary = sizeSummaryParts.join(', ');

    const refId = tagNumber.trim() ? tagNumber.trim() : `TM-W${Math.floor(10000 + Math.random() * 90000)}`;

    const payload = {
      id: refId,
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: email.trim(),
      phone: phone.trim(),
      dropoff: `${dropoffDate} ${dropoffTime}`,
      pickup: `${pickupDate} ${pickupTime}`,
      bags: totalBags,
      size: sizeSummary,
      price: calculatedPrice,
      status: 'checked-in',
      source: 'walk-in',
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      tag_number: refId,
      payment_option: payOption,
      size_counts: sizeCounts,
      photos: photos
    };

    try {
      setSubmitLoading(true);
      await api.post('/bookings', payload);
      toast.success('Walk-in booking created successfully!');
      navigate('/dashboard?tab=bookings');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create walk-in booking.';
      toast.error(msg);
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const rates = getActiveRates();
  const days = calculateDays();
  const totalBags = sizeCounts.small + sizeCounts.regular + sizeCounts.large + sizeCounts.plus;
  const totalPrice = days * (
    (sizeCounts.small * rates.price_small) +
    (sizeCounts.regular * rates.price_regular) +
    (sizeCounts.large * rates.price_large) +
    (sizeCounts.plus * rates.price_plus)
  );

  return (
    <div className="tab-pane fade-in-panel">
      <div className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/dashboard?tab=bookings')} className="btn btn-secondary" style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', justifyContent: 'center' }} title="Back to bookings">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ margin: 0 }}>Add Walk-In Booking</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Create a new walk-in customer booking record with backend database registration.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Left Side: Booking Form Card */}
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Customer Information
            </h3>

            {/* Row 1: Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label htmlFor="walkin-first-name" style={{ fontWeight: 750 }}>First Name *</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="walkin-first-name"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. John"
                    style={{ paddingLeft: '40px' }}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="walkin-last-name" style={{ fontWeight: 750 }}>Last Name *</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="walkin-last-name"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Doe"
                    style={{ paddingLeft: '40px' }}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Contact */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label htmlFor="walkin-email" style={{ fontWeight: 750 }}>Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="walkin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                    style={{ paddingLeft: '40px' }}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="walkin-phone" style={{ fontWeight: 750 }}>Phone Number *</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="walkin-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0917 123 4567"
                    style={{ paddingLeft: '40px' }}
                    required
                  />
                </div>
              </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginTop: '1rem' }}>
              Rentals & Schedule
            </h3>

            {/* Row 3: Dropoff & Pickup Date/Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div className="form-group" style={{ flex: 1.2 }}>
                  <label htmlFor="walkin-dropoff-date" style={{ fontWeight: 750 }}>Drop-off Date *</label>
                  <input
                    id="walkin-dropoff-date"
                    type="date"
                    value={dropoffDate}
                    onChange={(e) => setDropoffDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 0.8 }}>
                  <label htmlFor="walkin-dropoff-time" style={{ fontWeight: 750 }}>Time</label>
                  <input
                    id="walkin-dropoff-time"
                    type="time"
                    value={dropoffTime}
                    onChange={(e) => setDropoffTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div className="form-group" style={{ flex: 1.2 }}>
                  <label htmlFor="walkin-pickup-date" style={{ fontWeight: 750 }}>Pick-up Date *</label>
                  <input
                    id="walkin-pickup-date"
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 0.8 }}>
                  <label htmlFor="walkin-pickup-time" style={{ fontWeight: 750 }}>Time</label>
                  <input
                    id="walkin-pickup-time"
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Row 4: Pricing Plan Tier Selection */}
            <div className="form-group">
              <label htmlFor="walkin-pricing-plan" style={{ fontWeight: 750 }}>Pricing Plan / Rate Card *</label>
              <select
                id="walkin-pricing-plan"
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
              >
                <option value="default">Standard Rates (Default)</option>
                {dbPricingPlans.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} (S: ₱{plan.price_small}, R: ₱{plan.price_regular}, L: ₱{plan.price_large}, P: ₱{plan.price_plus})
                  </option>
                ))}
              </select>
            </div>

            {/* Row 5: Baggage Counters */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem' }}>
                Baggage Quantities
              </label>
              <div className="baggage-counter-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                {(['small', 'regular', 'large', 'plus'] as const).map(size => {
                  const sizeLabels: Record<string, string> = {
                    small: 'Small',
                    regular: 'Regular',
                    large: 'Large',
                    plus: 'Plus'
                  };
                  const sizeRates: Record<string, number> = {
                    small: rates.price_small,
                    regular: rates.price_regular,
                    large: rates.price_large,
                    plus: rates.price_plus
                  };
                  return (
                    <div key={size} className="baggage-counter-card" style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, display: 'block', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{sizeLabels[size]}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.75rem' }}>₱{sizeRates[size]}/day</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button
                          type="button"
                          onClick={() => setSizeCounts(prev => ({ ...prev, [size]: Math.max(0, prev[size] - 1) }))}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem' }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, width: '20px' }}>{sizeCounts[size]}</span>
                        <button
                          type="button"
                          onClick={() => setSizeCounts(prev => ({ ...prev, [size]: prev[size] + 1 }))}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem' }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginTop: '1rem' }}>
              Security & Photos
            </h3>

            {/* Row 6: Tag Number */}
            <div className="form-group">
              <label htmlFor="walkin-tag-number" style={{ fontWeight: 750 }}>Baggage Security Tag Number</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Tag size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="walkin-tag-number"
                    type="text"
                    value={tagNumber}
                    onChange={(e) => setTagNumber(e.target.value)}
                    placeholder="Auto-generate or enter custom ID"
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAutoGenerateTag}
                  className="btn btn-secondary"
                  style={{ height: '48px', padding: '0 1.5rem' }}
                >
                  Generate Tag
                </button>
              </div>
            </div>

            {/* Row 7: Baggage Photos */}
            <div className="form-group">
              <label style={{ fontWeight: 750 }}>Baggage Visual Inspection Photos</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="photo-upload-zone" style={{ border: '2px dashed var(--border)', borderRadius: '16px', padding: '2rem', textAlign: 'center', cursor: 'pointer', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: 'pointer', zIndex: 5 }}
                  />
                  <Upload size={24} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>Select visual verification photos</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Supported formats: JPG, PNG, WEBP (Max 10MB per file)</span>
                </div>

                {photos.length > 0 && (
                  <div className="photo-preview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
                    {photos.map((url, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '100%', paddingBottom: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <img src={url} alt="Baggage preview" style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(239, 68, 68, 0.9)', border: 'none', color: '#ffffff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 'bold', zIndex: 10 }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginTop: '1rem' }}>
              Billing & Settlement
            </h3>

            {/* Row 8: Payment Option */}
            <div className="form-group">
              <label style={{ fontWeight: 750 }}>Settlement Terms *</label>
              <div style={{ display: 'flex', gap: '2rem', marginTop: '0.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  <input
                    type="radio"
                    name="payment-option"
                    checked={payOption === 'check-in'}
                    onChange={() => setPayOption('check-in')}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                  />
                  <CreditCard size={16} style={{ color: 'var(--text-secondary)' }} />
                  Pay at Check-In (Cash / Maya / GCash)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  <input
                    type="radio"
                    name="payment-option"
                    checked={payOption === 'checkout'}
                    onChange={() => setPayOption('checkout')}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                  />
                  <Percent size={16} style={{ color: 'var(--text-secondary)' }} />
                  Pay at Check-Out (Billed on Retrieval)
                </label>
              </div>
            </div>

            {/* Submit Action Block */}
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/dashboard?tab=bookings')}
                style={{ flex: 1 }}
                disabled={submitLoading}
              >
                Cancel & Exit
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1.5 }}
                disabled={submitLoading || totalBags === 0}
              >
                {submitLoading ? 'Creating Booking...' : 'Register Walk-In Customer'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Dynamic Real-time Invoice Details */}
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '24px', position: 'sticky', top: '100px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            Booking Invoice
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Customer:</span>
              <strong style={{ color: 'var(--text-primary)' }}>
                {firstName || lastName ? `${firstName} ${lastName}` : '—'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Drop-off Schedule:</span>
              <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                {dropoffDate ? `${dropoffDate} at ${dropoffTime}` : '—'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Retrieval Schedule:</span>
              <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                {pickupDate ? `${pickupDate} at ${pickupTime}` : '—'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Baggage Tag:</span>
              <strong style={{ color: 'var(--color-primary)' }}>
                {tagNumber || 'Auto-generated on submit'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>Rental Duration:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{days} {days === 1 ? 'day' : 'days'}</strong>
            </div>

            {/* Sizes itemized details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Charges Summary
              </span>

              {sizeCounts.small > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <span>Small Size (x{sizeCounts.small}):</span>
                  <span>₱{(sizeCounts.small * rates.price_small * days).toLocaleString()}</span>
                </div>
              )}
              {sizeCounts.regular > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <span>Regular Size (x{sizeCounts.regular}):</span>
                  <span>₱{(sizeCounts.regular * rates.price_regular * days).toLocaleString()}</span>
                </div>
              )}
              {sizeCounts.large > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <span>Large Size (x{sizeCounts.large}):</span>
                  <span>₱{(sizeCounts.large * rates.price_large * days).toLocaleString()}</span>
                </div>
              )}
              {sizeCounts.plus > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <span>Plus Size (x{sizeCounts.plus}):</span>
                  <span>₱{(sizeCounts.plus * rates.price_plus * days).toLocaleString()}</span>
                </div>
              )}
              {totalBags === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '0.5rem 0' }}>
                  No bags selected. Increase counter quantities.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.05rem' }}>Total Charge:</span>
              <strong style={{ fontSize: '1.5rem', fontWeight: 850, color: 'var(--color-primary)' }}>
                ₱{totalPrice.toLocaleString()}
              </strong>
            </div>

            <div style={{ background: 'rgba(255, 56, 92, 0.04)', border: '1px solid rgba(255, 56, 92, 0.1)', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>ℹ</span>
              <span>
                {payOption === 'check-in'
                  ? 'Customer is paying immediately. A successful transaction ledger entry will be recorded in the system.'
                  : 'Customer wishes to settle payment upon bag retrieval. Billing will occur during check-out.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
