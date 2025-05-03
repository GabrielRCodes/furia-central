'use client';

import { Button } from '@/components/ui/button';
import { FiLogIn } from 'react-icons/fi';
import { useState } from 'react';
import { LoginModal } from './LoginModal';
import { VerifyRequestModal } from './VerifyRequestModal';

interface LoginButtonProps {
  label: string;
}

export function LoginButton({ label }: LoginButtonProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isVerifyRequestOpen, setIsVerifyRequestOpen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);

  const handleVerifyRequest = (email: string) => {
    setVerificationEmail(email);
    setIsLoginModalOpen(false);
    setIsVerifyRequestOpen(true);
  };

  return (
    <>
      <Button 
        size="lg" 
        onClick={() => setIsLoginModalOpen(true)}
        className="flex items-center gap-2 bg-background text-foreground border border-border hover:bg-muted font-medium py-5 px-6 shadow-sm hover:shadow transition-all duration-200"
      >
        <FiLogIn className="h-5 w-5" />
        {label}
      </Button>

      {/* Modal de Login */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onCloseAction={() => setIsLoginModalOpen(false)}
        onVerifyRequestAction={handleVerifyRequest}
      />

      {/* Modal de Verificação de Email */}
      <VerifyRequestModal
        isOpen={isVerifyRequestOpen}
        onCloseAction={() => setIsVerifyRequestOpen(false)}
        email={verificationEmail}
      />
    </>
  );
} 