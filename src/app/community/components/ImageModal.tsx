'use client';

import Image from 'next/image';
import {
  Dialog,
  DialogClose,
  DialogTitle
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface ImageModalProps {
  imageUrl: string | null;
  onCloseAction: () => void;
}

// Componente DialogContent customizado com Framer Motion
const MotionDialogContent = motion(({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div">) => (
  <div
    className={`fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] border bg-background sm:rounded-lg ${className}`}
    {...props}
  >
    {children}
  </div>
));

export function ImageModal({ imageUrl, onCloseAction }: ImageModalProps) {
  const t = useTranslations('Community.chat.imageModal');
  
  return (
    <Dialog open={!!imageUrl} onOpenChange={(open) => !open && onCloseAction()}>
      <AnimatePresence mode="wait">
        {!!imageUrl && (
          <>
            <motion.div 
              className="fixed inset-0 z-50 bg-black/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <MotionDialogContent
              className="sm:max-w-[90vw] max-h-[80vh] p-0 overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <DialogTitle className="sr-only">{t('title')}</DialogTitle>
              <DialogClose className="absolute right-2 top-2 z-10 bg-background rounded-full" />
              <motion.div 
                className="w-full h-auto max-h-[70vh] overflow-hidden p-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <Image
                  src={imageUrl}
                  alt="Expanded image"
                  width={1200}
                  height={800}
                  className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                />
              </motion.div>
            </MotionDialogContent>
          </>
        )}
      </AnimatePresence>
    </Dialog>
  );
} 