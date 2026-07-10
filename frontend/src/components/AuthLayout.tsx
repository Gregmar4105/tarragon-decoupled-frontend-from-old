import { useState, useEffect, useRef } from 'react';
import { Outlet, Link } from 'react-router-dom';

const videos = [
  '/can_you_add_a_Tarragon_Manila.mp4',
  '/Tourist_Mateo_gets_van_202606210158.mp4',
  '/create_a_funny_baggage_floatin.mp4'
];

/**
 * AuthLayout
 *
 * Premium split-layout for public auth pages (Login, Forgot Password, Reset Password).
 * Bypasses the standard navbar.
 *
 * Left: Sequential video loop of the three brand videos.
 * Right: Clean canvas containing the logo, brand title, and form outlet.
 */
export default function AuthLayout() {
  const [videoIndex, setVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoEnded = () => {
    setVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch((err) => {
        console.log("Autoplay blocked or video error:", err);
      });
    }
  }, [videoIndex]);

  return (
    <div className="auth-split-layout">
      {/* Left Column: Sequential Videos */}
      <div className="auth-split-left">
        <video
          ref={videoRef}
          src={videos[videoIndex]}
          onEnded={handleVideoEnded}
          autoPlay
          muted
          playsInline
          className="auth-split-video"
        />
        <div className="auth-split-overlay" />
      </div>

      {/* Right Column: Auth Content */}
      <div className="auth-split-right">
        <div className="auth-split-content-wrapper">
          <div className="auth-split-brand">
            <Link to="/" className="auth-logo-link">
              <img src="/logo.svg" alt="Tarragon Manila Logo" className="auth-logo-img" />
              <div className="auth-logo-text">
                <span className="auth-logo-title">Tarragon Manila</span>
                <span className="auth-logo-subtitle">Baggage Storage Rentals</span>
              </div>
            </Link>
          </div>
          <div className="auth-split-form-container">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
