import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About ArtAuction</h3>
            <p className="text-gray-600">
              A platform connecting artists and art enthusiasts through auctions.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/artworks" className="text-gray-600 hover:text-primary">
                  Browse Artworks
                </a>
              </li>
              <li>
                <a href="/artworks/upload" className="text-gray-600 hover:text-primary">
                  Upload Artwork
                </a>
              </li>
              <li>
                <a href="/auth/login" className="text-gray-600 hover:text-primary">
                  Login
                </a>
              </li>
              <li>
                <a href="/auth/signup" className="text-gray-600 hover:text-primary">
                  Sign Up
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Email: support@artauction.com</li>
              <li>Phone: +254 700 000 000</li>
              <li>Address: Nairobi, Kenya</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} ArtAuction. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 