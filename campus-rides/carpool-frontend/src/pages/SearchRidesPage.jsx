import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Car, Calendar, DollarSign, Users, ShieldCheck, MapPin, Navigation, Eye, Check } from 'lucide-react';
import { api, getStoredUser, setStoredUser } from '../utils/api';
import GlowCard from '../components/GlowCard';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

const SearchRidesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser());
  
  // Search parameters
  const [filters, setFilters] = useState({
    departure: searchParams.get('departure') || '',
    destination: searchParams.get('destination') || '',
    seats: parseInt(searchParams.get('seats')) || 1
  });

  const [rides, setRides] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const [seatsToBook, setSeatsToBook] = useState(1);
  
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchRides = async (searchFilters) => {
    setLoading(true);
    setError('');
    try {
      const results = await api.searchRides(searchFilters);
      setRides(results);
    } catch (err) {
      setError(err.message || 'Failed to search for rides.');
    } finally {
      setLoading(false);
    }
  };

  // Run search on initial load
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'PASSENGER') {
      navigate('/dashboard');
      return;
    }
    fetchRides(filters);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({
      departure: filters.departure,
      destination: filters.destination,
      seats: filters.seats.toString()
    });
    fetchRides(filters);
  };

  const handleBookRide = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must sign in as a Passenger to book rides.');
      return;
    }
    if (user.role !== 'PASSENGER') {
      setError('Only passengers can book/request seats.');
      return;
    }
    
    setBookingLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.createBooking({
        rideId: selectedRide.id,
        seatsBooked: seatsToBook
      });
      setSuccess('Booking request sent successfully! Driver notified.');
      
      // Update local wallet balance state
      const prof = await api.getProfile();
      const current = getStoredUser();
      const updated = { ...current, ...prof };
      setStoredUser(updated);
      setUser(updated);

      // Refresh list
      fetchRides(filters);
      setSelectedRide(null);
    } catch (err) {
      setError(err.message || 'Booking request failed.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Campus map coordinates grid visualization (predefined hot spots)
  const campusLocations = [
    { name: 'Main Gate Circle', lat: 34.0522, lng: -118.2437 },
    { name: 'Engineering Block B', lat: 34.0592, lng: -118.2537 },
    { name: 'North Student Housing', lat: 34.0722, lng: -118.2337 },
    { name: 'Science Center Lab', lat: 34.0622, lng: -118.2537 },
    { name: 'Central Campus Library', lat: 34.0650, lng: -118.2450 },
    { name: 'Sports Complex Gym', lat: 34.0580, lng: -118.2380 }
  ];

  return (
    <div className="container" style={{ padding: '40px 24px', textAlign: 'left' }}>
      
      {/* Page Title */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', margin: 0, fontFamily: 'var(--font-heading)' }}>
          Discover Campus <span className="text-neon">Carpools</span>
        </h1>
        <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '4px' }}>
          Find active rides shared by verified university drivers.
        </p>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '32px' }} className="grid-search">
        
        {/* Left column: Search Filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <GlowCard interactive={false}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-heading)' }}>
              <Search size={18} className="text-neon" />
              Search Options
            </h3>
            
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Leaving From</label>
                <input 
                  type="text"
                  className="form-control"
                  placeholder="e.g. Main Gate"
                  value={filters.departure}
                  onChange={(e) => setFilters({ ...filters, departure: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Going To</label>
                <input 
                  type="text"
                  className="form-control"
                  placeholder="e.g. Engineering"
                  value={filters.destination}
                  onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '8px' }}>
                <label className="form-label">Seats Required</label>
                <select
                  className="form-control"
                  value={filters.seats}
                  onChange={(e) => setFilters({ ...filters, seats: parseInt(e.target.value) })}
                >
                  <option value={1}>1 seat</option>
                  <option value={2}>2 seats</option>
                  <option value={3}>3 seats</option>
                  <option value={4}>4 seats</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '42px' }}>
                Search Rides
              </button>
            </form>
          </GlowCard>

          {/* Quick Hotspots Guide */}
          <GlowCard interactive={false} style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '12px', color: '#fff' }}>Common Hubs</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {campusLocations.map((loc, idx) => (
                <button
                  key={idx}
                  onClick={() => setFilters({ ...filters, departure: loc.name })}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--neon-green)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                >
                  <MapPin size={12} className="text-neon" />
                  {loc.name}
                </button>
              ))}
            </div>
          </GlowCard>
        </div>

        {/* Right column: Results list & Interactive Map Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Map Preview Grid */}
          {selectedRide && (
            <GlowCard interactive={false} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ color: '#fff', fontSize: '1.05rem', fontFamily: 'var(--font-heading)' }}>
                  Carpool Route Selection Mapping
                </h4>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }} 
                  onClick={() => setSelectedRide(null)}
                >
                  Close Map View
                </button>
              </div>

              <div style={{
                height: '220px',
                background: 'rgba(13, 17, 23, 0.6)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* Visual SVG map routes */}
                <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                  <defs>
                    <radialGradient id="green-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="var(--neon-green)" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="var(--neon-green)" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="cyan-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="var(--neon-cyan)" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="var(--neon-cyan)" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Draw grid lines */}
                  {[...Array(10)].map((_, i) => (
                    <line key={`h-${i}`} x1="0" y1={i * 25} x2="100%" y2={i * 25} stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                  ))}
                  {[...Array(15)].map((_, i) => (
                    <line key={`v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="100%" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                  ))}

                  {/* Start Point coordinates */}
                  <circle cx="30%" cy="55%" r="30" fill="url(#cyan-glow)" />
                  <circle cx="30%" cy="55%" r="6" fill="var(--neon-cyan)" />
                  <text x="30%" y="45%" fill="var(--neon-cyan)" fontSize="11" textAnchor="middle" fontWeight="bold">PICK-UP</text>

                  {/* End Point coordinates */}
                  <circle cx="70%" cy="35%" r="30" fill="url(#green-glow)" />
                  <circle cx="70%" cy="35%" r="6" fill="var(--neon-green)" />
                  <text x="70%" y="25%" fill="var(--neon-green)" fontSize="11" textAnchor="middle" fontWeight="bold">DESTINATION</text>

                  {/* Connecting Route */}
                  <path d="M 240 121 Q 380 70 560 77" fill="none" stroke="var(--neon-green)" strokeWidth="2.5" strokeDasharray="6,4" />
                </svg>

                <div style={{ position: 'absolute', bottom: '12px', left: '16px', fontSize: '0.8rem', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: 'var(--radius-sm)' }} className="text-muted">
                  Route: {selectedRide.departureLocation} &rarr; {selectedRide.destinationLocation}
                </div>
              </div>
            </GlowCard>
          )}

          {/* Matches List */}
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#fff', fontFamily: 'var(--font-heading)' }}>
              Matching Carpools ({rides.length})
            </h3>

            {loading && (
              <div className="loading-container">
                <Spinner />
                <p className="text-muted">Searching for matching rides...</p>
              </div>
            )}

            {!loading && rides.length === 0 && (
              <GlowCard interactive={false} style={{ textAlign: 'center', padding: '40px' }}>
                <Car size={32} className="text-muted" style={{ margin: '0 auto 16px auto' }} />
                <p className="text-muted">No rides match your criteria. Try adjusting your search locations.</p>
              </GlowCard>
            )}

            {!loading && rides.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {rides.map(r => (
                  <GlowCard 
                    key={r.id} 
                    interactive={true} 
                    style={{ borderLeft: selectedRide?.id === r.id ? '4px solid var(--neon-cyan)' : '1px solid var(--border-subtle)' }}
                    onClick={() => {
                      setSelectedRide(r);
                      setSeatsToBook(1);
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h4 style={{ color: '#fff', fontSize: '1.15rem' }}>
                            {r.departureLocation} &rarr; {r.destinationLocation}
                          </h4>
                        </div>
                        <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                          Driver: <span style={{ color: '#fff' }}>{r.driver.fullName}</span> | Departure Time: {new Date(r.departureTime).toLocaleString()}
                        </p>
                        <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                          Car details: {r.vehicle.color} {r.vehicle.make} {r.vehicle.model} ({r.vehicle.licensePlate})
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Seats Left</span>
                          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                            {r.availableSeats} / {r.totalSeats}
                          </span>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Cost / Seat</span>
                          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--neon-green)' }}>
                            ${r.baseFare.toFixed(2)}
                          </span>
                        </div>

                        <button 
                          className="btn btn-primary"
                          style={{ height: '38px', padding: '0 16px', fontSize: '0.85rem' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRide(r);
                            setSeatsToBook(1);
                          }}
                        >
                          Book Seats
                        </button>
                      </div>
                    </div>
                  </GlowCard>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Dialog Modal Drawer */}
      {selectedRide && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }}>
          <div style={{ width: '100%', maxWidth: '460px' }}>
            <GlowCard interactive={false} style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', color: '#fff' }}>
                  Reserve Carpool Seats
                </h3>
                <button 
                  style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }} 
                  onClick={() => setSelectedRide(null)}
                >
                  &times;
                </button>
              </div>

              <div style={{ marginBottom: '24px', fontSize: '0.9rem' }}>
                <p style={{ color: '#fff', fontWeight: 600, fontSize: '1.05rem', marginBottom: '8px' }}>
                  {selectedRide.departureLocation} &rarr; {selectedRide.destinationLocation}
                </p>
                <p className="text-muted">Driver: {selectedRide.driver.fullName}</p>
                <p className="text-muted">Time: {new Date(selectedRide.departureTime).toLocaleString()}</p>
                <p className="text-muted">Contribution: ${selectedRide.baseFare.toFixed(2)} per seat</p>
              </div>

              <form onSubmit={handleBookRide} style={{ textAlign: 'left' }}>
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">Select Seats</label>
                  <select
                    className="form-control"
                    value={seatsToBook}
                    onChange={(e) => setSeatsToBook(parseInt(e.target.value))}
                  >
                    {[...Array(selectedRide.availableSeats)].map((_, i) => (
                      <option key={i+1} value={i+1}>{i+1} seat{i > 0 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                  marginBottom: '24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.85rem' }} className="text-muted">Total Contribution:</span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--neon-green)' }}>
                    ${(selectedRide.baseFare * seatsToBook).toFixed(2)}
                  </span>
                </div>

                {user && user.walletBalance < (selectedRide.baseFare * seatsToBook) && (
                  <div style={{ color: 'var(--error)', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 600 }}>
                    Insufficient wallet balance! Please add funds in your passenger dashboard.
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedRide(null)}>
                    Close
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ flex: 2 }}
                    disabled={bookingLoading || (user && user.walletBalance < (selectedRide.baseFare * seatsToBook))}
                  >
                    {bookingLoading ? (
                      <>
                        <Spinner size="small" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Submit Request</span>
                    )}
                  </button>
                </div>
              </form>
            </GlowCard>
          </div>
        </div>
      )}

      {/* Responsive helper */}
      <style>{`
        @media (max-width: 800px) {
          .grid-search {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SearchRidesPage;
