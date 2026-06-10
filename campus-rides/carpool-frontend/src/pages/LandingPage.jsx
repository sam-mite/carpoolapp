import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ShieldCheck, Users, Car, ArrowRight, Star, Clock } from 'lucide-react';
import GlowCard from '../components/GlowCard';

const LandingPage = ({ user }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    departure: '',
    destination: '',
    seats: 1
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = new URLSearchParams(searchParams).toString();
    navigate(`/search?${query}`);
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '80px 0 60px 0',
        background: 'radial-gradient(circle at 50% -20%, rgba(16, 185, 129, 0.15) 0%, rgba(8, 10, 15, 0) 60%)',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 16px',
            color: 'var(--neon-green)',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '24px',
            fontFamily: 'var(--font-heading)'
          }}>
            <ShieldCheck size={16} />
            Exclusive to Campus Students & Faculty
          </div>

          <h1 style={{
            fontSize: '3.8rem',
            lineHeight: '1.15',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginBottom: '20px',
            fontFamily: 'var(--font-heading)',
            color: '#fff'
          }}>
            Split the Ride. <br />
            <span className="text-neon" style={{
              background: 'linear-gradient(to right, #10b981, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Share the Journey.</span>
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-muted)',
            maxWidth: '650px',
            margin: '0 auto 40px auto',
            lineHeight: '1.6'
          }}>
            CampusRides is a premium carpooling service tailored specifically for students and university staff. Find rides, share costs, and travel safely.
          </p>

          {/* Quick CTAs */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            marginBottom: '60px'
          }}>
            <Link to={user ? "/dashboard" : "/register?role=passenger"} className="btn btn-primary btn-lg" style={{ fontSize: '1.05rem', padding: '14px 28px' }}>
              Find a Ride <ArrowRight size={18} />
            </Link>
            <Link to={user ? "/dashboard" : "/register?role=driver"} className="btn btn-secondary btn-lg" style={{ fontSize: '1.05rem', padding: '14px 28px' }}>
              Offer a Ride
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Search Bar Section */}
      <section style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }}>
        <div className="container" style={{ maxWidth: '950px' }}>
          <form onSubmit={handleSearchSubmit}>
            <GlowCard 
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 120px auto',
                gap: '16px',
                alignItems: 'end',
                padding: '24px',
                backgroundColor: 'rgba(22, 27, 34, 0.85)',
                border: '1px solid var(--border-subtle)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 15px rgba(16,185,129,0.05)'
              }}
              className="quick-search-form"
            >
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Leaving From</span>
                </label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Main Gate Circle" 
                  value={searchParams.departure}
                  onChange={(e) => setSearchParams({ ...searchParams, departure: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Going To</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Engineering Block B" 
                  value={searchParams.destination}
                  onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Seats</label>
                <select 
                  className="form-control" 
                  value={searchParams.seats}
                  onChange={(e) => setSearchParams({ ...searchParams, seats: parseInt(e.target.value) })}
                >
                  <option value={1}>1 seat</option>
                  <option value={2}>2 seats</option>
                  <option value={3}>3 seats</option>
                  <option value={4}>4 seats</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{
                  height: '46px',
                  width: '100%',
                  padding: '0 24px'
                }}
              >
                <Search size={18} />
                Search
              </button>
            </GlowCard>
          </form>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '80px 0 40px 0' }}>
        <div className="container">
          <div className="grid-3">
            <GlowCard interactive={false} style={{ textAlign: 'center', padding: '36px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                color: 'var(--neon-green)'
              }}>
                <Car size={24} />
              </div>
              <h3 style={{ fontSize: '2rem', marginBottom: '8px', color: '#fff', fontFamily: 'var(--font-heading)' }}>1,200+</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Verified Vehicles</p>
            </GlowCard>

            <GlowCard interactive={false} style={{ textAlign: 'center', padding: '36px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'rgba(6, 182, 212, 0.1)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                color: 'var(--neon-cyan)'
              }}>
                <Users size={24} />
              </div>
              <h3 style={{ fontSize: '2rem', marginBottom: '8px', color: '#fff', fontFamily: 'var(--font-heading)' }}>4,800+</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Active Members</p>
            </GlowCard>

            <GlowCard interactive={false} style={{ textAlign: 'center', padding: '36px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                color: 'var(--neon-green)'
              }}>
                <Clock size={24} />
              </div>
              <h3 style={{ fontSize: '2rem', marginBottom: '8px', color: '#fff', fontFamily: 'var(--font-heading)' }}>15,000+</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Completed Trips</p>
            </GlowCard>
          </div>
        </div>
      </section>

      {/* Trust / Safety Section */}
      <section style={{ padding: '60px 0', borderTop: '1px solid var(--border-subtle)', background: 'rgba(13, 17, 23, 0.4)' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '16px', textAlign: 'center' }}>
            Built on <span className="text-neon">Trust and Safety</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px auto' }}>
            We implement strict security checks to ensure every carpool experience is safe, pleasant, and verified.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="text-neon" style={{ flexShrink: 0 }}><ShieldCheck size={32} /></div>
              <div>
                <h4 style={{ color: '#fff', marginBottom: '8px', fontSize: '1.1rem' }}>Strict Verification</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  All drivers must submit their CNIC documents, driving licenses, and vehicle paperwork which undergo audit by system moderators.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="text-neon" style={{ flexShrink: 0 }}><Star size={32} /></div>
              <div>
                <h4 style={{ color: '#fff', marginBottom: '8px', fontSize: '1.1rem' }}>Mutual Ratings</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Passengers review drivers and drivers review passengers after every trip. Maintaining high feedback standards is key.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="text-neon" style={{ flexShrink: 0 }}><Clock size={32} /></div>
              <div>
                <h4 style={{ color: '#fff', marginBottom: '8px', fontSize: '1.1rem' }}>Secure OTP Check-in</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Trips only start when passengers verify their presence in the vehicle by providing a secure OTP code to the driver.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Local Responsive styles injection */}
      <style>{`
        @media (max-width: 768px) {
          .quick-search-form {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
