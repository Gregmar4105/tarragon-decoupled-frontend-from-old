import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../lib/axios';
import {
  MapPin,
  Calendar,
  Star,
  Clock,
  Shield,
  Lock,
  ArrowRight,
  Phone,
  Mail,
  MousePointerClick,
  Compass,
  CheckCircle2,
  Volume2,
  VolumeX,
} from 'lucide-react';

/**
 * Home Page - Tarragon Manila Baggage Storage & Rentals
 *
 * Fullscreen background video player fold (extending under transparent navbar)
 * with a floating glassmorphic storage booking card, audio volume toggle control,
 * and standard information grids below.
 */
export default function Home() {
  const location = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Search Form State
  const [dropOffDate, setDropOffDate] = useState('');
  const [dropOffTime, setDropOffTime] = useState('10:00');
  const [pickUpDate, setPickUpDate] = useState('');
  const [pickUpTime, setPickUpTime] = useState('18:00');

  // Booking Wizard Step State
  const [bookingStep, setBookingStep] = useState(0);

  // Additional Wizard Form State
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');

  // Baggage Counter State (aligned with AddWalkIn)
  const [sizeCounts, setSizeCounts] = useState({
    small: 0,
    regular: 1,
    large: 0,
    plus: 0
  });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<any>(null);

  // Cloudflare Turnstile Spam Protection State & Refs
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileWidgetId = useRef<string | null>(null);

  // Render and manage Cloudflare Turnstile widget in Step 3
  const turnstileRefCallback = useCallback((node: HTMLDivElement | null) => {
    if (!node) {
      // Cleanup when container is unmounted
      const turnstile = (window as any).turnstile;
      if (turnstile && turnstileWidgetId.current !== null) {
        try {
          console.log("Turnstile: cleaning up widget", turnstileWidgetId.current);
          turnstile.remove(turnstileWidgetId.current);
        } catch (e) {
          console.error("Turnstile cleanup error:", e);
        }
        turnstileWidgetId.current = null;
      }
      return;
    }

    // Container is mounted, check and render
    console.log("Turnstile: container mounted", node);

    // Make sure script is loaded
    let script = document.querySelector('script[src*="challenges.cloudflare.com"]');
    if (!script) {
      console.log("Turnstile: script not found, injecting dynamically");
      const newScript = document.createElement('script');
      newScript.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      newScript.async = true;
      newScript.defer = true;
      document.head.appendChild(newScript);
    }

    let retries = 0;
    const checkAndRender = () => {
      const turnstile = (window as any).turnstile;
      if (turnstile) {
        try {
          if (turnstileWidgetId.current !== null) {
            console.log("Turnstile: removing existing widget", turnstileWidgetId.current);
            turnstile.remove(turnstileWidgetId.current);
            turnstileWidgetId.current = null;
          }
          setTurnstileToken(null);

          const hostname = window.location.hostname;
          const sitekey = (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.test'))
            ? '1x00000000000000000000AA'
            : (import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAADot1R9Dkw8rU7j0yromhgpzb6Y');

          console.log(`Turnstile: rendering widget for hostname "${hostname}" using sitekey "${sitekey}"`);

          const widgetId = turnstile.render(node, {
            sitekey: sitekey,
            callback: (token: string) => {
              console.log("Turnstile: token received", token ? "SUCCESS" : "EMPTY");
              setTurnstileToken(token);
            },
            'error-callback': (err: any) => {
              console.error("Turnstile: error encountered", err);
              setTurnstileToken(null);
            },
            'expired-callback': () => {
              console.log("Turnstile: token expired");
              setTurnstileToken(null);
            }
          });
          turnstileWidgetId.current = widgetId;
          console.log("Turnstile: widget successfully rendered with ID", widgetId);
        } catch (err) {
          console.error("Turnstile: exception during render:", err);
        }
      } else {
        retries++;
        if (retries < 50) { // Limit to 10 seconds of retries
          setTimeout(checkAndRender, 200);
        } else {
          console.error("Turnstile: timed out waiting for window.turnstile to load");
        }
      }
    };

    checkAndRender();
  }, []);

  // Online Booking API State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Timed Slogan State
  const [showSlogans, setShowSlogans] = useState(true);

  // Listen for ?book=true query parameter to start the booking process
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('book') === 'true') {
      setBookingStep(1);
      setTimeout(() => {
        const el = document.querySelector('.booking-details-card');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [location.search]);

  // Video volume and autoplay state
  const [isMuted, setIsMuted] = useState(true);

  // Auto-play trigger and mute setting handling browser policies
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch((err) => {
        console.log("Autoplay blocked initially, playing muted default:", err);
        // Force muted play to satisfy browsers
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().catch(e => console.error("Error playing video:", e));
        }
      });
    }
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  // Rescue Video volume state and ref
  const rescueVideoRef = useRef<HTMLVideoElement>(null);
  const [isRescueMuted, setIsRescueMuted] = useState(true);

  const toggleRescueMute = () => {
    if (rescueVideoRef.current) {
      const nextMuted = !rescueVideoRef.current.muted;
      rescueVideoRef.current.muted = nextMuted;
      setIsRescueMuted(nextMuted);
    }
  };

  // Baggage Video volume state and ref
  const baggageVideoRef = useRef<HTMLVideoElement>(null);
  const [isBaggageMuted, setIsBaggageMuted] = useState(true);

  const toggleBaggageMute = () => {
    if (baggageVideoRef.current) {
      const nextMuted = !baggageVideoRef.current.muted;
      baggageVideoRef.current.muted = nextMuted;
      setIsBaggageMuted(nextMuted);
    }
  };

  // Dynamic Pricing State
  const [standardPlan, setStandardPlan] = useState<any>(null);

  useEffect(() => {
    api.get('/pricing-plans/public')
      .then(res => {
        if (res.data && Array.isArray(res.data.data)) {
          const plans = res.data.data;
          const std = plans.find((p: any) => p.name.toLowerCase().includes('standard'));
          if (std) {
            setStandardPlan(std);
          }
        }
      })
      .catch(err => {
        console.error('Error fetching public pricing plans:', err);
      });
  }, []);

  const getRates = () => {
    if (standardPlan) {
      return {
        small: Number(standardPlan.price_small) || 100,
        regular: Number(standardPlan.price_regular) || 200,
        large: Number(standardPlan.price_large) || 300,
        plus: Number(standardPlan.price_plus) || 400
      };
    }
    return {
      small: 100,
      regular: 200,
      large: 300,
      plus: 400
    };
  };

  const rates = getRates();

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const cycleTime = video.currentTime % 10;
    setShowSlogans(cycleTime < 7);
  };

  const pricingOptions = [
    {
      title: 'Flat Rate Baggage Storage',
      price: String(rates.regular),
      currency: '₱',
      period: 'bag / day',
      description: 'Standard tier rate for a regular size bag. Perfect for standard suitcases and backpacks.',
      features: [
        'Secure security seal tag',
        '24/7 CCTV monitored storage',
        'Safety insurance coverage included',
        'Flexible drop-off & pick-up times',
      ],
      tag: 'Best Value',
      btnText: 'Book Storage',
    }
  ];

  const steps = [
    {
      num: '1',
      title: 'Book Online',
      description: 'Select your preferred drop-off location in Manila, date, time, and number of bags.',
      icon: <MousePointerClick className="step-icon" size={24} />,
    },
    {
      num: '2',
      title: 'Secure Drop-Off',
      description: 'Hand over your luggage at our locker center. We tag and secure your bags with safety seals.',
      icon: <Lock className="step-icon" size={24} />,
    },
    {
      num: '3',
      title: 'Explore Hands-Free',
      description: 'Roam around Manila, shop at the malls, or tour the sights without dragging heavy bags.',
      icon: <Compass className="step-icon" size={24} />,
    },
    {
      num: '4',
      title: 'Pick Up Anytime',
      description: 'Retrieve your baggage by presenting your digital booking ticket at the storage desk.',
      icon: <CheckCircle2 className="step-icon" size={24} />,
    },
  ];

  const reviews = [
    {
      name: 'Michael Chen',
      avatar: 'MC',
      date: 'June 2026',
      rating: 5,
      comment: 'An absolute lifesaver! Stored my large bags at Terminal 3 while waiting for a 10-hour layover. Mall of Asia and Intramuros were a breeze to explore.',
    },
    {
      name: 'Patricia Alunan',
      avatar: 'PA',
      date: 'May 2026',
      rating: 5,
      comment: 'Super secure. We left our surfboards and heavy luggage here before boarding our domestic flight to Siargao. Staff was professional and helpful.',
    },
    {
      name: 'David Miller',
      avatar: 'DM',
      date: 'April 2026',
      rating: 5,
      comment: 'Easy online booking, secure zip seals, and convenient location in Makati. Storing my luggage made my last day in Manila so much better!',
    },
  ];

  const calculateTotalPrice = () => {
    if (!dropOffDate || !pickUpDate) return 0;
    const start = new Date(dropOffDate);
    const end = new Date(pickUpDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const days = diffDays === 0 ? 1 : diffDays;

    return days * (
      (sizeCounts.small * rates.small) +
      (sizeCounts.regular * rates.regular) +
      (sizeCounts.large * rates.large) +
      (sizeCounts.plus * rates.plus)
    );
  };

  const resetWizard = () => {
    setBookingStep(0);
    setDropOffDate('');
    setDropOffTime('10:00');
    setPickUpDate('');
    setPickUpTime('18:00');
    setSizeCounts({
      small: 0,
      regular: 1,
      large: 0,
      plus: 0
    });
    setCustName('');
    setCustEmail('');
    setCustPhone('');
    setErrorMessage('');
    setIsLoading(false);
    setTurnstileToken(null);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!turnstileToken) {
      setErrorMessage('Verification failed: Please complete the Cloudflare Turnstile check to prove you are human.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const totalBags = sizeCounts.small + sizeCounts.regular + sizeCounts.large + sizeCounts.plus;
    const sizeSummaryParts = [];
    if (sizeCounts.small > 0) sizeSummaryParts.push(`Small (x${sizeCounts.small})`);
    if (sizeCounts.regular > 0) sizeSummaryParts.push(`Regular (x${sizeCounts.regular})`);
    if (sizeCounts.large > 0) sizeSummaryParts.push(`Large (x${sizeCounts.large})`);
    if (sizeCounts.plus > 0) sizeSummaryParts.push(`Plus (x${sizeCounts.plus})`);
    const sizeSummary = sizeSummaryParts.join(', ');

    const hostname = window.location.hostname;
    const activeSitekey = (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.test'))
      ? '1x00000000000000000000AA'
      : (import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAADot1R9Dkw8rU7j0yromhgpzb6Y');

    const payload = {
      name: custName.trim(),
      email: custEmail.trim(),
      phone: custPhone.trim(),
      dropoff: `${dropOffDate} ${dropOffTime}`,
      pickup: `${pickUpDate} ${pickUpTime}`,
      bags: totalBags,
      size: sizeSummary,
      price: calculateTotalPrice(),
      size_counts: sizeCounts,
      turnstile_token: turnstileToken,
      turnstile_sitekey: activeSitekey,
    };

    try {
      const response = await api.post('/bookings/public', payload);
      if (response.data && response.data.data) {
        setModalData(response.data.data);
        setShowModal(true);
        // Reset card state to Step 0 immediately so that behind the modal it looks clean
        setBookingStep(0);
        setDropOffDate('');
        setDropOffTime('10:00');
        setPickUpDate('');
        setPickUpTime('18:00');
        setSizeCounts({
          small: 0,
          regular: 1,
          large: 0,
          plus: 0
        });
        setCustName('');
        setCustEmail('');
        setCustPhone('');
        setTurnstileToken(null);
      } else {
        setErrorMessage('Failed to receive confirmation data. Please try again.');
      }
    } catch (error: any) {
      console.error('Error creating online booking:', error);
      const msg = error.response?.data?.message || 'Failed to create booking. Please check your inputs and try again.';
      setErrorMessage(msg);
      // Reset Turnstile token on API failure so user has to verify again if they change inputs
      if ((window as any).turnstile && turnstileWidgetId.current !== null) {
        (window as any).turnstile.reset(turnstileWidgetId.current);
      }
      setTurnstileToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home-page">
      {/* ─── Fullscreen Video Hero Section ─── */}
      <section className="video-hero-fullscreen">
        <div className="fullscreen-video-container">
          <video
            ref={videoRef}
            className="fullscreen-video"
            autoPlay
            loop
            muted={isMuted}
            playsInline
            src="/can_you_add_a_Tarragon_Manila.mp4"
            onTimeUpdate={handleTimeUpdate}
          >
            Your browser does not support the video tag.
          </video>
          <button
            type="button"
            className="video-audio-toggle"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>

        {/* Left Side: Booking Details Card (Interactive Wizard) */}
        <div className="hero-left-column">
          <div className={`hero-text-block ${showSlogans ? 'visible' : 'hidden'}`}>
            <h2 className="slogan-main">Leave your heavy baggage at us!</h2>
            <p className="slogan-sub">We care about your belongings.</p>
          </div>

          {bookingStep === 0 && (
            <div className="booking-details-card step-0">
              <h3 className="card-title">Booking Details</h3>
              <p className="wizard-intro-text">
                Secure your luggage storage in Pasay City near NAIA Terminal 3 in just 3 quick steps.
              </p>
              <div className="wizard-actions">
                <button
                  type="button"
                  className="wizard-btn btn-back btn-how-it-works"
                  onClick={() => {
                    const el = document.getElementById('how-it-works');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  How It Works
                </button>
                <button
                  type="button"
                  className="wizard-btn btn-next start-booking-btn"
                  onClick={() => setBookingStep(1)}
                >
                  Book Now
                </button>

              </div>
            </div>
          )}

          {bookingStep === 1 && (
            <div className="booking-details-card step-1">
              <h3 className="card-title">Booking Details (Step 1 of 3)</h3>
              <div className="wizard-progress-bar">
                <div className="progress-fill" style={{ width: '33%' }}></div>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); setBookingStep(2); }} className="baggage-booking-form">
                <div className="form-row-double">
                  <div className="booking-input-group">
                    <label htmlFor="dropoff-date">
                      <Calendar size={12} style={{ marginRight: 2 }} />
                      Drop-off Date
                    </label>
                    <input
                      id="dropoff-date"
                      type="date"
                      value={dropOffDate}
                      onChange={(e) => setDropOffDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="booking-input-group">
                    <label htmlFor="dropoff-time">
                      <Clock size={12} style={{ marginRight: 2 }} />
                      Time
                    </label>
                    <input
                      id="dropoff-time"
                      type="time"
                      value={dropOffTime}
                      onChange={(e) => setDropOffTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row-double">
                  <div className="booking-input-group">
                    <label htmlFor="pickup-date">
                      <Calendar size={12} style={{ marginRight: 2 }} />
                      Pick-up Date
                    </label>
                    <input
                      id="pickup-date"
                      type="date"
                      value={pickUpDate}
                      onChange={(e) => setPickUpDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="booking-input-group">
                    <label htmlFor="pickup-time">
                      <Clock size={12} style={{ marginRight: 2 }} />
                      Time
                    </label>
                    <input
                      id="pickup-time"
                      type="time"
                      value={pickUpTime}
                      onChange={(e) => setPickUpTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="wizard-actions">
                  <button type="button" className="wizard-btn btn-back" onClick={() => setBookingStep(0)}>
                    Back
                  </button>
                  <button type="submit" className="wizard-btn btn-next">
                    Next
                  </button>
                </div>
              </form>
            </div>
          )}

          {bookingStep === 2 && (
            <div className="booking-details-card step-2">
              <h3 className="card-title">Booking Details (Step 2 of 3)</h3>
              <div className="wizard-progress-bar">
                <div className="progress-fill" style={{ width: '66%' }}></div>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); setBookingStep(3); }} className="baggage-booking-form">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {(['small', 'regular', 'large', 'plus'] as const).map(size => {
                    const sizeLabels: Record<string, string> = {
                      small: `Small (₱${rates.small}/d)`,
                      regular: `Regular (₱${rates.regular}/d)`,
                      large: `Large (₱${rates.large}/d)`,
                      plus: `Plus (₱${rates.plus}/d)`
                    };
                    return (
                      <div key={size} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.05)', padding: '0.45rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{sizeLabels[size]}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => setSizeCounts(prev => ({ ...prev, [size]: Math.max(0, prev[size] - 1) }))}
                            style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                          >
                            -
                          </button>
                          <span style={{ fontSize: '0.9rem', fontWeight: 800, width: '16px', textAlign: 'center' }}>{sizeCounts[size]}</span>
                          <button
                            type="button"
                            onClick={() => setSizeCounts(prev => ({ ...prev, [size]: prev[size] + 1 }))}
                            style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="wizard-actions">
                  <button type="button" className="wizard-btn btn-back" onClick={() => setBookingStep(1)}>
                    Back
                  </button>
                  <button type="submit" className="wizard-btn btn-next" disabled={sizeCounts.small + sizeCounts.regular + sizeCounts.large + sizeCounts.plus === 0}>
                    Next
                  </button>
                </div>
              </form>
            </div>
          )}

          {bookingStep === 3 && (
            <div className="booking-details-card step-3">
              <h3 className="card-title">Booking Details (Step 3 of 3)</h3>
              <div className="wizard-progress-bar">
                <div className="progress-fill" style={{ width: '90%' }}></div>
              </div>
              <form onSubmit={handleConfirmBooking} className="baggage-booking-form">
                <div className="form-group-wizard">
                  <label htmlFor="cust-name">Full Name</label>
                  <input
                    id="cust-name"
                    type="text"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="e.g. John Doe"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-row-double" style={{ marginTop: '0.75rem' }}>
                  <div className="booking-input-group">
                    <label htmlFor="cust-email">Email Address</label>
                    <input
                      id="cust-email"
                      type="email"
                      value={custEmail}
                      onChange={(e) => setCustEmail(e.target.value)}
                      placeholder="e.g. john@example.com"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="booking-input-group">
                    <label htmlFor="cust-phone">Contact Number</label>
                    <input
                      id="cust-phone"
                      type="tel"
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      placeholder="e.g. 0917 123 4567"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Cloudflare Turnstile Spam Protection */}
                <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'center', minHeight: '65px' }}>
                  <div ref={turnstileRefCallback} className="cf-turnstile-container" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>
                </div>

                {errorMessage && (
                  <div style={{ color: '#ff385c', background: 'rgba(255, 56, 92, 0.1)', padding: '0.65rem 0.85rem', borderRadius: '10px', fontSize: '0.85rem', marginTop: '0.75rem', border: '1px solid rgba(255, 56, 92, 0.2)', textAlign: 'center', lineHeight: '1.4' }}>
                    {errorMessage}
                  </div>
                )}

                <div className="wizard-actions">
                  <button type="button" className="wizard-btn btn-back" onClick={() => setBookingStep(2)} disabled={isLoading}>
                    Back
                  </button>
                  <button type="submit" className="wizard-btn btn-confirm" disabled={isLoading || !turnstileToken}>
                    {isLoading ? 'Processing...' : 'Confirm Booking'}
                  </button>
                </div>
              </form>
            </div>
          )}


        </div>

        {/* Right Side: Store Details Card (including map) */}
        <div className="store-details-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/logo.svg" alt="Tarragon Manila Logo" style={{ height: '48px', width: '39px', objectFit: 'cover', objectPosition: 'center', flexShrink: 0 }} />
            <h3 className="card-title">Tarragon Manila Baggage Storage Rentals</h3>
          </div>

          <a href="https://share.google/IWqrJOQXkpk2WKUsy" target="_blank" rel="noopener noreferrer" className="store-rating-link">
            <div className="store-rating-stars">
              <Star size={11} fill="#f59e0b" style={{ color: '#f59e0b' }} />
              <Star size={11} fill="#f59e0b" style={{ color: '#f59e0b' }} />
              <Star size={11} fill="#f59e0b" style={{ color: '#f59e0b' }} />
              <Star size={11} fill="#f59e0b" style={{ color: '#f59e0b' }} />
              <Star size={11} fill="#f59e0b" style={{ color: '#f59e0b' }} />
              <span className="rating-text">5.0 Google Rating</span>
            </div>
          </a>

          <div className="store-price-tag">
            <span className="price-value">₱{rates.regular}</span>
            <span className="price-lbl"> / bag / day</span>
          </div>

          <div className="store-address-block">
            <MapPin size={16} className="address-icon" style={{ flexShrink: 0 }} />
            <p className="store-address-text">
              P9 01, 8th St Corner 3rd St., Brgy. 183 Villamor, Pasay City, Philippines
            </p>
          </div>

          {/* Embedded Map directly inside the store details card */}
          <div className="card-map-container">
            <iframe
              title="Tarragon Manila Store Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15449.204133741741!2d120.9952687871582!3d14.524765700000009!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c9d1980b116b%3A0xd75b1c4cbc6933e2!2sTarragon%20Manila%20Baggage%20Storage%20Rental%20Services!5e0!3m2!1sen!2sus!4v1781972302119!5m2!1sen!2sus"
              width="100%"
              height="180"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          <div className="card-contact-info">
            <div className="contact-item">
              <Phone size={12} />
              <span>0917 117 3027</span>
            </div>
            <div className="contact-item">
              <Mail size={12} />
              <span>tarragonmanila@gmail.com</span>
            </div>
          </div>

          <div className="card-external-links">
            <a
              href="https://bounce.com/s/location/c95b6287-ed45-4619-8e03-c6517605d62b?_aid=7613e1d2-fbac-4613-a34d-e51b721862cb&query=Pasay%2C%20Philippines"
              target="_blank"
              rel="noopener noreferrer"
              className="partner-link bounce-partner"
            >
              <svg viewBox="0 0 100 100" className="partner-logo-icon" style={{ width: 14, height: 14, marginRight: 6 }}>
                <circle cx="67" cy="41" r="13.5" fill="#ffffff" />
                <circle cx="23.8" cy="39.5" r="4.5" fill="#ffffff" />
                <circle cx="32.7" cy="48.5" r="4.5" fill="#ffffff" />
                <circle cx="39.5" cy="59.4" r="4.5" fill="#ffffff" />
                <circle cx="54.6" cy="60.1" r="4.5" fill="#ffffff" />
                <circle cx="46.2" cy="70.1" r="4.5" fill="#ffffff" />
              </svg>
              Bounce
            </a>
            <a
              href="https://www.facebook.com/people/Tarragon-Manila-Baggage-Storage-Rentals/61553959761777/"
              target="_blank"
              rel="noopener noreferrer"
              className="partner-link facebook-partner"
            >
              <svg viewBox="0 0 24 24" className="partner-logo-icon" style={{ width: 14, height: 14, marginRight: 6, fill: '#ffffff' }}>
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </a>
            <a
              href="https://share.google/IWqrJOQXkpk2WKUsy"
              target="_blank"
              rel="noopener noreferrer"
              className="partner-link google-partner"
            >
              <svg viewBox="0 0 24 24" className="partner-logo-icon" style={{ width: 14, height: 14, marginRight: 6 }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              Google
            </a>
          </div>

          <div className="hero-trust-badges">
            <div className="trust-badge">
              <Shield size={14} />
              <span>Safety Insurance</span>
            </div>
            <div className="trust-badge">
              <Lock size={14} />
              <span>24/7 CCTV Monitored</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works Section ─── */}
      <section id="how-it-works" className="home-section">
        <div className="section-container">
          <div className="section-header-block">
            <h2>How It Works</h2>
            <p>Store your luggage securely in four simple steps and reclaim your travel freedom.</p>
          </div>

          <div className="steps-grid">
            {steps.map((step) => (
              <div key={step.num} className="step-card">
                <div className="step-icon-wrapper">
                  {step.icon}
                  <div className="step-badge">{step.num}</div>
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Van to the Rescue Section ─── */}
      <section className="video-hero-fullscreen video-rescue-fullscreen">
        <div className="fullscreen-video-container">
          <video
            ref={rescueVideoRef}
            className="fullscreen-video"
            autoPlay
            loop
            muted={isRescueMuted}
            playsInline
            src="/Tourist_Mateo_gets_van_202606210158.mp4"
          >
            Your browser does not support the video tag.
          </video>
          <div className="video-overlay-glow"></div>
          <button
            type="button"
            className="video-audio-toggle rescue-audio-toggle"
            onClick={toggleRescueMute}
            aria-label={isRescueMuted ? "Unmute video" : "Mute video"}
          >
            {isRescueMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>

        {/* Content overlaid on top of fullscreen video background */}
        <div className="rescue-hero-overlay-card">
          <h2>Van to the Rescue!</h2>
          <p className="rescue-lead">
            Almost missed your flight? See how Tarragon Manila's express van rental service saved tourist Mateo from missing his flight too!
          </p>
          <p className="rescue-text">
            Stranded, running out of options, and carrying heavy bags under time pressure is every traveler's nightmare. Normal transport fell through—but our dedicated van rental service swooped in for a fast, spacious, and reliable airport transit rescue.
          </p>
          
          <ul className="rescue-features">
            <li>
              <span className="feature-marker">⚡</span>
              <div>
                <strong>Ultra-Fast Response:</strong> Dispatch in minutes to secure passengers & luggage.
              </div>
            </li>
            <li>
              <span className="feature-marker">🎒</span>
              <div>
                <strong>Spacious & Secure:</strong> Plenty of room for heavy luggage and surfboard bags.
              </div>
            </li>
            <li>
              <span className="feature-marker">✈️</span>
              <div>
                <strong>Direct Airport Route:</strong> Bypassed standard traffic routes for an on-time gate arrival.
              </div>
            </li>
          </ul>

          <button
            className="btn btn-primary rescue-cta-btn"
            onClick={() => {
              setBookingStep(1);
              setTimeout(() => {
                const el = document.querySelector('.booking-details-card');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }, 100);
            }}
          >
            Book Van Now
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ─── Storage Pricing Section ─── */}
      <section className="home-section-alt">
        <div className="section-container">
          <div className="section-header-block">
            <h2>Simple, Affordable Pricing</h2>
            <p>Affordable daily rates for safe luggage storage across all hubs.</p>
          </div>

          <div className="pricing-grid">
            {pricingOptions.map((option, idx) => (
              <div key={idx} className="pricing-card">
                {option.tag && <div className="pricing-tag">{option.tag}</div>}
                <h3>{option.title}</h3>
                <div className="price-display">
                  <span className="currency">{option.currency}</span>
                  <span className="amount">{option.price}</span>
                  <span className="period">/ {option.period}</span>
                </div>
                <p className="pricing-desc">{option.description}</p>
                <ul className="pricing-features">
                  {option.features.map((feat, fIdx) => (
                    <li key={fIdx}>
                      <Shield size={14} style={{ color: 'var(--tarragon-rausch)', marginRight: 8, flexShrink: 0 }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className="pricing-btn"
                  onClick={() => {
                    setBookingStep(1);
                    setTimeout(() => {
                      const el = document.querySelector('.booking-details-card');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }, 100);
                  }}
                >
                  {option.btnText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Floating Baggage Video Section ─── */}
      <section className="video-hero-fullscreen video-baggage-fullscreen">
        <div className="fullscreen-video-container">
          <video
            ref={baggageVideoRef}
            className="fullscreen-video"
            autoPlay
            loop
            muted={isBaggageMuted}
            playsInline
            src="/create_a_funny_baggage_floatin.mp4"
          >
            Your browser does not support the video tag.
          </video>
          <div className="video-overlay-glow"></div>
          <button
            type="button"
            className="video-audio-toggle rescue-audio-toggle"
            onClick={toggleBaggageMute}
            aria-label={isBaggageMuted ? "Unmute video" : "Mute video"}
          >
            {isBaggageMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </section>

      {/* ─── Testimonials Section ─── */}
      <section className="home-section">
        <div className="section-container">
          <div className="section-header-block">
            <h2>Trusted by Travelers Worldwide</h2>
            <p>Read what hands-free explorers say about their experience with Tarragon Manila storage hubs.</p>
          </div>

          <div className="reviews-grid">
            {reviews.map((rev, i) => (
              <div key={i} className="review-card">
                <div className="review-stars">
                  {[...Array(rev.rating)].map((_, idx) => (
                    <Star key={idx} size={16} />
                  ))}
                </div>
                <div className="review-comment">"{rev.comment}"</div>
                <div className="review-user-info">
                  <div className="review-user-avatar">{rev.avatar}</div>
                  <div>
                    <div className="review-user-name">{rev.name}</div>
                    <div className="review-user-date">Verified Guest • {rev.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Call to Action ─── */}
      <section className="home-section-alt" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <div className="section-container" style={{ maxWidth: '650px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Reclaim Your Day in Manila
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1.125rem' }}>
            Book secure, insured baggage storage now and explore historical sights, malls, or beaches hands-free.
          </p>
          <button
            className="btn btn-primary"
            style={{ height: 48, padding: '0 2.5rem', fontSize: '1rem', background: 'var(--tarragon-rausch)', borderColor: 'var(--tarragon-rausch)' }}
            onClick={() => {
              setBookingStep(1);
              setTimeout(() => {
                const el = document.querySelector('.booking-details-card');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }, 100);
            }}
          >
            Book Now
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Congratulatory Confirmation Modal */}
      {showModal && modalData && (
        <div className="congrats-modal-overlay">
          <div className="congrats-modal-box">
            <div className="congrats-modal-icon-badge">✓</div>
            <h2 className="congrats-modal-title">Congratulations!</h2>
            <p className="congrats-modal-subtitle">
              Your baggage storage space has been successfully reserved at Tarragon Manila.
            </p>
            
            <div className="congrats-modal-summary">
              <div className="modal-summary-row">
                <span>Reference ID:</span>
                <strong className="modal-ref-code">{modalData.id}</strong>
              </div>
              <div className="modal-summary-row">
                <span>Customer Name:</span>
                <span>{modalData.name}</span>
              </div>
              <div className="modal-summary-row">
                <span>Drop-off:</span>
                <span>{modalData.dropoff}</span>
              </div>
              <div className="modal-summary-row">
                <span>Pick-up:</span>
                <span>{modalData.pickup}</span>
              </div>
              <div className="modal-summary-row">
                <span>Luggage details:</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--tarragon-rausch)', fontWeight: 'bold' }}>{modalData.size}</span>
              </div>
              <div className="modal-summary-row total-row">
                <span>Total Price (Pay at Check-In):</span>
                <strong className="modal-total-price">₱{modalData.price.toFixed(2)}</strong>
              </div>
            </div>

            <div className="congrats-modal-notice">
              <p>A confirmation email with checking-in instructions and your retrieval QR code has been sent to:</p>
              <strong style={{ display: 'block', marginTop: '0.25rem' }}>{modalData.email}</strong>
            </div>

            <button type="button" className="congrats-modal-close-btn" onClick={() => { setShowModal(false); resetWizard(); }}>
              Done & Explore
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


