'use client'

import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FiHome, FiTv, FiMessageCircle, FiShoppingBag } from 'react-icons/fi'

export function NavigationTabs() {
  const t = useTranslations('Timeline')
  const pathname = usePathname()

  const tabs = [
    { 
      key: 'posts', 
      label: t('tabs.posts'), 
      href: '/', 
      icon: <FiHome className="h-4 w-4" /> 
    },
    { 
      key: 'games', 
      label: t('tabs.games'), 
      href: '/games', 
      icon: <FiTv className="h-4 w-4" /> 
    },
    { 
      key: 'community', 
      label: t('tabs.community'), 
      href: '/community', 
      icon: <FiMessageCircle className="h-4 w-4" /> 
    },
    { 
      key: 'store', 
      label: t('tabs.store'), 
      href: '/store', 
      icon: <FiShoppingBag className="h-4 w-4" /> 
    },
  ]

  return (
    <Tabs defaultValue={tabs.find(tab => pathname === tab.href)?.key || 'posts'} className="w-full">
      <TabsList className="w-full">
        {tabs.map((tab) => (
          <Link key={tab.key} href={tab.href} className="flex-1">
            <TabsTrigger 
              value={tab.key}
              className="w-full"
              data-state={pathname === tab.href ? "active" : "inactive"}
            >
              <span className="md:hidden">{tab.icon}</span>
              <span className="hidden md:inline">{tab.label}</span>
            </TabsTrigger>
          </Link>
        ))}
      </TabsList>
    </Tabs>
  )
} 