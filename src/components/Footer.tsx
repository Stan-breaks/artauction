import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              About Art Auction
            </h3>
            <p className="mt-4 text-base text-gray-500">
              A platform connecting artists with art enthusiasts through online
              auctions. Discover unique artworks and support talented artists.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a
                  href="/artworks"
                  className="text-base text-gray-500 hover:text-gray-900"
                >
                  Browse Artworks
                </a>
              </li>
              <li>
                <a
                  href="/auth/signup"
                  className="text-base text-gray-500 hover:text-gray-900"
                >
                  Become an Artist
                </a>
              </li>
              <li>
                <a
                  href="/how-it-works"
                  className="text-base text-gray-500 hover:text-gray-900"
                >
                  How It Works
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Support
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a
                  href="/faq"
                  className="text-base text-gray-500 hover:text-gray-900"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-base text-gray-500 hover:text-gray-900"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="text-base text-gray-500 hover:text-gray-900"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Contact
            </h3>
            <ul className="mt-4 space-y-4">
              <li className="text-base text-gray-500">
                Email: support@artauction.com
              </li>
              <li className="text-base text-gray-500">Phone: (555) 123-4567</li>
              <li className="text-base text-gray-500">
                Hours: Mon-Fri, 9am-5pm EST
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            © {new Date().getFullYear()} Art Auction. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 