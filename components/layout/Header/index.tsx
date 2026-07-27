'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [year, setYear] = React.useState(2026);

  React.useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-40">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-red-primary to-red-dark rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Mathlers</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-gray-700 hover:text-red-primary transition-colors">
                Features
              </Link>
              <Link href="#journey" className="text-gray-700 hover:text-red-primary transition-colors">
                Journey
              </Link>
              <Link href="#faq" className="text-gray-700 hover:text-red-primary transition-colors">
                FAQ
              </Link>
              <Link href="#contact" className="text-gray-700 hover:text-red-primary transition-colors">
                Contact
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-red-primary transition-colors">
                Login
              </Link>
              <Link href="/register" className="glass-button px-6 py-2 text-white font-semibold rounded-xl">
                Register
              </Link>
            </div>

            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-4">
              <Link href="#features" className="block text-gray-700 hover:text-red-primary transition-colors">
                Features
              </Link>
              <Link href="#journey" className="block text-gray-700 hover:text-red-primary transition-colors">
                Journey
              </Link>
              <Link href="#faq" className="block text-gray-700 hover:text-red-primary transition-colors">
                FAQ
              </Link>
              <Link href="#contact" className="block text-gray-700 hover:text-red-primary transition-colors">
                Contact
              </Link>
              <Link href="/login" className="block text-gray-700 hover:text-red-primary transition-colors">
                Login
              </Link>
              <Link href="/register" className="glass-button px-6 py-2 text-white font-semibold rounded-xl inline-block">
                Register
              </Link>
            </div>
          )}
        </nav>
      </header>

      <main>{children}</main>

      <footer className="glass mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-red-primary to-red-dark rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">M</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">Mathlers</span>
              </div>
              <p className="text-gray-600">
                Making mathematics engaging through structured practice and competitive events.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-gray-600 hover:text-red-primary transition-colors">Features</Link></li>
                <li><Link href="#journey" className="text-gray-600 hover:text-red-primary transition-colors">Competition Journey</Link></li>
                <li><Link href="#faq" className="text-gray-600 hover:text-red-primary transition-colors">FAQ</Link></li>
                <li><Link href="#contact" className="text-gray-600 hover:text-red-primary transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-600 hover:text-red-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-red-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-red-primary transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-600">
                <li>info@mathlers.com</li>
                <li>+1 (555) 123-4567</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
            <p>&copy; {year} Mathlers. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
