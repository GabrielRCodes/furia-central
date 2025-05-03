'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FiSend, FiImage } from 'react-icons/fi';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface ChatInputProps {
  onSendMessageAction: (message: string) => void;
}

export function ChatInput({ onSendMessageAction }: ChatInputProps) {
  const t = useTranslations('Community.chat.input');
  const [inputMessage, setInputMessage] = useState('');

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  // Send message
  const sendMessage = () => {
    if (!inputMessage.trim()) return;
    onSendMessageAction(inputMessage.trim());
    setInputMessage('');
  };

  // Handle enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputMessage.trim()) {
      sendMessage();
    }
  };

  return (
    <div className="flex w-full gap-2">
      <Input
        value={inputMessage}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder={t('placeholder')}
        className="flex-1"
      />
      <Button variant="ghost" size="icon" title={t('attachImage')}>
        <FiImage />
      </Button>
      <Button 
        disabled={!inputMessage.trim()} 
        onClick={sendMessage}
      >
        <FiSend />
        <span className="sr-only md:not-sr-only">{t('send')}</span>
      </Button>
    </div>
  );
} 