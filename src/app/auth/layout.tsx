import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Authentication - ArtAuction',
    template: '%s - ArtAuction',
  },
  description: 'Join ArtAuction - Kenya\'s Premier Digital Art Marketplace. Create an account to start bidding on unique artworks or showcase your art to collectors worldwide.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#b65425] via-white to-[#078250]">
      {children}
    </div>
  );
}