'use client'

import { Button } from '@/components/ui/button'
import { LucideRefreshCcw } from 'lucide-react'

interface RefreshButtonProps {
  label: string
}

export function RefreshButton({ label }: RefreshButtonProps) {
  return (
    <Button 
      variant="outline" 
      onClick={() => window.location.reload()}
      title={label}
      className="flex items-center"
    >
      <LucideRefreshCcw className="h-4 w-4" />
    </Button>
  )
} 