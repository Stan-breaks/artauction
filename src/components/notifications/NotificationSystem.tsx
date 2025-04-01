'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

type NotificationSystemProps = {
  userId: string | null | undefined;
};

export default function NotificationSystem({ userId }: NotificationSystemProps) {
  if (!userId) return null;
  
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="icon"
        className="relative rounded-full h-9 w-9"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
          0
        </span>
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <div className="p-4 text-center text-sm text-gray-500">
            <p>Notifications are disabled in this demo.</p>
            <p className="mt-1">In a production app, you would see real-time auction and bid updates here.</p>
          </div>
        </div>
      )}
    </div>
  );
} 