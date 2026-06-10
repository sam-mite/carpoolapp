import React, { useState, useEffect } from 'react';
import { Shield, Users, ShieldAlert, Award, FileText, Check, X, ShieldX, BarChart2, DollarSign, RefreshCw, User, LayoutDashboard, Car, ShieldCheck } from 'lucide-react';
import { api, BASE_URL } from '../utils/api';
import GlowCard from '../components/GlowCard';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, verification, users, bookings, complaints, analytics
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadAdminData = async () => {
      setLoading(true);
      setError('');
      try {
        try {
          const uList = await api.adminGetUsers();
          setUsers(uList || []);
        } catch (e) {
          console.error("Error fetching users:", e);
          setUsers([]);
        }
        try {
          const bList = await api.adminGetBookings();
          setBookings(bList || []);
        } catch (e) {
          console.error("Error fetching bookings:", e);
          setBookings([]);
        }
        try {
          const cList = await api.adminGetComplaints();
          setComplaints(cList || []);
        } catch (e) {
          console.error("Error fetching complaints:", e);
          setComplaints([]);
        }
        try {
          const stats = await api.adminGetAnalytics();
          setAnalytics(stats || null);
        } catch (e) {
          console.error("Error fetching analytics:", e);
          setAnalytics(null);
        }
      } catch (err) {
        setError(err.message || 'Failed to load administrative data.');
      } finally {
        setLoading(false);
      }
    };
    loadAdminData();
  }, [refreshKey]);

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Admin: Moderation Approval/Rejection of Driver CNIC
  const handleVerifyDriver = async (driverId, approve) => {
    setError('');
    setSuccess('');
    try {
      await api.adminVerifyDriver(driverId, approve);
      setSuccess(`Driver account ${approve ? 'approved' : 'rejected'} successfully!`);
      triggerRefresh();
    } catch (err) {
      setError(err.message || 'Verification update failed.');
    }
  };

  // Admin: Suspend / Unsuspend user
  const handleSuspendUser = async (userId, suspend) => {
    if (!window.confirm(`Are you sure you want to ${suspend ? 'suspend' : 'activate'} this user account?`)) return;
    setError('');
    setSuccess('');
    try {
      await api.adminSuspendUser(userId, suspend);
      setSuccess(`User account ${suspend ? 'suspended' : 'activated'} successfully!`);
      triggerRefresh();
    } catch (err) {
      setError(err.message || 'Suspension toggle failed.');
    }
  };

  // Admin: Resolve complaint
  const handleResolveComplaint = async (complaintId) => {
    setError('');
    setSuccess('');
    try {
      await api.adminResolveComplaint(complaintId);
      setSuccess('Complaint ticket resolved successfully!');
      triggerRefresh();
    } catch (err) {
      setError(err.message || 'Failed to resolve complaint.');
    }
  };

  // Filter users to get drivers pending verification
  const pendingDrivers = (users || []).filter(u => u && u.role === 'DRIVER' && u.verificationStatus === 'PENDING');

  return (
    <div className="container" style={{ padding: '40px 24px', textAlign: 'left' }}>
      
      {/* Page Header */}
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
        <div>
          <h1 style={{ fontSize: '2.2rem', margin: 0, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield className="text-neon" size={32} />
            Administration Control Panel
          </h1>
          <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '4px' }}>
            Manage driver onboardings, user safety status, reports, and financial logs.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={triggerRefresh}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {/* Tabs Menu Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '32px',
        overflowX: 'auto',
        gap: '16px'
      }}>
        {[
          { id: 'dashboard', label: 'Admin Dashboard', icon: <LayoutDashboard size={18} /> },
          { id: 'verification', label: 'Driver Verification Queue', icon: <Award size={18} /> },
          { id: 'users', label: 'User Management', icon: <Users size={18} /> },
          { id: 'bookings', label: 'Bookings Monitor', icon: <FileText size={18} /> },
          { id: 'complaints', label: 'Complaint Reports', icon: <ShieldAlert size={18} /> },
          { id: 'analytics', label: 'System Analytics', icon: <BarChart2 size={18} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--neon-green)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--neon-green)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'var(--transition-smooth)'
            }}
          >
            {tab.icon}
            {tab.label}
            {tab.id === 'verification' && pendingDrivers.length > 0 && (
              <span className="badge badge-danger" style={{ fontSize: '0.65rem', padding: '2px 6px', marginLeft: '4px' }}>
                {pendingDrivers.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <div className="loading-container">
          <Spinner />
          <p className="text-muted">Fetching administrative data...</p>
        </div>
      )}

      {/* TAB CONTENT AREAS */}
      {!loading && (
        <div>
          {/* 0. ADMIN DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                System Overview
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
              }} className="grid-4">
                <GlowCard interactive={false}>
                  <Users className="text-neon" size={28} />
                  <h4 style={{ fontSize: '1.8rem', color: '#fff', margin: '8px 0 4px 0' }}>{users.length}</h4>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>Total Registered Users</p>
                </GlowCard>

                <GlowCard interactive={false}>
                  <Car className="text-neon" size={28} />
                  <h4 style={{ fontSize: '1.8rem', color: '#fff', margin: '8px 0 4px 0' }}>
                    {users.filter(u => u.role === 'DRIVER').length}
                  </h4>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>Total Drivers Registered</p>
                </GlowCard>

                <GlowCard interactive={false}>
                  <ShieldAlert className="text-warning" size={28} />
                  <h4 style={{ fontSize: '1.8rem', color: '#fff', margin: '8px 0 4px 0' }}>
                    {users.filter(u => u.role === 'DRIVER' && u.verificationStatus === 'PENDING').length}
                  </h4>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>Pending Driver Requests</p>
                </GlowCard>

                <GlowCard interactive={false}>
                  <ShieldCheck className="text-neon" size={28} />
                  <h4 style={{ fontSize: '1.8rem', color: '#fff', margin: '8px 0 4px 0' }}>
                    {users.filter(u => u.role === 'DRIVER' && u.verified).length}
                  </h4>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>Approved Drivers</p>
                </GlowCard>
              </div>

              <div style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                  Recent Driver Applications
                </h3>
                <GlowCard interactive={false} style={{ padding: 0 }}>
                  {users.filter(u => u.role === 'DRIVER').length === 0 ? (
                    <p className="text-muted" style={{ padding: '24px', textAlign: 'center' }}>No driver registrations found.</p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                          <th style={{ padding: '14px 16px', color: '#fff' }}>Driver Name</th>
                          <th style={{ padding: '14px 16px', color: '#fff' }}>Email / Phone</th>
                          <th style={{ padding: '14px 16px', color: '#fff' }}>License Number</th>
                          <th style={{ padding: '14px 16px', color: '#fff' }}>Status</th>
                          <th style={{ padding: '14px 16px', color: '#fff', textAlign: 'right' }}>Applied On</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users
                          .filter(u => u && u.role === 'DRIVER')
                          .sort((a, b) => (b.createdAt ? new Date(b.createdAt) : 0) - (a.createdAt ? new Date(a.createdAt) : 0))
                          .slice(0, 5)
                          .map(d => (
                            <tr key={d.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                              <td style={{ padding: '14px 16px' }}>
                                <span style={{ color: '#fff', fontWeight: 600 }}>{d.fullName}</span>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{d.username}</div>
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <div>{d.email}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.phoneNumber}</div>
                              </td>
                              <td style={{ padding: '14px 16px', fontWeight: 600 }}>{d.licenseNumber}</td>
                              <td style={{ padding: '14px 16px' }}>
                                <span className={`badge ${d.verified ? 'badge-success' : d.verificationStatus === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                                  {d.verified ? 'APPROVED' : d.verificationStatus || 'PENDING'}
                                </span>
                              </td>
                              <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'N/A'}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                </GlowCard>
              </div>
            </div>
          )}
          {/* 1. DRIVER VERIFICATION QUEUE */}
          {activeTab === 'verification' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                Onboarding Approvals Queue
              </h3>
              {pendingDrivers.length === 0 ? (
                <GlowCard interactive={false} style={{ textAlign: 'center', padding: '40px' }}>
                  <p className="text-muted">No drivers are currently awaiting verification approvals.</p>
                </GlowCard>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {pendingDrivers.map(d => (
                    <GlowCard key={d.id} interactive={false}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }} className="grid-2">
                        {/* Info details */}
                        <div>
                          <h4 style={{ color: '#fff', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <User size={18} className="text-neon" />
                            {d.fullName}
                          </h4>
                          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '6px' }}>Username: {d.username}</p>
                          <p className="text-muted" style={{ fontSize: '0.85rem' }}>Email: {d.email}</p>
                          <p className="text-muted" style={{ fontSize: '0.85rem' }}>Phone: {d.phoneNumber}</p>
                          <p className="text-muted" style={{ fontSize: '0.85rem' }}>Driving License: <span style={{ color: '#fff', fontWeight: 600 }}>{d.licenseNumber}</span></p>
                          <p className="text-muted" style={{ fontSize: '0.85rem' }}>CNIC Number: <span style={{ color: '#fff', fontWeight: 600 }}>{d.cnicNumber || 'N/A'}</span></p>
                          
                          {d.vehicle && (
                            <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                              <h5 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '4px' }}>Vehicle Information</h5>
                              <p style={{ fontSize: '0.8rem' }}>Car: {d.vehicle.color} {d.vehicle.make} {d.vehicle.model}</p>
                              <p style={{ fontSize: '0.8rem' }}>License Plate: {d.vehicle.licensePlate}</p>
                              <p style={{ fontSize: '0.8rem' }}>Max Capacity: {d.vehicle.capacity} seats</p>
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleVerifyDriver(d.id, true)}>
                              <Check size={16} /> Approve
                            </button>
                            <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleVerifyDriver(d.id, false)}>
                              <X size={16} /> Reject
                            </button>
                          </div>
                        </div>

                        {/* Auditing Documents Media Grid */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <h5 style={{ color: '#fff', fontSize: '0.95rem' }}>Uploaded Proof Documents</h5>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-2">
                            <div>
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>CNIC Front Image</p>
                              {d.cnicFrontUrl ? (
                                <a href={`${BASE_URL}${d.cnicFrontUrl}`} target="_blank" rel="noreferrer">
                                  <img 
                                    src={`${BASE_URL}${d.cnicFrontUrl}`} 
                                    alt="CNIC Front" 
                                    style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
                                  />
                                </a>
                              ) : (
                                <div style={{ height: '120px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}>
                                  No image uploaded
                                </div>
                              )}
                            </div>
                            
                            <div>
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>CNIC Back Image</p>
                              {d.cnicBackUrl ? (
                                <a href={`${BASE_URL}${d.cnicBackUrl}`} target="_blank" rel="noreferrer">
                                  <img 
                                    src={`${BASE_URL}${d.cnicBackUrl}`} 
                                    alt="CNIC Back" 
                                    style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
                                  />
                                </a>
                              ) : (
                                <div style={{ height: '120px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}>
                                  No image uploaded
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Car Vehicle Image</p>
                            {d.vehicle?.imageUrl ? (
                              <a href={`${BASE_URL}${d.vehicle.imageUrl}`} target="_blank" rel="noreferrer">
                                <img 
                                  src={`${BASE_URL}${d.vehicle.imageUrl}`} 
                                  alt="Vehicle Car" 
                                  style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
                                />
                              </a>
                            ) : (
                              <div style={{ height: '150px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}>
                                No image uploaded
                              </div>
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

          {/* 2. USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                System Accounts Auditing
              </h3>
              <GlowCard interactive={false} style={{ padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                      <th style={{ padding: '14px 16px', color: '#fff' }}>User</th>
                      <th style={{ padding: '14px 16px', color: '#fff' }}>Email</th>
                      <th style={{ padding: '14px 16px', color: '#fff' }}>Role</th>
                      <th style={{ padding: '14px 16px', color: '#fff' }}>Verified (Drivers)</th>
                      <th style={{ padding: '14px 16px', color: '#fff' }}>Status</th>
                      <th style={{ padding: '14px 16px', color: '#fff', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ color: '#fff', fontWeight: 600 }}>{u.fullName}</span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{u.username}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>{u.email}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className={`badge ${u.role === 'ADMIN' ? 'badge-danger' : u.role === 'DRIVER' ? 'badge-info' : 'badge-success'}`} style={{ fontSize: '0.65rem' }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          {u.role === 'DRIVER' ? (
                            <span className={`badge ${u.verified ? 'badge-success' : 'badge-warning'}`}>
                              {u.verified ? 'Approved' : u.verificationStatus || 'Pending'}
                            </span>
                          ) : '—'}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className={`badge ${u.suspended ? 'badge-danger' : 'badge-success'}`}>
                            {u.suspended ? 'SUSPENDED' : 'ACTIVE'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          {u.role !== 'ADMIN' && (
                            <button
                              className={`btn ${u.suspended ? 'btn-primary' : 'btn-danger'}`}
                              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                              onClick={() => handleSuspendUser(u.id, !u.suspended)}
                            >
                              {u.suspended ? <Check size={12} /> : <ShieldX size={12} />}
                              {u.suspended ? 'Activate' : 'Suspend'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </GlowCard>
            </div>
          )}

          {/* 3. BOOKINGS MONITOR */}
          {activeTab === 'bookings' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                System-Wide Carpool Bookings Monitor
              </h3>
              <GlowCard interactive={false} style={{ padding: 0 }}>
                {bookings.length === 0 ? (
                  <p className="text-muted" style={{ padding: '24px', textAlign: 'center' }}>No bookings found in the database.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                        <th style={{ padding: '14px 16px', color: '#fff' }}>Booking ID</th>
                        <th style={{ padding: '14px 16px', color: '#fff' }}>Carpool Route</th>
                        <th style={{ padding: '14px 16px', color: '#fff' }}>Passenger</th>
                        <th style={{ padding: '14px 16px', color: '#fff' }}>Driver</th>
                        <th style={{ padding: '14px 16px', color: '#fff' }}>Seats</th>
                        <th style={{ padding: '14px 16px', color: '#fff' }}>Fare Paid</th>
                        <th style={{ padding: '14px 16px', color: '#fff' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '14px 16px' }}>#{b.id}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ color: '#fff', fontWeight: 600 }}>{b.ride?.departureLocation || 'N/A'}</span> &rarr; <span style={{ color: '#fff', fontWeight: 600 }}>{b.ride?.destinationLocation || 'N/A'}</span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>{b.passenger?.fullName || 'N/A'}</td>
                          <td style={{ padding: '14px 16px' }}>{b.ride?.driver?.fullName || 'N/A'}</td>
                          <td style={{ padding: '14px 16px' }}>{b.seatsBooked}</td>
                          <td style={{ padding: '14px 16px', fontWeight: 600 }}>${(b.farePaid || 0).toFixed(2)}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span className={`badge ${b.status === 'CONFIRMED' ? 'badge-success' : b.status === 'PENDING' ? 'badge-warning' : b.status === 'CANCELLED' ? 'badge-danger' : 'badge-info'}`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </GlowCard>
            </div>
          )}

          {/* 4. COMPLAINTS SYSTEM */}
          {activeTab === 'complaints' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                System Complaint Tickets
              </h3>
              {complaints.length === 0 ? (
                <GlowCard interactive={false} style={{ textAlign: 'center', padding: '32px' }}>
                  <p className="text-muted">No complaints filed.</p>
                </GlowCard>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {complaints.map(c => (
                    <GlowCard key={c.id} interactive={false} style={{ borderLeft: `4px solid ${c.status === 'RESOLVED' ? 'var(--neon-green)' : 'var(--error)'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                          <span className={`badge ${c.status === 'RESOLVED' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.65rem', marginBottom: '8px' }}>
                            {c.status}
                          </span>
                          <h4 style={{ color: '#fff', fontSize: '1.1rem' }}>{c.title}</h4>
                          <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', marginTop: '6px' }}>{c.description}</p>
                          <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '12px' }}>
                            Filed by: {c.reporter.fullName} (@{c.reporter.username}) | Date: {new Date(c.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {c.status === 'PENDING' && (
                          <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleResolveComplaint(c.id)}>
                            Resolve Ticket
                          </button>
                        )}
                      </div>
                    </GlowCard>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. SYSTEM ANALYTICS */}
          {activeTab === 'analytics' && analytics && (
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                Platform Metrics Overview
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
              }} className="grid-3">
                <GlowCard interactive={false}>
                  <DollarSign className="text-neon" size={28} />
                  <h4 style={{ fontSize: '1.8rem', color: '#fff', margin: '8px 0 4px 0' }}>${analytics.totalRevenue.toFixed(2)}</h4>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>Total Platform Revenue</p>
                </GlowCard>

                <GlowCard interactive={false}>
                  <Users className="text-neon" size={28} />
                  <h4 style={{ fontSize: '1.8rem', color: '#fff', margin: '8px 0 4px 0' }}>{analytics.totalUsers}</h4>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>Registered Users ({analytics.totalDrivers} Drivers, {analytics.totalPassengers} Passengers)</p>
                </GlowCard>

                <GlowCard interactive={false}>
                  <Award className="text-neon" size={28} />
                  <h4 style={{ fontSize: '1.8rem', color: '#fff', margin: '8px 0 4px 0' }}>{analytics.totalRides}</h4>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>Total Scheduled Rides</p>
                </GlowCard>

                <GlowCard interactive={false}>
                  <ShieldAlert className="text-error" size={28} />
                  <h4 style={{ fontSize: '1.8rem', color: '#fff', margin: '8px 0 4px 0' }}>{analytics.pendingComplaints} / {analytics.totalComplaints}</h4>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>Pending / Total Complaints</p>
                </GlowCard>
              </div>

              {/* Status details card */}
              <GlowCard interactive={false}>
                <h4 style={{ color: '#fff', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>Carpool Lifecycle Summary</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Scheduled Trips</span>
                    <p style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 600 }}>{analytics.activeRides}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completed Trips</span>
                    <p style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 600 }}>{analytics.completedRides}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cancelled Trips</span>
                    <p style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 600 }}>{analytics.cancelledRides}</p>
                  </div>
                </div>
              </GlowCard>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
