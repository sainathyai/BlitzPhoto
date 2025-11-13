import { Link } from 'react-router-dom';
import { HelpCircle, Shield, FileText } from 'lucide-react';

/**
 * Footer Component
 * 
 * Subtle footer with links to Terms, Privacy, and Help.
 */
export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <span>© {new Date().getFullYear()} BlitzPhoto. All rights reserved.</span>
          </div>
          
          <nav className="flex items-center gap-6">
            <Link
              to="/help"
              className="flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help</span>
            </Link>
            <Link
              to="/privacy"
              className="flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600 transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Privacy</span>
            </Link>
            <Link
              to="/terms"
              className="flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Terms</span>
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

