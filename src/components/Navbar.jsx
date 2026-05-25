import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const links = [
  { label: 'Home', to: '/' },
  { label: 'PDF Tools', to: '/pdf-tools' },
  { label: 'Image Tools', to: '/image-tools' },
  { label: 'Video Tools', to: '/video-tools' },
  { label: 'Doc Tools', to: '/doc-tools' },
]

function GlowNavLink({ to, label, active }) {
  return (
    <Link to={to} className="relative inline-block">
      <button className={`glow-button ${active ? 'active' : ''}`}>
        {label}
        <svg className="glow-container" viewBox="0 0 100 40" preserveAspectRatio="none">
          <rect className="glow-blur" pathLength="100"></rect>
          <rect className="glow-line" pathLength="100"></rect>
        </svg>
      </button>
    </Link>
  )
}

function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <>
      <nav className="sticky top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div
          className="max-w-7xl mx-auto h-20 flex items-center justify-between"
          style={{ paddingLeft: '48px', paddingRight: '48px' }}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200 logo-spin"
              style={{ background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-[11px] font-medium text-slate-400 tracking-widest uppercase">
                FILE
              </span>
              <span className="text-xl font-bold text-slate-900 tracking-tight -mt-0.5">
                Converter PRO<span className="text-blue-600">.</span>
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center ml-auto gap-2">
            {links.map((link) => (
              <GlowNavLink
                key={link.to}
                to={link.to}
                label={link.label}
                active={pathname === link.to}
              />
            ))}
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden bg-white border-t border-slate-200 px-6 py-5 space-y-3 shadow-lg">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition
                  ${pathname === link.to
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-blue-600'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Styles */}
      <style>{`
        .glow-button {
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          padding: 7px 12px;
          border-radius: 12px;
          border: 1.5px solid #ccd2e6;
          background: transparent;
          color: #0f172a;
          position: relative;
          white-space: nowrap;
          transition: all 0.3s ease;
        }

        .glow-button:hover {
          border-color: #7c3aed;
          color: #4f46e5;
        }

        .glow-container {
          pointer-events: none;
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
        }

        .glow-line,
        .glow-blur {
          width: 100%;
          height: 100%;
          x: 0;
          y: 0;
          rx: 12;
          fill: transparent;
          stroke-dasharray: 30 70;
        }

        .glow-line {
          stroke: #7c3aed;
          stroke-width: 2px;
        }

        .glow-blur {
          stroke: #a78bfa;
          stroke-width: 6px;
          filter: blur(6px);
        }

        .glow-button:hover .glow-container {
          opacity: 1;
        }

        .glow-button:hover .glow-line,
        .glow-button:hover .glow-blur {
          stroke-dashoffset: -120;
          transition: 1.2s ease-in-out;
        }

        .glow-button.active {
          border-color: #4f46e5;
          background: #eef2ff;
          color: #4f46e5;
        }

        .logo-spin {
          animation: rotatePause 6s ease-in-out infinite;
        }

        @keyframes rotatePause {
          0% { transform: rotate(0deg); }
          20% { transform: rotate(360deg); }
          50% { transform: rotate(360deg); }
          70% { transform: rotate(720deg); }
          100% { transform: rotate(720deg); }
        }
      `}</style>
    </>
  )
}

export default Navbar