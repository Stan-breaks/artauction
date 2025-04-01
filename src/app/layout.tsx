import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ArtAuction - Buy and Sell Art',
  description: 'A platform for buying and selling artwork through auctions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-gray-50 dark:bg-gray-900`}>
        <Providers>
          <Navigation />
          <main className="flex-grow pt-16 container mx-auto px-4">
            {children}
          </main>
          <Footer />
          <ToastContainer position="top-right" />
        </Providers>
      </body>
    </html>
  );
}