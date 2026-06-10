import React from 'react';
import { Link } from 'react-router-dom';
import { Car, ShieldAlert, HeartHandshake } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: 'var(--bg-darker)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '48px 0 24px 0',
      marginTop: 'auto',
      color: 'var(--text-muted)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '32px',
          marginBottom: '40px',
          textAlign: 'left'
        }}>
          {/* Brand Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Link to="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 800,
              fontSize: '1.25rem',
              color: '#fff',
              fontFamily: 'var(--font-heading)'
            }}>
              <Car size={24} className="text-neon" />
              <span>Campus<span className="text-neon">Rides</span></span>
            </Link>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
              The premium, community-driven carpool platform connecting students and faculty to make campus travel sustainable, affordable, and secure.
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 style={{ color: '#fff', marginBottom: '16px', fontSize: '1rem', fontFamily: 'var(--font-heading)' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <li><Link to="/search" style={{ color: 'inherit' }}>Find Carpools</Link></li>
              <li><Link to="/login" style={{ color: 'inherit' }}>Driver Portal</Link></li>
              <li><Link to="/register" style={{ color: 'inherit' }}>Create Account</Link></li>
            </ul>
          </div>

          {/* Trust & Safety Column */}
          <div>
            <h4 style={{ color: '#fff', marginBottom: '16px', fontSize: '1rem', fontFamily: 'var(--font-heading)' }}>Trust & Safety</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HeartHandshake size={14} className="text-neon" />
                <span>Mutual Ratings</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={14} className="text-neon" />
                <span>CNIC & Car Audits</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>OTP Ride Check-in</span>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 style={{ color: '#fff', marginBottom: '16px', fontSize: '1rem', fontFamily: 'var(--font-heading)' }}>Support</h4>
            <p style={{ fontSize: '0.85rem', marginBottom: '12px' }}>
              Have questions or complaints? Reach out to our campus moderation team.
            </p>
            <p style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 500 }}>
              support@campus.edu
            </p>
          </div>
        </div>

        {/* Lower Footer */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '0.8rem'
        }}>
          <span>&copy; {new Date().getFullYear()} CampusRides. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="https://github.com" target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
