'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const isAuthenticated = typeof document !== 'undefined' && document.cookie.includes('token=');

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if path is active
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  // Close all menus (for link clicks)
  const closeMenus = () => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    window.location.href = '/auth/login';
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white dark:bg-gray-900 shadow-md py-2'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold flex items-center gap-2" onClick={closeMenus}>
            <Image 
              src="/images/logo.png" 
              alt="ArtAuction Kenya" 
              width={40} 
              height={40} 
              className="w-10 h-10 object-contain"
            />
            <span className={`${isScrolled || pathname !== '/' ? 'text-primary' : 'text-white'}`}>
              ArtAuction<span className="font-light">Kenya</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/"
              className={`nav-link ${isActive('/') 
                ? (isScrolled ? 'text-primary font-medium' : 'text-white font-medium') 
                : (isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white/90 hover:text-white')}`}
              onClick={closeMenus}
            >
              Home
            </Link>
            <Link 
              href="/auctions"
              className={`nav-link ${isActive('/auctions') 
                ? (isScrolled ? 'text-primary font-medium' : 'text-white font-medium') 
                : (isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white/90 hover:text-white')}`}
              onClick={closeMenus}
            >
              Auctions
            </Link>
            <Link 
              href="/artists"
              className={`nav-link ${isActive('/artists') 
                ? (isScrolled ? 'text-primary font-medium' : 'text-white font-medium') 
                : (isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white/90 hover:text-white')}`}
              onClick={closeMenus}
            >
              Artists
            </Link>
            <Link 
              href="/about"
              className={`nav-link ${isActive('/about') 
                ? (isScrolled ? 'text-primary font-medium' : 'text-white font-medium') 
                : (isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white/90 hover:text-white')}`}
              onClick={closeMenus}
            >
              About
            </Link>
            <Link 
              href="/contact"
              className={`nav-link ${isActive('/contact') 
                ? (isScrolled ? 'text-primary font-medium' : 'text-white font-medium') 
                : (isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white/90 hover:text-white')}`}
              onClick={closeMenus}
            >
              Contact
            </Link>
          </nav>
          
          {/* User Menu (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {status === 'authenticated' ? (
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2"
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-secondary">
                    <Image 
                      src={session.user?.image || '/images/artists/soi.jpg'} 
                      alt={session.user?.name || 'User'} 
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className={isScrolled || pathname !== '/' ? 'text-gray-800' : 'text-white'}>
                    {session.user?.name?.split(' ')[0]}
                  </span>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden z-50">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{session.user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{session.user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link 
                        href="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={closeMenus}
                      >
                        Your Profile
                      </Link>
                      <Link 
                        href="/dashboard" 
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={closeMenus}
                      >
                        Dashboard
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link 
                  href="/auth/signin" 
                  className={`text-sm font-medium ${
                    isScrolled || pathname !== '/' ? 'text-primary' : 'text-white'
                  }`}
                  onClick={closeMenus}
                >
                  Sign in
                </Link>
                <Link 
                  href="/auth/signup" 
                  onClick={closeMenus}
                >
                  <Button className={`${
                    isScrolled || pathname !== '/' 
                    ? 'bg-primary text-white hover:bg-primary/90' 
                    : 'bg-white text-primary hover:bg-white/90'
                  }`}>
                    Join Now
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden bg-white dark:bg-gray-900 shadow-lg absolute left-0 right-0"
          ref={mobileMenuRef}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              href="/"
              className={`block px-3 py-2 rounded-md ${isActive('/') ? 'bg-primary/10 text-primary' : 'text-gray-700 dark:text-gray-300'}`}
              onClick={closeMenus}
            >
              Home
            </Link>
            <Link 
              href="/auctions"
              className={`block px-3 py-2 rounded-md ${isActive('/auctions') ? 'bg-primary/10 text-primary' : 'text-gray-700 dark:text-gray-300'}`}
              onClick={closeMenus}
            >
              Auctions
            </Link>
            <Link 
              href="/artists"
              className={`block px-3 py-2 rounded-md ${isActive('/artists') ? 'bg-primary/10 text-primary' : 'text-gray-700 dark:text-gray-300'}`}
              onClick={closeMenus}
            >
              Artists
            </Link>
            <Link 
              href="/about"
              className={`block px-3 py-2 rounded-md ${isActive('/about') ? 'bg-primary/10 text-primary' : 'text-gray-700 dark:text-gray-300'}`}
              onClick={closeMenus}
            >
              About
            </Link>
            <Link 
              href="/contact"
              className={`block px-3 py-2 rounded-md ${isActive('/contact') ? 'bg-primary/10 text-primary' : 'text-gray-700 dark:text-gray-300'}`}
              onClick={closeMenus}
            >
              Contact
            </Link>
          </div>
          
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            {status === 'authenticated' ? (
              <>
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <Image 
                      src={session.user?.image || '/images/artists/soi.jpg'} 
                      alt={session.user?.name || 'User'} 
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800 dark:text-white">{session.user?.name}</div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{session.user?.email}</div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <Link 
                    href="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={closeMenus}
                  >
                    Your Profile
                  </Link>
                  <Link 
                    href="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={closeMenus}
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="px-4 py-3 flex gap-3">
                <Link 
                  href="/auth/signin" 
                  className="flex-1"
                  onClick={closeMenus}
                >
                  <Button 
                    variant="outline" 
                    className="w-full border-primary text-primary"
                  >
                    Sign in
                  </Button>
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="flex-1"
                  onClick={closeMenus}
                >
                  <Button className="w-full bg-primary text-white hover:bg-primary/90">
                    Join Now
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 