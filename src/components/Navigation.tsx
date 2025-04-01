'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="text-xl font-bold"
          >
            ArtAuction
          </Link>
          <Link
            href="/artworks"
            className={`text-sm ${
              pathname === '/artworks'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            Artworks
          </Link>
          {user?.role === 'ARTIST' && (
            <Link
              href="/artworks/upload"
              className={`text-sm ${
                pathname === '/artworks/upload'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              Upload Artwork
            </Link>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">
                {user.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className={`text-sm ${
                  pathname === '/auth/login'
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className={`text-sm ${
                  pathname === '/auth/signup'
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 