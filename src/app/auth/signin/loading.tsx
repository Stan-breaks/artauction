import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default function SignInLoading() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="h-8 w-1/2 mx-auto rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="h-4 w-3/4 mx-auto rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="h-9 w-full rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-9 w-full rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-9 w-full rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="h-9 w-full rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="h-4 w-3/4 mx-auto rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        </CardFooter>
      </Card>
    </div>
  );
}