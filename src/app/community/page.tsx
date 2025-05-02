'use client';

import { NavigationTabs } from '@/components/NavigationTabs';
import { RefreshButton } from '@/components/RefreshButton';
import { ChatContainer } from './components/ChatContainer';
import { useTranslations } from 'next-intl';

export default function Community() {
  const t = useTranslations('Community');
  
    return (
    <div className="container max-w-7xl mx-auto py-6 px-3">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <RefreshButton label={t('refresh')} />
      </div>

      {/* Navigation Tabs */}
      <NavigationTabs />
      
      {/* Chat Container */}
      <div className="mt-6">
        <ChatContainer />
      </div>
    </div>
  );
}
