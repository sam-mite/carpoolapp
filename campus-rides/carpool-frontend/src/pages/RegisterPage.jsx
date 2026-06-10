import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Users, Car, User, Mail, Lock, Phone, CreditCard, Shield, Eye, EyeOff } from 'lucide-react';
import { api } from '../utils/api';
import GlowCard from '../components/GlowCard';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Set initial role based on URL parameters
  const initialRole = searchParams.get('role') === 'driver' ? 'DRIVER' : searchParams.get('role') === 'admin' ? 'ADMIN' : 'PASSENGER';
  const [role, setRole] = useState(initialRole);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    licenseNumber: '',
    make: '',
    model: '',
    licensePlate: '',
    color: '',
    capacity: 4
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const urlRole = searchParams.get('role');
    if (urlRole === 'driver') setRole('DRIVER');
    else if (urlRole === 'passenger') setRole('PASSENGER');
    else if (urlRole === 'admin') setRole('ADMIN');
  }, [searchParams]);

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: role,
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber
    };

    if (role === 'DRIVER') {
      payload.licenseNumber = formData.licenseNumber;
      payload.make = formData.make;
      payload.model = formData.model;
      payload.licensePlate = formData.licensePlate;
      payload.color = formData.color;
      payload.capacity = formData.capacity;

      if (!payload.licenseNumber || !payload.make || !payload.model || !payload.licensePlate || !payload.color || !payload.capacity) {
        setError('Please fill in all driver vehicle details.');
        setLoading(false);
        return;
      }
    }

    try {
      await api.signup(payload);
      setSuccess('Registration successful! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login?registered=true');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 24px',
      background: 'radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.08) 0%, rgba(8, 10, 15, 0) 50%)',
      flex: 1
    }}>
      <div style={{ width: '100%', maxWidth: role === 'DRIVER' ? '700px' : '460px' }}>
        <GlowCard style={{ padding: '40px 32px' }} interactive={false}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.85rem', fontFamily: 'var(--font-heading)' }}>Join CampusRides</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
              Create an account to start sharing rides on campus
            </p>

            {/* Role Selection Toggle */}
            <div style={{
              display: 'flex',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '4px',
              marginTop: '24px',
              gap: '4px'
            }}>
              <button
                type="button"
                onClick={() => setRole('PASSENGER')}
                style={{
                  flex: 1,
                  background: role === 'PASSENGER' ? 'var(--neon-green)' : 'transparent',
                  color: role === 'PASSENGER' ? 'var(--bg-darkest)' : 'var(--text-main)',
                  border: 'none',
                  borderRadius: 'calc(var(--radius-md) - 2px)',
                  padding: '10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'var(--transition-smooth)',
                  fontSize: '0.85rem'
                }}
              >
                <Users size={14} />
                Passenger
              </button>
              <button
                type="button"
                onClick={() => setRole('DRIVER')}
                style={{
                  flex: 1,
                  background: role === 'DRIVER' ? 'var(--neon-green)' : 'transparent',
                  color: role === 'DRIVER' ? 'var(--bg-darkest)' : 'var(--text-main)',
                  border: 'none',
                  borderRadius: 'calc(var(--radius-md) - 2px)',
                  padding: '10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'var(--transition-smooth)',
                  fontSize: '0.85rem'
                }}
              >
                <Car size={14} />
                Driver
              </button>
              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                style={{
                  flex: 1,
                  background: role === 'ADMIN' ? 'var(--neon-green)' : 'transparent',
                  color: role === 'ADMIN' ? 'var(--bg-darkest)' : 'var(--text-main)',
                  border: 'none',
                  borderRadius: 'calc(var(--radius-md) - 2px)',
                  padding: '10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'var(--transition-smooth)',
                  fontSize: '0.85rem'
                }}
              >
                <Shield size={14} />
                Admin
              </button>
            </div>
          </div>

          <Alert type="error" message={error} onClose={() => setError('')} />
          <Alert type="success" message={success} />

          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: role === 'DRIVER' ? '1fr 1fr' : '1fr',
              gap: '24px'
            }} className="form-grid">
              
              {/* Left Column: Personal Information */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ color: '#fff', fontSize: '1.05rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', fontFamily: 'var(--font-heading)' }}>
                  Personal Information
                </h4>
                
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} />
                    <span>Username</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    className="form-control"
                    placeholder="Choose username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="Enter university email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lock size={14} />
                    <span>Password</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      className="form-control"
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    className="form-control"
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} />
                    <span>Phone Number</span>
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    className="form-control"
                    placeholder="e.g. 555-0199"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Right Column: Driver Details (Only visible for DRIVER role) */}
              {role === 'DRIVER' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ color: '#fff', fontSize: '1.05rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', fontFamily: 'var(--font-heading)' }}>
                    Driver & Vehicle Details
                  </h4>

                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CreditCard size={14} />
                      <span>Driving License Number</span>
                    </label>
                    <input
                      type="text"
                      name="licenseNumber"
                      className="form-control"
                      placeholder="e.g. DL-12345678"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      required={role === 'DRIVER'}
                      disabled={loading}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Car Make</label>
                      <input
                        type="text"
                        name="make"
                        className="form-control"
                        placeholder="e.g. Honda"
                        value={formData.make}
                        onChange={handleChange}
                        required={role === 'DRIVER'}
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Car Model</label>
                      <input
                        type="text"
                        name="model"
                        className="form-control"
                        placeholder="e.g. Civic"
                        value={formData.model}
                        onChange={handleChange}
                        required={role === 'DRIVER'}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">License Plate Number</label>
                    <input
                      type="text"
                      name="licensePlate"
                      className="form-control"
                      placeholder="e.g. ABC-1234"
                      value={formData.licensePlate}
                      onChange={handleChange}
                      required={role === 'DRIVER'}
                      disabled={loading}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Car Color</label>
                      <input
                        type="text"
                        name="color"
                        className="form-control"
                        placeholder="e.g. Black"
                        value={formData.color}
                        onChange={handleChange}
                        required={role === 'DRIVER'}
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Capacity (Seats)</label>
                      <input
                        type="number"
                        name="capacity"
                        min="1"
                        max="8"
                        className="form-control"
                        value={formData.capacity}
                        onChange={handleChange}
                        required={role === 'DRIVER'}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', height: '46px', marginTop: '32px' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="small" />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          <p style={{
            fontSize: '0.85rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
            marginTop: '24px'
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
          </p>
        </GlowCard>
      </div>
      <style>{`
        @media (max-width: 650px) {
          .form-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
