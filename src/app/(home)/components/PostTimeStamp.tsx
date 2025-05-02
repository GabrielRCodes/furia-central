'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'

interface PostTimeStampProps {
  relativeTime: string
  author: string
}

export function PostTimeStamp({ relativeTime, author }: PostTimeStampProps) {
  const t = useTranslations('Timeline')
  const locale = useLocale()
  const [formattedDate, setFormattedDate] = useState<string>(t('postFrom', { author }))

  useEffect(() => {
    // Formatação da data apenas no cliente
    const now = new Date()
    
    // Formatar data e hora conforme o locale do idioma atual
    const dateOptions: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }
    
    const timeOptions: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: locale === 'en' // usar formato 12h para inglês e 24h para português
    }
    
    const dateStr = now.toLocaleDateString(locale, dateOptions)
    const timeStr = now.toLocaleTimeString(locale, timeOptions)
    
    setFormattedDate(t('postedOn', { date: dateStr, time: timeStr }))
  }, [t, author, locale])

  return (
    <span 
      className="text-sm text-muted-foreground" 
      title={formattedDate}
    >
      {relativeTime}
    </span>
  )
} 