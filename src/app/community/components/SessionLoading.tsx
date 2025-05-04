'use client';

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

export function SessionLoading() {
  const t = useTranslations('Community.chat');
  
  return (
    <Card className="w-full border shadow-md gap-0">
      <CardHeader className="border-b px-6">
        <CardTitle className="text-xl">{t('title')}</CardTitle>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="h-[calc(100vh-550px)] md:h-[calc(100vh-500px)] bg-secondary/10 flex flex-col items-center justify-center p-6 text-center space-y-4">
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