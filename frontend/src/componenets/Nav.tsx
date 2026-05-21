import { useState } from 'react';
import { Link } from 'react-router-dom';

function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF4500] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">J</span>
            </div>
            <span className="text-xl font-bold text-gray-900">JobOps</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-500 hover:text-gray-900 transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-500 hover:text-gray-900 transition-colors">How it Works</a>
            <a href="#pricing" className="text-gray-500 hover:text-gray-900 transition-colors">Pricing</a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="px-4 py-2 bg-[#FF4500] hover:bg-[#e03e00] text-white rounded-lg transition-colors">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-700"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-4 py-4 space-y-3">
            <a href="#features" className="block py-2 text-gray-500 hover:text-gray-900 transition-colors" onClick={() => setIsOpen(false)}>Features</a>
            <a href="#how-it-works" className="block py-2 text-gray-500 hover:text-gray-900 transition-colors" onClick={() => setIsOpen(false)}>How it Works</a>
            <a href="#pricing" className="block py-2 text-gray-500 hover:text-gray-900 transition-colors" onClick={() => setIsOpen(false)}>Pricing</a>
            <div className="pt-3 space-y-2 border-t border-gray-200">
              <Link to="/login" className="block w-full text-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="block w-full text-center px-4 py-2 bg-[#FF4500] hover:bg-[#e03e00] text-white rounded-lg transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Nav;
