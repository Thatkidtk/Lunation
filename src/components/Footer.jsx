import React from 'react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      background: 'linear-gradient(135deg, var(--surface-2), var(--surface))',
      borderTop: '1px solid var(--border)',
      marginTop: 'auto',
      padding: '3rem 2rem 2rem',
      color: 'var(--text)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '3rem',
        marginBottom: '2rem'
      }}>
        {/* Lunation Info */}
        <div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            marginBottom: '1rem' 
          }}>
            <span style={{ fontSize: '2rem' }}>🌙</span>
            <h3 style={{ 
              margin: 0, 
              fontSize: '1.5rem',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Lunation
            </h3>
          </div>
          <p style={{ 
            color: 'var(--muted)', 
            lineHeight: '1.6', 
            marginBottom: '1.5rem',
            fontSize: '0.95rem'
          }}>
            Revolutionary AI-powered menstrual cycle tracking with advanced predictive intelligence, 
            health insights, and privacy-first design. Your personal reproductive health companion.
          </p>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-2)' + '20, var(--accent)' + '20)',
            border: '1px solid var(--accent)',
            borderRadius: '12px',
            padding: '1rem',
            fontSize: '0.85rem'
          }}>
            <strong style={{ color: 'var(--accent)' }}>🎉 Version 3.0.0</strong>
            <div style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>
              Phase 3: AI Intelligence, PWA, Research Hub
            </div>
          </div>
        </div>

        {/* Creator & Contact */}
        <div>
          <h4 style={{ 
            color: 'var(--accent)', 
            marginBottom: '1rem',
            fontSize: '1.1rem'
          }}>
            Created by Thomas Kase Black
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <a 
              href="https://github.com/Thatkidtk" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                color: 'var(--text)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem',
                borderRadius: '8px',
                transition: 'background-color 0.2s',
                fontSize: '0.9rem'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--surface-glass)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <span style={{ fontSize: '1.2rem' }}>👨‍💻</span>
              <span>GitHub: @Thatkidtk</span>
            </a>

            <a 
              href="https://linkedin.com/in/thomas-kase-black" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                color: 'var(--text)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem',
                borderRadius: '8px',
                transition: 'background-color 0.2s',
                fontSize: '0.9rem'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--surface-glass)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <span style={{ fontSize: '1.2rem' }}>💼</span>
              <span>LinkedIn Profile</span>
            </a>

            <a 
              href="https://thatkidtk.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                color: 'var(--text)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem',
                borderRadius: '8px',
                transition: 'background-color 0.2s',
                fontSize: '0.9rem'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--surface-glass)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <span style={{ fontSize: '1.2rem' }}>🌐</span>
              <span>Portfolio Website</span>
            </a>

            <a 
              href="mailto:thomas@thatkidtk.dev" 
              style={{
                color: 'var(--text)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem',
                borderRadius: '8px',
                transition: 'background-color 0.2s',
                fontSize: '0.9rem'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--surface-glass)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <span style={{ fontSize: '1.2rem' }}>📧</span>
              <span>thomas@thatkidtk.dev</span>
            </a>
          </div>

          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'var(--surface)',
            borderRadius: '8px',
            border: '1px solid var(--border)'
          }}>
            <div style={{ color: 'var(--text)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              💡 <strong>Passionate Full-Stack Developer</strong>
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '0.8rem', lineHeight: '1.4' }}>
              Specializing in React, AI integration, and privacy-focused health applications. 
              Available for consulting and custom development projects.
            </div>
          </div>
        </div>

        {/* Project & Technical Info */}
        <div>
          <h4 style={{ 
            color: 'var(--accent)', 
            marginBottom: '1rem',
            fontSize: '1.1rem'
          }}>
            Project & Support
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <a 
              href="https://github.com/Thatkidtk/Lunation" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                color: 'var(--text)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem',
                borderRadius: '8px',
                transition: 'background-color 0.2s',
                fontSize: '0.9rem'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--surface-glass)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <span style={{ fontSize: '1.2rem' }}>⭐</span>
              <span>Star on GitHub</span>
            </a>

            <a 
              href="https://github.com/Thatkidtk/Lunation/issues" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                color: 'var(--text)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem',
                borderRadius: '8px',
                transition: 'background-color 0.2s',
                fontSize: '0.9rem'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--surface-glass)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <span style={{ fontSize: '1.2rem' }}>🐛</span>
              <span>Report Issues</span>
            </a>

            <a 
              href="https://github.com/Thatkidtk/Lunation/blob/main/README.md" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                color: 'var(--text)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem',
                borderRadius: '8px',
                transition: 'background-color 0.2s',
                fontSize: '0.9rem'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--surface-glass)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <span style={{ fontSize: '1.2rem' }}>📚</span>
              <span>Documentation</span>
            </a>
          </div>

          <div style={{
            background: 'var(--surface)',
            borderRadius: '8px',
            padding: '1rem',
            border: '1px solid var(--border)'
          }}>
            <div style={{ color: 'var(--text)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              🏗️ <strong>Built With:</strong>
            </div>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '0.5rem',
              fontSize: '0.8rem'
            }}>
              {[
                'React 18', 'Vite', 'AI/ML', 'WebAuthn', 'PWA', 'Chart.js', 
                'Web Crypto API', 'Service Worker', 'Local Storage'
              ].map(tech => (
                <span key={tech} style={{
                  background: 'var(--accent)' + '20',
                  color: 'var(--accent)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  border: '1px solid var(--accent)' + '40'
                }}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{
        borderTop: '1px solid var(--border)',
        paddingTop: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
          © {currentYear} Thomas Kase Black. Built with ❤️ for better reproductive health.
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          fontSize: '0.85rem',
          color: 'var(--muted)'
        }}>
          <span>🔒 Privacy-First</span>
          <span>•</span>
          <span>🌙 Open Source</span>
          <span>•</span>
          <span>🧠 AI-Powered</span>
        </div>
      </div>

      {/* Medical Disclaimer */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: 'var(--warning-light)',
        border: '1px solid var(--warning)',
        borderRadius: '8px',
        fontSize: '0.8rem',
        color: 'var(--text)',
        lineHeight: '1.4'
      }}>
        <strong>⚕️ Medical Disclaimer:</strong> Lunation is for informational purposes only and should not replace 
        professional medical advice. Always consult healthcare providers for birth control decisions, fertility planning, 
        or health concerns. The app's predictions are estimates based on your data and may not be accurate for medical purposes.
      </div>
    </footer>
  );
}

export default Footer;