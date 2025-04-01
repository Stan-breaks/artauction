'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      console.log("Attempting to sign in with:", email);
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        console.log("Sign-in error:", result.error);
        setError(result.error);
      } else if (result?.ok) {
        console.log("Sign-in successful, redirecting to:", callbackUrl);
        router.push(callbackUrl);
      }
    } catch (error) {
      console.error("Sign-in exception:", error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl });
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md border-2 border-[#078250] bg-white/90 backdrop-blur">
        <CardHeader className="space-y-1">
          <div className="mx-auto mb-4 relative w-32 h-32">
            <Image
              src="/images/logo.png"
              alt="ArtAuction Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <CardTitle className="text-2xl text-center text-[#b65425]">Welcome to ArtAuction</CardTitle>
          <CardDescription className="text-center">
            Sign in to start bidding on unique Kenyan artworks
          </CardDescription>
          {searchParams.get('registered') === 'true' && (
            <div className="bg-green-50 p-3 rounded-md text-green-700 text-sm mt-2">
              Your account has been created! Please sign in.
            </div>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <Button
              type="button"
              variant="outline"
              className="w-full border-[#078250] hover:bg-[#078250]/10"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#b65425]/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-[#b65425]">Or sign in with email</span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-[#b65425]">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.co.ke"
                required
                disabled={loading}
                className="border-[#078250] focus-visible:ring-[#078250]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-[#b65425]">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={loading}
                className="border-[#078250] focus-visible:ring-[#078250]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Test account: john@example.co.ke / password123
              </p>
            </div>
            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md flex items-center">
                <span className="mr-2 text-lg">⚠️</span>
                {error === "CredentialsSignin" ? "Invalid email or password" : error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              className="w-full bg-[#078250] hover:bg-[#078250]/90" 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <p className="text-center text-sm text-[#b65425]">
              New to ArtAuction?{' '}
              <Link href="/auth/signup" className="underline underline-offset-4 hover:text-[#078250]">
                Create an account
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 