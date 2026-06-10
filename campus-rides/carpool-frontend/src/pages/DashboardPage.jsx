import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, ShieldCheck, ShieldAlert, DollarSign, List, FileText, Plus, 
  Check, X, Key, Star, Award, RefreshCw, Upload, Navigation, Eye, User, Users
} from 'lucide-react';
import { api, getStoredUser, setStoredUser } from '../utils/api';
import GlowCard from '../components/GlowCard';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

const DashboardPage = ({ user: initialUser }) => {
  const [user, setUser] = useState(initialUser);
  const [profile, setProfile] = useState(null);
  
  // Passenger states
  const [walletAmount, setWalletAmount] = useState('');
  const [bookings, setBookings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [passengerRequests, setPassengerRequests] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    departureLocation: '',
    destinationLocation: '',
    departureTime: '',
    seatsNeeded: 1,
    fareOffered: 5.00
  });
  
  // Driver states
  const [verificationStatus, setVerificationStatus] = useState('PENDING'); // PENDING, APPROVED, REJECTED
  const [cnicNumber, setCnicNumber] = useState('');
  const [cnicFrontFile, setCnicFrontFile] = useState(null);
  const [cnicBackFile, setCnicBackFile] = useState(null);
  const [vehicleFile, setVehicleFile] = useState(null);
  
  const [myRides, setMyRides] = useState([]);
  const [driverBookings, setDriverBookings] = useState([]);
  const [pendingPassengerRequests, setPendingPassengerRequests] = useState([]);
  const [rideForm, setRideForm] = useState({
    departureLocation: '',
    destinationLocation: '',
    departureTime: '',
    totalSeats: 4,
    baseFare: 5.00
  });

  // Common UI states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // OTP Validation State (Driver Dashboard)
  const [otpInputs, setOtpInputs] = useState({}); // { bookingId: '1234' }

  // Rating Modal State
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingData, setRatingData] = useState({
    bookingId: null,
    score: 5,
    comment: '',
    isDriverReview: false
  });

  // Load profile and relevant dashboard data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const prof = await api.getProfile();
        setProfile(prof);
        
        // Cache user details update
        const current = getStoredUser();
        const updated = { ...current, ...prof };
        setStoredUser(updated);
        setUser(updated);

        if (prof.role === 'PASSENGER') {
          const bList = await api.getPassengerBookings();
          setBookings(bList || []);
          const tList = await api.getTransactionHistory();
          setTransactions(tList || []);
          const prList = await api.getPassengerRideRequests();
          setPassengerRequests(prList || []);
        } else if (prof.role === 'DRIVER') {
          setVerificationStatus(prof.verificationStatus || 'PENDING');
          setCnicNumber(prof.cnicNumber || '');
          const rList = await api.getDriverRides();
          setMyRides(rList || []);
          const bList = await api.getDriverBookings();
          setDriverBookings(bList || []);
          const pprList = await api.getPendingPassengerRideRequests();
          setPendingPassengerRequests(pprList || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [refreshKey]);

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Passenger: Deposit funds
  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!walletAmount || parseFloat(walletAmount) <= 0) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.depositFunds(parseFloat(walletAmount));
      setSuccess(`Successfully added $${parseFloat(walletAmount).toFixed(2)} to your wallet!`);
      setWalletAmount('');
      triggerRefresh();
    } catch (err) {
      setError(err.message || 'Deposit failed.');
    } finally {
      setLoading(false);
    }
  };

  // Passenger: Cancel Booking
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? You will receive a full refund.')) return;
    setLoading(true);
    setError('');
    try {
      await api.cancelBooking(bookingId);
      setSuccess('Booking request cancelled and refunded successfully!');
      triggerRefresh();
    } catch (err) {
      setError(err.message || 'Cancellation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Driver: Upload CNIC & Documents
  const handleDriverVerifySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 1. Submit text details if changed
      if (cnicNumber && cnicNumber !== profile.cnicNumber) {
        await api.updateProfile({
          fullName: profile.fullName,
          phoneNumber: profile.phoneNumber,
          licenseNumber: profile.licenseNumber,
          cnicNumber: cnicNumber,
          make: profile.vehicle?.make || '',
          model: profile.vehicle?.model || '',
          licensePlate: profile.vehicle?.licensePlate || '',
          color: profile.vehicle?.color || '',
          capacity: profile.vehicle?.capacity || 4
        });
      }

      // 2. Upload front image
      if (cnicFrontFile) {
        await api.uploadCnicFront(cnicFrontFile);
      }

      // 3. Upload back image
      if (cnicBackFile) {
        await api.uploadCnicBack(cnicBackFile);
      }

      // 4. Upload vehicle image
      if (vehicleFile) {
        await api.uploadVehicleImage(vehicleFile);
      }

      setSuccess('Verification materials uploaded successfully! Administrators will review your profile.');
      setCnicFrontFile(null);
      setCnicBackFile(null);
      setVehicleFile(null);
      triggerRefresh();
    } catch (err) {
      setError(err.message || 'Verification materials upload failed.');
    } finally {
      setLoading(false);
    }
  };

  // Driver: Create Ride
  const handleCreateRide = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Set a quick estimated departure ISO timestamp from value
      const payload = {
        ...rideForm,
        departureTime: new Date(rideForm.departureTime).toISOString()
      };
      await api.createRide(payload);
      setSuccess('Ride scheduled successfully!');
      setRideForm({
        departureLocation: '',
        destinationLocation: '',
        departureTime: '',
        totalSeats: 4,
        baseFare: 5.00
      });
      triggerRefresh();
    } catch (err) {
      setError(err.message || 'Failed to create ride.');
    } finally {
      setLoading(false);
    }
  };

  // Driver: Approve request
  const handleApproveBooking = async (bookingId) => {
    setError('');
    try {
      await api.approveBooking(bookingId);
      setSuccess('Booking approved successfully!');
      triggerRefresh();
    } catch (err) {
      setError(err.message || 'Approval failed.');
    }
  };

  // Driver: Reject request
  const handleRejectBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to reject this request? Passenger will be refunded.')) return;
    setError('');
    try {
      await api.rejectBooking(bookingId);
      setSuccess('Booking request rejected and passenger refunded.');
      triggerRefresh();
    } catch (err) {
      setError(err.message || 'Rejection failed.');
    }
  };

  // Driver: Start Trip
  const handleStartTrip = async (rideId) => {
    setError('');
    try {
      await api.updateRideStatus(rideId, 'ONGOING');
      setSuccess('Trip started! Drive safely.');
      triggerRefresh();
    } catch (err) {
      setError(err.message || 'Failed to start trip.');
    }
  };

  // Driver: Complete Trip
  const handleCompleteTrip = async (rideId) => {
    setError('');
    try {
      await api.updateRideStatus(rideId, 'COMPLETED');
      setSuccess('Trip completed! Reviews are now open.');
      triggerRefresh();
    } catch (err) {
      setError(err.message || 'Failed to complete trip.');
    }
  };

  // Driver: Cancel Trip
  const handleCancelTrip = async (rideId) => {
    if (!window.confirm('Are you sure you want to cancel this entire ride? All passenger bookings will be refunded automatically.')) return;
    setError('');
    try {
      await api.deleteRide(rideId);
      setSuccess('Ride cancelled and passenger bookings refunded successfully.');
      triggerRefresh();
    } catch (err) {
      setError(err.message || 'Failed to cancel ride.');
    }
  };

  // Driver: Verify Passenger OTP
  const handleVerifyOtp = async (bookingId) => {
    const otp = otpInputs[bookingId];
    if (!otp || otp.trim().length !== 4) {
      alert('Please enter a 4-digit code.');
      return;
    }

    setError('');
    try {
      await api.verifyOtp(bookingId, otp);
      setSuccess('Passenger check-in verified successfully!');
      setOtpInputs({ ...otpInputs, [bookingId]: '' });
      triggerRefresh();
    } catch (err) {
      setError(err.message || 'OTP verification failed.');
    }
  };

  // Rating Submission
  const openRatingModal = (bookingId, isDriverReview = false) => {
    setRatingData({
      bookingId,
      score: 5,
      comment: '',
      isDriverReview
    });
    setShowRatingModal(true);
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.addRating(ratingData);
      setSuccess('Review submitted successfully!');
      setShowRatingModal(false);
      triggerRefresh();
    } catch (err) {
      setError(err.message || 'Failed to submit review.');
    }
  };

  // Passenger Ride Requests Handlers
  const handleCreatePassengerRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...requestForm,
        departureTime: new Date(requestForm.departureTime).toISOString()
      };
      await api.createPassengerRideRequest(payload);
      setSuccess('Your ride request has been created and funds are held!');
      setShowRequestModal(false);
      setRequestForm({
        departureLocation: '',
        destinationLocation: '',
        departureTime: '',
        seatsNeeded: 1,
        fareOffered: 5.00
      });
      triggerRefresh();
    } catch (err) {
      setError(err.message || 'Failed to create ride request.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPassengerRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request? Your held fare will be refunded.')) return;
    setLoading(true);
    setError('');
    try {
      await api.cancelPassengerRideRequest(requestId);
      setSuccess('Request cancelled and fare refunded!');
      triggerRefresh();
    } catch (err) {
      setError(err.message || 'Failed to cancel request.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptPassengerRequest = async (requestId) => {
    setError('');
    setSuccess('');
    try {
      await api.acceptPassengerRideRequest(requestId);
      setSuccess('Accepted passenger request! Active Ride and Confirmed Booking have been generated.');
      triggerRefresh();
    } catch (err) {
      setError(err.message || 'Failed to accept request.');
    }
  };

  const handleRejectPassengerRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to reject this request? The passenger will be refunded.')) return;
    setError('');
    setSuccess('');
    try {
      await api.rejectPassengerRideRequest(requestId);
      setSuccess('Passenger request rejected and refunded.');
      triggerRefresh();
    } catch (err) {
      setError(err.message || 'Failed to reject request.');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      {/* Top Header Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '24px',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ textAlign: 'left' }}>
          <h1 style={{ fontSize: '2.2rem', margin: 0, fontFamily: 'var(--font-heading)' }}>
            Welcome, <span className="text-neon">{user.fullName}</span>
          </h1>
          <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '4px' }}>
            Role: <span className="text-neon" style={{ fontWeight: 600 }}>{user.role}</span>
          </p>
        </div>
        <button className="btn btn-secondary" onClick={triggerRefresh}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {/* ======================================================== */}
      {/* PASSENGER DASHBOARD                                      */}
      {/* ======================================================== */}
      {user.role === 'PASSENGER' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px' }} className="dashboard-grid">
          
          {/* Main Area: Bookings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ fontSize: '1.4rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <List size={20} className="text-neon" />
                  Active Carpool Bookings
                </h2>
                <button className="btn btn-primary" onClick={() => setShowRequestModal(true)}>
                  <Plus size={16} /> Create Ride Request
                </button>
              </div>

              {bookings.length === 0 ? (
                <GlowCard interactive={false} style={{ textAlign: 'center', padding: '40px' }}>
                  <Car size={32} className="text-muted" style={{ margin: '0 auto 16px auto' }} />
                  <p className="text-muted">You have no booking requests or active trips.</p>
                  <button className="btn btn-primary mt-4" onClick={() => navigate('/search')}>
                    Find a Ride
                  </button>
                </GlowCard>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {bookings.map(b => (
                    <GlowCard key={b.id} interactive={false} style={{ borderLeft: `4px solid ${b.status === 'CONFIRMED' ? 'var(--neon-green)' : b.status === 'PENDING' ? 'var(--warning)' : 'var(--border-subtle)'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                          <h4 style={{ fontSize: '1.1rem', color: '#fff' }}>
                            {b.ride?.departureLocation || 'N/A'} &rarr; {b.ride?.destinationLocation || 'N/A'}
                          </h4>
                          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                            Driver: <span style={{ color: '#fff' }}>{b.ride?.driver?.fullName || 'N/A'}</span> | Departure: {b.ride?.departureTime ? new Date(b.ride.departureTime).toLocaleString() : 'N/A'}
                          </p>
                          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                            Seats Reserved: <span style={{ color: '#fff' }}>{b.seatsBooked}</span> | Contribution: <span style={{ color: '#fff' }}>${(b.farePaid || 0).toFixed(2)}</span>
                          </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span className={`badge ${b.status === 'CONFIRMED' ? 'badge-success' : b.status === 'PENDING' ? 'badge-warning' : b.status === 'CANCELLED' ? 'badge-danger' : 'badge-info'}`}>
                              {b.status}
                            </span>
                            <span className={`badge badge-info`}>
                              Ride: {b.ride?.status || 'UNKNOWN'}
                            </span>
                          </div>

                          {/* Show OTP if confirmed and trip is starting */}
                          {b.status === 'CONFIRMED' && b.otpCode && b.otpCode !== 'VERIFIED' && b.ride?.status !== 'COMPLETED' && (
                            <div style={{
                              background: 'rgba(6, 182, 212, 0.1)',
                              border: '1px solid rgba(6, 182, 212, 0.3)',
                              borderRadius: 'var(--radius-sm)',
                              padding: '6px 12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              color: 'var(--neon-cyan)',
                              fontSize: '0.85rem',
                              fontWeight: 600
                            }}>
                              <Key size={14} />
                              Check-in OTP: {b.otpCode}
                            </div>
                          )}

                          {/* Cancel Booking option */}
                          {(b.status === 'PENDING' || b.status === 'CONFIRMED') && b.ride?.status === 'CREATED' && (
                            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleCancelBooking(b.id)}>
                              Cancel Ride
                            </button>
                          )}

                          {/* Review Driver Modal trigger */}
                          {b.ride?.status === 'COMPLETED' && b.status === 'CONFIRMED' && (
                            <button className="btn btn-accent" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => openRatingModal(b.id, false)}>
                              <Star size={12} />
                              Rate Driver
                            </button>
                          )}
                        </div>
                      </div>
                    </GlowCard>
                  ))}
                </div>
              )}
            </div>

            {/* Transaction History */}
            <div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} className="text-neon" />
                Wallet Transactions
              </h2>
              <GlowCard interactive={false} style={{ padding: 0 }}>
                {transactions.length === 0 ? (
                  <p className="text-muted" style={{ padding: '24px', textAlign: 'center' }}>No wallet transactions found.</p>
                ) : (
                  <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                          <th style={{ padding: '12px 16px', color: '#fff' }}>Date</th>
                          <th style={{ padding: '12px 16px', color: '#fff' }}>Type</th>
                          <th style={{ padding: '12px 16px', color: '#fff' }}>Description</th>
                          <th style={{ padding: '12px 16px', color: '#fff', textAlign: 'right' }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map(t => (
                          <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '12px 16px' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <span className={`badge ${t.type === 'DEPOSIT' ? 'badge-success' : t.type === 'REFUND' ? 'badge-info' : 'badge-danger'}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                                {t.type}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>{t.description}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: t.type === 'DEPOSIT' || t.type === 'REFUND' ? 'var(--neon-green)' : 'var(--error)' }}>
                              {t.type === 'DEPOSIT' || t.type === 'REFUND' ? '+' : '-'}${t.amount.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </GlowCard>
            </div>

            {/* My Ride Requests List */}
            <div style={{ marginTop: '32px' }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Navigation size={20} className="text-neon" />
                My Ride Requests
              </h2>

              {passengerRequests.length === 0 ? (
                <GlowCard interactive={false} style={{ textAlign: 'center', padding: '32px' }}>
                  <p className="text-muted">You have no custom ride requests posted.</p>
                </GlowCard>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {passengerRequests.map(req => (
                    <GlowCard key={req.id} interactive={false} style={{ borderLeft: `4px solid ${req.status === 'ACCEPTED' ? 'var(--neon-green)' : req.status === 'PENDING' ? 'var(--warning)' : 'var(--border-subtle)'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                          <h4 style={{ color: '#fff', fontSize: '1.05rem' }}>
                            {req.departureLocation} &rarr; {req.destinationLocation}
                          </h4>
                          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                            Requested Seats: <span style={{ color: '#fff' }}>{req.seatsNeeded}</span> | Fare Offered: <span style={{ color: '#fff' }}>${req.fareOffered.toFixed(2)}</span>
                          </p>
                          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                            Departure: {new Date(req.departureTime).toLocaleString()}
                          </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                          <span className={`badge ${req.status === 'ACCEPTED' ? 'badge-success' : req.status === 'PENDING' ? 'badge-warning' : req.status === 'CANCELLED' ? 'badge-danger' : 'badge-danger'}`}>
                            {req.status}
                          </span>
                          
                          {req.status === 'PENDING' && (
                            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleCancelPassengerRequest(req.id)}>
                              Cancel Request
                            </button>
                          )}
                        </div>
                      </div>
                    </GlowCard>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Wallet Balance & Deposit */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <GlowCard interactive={false} style={{ textAlign: 'center' }}>
              <Award size={36} className="text-neon" style={{ margin: '0 auto 12px auto' }} />
              <h4 style={{ color: '#fff', fontSize: '1rem' }}>Wallet Balance</h4>
              <p style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', margin: '8px 0' }}>
                ${user.walletBalance?.toFixed(2) || '0.00'}
              </p>
              <form onSubmit={handleDeposit} style={{ marginTop: '20px' }}>
                <div className="form-group">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    className="form-control text-center"
                    placeholder="Enter deposit amount ($)"
                    value={walletAmount}
                    onChange={(e) => setWalletAmount(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '42px', marginTop: '8px' }}>
                  <DollarSign size={16} />
                  Top-Up Wallet
                </button>
              </form>
            </GlowCard>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DRIVER DASHBOARD                                         */}
      {/* ======================================================== */}
      {user.role === 'DRIVER' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }} className="dashboard-grid">
          
          {/* Main Area: Onboarding, Bookings list, Ride Creation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left' }}>
            
            {/* 1. Onboarding & Verification Status */}
            <div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} className="text-neon" />
                Driver Verification Profile
              </h2>

              <GlowCard interactive={false} style={{ borderLeft: `4px solid ${verificationStatus === 'APPROVED' ? 'var(--neon-green)' : verificationStatus === 'REJECTED' ? 'var(--error)' : 'var(--warning)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <h4 style={{ color: '#fff', fontSize: '1.1rem' }}>Document Verification</h4>
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                      Status:{' '}
                      <span className={`badge ${verificationStatus === 'APPROVED' ? 'badge-success' : verificationStatus === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                        {verificationStatus}
                      </span>
                    </p>
                  </div>
                  {verificationStatus === 'APPROVED' && (
                    <Award size={32} className="text-neon" />
                  )}
                </div>

                {/* Verification Documents Upload form */}
                {verificationStatus !== 'APPROVED' && (
                  <form onSubmit={handleDriverVerifySubmit} style={{ marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                      Please submit your CNIC documentation and car images below to activate your driver status.
                    </p>
                    
                    <div className="form-group">
                      <label className="form-label">CNIC Number</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. 37405-1234567-8" 
                        value={cnicNumber}
                        onChange={(e) => setCnicNumber(e.target.value)}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }} className="grid-2">
                      <div className="form-group">
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Upload size={14} />
                          <span>CNIC Front Photo</span>
                        </label>
                        <input 
                          type="file" 
                          accept="image/*"
                          className="form-control"
                          onChange={(e) => setCnicFrontFile(e.target.files[0])}
                          required={!profile?.cnicFrontUrl}
                        />
                        {profile?.cnicFrontUrl && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--neon-green)' }}>Uploaded Front Document</span>
                        )}
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Upload size={14} />
                          <span>CNIC Back Photo</span>
                        </label>
                        <input 
                          type="file" 
                          accept="image/*"
                          className="form-control"
                          onChange={(e) => setCnicBackFile(e.target.files[0])}
                          required={!profile?.cnicBackUrl}
                        />
                        {profile?.cnicBackUrl && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--neon-green)' }}>Uploaded Back Document</span>
                        )}
                      </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '12px' }}>
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Upload size={14} />
                        <span>Car / Vehicle Photo</span>
                      </label>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="form-control"
                        onChange={(e) => setVehicleFile(e.target.files[0])}
                        required={!profile?.vehicle?.imageUrl}
                      />
                      {profile?.vehicle?.imageUrl && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--neon-green)' }}>Uploaded Car Photo</span>
                      )}
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '20px', height: '42px' }}>
                      Upload Verification Materials
                    </button>
                  </form>
                )}
              </GlowCard>
            </div>

            {/* 2. Passenger Requests List */}
            {verificationStatus === 'APPROVED' && (
              <div>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={20} className="text-neon" />
                  Incoming Ride Requests
                </h2>

                {driverBookings.length === 0 ? (
                  <GlowCard interactive={false} style={{ textAlign: 'center', padding: '32px' }}>
                    <p className="text-muted">No passenger requests submitted yet.</p>
                  </GlowCard>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {driverBookings.map(b => (
                      <GlowCard key={b.id} interactive={false} style={{ borderLeft: `4px solid ${b.status === 'CONFIRMED' ? 'var(--neon-green)' : b.status === 'PENDING' ? 'var(--warning)' : 'var(--border-subtle)'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                          <div>
                            <h4 style={{ color: '#fff', fontSize: '1.05rem' }}>
                              Passenger: {b.passenger.fullName} ({b.passenger.phoneNumber})
                            </h4>
                            <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                              Carpool: {b.ride.departureLocation} &rarr; {b.ride.destinationLocation}
                            </p>
                            <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                              Seats Requested: <span style={{ color: '#fff' }}>{b.seatsBooked}</span> | Contribution Paid: <span style={{ color: '#fff' }}>${b.farePaid.toFixed(2)}</span>
                            </p>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                            <span className={`badge ${b.status === 'CONFIRMED' ? 'badge-success' : b.status === 'PENDING' ? 'badge-warning' : b.status === 'CANCELLED' ? 'badge-danger' : 'badge-info'}`}>
                              {b.status}
                            </span>

                            {/* Approve / Reject pending requests */}
                            {b.status === 'PENDING' && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleApproveBooking(b.id)}>
                                  <Check size={12} /> Approve
                                </button>
                                <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleRejectBooking(b.id)}>
                                  <X size={12} /> Reject
                                </button>
                              </div>
                            )}

                            {/* OTP Validation Form (When trip is ongoing/created) */}
                            {b.status === 'CONFIRMED' && b.otpCode !== 'VERIFIED' && (b.ride.status === 'ONGOING' || b.ride.status === 'CREATED') && (
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                  type="text"
                                  placeholder="Enter OTP"
                                  maxLength="4"
                                  className="form-control"
                                  style={{ width: '100px', height: '32px', padding: '4px 8px', fontSize: '0.8rem', textAlign: 'center' }}
                                  value={otpInputs[b.id] || ''}
                                  onChange={(e) => setOtpInputs({ ...otpInputs, [b.id]: e.target.value })}
                                />
                                <button className="btn btn-accent" style={{ padding: '6px 12px', fontSize: '0.8rem', height: '32px' }} onClick={() => handleVerifyOtp(b.id)}>
                                  Verify check-in
                                </button>
                              </div>
                            )}

                            {/* OTP Check-in status display */}
                            {b.status === 'CONFIRMED' && b.otpCode === 'VERIFIED' && (
                              <span style={{ fontSize: '0.85rem', color: 'var(--neon-green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Check size={14} /> Passenger Checked-in
                              </span>
                            )}

                            {/* Rate Passenger (after ride completed) */}
                            {b.ride.status === 'COMPLETED' && b.status === 'CONFIRMED' && (
                              <button className="btn btn-accent" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => openRatingModal(b.id, true)}>
                                <Star size={12} /> Rate Passenger
                              </button>
                            )}
                          </div>
                        </div>
                      </GlowCard>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2.5. Passenger Custom Ride Requests Queue */}
            {verificationStatus === 'APPROVED' && (
              <div style={{ marginTop: '32px', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Navigation size={20} className="text-neon" />
                  Passenger Ride Requests
                </h2>

                {pendingPassengerRequests.length === 0 ? (
                  <GlowCard interactive={false} style={{ textAlign: 'center', padding: '32px' }}>
                    <p className="text-muted">No custom ride requests from passengers at this time.</p>
                  </GlowCard>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {pendingPassengerRequests.map(req => (
                      <GlowCard key={req.id} interactive={false}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                          <div>
                            <h4 style={{ color: '#fff', fontSize: '1.05rem' }}>
                              Route: {req.departureLocation} &rarr; {req.destinationLocation}
                            </h4>
                            <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                              Requested by: <span style={{ color: '#fff' }}>{req.passenger.fullName}</span> | Time: {new Date(req.departureTime).toLocaleString()}
                            </p>
                            <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                              Seats Needed: <span style={{ color: '#fff' }}>{req.seatsNeeded}</span> | Fare Offered: <span style={{ color: 'var(--neon-green)', fontWeight: 600 }}>${req.fareOffered.toFixed(2)}</span>
                            </p>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => handleAcceptPassengerRequest(req.id)}>
                              <Check size={14} /> Accept Request
                            </button>
                            <button className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => handleRejectPassengerRequest(req.id)}>
                              <X size={14} /> Reject
                            </button>
                          </div>
                        </div>
                      </GlowCard>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. My Scheduled Rides list */}
            {verificationStatus === 'APPROVED' && (
              <div>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <List size={20} className="text-neon" />
                  My Scheduled Carpools
                </h2>

                {myRides.length === 0 ? (
                  <GlowCard interactive={false} style={{ textAlign: 'center', padding: '32px' }}>
                    <p className="text-muted">You haven't scheduled any rides yet. Use the sidebar form to post one.</p>
                  </GlowCard>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {myRides.map(r => (
                      <GlowCard key={r.id} interactive={false} style={{ borderLeft: `4px solid ${r.status === 'ONGOING' ? 'var(--neon-cyan)' : r.status === 'COMPLETED' ? 'var(--neon-green)' : 'var(--border-subtle)'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                          <div>
                            <h4 style={{ color: '#fff', fontSize: '1.1rem' }}>
                              {r.departureLocation} &rarr; {r.destinationLocation}
                            </h4>
                            <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                              Departure: {new Date(r.departureTime).toLocaleString()}
                            </p>
                            <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                              Seats available: <span style={{ color: '#fff' }}>{r.availableSeats} / {r.totalSeats}</span> | Contribution: <span style={{ color: '#fff' }}>${r.baseFare.toFixed(2)}</span>
                            </p>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                            <span className={`badge ${r.status === 'COMPLETED' ? 'badge-success' : r.status === 'ONGOING' ? 'badge-info' : r.status === 'CANCELLED' ? 'badge-danger' : 'badge-pending'}`}>
                              {r.status}
                            </span>
                            
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {/* Transition Actions */}
                              {r.status === 'CREATED' && (
                                <>
                                  <button className="btn btn-accent" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleStartTrip(r.id)}>
                                    Start Trip
                                  </button>
                                  <button className="btn btn-secondary text-error" style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'var(--error)' }} onClick={() => handleCancelTrip(r.id)}>
                                    Cancel
                                  </button>
                                </>
                              )}
                              
                              {r.status === 'ONGOING' && (
                                <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleCompleteTrip(r.id)}>
                                  Complete Trip
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </GlowCard>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar: Create Ride Form */}
          <div>
            {verificationStatus !== 'APPROVED' ? (
              <GlowCard interactive={false} style={{ textAlign: 'center', padding: '24px' }}>
                <ShieldAlert size={36} className="text-error" style={{ margin: '0 auto 12px auto' }} />
                <h4 style={{ color: '#fff' }}>Pending Approval</h4>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '8px' }}>
                  Your account is pending administrator verification. You will be able to post rides once approved.
                </p>
              </GlowCard>
            ) : (
              <GlowCard interactive={false}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-heading)' }}>
                  <Plus size={18} className="text-neon" />
                  Post a Carpool Ride
                </h3>
                
                <form onSubmit={handleCreateRide} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Pick-up Location</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Main Gate Circle"
                      value={rideForm.departureLocation}
                      onChange={(e) => setRideForm({ ...rideForm, departureLocation: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Destination Location</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Engineering Block B"
                      value={rideForm.destinationLocation}
                      onChange={(e) => setRideForm({ ...rideForm, destinationLocation: e.target.value })}
                      required
                    />
                  </div>


                  <div className="form-group">
                    <label className="form-label">Departure Date & Time</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={rideForm.departureTime}
                      onChange={(e) => setRideForm({ ...rideForm, departureTime: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }} className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Available Seats</label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        className="form-control"
                        value={rideForm.totalSeats}
                        onChange={(e) => setRideForm({ ...rideForm, totalSeats: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Seat Cost ($)</label>
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        className="form-control"
                        value={rideForm.baseFare}
                        onChange={(e) => setRideForm({ ...rideForm, baseFare: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '42px', marginTop: '12px' }}>
                    Post Carpool
                  </button>
                </form>
              </GlowCard>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CREATE RIDE REQUEST MODAL (PASSENGER)                    */}
      {/* ======================================================== */}
      {showRequestModal && (
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
          padding: '16px'
        }}>
          <div style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <GlowCard interactive={false} style={{ padding: '24px', display: 'flex', flexDirection: 'column', maxHeight: '100%', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', color: '#fff' }}>
                  Create a Custom Ride Request
                </h3>
                <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.5rem', padding: 0 }} onClick={() => setShowRequestModal(false)}>
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreatePassengerRequest} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Pick-up Location</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. North Housing Complex"
                    value={requestForm.departureLocation}
                    onChange={(e) => setRequestForm({ ...requestForm, departureLocation: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Destination Location</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Science Lab 3"
                    value={requestForm.destinationLocation}
                    onChange={(e) => setRequestForm({ ...requestForm, destinationLocation: e.target.value })}
                    required
                  />
                </div>


                <div className="form-group">
                  <label className="form-label">Departure Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={requestForm.departureTime}
                    onChange={(e) => setRequestForm({ ...requestForm, departureTime: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Seats Needed</label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      className="form-control"
                      value={requestForm.seatsNeeded}
                      onChange={(e) => setRequestForm({ ...requestForm, seatsNeeded: parseInt(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fare Offered ($)</label>
                    <input
                      type="number"
                      min="1"
                      step="0.5"
                      className="form-control"
                      value={requestForm.fareOffered}
                      onChange={(e) => setRequestForm({ ...requestForm, fareOffered: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowRequestModal(false)}>
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                    {loading ? <Spinner size="small" /> : 'Post Request'}
                  </button>
                </div>
              </form>
            </GlowCard>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* RATINGS MODAL (MUTUAL REVIEW)                            */}
      {/* ======================================================== */}
      {showRatingModal && (
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
          <div style={{ width: '100%', maxWidth: '450px' }}>
            <GlowCard interactive={false} style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', color: '#fff' }}>
                  Submit Ride Review
                </h3>
                <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.5rem' }} onClick={() => setShowRatingModal(false)}>
                  &times;
                </button>
              </div>

              <form onSubmit={handleRatingSubmit} style={{ textAlign: 'left' }}>
                <div className="form-group">
                  <label className="form-label">Select Stars (1 - 5)</label>
                  <select
                    className="form-control"
                    value={ratingData.score}
                    onChange={(e) => setRatingData({ ...ratingData, score: parseInt(e.target.value) })}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 - Good)</option>
                    <option value={3}>⭐⭐⭐ (3 - Average)</option>
                    <option value={2}>⭐⭐ (2 - Poor)</option>
                    <option value={1}>⭐ (1 - Terrible)</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">Review Comment</label>
                  <textarea
                    rows="4"
                    className="form-control"
                    placeholder="Share details about your trip experience..."
                    value={ratingData.comment}
                    onChange={(e) => setRatingData({ ...ratingData, comment: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowRatingModal(false)}>
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                    Submit Review
                  </button>
                </div>
              </form>
            </GlowCard>
          </div>
        </div>
      )}

      {/* Inject local style helper for Dashboard layout grid responsiveness */}
      <style>{`
        @media (max-width: 900px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
