
import React from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8">
      <div className="container mx-auto px-6">
        <div className="text-center text-gray-600">
          <p className="text-sm">
            © 2025 SnapRestore. All rights reserved.
          </p>
          <div className="flex items-center justify-center space-x-4 mt-3">
            <Link 
              to="/privacy" 
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-300">•</span>
            <Link 
              to="/terms" 
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
          <p className="text-sm mt-2 flex items-center justify-center gap-1">
            Made with <Heart size={14} className="text-red-500 fill-current" /> by raglandlabs
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
