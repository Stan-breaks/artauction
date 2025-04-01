import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold">About ArtAuction</h3>
            <p className="mt-2 text-sm text-gray-600">
              ArtAuction is a platform that connects artists with art enthusiasts,
              making it easy to buy and sell artwork through auctions.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="mt-2 space-y-1">
              <li>
                <a
                  href="/artworks"
                  className="text-sm text-gray-600 hover:text-primary"
                >
                  Browse Artworks
                </a>
              </li>
              <li>
                <a
                  href="/artworks/upload"
                  className="text-sm text-gray-600 hover:text-primary"
                >
                  Upload Artwork
                </a>
              </li>
              <li>
                <a
                  href="/auth/login"
                  className="text-sm text-gray-600 hover:text-primary"
                >
                  Login
                </a>
              </li>
              <li>
                <a
                  href="/auth/signup"
                  className="text-sm text-gray-600 hover:text-primary"
                >
                  Sign Up
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Contact</h3>
            <ul className="mt-2 space-y-1">
              <li className="text-sm text-gray-600">
                Email: support@artauction.com
              </li>
              <li className="text-sm text-gray-600">
                Phone: +1 (555) 123-4567
              </li>
              <li className="text-sm text-gray-600">
                123 Art Street, Gallery City, AC 12345
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} ArtAuction. All rights reserved.
        </div>
      </div>
    </footer>
  );
} 