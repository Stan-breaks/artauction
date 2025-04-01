'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function AuthModal({ isOpen, onClose, message }: AuthModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Authentication Required</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {message || 'Please sign in or create an account to continue.'}
          </p>
          <div className="flex flex-col gap-4">
            <Link href="/auth/login" className="w-full">
              <Button className="w-full">Sign In</Button>
            </Link>
            <Link href="/auth/signup" className="w-full">
              <Button variant="outline" className="w-full">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 