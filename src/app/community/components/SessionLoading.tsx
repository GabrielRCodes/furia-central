'use client';

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export function SessionLoading() {
  
  return (
    <Card className="w-full border shadow-md gap-0">
      
      <CardContent className="p-0">
        <div className="h-[calc(100vh-470px)] sm:h-[calc(100vh-470px)] md:h-[calc(100vh-460px)] bg-secondary/10 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full bg-muted" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px] bg-muted" />
            <Skeleton className="h-4 w-[200px] bg-muted" />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t px-4">
        <div className="w-full flex gap-2">
          <Skeleton className="h-10 flex-1 bg-muted" />
          <Skeleton className="h-10 w-10 rounded-full bg-muted" />
          <Skeleton className="h-10 w-10 rounded-full bg-muted" />
        </div>
      </CardFooter>
    </Card>
  );
} 