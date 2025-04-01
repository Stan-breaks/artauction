import { cn } from '@/lib/utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent',
        className
      )}
      {...props}
    />
  );
} 