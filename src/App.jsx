import React, { Component } from 'react';
import IgniteLandingPage from './IgniteLandingPage';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled Application Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            fontFamily: "'DM Sans', system-ui, sans-serif",
            background: '#FFF6EF',
            color: '#17140F',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              maxWidth: 480,
              background: '#FFFFFF',
              borderRadius: 20,
              padding: '32px 24px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: '#FEF2F2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                fontSize: 28,
                fontWeight: 900
              }}
            >
              !
            </div>
            <h2 style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 24, margin: 0 }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: 15, color: '#6B6157', margin: 0, lineHeight: 1.5 }}>
              We apologize for the inconvenience. You can reload the page or complete your order directly with our nutrition team on WhatsApp.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  background: '#C2410C',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '14px 20px',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer'
                }}
              >
                Reload Page
              </button>
              <a
                href="https://wa.me/919875270200?text=Hi%2C%20I%20want%20to%20order%20IGNITE%20Fat%20Burner."
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#16A34A',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  padding: '14px 20px',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                Order via WhatsApp (+91 98752 70200)
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <IgniteLandingPage />
    </ErrorBoundary>
  );
}
