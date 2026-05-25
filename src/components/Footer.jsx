import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="mt-auto bg-white">
      {/* White space above footer */}
      <div className="bg-white h-20" />
      <div className="max-w-7xl mx-auto py-12" style={{ paddingLeft: '48px', paddingRight: '48px' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand - same as Navbar */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 group mb-4">

              {/* Same icon box as Navbar */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md"
                style={{ background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>

              {/* Same brand name as Navbar */}
              <div className="flex flex-col leading-tight">
                <span className="text-[11px] font-medium text-slate-400 tracking-widest uppercase">
                  iLove
                </span>
                <span className="text-xl font-bold text-slate-900 tracking-tight -mt-0.5">
                  Tools<span className="text-blue-600">.</span>
                </span>
              </div>
            </Link>

            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Free online tools for PDF, Image, Video and Document conversion.
              Fast, secure and easy to use.
            </p>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-slate-900 font-semibold mb-4">Tools</h3>
            <ul className="space-y-2">
              <li><Link to="/pdf-tools" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">PDF Tools</Link></li>
              <li><Link to="/image-tools" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">Image Tools</Link></li>
              <li><Link to="/video-tools" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">Video Tools</Link></li>
              <li><Link to="/doc-tools" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">Doc Tools</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-slate-900 font-semibold mb-4">Info</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">About</a></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-200 mt-8 pt-8 text-center">
          <p className="text-slate-400 text-sm">© 2025 iLoveTools. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
