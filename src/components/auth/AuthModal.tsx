import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
};

export default function AuthModal({ isOpen, onClose, message = "You need to sign in to place a bid" }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        onClose();
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full relative overflow-hidden shadow-xl">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2 text-[#b65425]">Sign In Required</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label htmlFor="modal-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="modal-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#078250] focus:border-[#078250]"
                required
              />
            </div>
            
            <div>
              <label htmlFor="modal-password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="modal-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#078250] focus:border-[#078250]"
                required
              />
            </div>
            
            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}
            
            <Button
              type="submit"
              className="w-full bg-[#078250] hover:bg-[#078250]/90 text-white"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                href="/auth/signup"
                className="text-[#078250] hover:underline"
                onClick={onClose}
              >
                Sign up
              </Link>
            </p>
          </div>
          
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              className="text-[#078250] border-[#078250]"
              onClick={() => {
                // Go to the full sign in page
                window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`;
              }}
            >
              More Sign In Options
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 