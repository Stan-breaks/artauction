'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export function Navigation() {
  const { user, loading, logout } = useAuth();

  const commonLinks = [
    { href: '/', label: 'Home' },
    { href: '/artworks', label: 'Browse Artworks' },
  ];

  const artistLinks = [
    { href: '/artworks/upload', label: 'Upload Artwork' },
    { href: '/artworks/my-artworks', label: 'My Artworks' },
    { href: '/artist/dashboard', label: 'Artist Dashboard' },
  ];

  const userLinks = [
    { href: '/my-bids', label: 'My Bids' },
    { href: '/watchlist', label: 'Watchlist' },
  ];

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Admin Dashboard' },
    { href: '/admin/users', label: 'Manage Users' },
    { href: '/admin/artworks', label: 'Manage Artworks' },
    { href: '/admin/reports', label: 'Reports' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-indigo-600">
                Art Auction
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {commonLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                >
                  {link.label}
                </Link>
              ))}
              {user?.role === 'ARTIST' &&
                artistLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                  >
                    {link.label}
                  </Link>
                ))}
              {(user?.role === 'USER' || user?.role === 'ARTIST') &&
                userLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                  >
                    {link.label}
                  </Link>
                ))}
              {user?.role === 'ADMIN' &&
                adminLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                  >
                    {link.label}
                  </Link>
                ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {loading ? (
              <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-indigo-500" />
            ) : user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Welcome, {user.name}
                </span>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login">
                  <Button variant="outline">Sign in</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 