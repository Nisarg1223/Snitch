import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { setUser } from '../state/auth.slice.js';

const Home = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(setUser(null));
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '2.5rem',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem' }}>
          SNITCH Dashboard
        </h1>

        {user ? (
          <div>
            <div style={{
              display: 'inline-block',
              padding: '0.35rem 0.85rem',
              backgroundColor: '#ecfdf5',
              color: '#047857',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: '600',
              marginBottom: '1.5rem'
            }}>
              Logged in as {user.role?.toUpperCase() || 'USER'}
            </div>

            <div style={{ textAlign: 'left', backgroundColor: '#f1f5f9', padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#334155' }}>
              <p style={{ margin: '0.35rem 0' }}><strong>Full Name:</strong> {user.fullname}</p>
              <p style={{ margin: '0.35rem 0' }}><strong>Email:</strong> {user.email}</p>
              {user.contact && <p style={{ margin: '0.35rem 0' }}><strong>Contact:</strong> {user.contact}</p>}
            </div>

            <button
              onClick={handleLogout}
              style={{
                backgroundColor: '#18181b',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1.75rem',
                borderRadius: '9999px',
                fontSize: '0.92rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
            >
              Log Out
            </button>
          </div>
        ) : (
          <div>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              You are currently not logged in.
            </p>
            <Link
              to="/login"
              style={{
                display: 'inline-block',
                backgroundColor: '#18181b',
                color: '#ffffff',
                textDecoration: 'none',
                padding: '0.75rem 1.75rem',
                borderRadius: '9999px',
                fontSize: '0.92rem',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(24, 24, 27, 0.15)'
              }}
            >
              Go to Login / Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;