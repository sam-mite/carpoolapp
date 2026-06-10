import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Car, LogIn, LogOut, User as UserIcon, DollarSign, Shield, LayoutDashboard, Search, Menu, X } from 'lucide-react';
import { getStoredUser, api } from '../utils/api';

const Navbar = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    api.logout();
    onLogout();
    navigate('/');
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>Admin</span>;
      case 'DRIVER':
        return <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>Driver</span>;
      case 'PASSENGER':
        return <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Passenger</span>;
      default:
        return null;
    }
  };

  return (
    <nav style={{
      background: 'rgba(13, 17, 23, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '16px 0',
      transition: 'var(--transition-smooth)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 800,
          fontSize: '1.4rem',
          fontFamily: 'var(--font-heading)',
          color: '#fff'
        }}>
          <Car size={28} className="text-neon" style={{ strokeWidth: 2.5 }} />
          <span>Campus<span className="text-neon">Rides</span></span>
        </Link>

        {/* Desktop Menu */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px'
        }} className="desktop-menu">
          {(!user || user.role === 'PASSENGER') && (
            <Link to="/search" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: isActive('/search') ? 'var(--neon-green)' : 'var(--text-main)',
              fontWeight: 500,
              fontSize: '0.95rem'
            }}>
              <Search size={18} />
              Find Rides
            </Link>
          )}

          {user ? (
            <>
              {/* Conditional Dashboard Link */}
              {user.role !== 'ADMIN' && (
                <Link to="/dashboard" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: isActive('/dashboard') ? 'var(--neon-green)' : 'var(--text-main)',
                  fontWeight: 500,
                  fontSize: '0.95rem'
                }}>
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
              )}

              {user.role === 'ADMIN' && (
                <Link to="/admin" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: isActive('/admin') ? 'var(--neon-green)' : 'var(--text-main)',
                  fontWeight: 500,
                  fontSize: '0.95rem'
                }}>
                  <Shield size={18} />
                  Admin
                </Link>
              )}

              {/* Wallet Info for Passenger */}
              {user.role === 'PASSENGER' && (
                <Link to="/dashboard" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 14px',
                  color: 'var(--neon-green)',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}>
                  <DollarSign size={16} />
                  <span>Wallet: ${user.walletBalance?.toFixed(2) || '0.00'}</span>
                </Link>
              )}

              {/* User Session Info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                paddingLeft: '16px',
                borderLeft: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{user.fullName}</span>
                  {getRoleBadge(user.role)}
                </div>
                <button 
                  onClick={handleLogoutClick}
                  className="btn btn-secondary" 
                  style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>
                <LogIn size={16} />
                Login
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            display: 'none'
          }} 
          className="mobile-toggle"
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div style={{
          background: 'var(--bg-darker)',
          borderTop: '1px solid var(--border-subtle)',
          padding: '20px 24px',
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          zIndex: 99,
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)'
        }}>
          {(!user || user.role === 'PASSENGER') && (
            <Link to="/search" onClick={() => setIsOpen(false)} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '1.05rem',
              color: isActive('/search') ? 'var(--neon-green)' : 'var(--text-main)',
              fontWeight: 500
            }}>
              <Search size={20} />
              Find Rides
            </Link>
          )}

          {user ? (
            <>
              {user.role !== 'ADMIN' && (
                <Link to="/dashboard" onClick={() => setIsOpen(false)} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '1.05rem',
                  color: isActive('/dashboard') ? 'var(--neon-green)' : 'var(--text-main)',
                  fontWeight: 500
                }}>
                  <LayoutDashboard size={20} />
                  Dashboard
                </Link>
              )}

              {user.role === 'ADMIN' && (
                <Link to="/admin" onClick={() => setIsOpen(false)} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '1.05rem',
                  color: isActive('/admin') ? 'var(--neon-green)' : 'var(--text-main)',
                  fontWeight: 500
                }}>
                  <Shield size={20} />
                  Admin Menu
                </Link>
              )}

              {user.role === 'PASSENGER' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 16px',
                  color: 'var(--neon-green)',
                  fontWeight: 600
                }}>
                  <DollarSign size={18} />
                  <span>Wallet: ${user.walletBalance?.toFixed(2) || '0.00'}</span>
                </div>
              )}

              <div style={{
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <UserIcon size={20} className="text-muted" />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>{user.fullName}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.username}</span>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    {getRoleBadge(user.role)}
                  </div>
                </div>

                <button 
                  onClick={handleLogoutClick}
                  className="btn btn-secondary" 
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)'
            }}>
              <Link to="/login" onClick={() => setIsOpen(false)} className="btn btn-secondary" style={{ width: '100%' }}>
                <LogIn size={18} />
                Login
              </Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="btn btn-primary" style={{ width: '100%' }}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Inject styling rules specifically for responsive hamburger display */}
      <style>{`
        @media (max-width: 850px) {
          .desktop-menu {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
