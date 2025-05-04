'use client';

import { useState } from 'react';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { FiUser, FiSave, FiCheck, FiLoader, FiChevronDown } from 'react-icons/fi';
import { createContactInfo } from '../actions';

// Media types
type MediaType = 'whatsapp' | 'telegram' | 'discord' | 'email';

// Schema de validação
const contactSchema = z.object({
  name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  cpf: z.union([
    z.string().regex(/^\d{11}$/, { message: 'CPF deve ter 11 dígitos numéricos' }),
    z.string().length(0)
  ]),
  mediaName: z.enum(['whatsapp', 'telegram', 'discord', 'email'] as const, {
    message: 'Selecione uma rede social válida'
  }),
  mediaContact: z.string().min(3, { message: 'Contato deve ter pelo menos 3 caracteres' })
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onCompleteAction: () => void;
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export function ContactFormModal({ isOpen, onCloseAction, onCompleteAction, user }: ContactFormModalProps) {
  const t = useTranslations('Community.contactForm');
  
  // Estado para valor da mídia social
  const [currentMediaName, setCurrentMediaName] = useState<MediaType>('whatsapp');
  
  // Estado para controlar o popover
  const [popoverOpen, setPopoverOpen] = useState(false);
  
  // Estado para o loading do botão de salvar
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado para erros de validação
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Estado inicial do formulário
  const [formData, setFormData] = useState<ContactFormData>({
    name: user?.name || '',
    email: user?.email || '',
    cpf: '',
    mediaName: currentMediaName,
    mediaContact: ''
  });
  
  // Estado para controlar a opção de não informar CPF
  const [skipCpf, setSkipCpf] = useState(false);
  
  // Manipulador de mudança de campo
  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Atualiza o estado currentMediaName se o campo for mediaName
    if (field === 'mediaName') {
      setCurrentMediaName(value as MediaType);
    }
    
    // Limpa o erro do campo quando o usuário altera o valor
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Função para formatar CPF durante a digitação
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove tudo que não for número
    let value = e.target.value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    value = value.substring(0, 11);
    
    handleChange('cpf', value);
  };
  
  // Função para alternar a opção de não informar CPF
  const handleSkipCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSkipCpf(checked);
    
    // Se marcado, limpa o CPF e erros associados
    if (checked) {
      handleChange('cpf', '');
    } else {
      handleChange('cpf', '');
    }
  };
  
  // Validação e envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Valida os dados do formulário
      contactSchema.parse(formData);
      
      // Prepara os dados para envio
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('cpf', formData.cpf);
      formDataToSend.append('mediaName', formData.mediaName);
      formDataToSend.append('mediaContact', formData.mediaContact);
      
      // Inicia o estado de salvando
      setIsSaving(true);
      
      // Envia os dados para o servidor
      const result = await createContactInfo(formDataToSend);
      
      // Processa o resultado
      if (result.success) {
        toast.success(t('success'));
        // Limpar erros de validação
        setErrors({});
        // Fechar modal e atualizar status
        onCompleteAction();
      } else {
        if (result.errors) {
          // Processa erros de validação do servidor
          const serverErrors: Record<string, string> = {};
          result.errors.forEach((err: { path: string; message: string }) => {
            serverErrors[err.path] = err.message;
          });
          setErrors(serverErrors);
          toast.error(t('validation_error'));
        } else {
          toast.error(result.message || t('error'));
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Formatar erros do Zod
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            formattedErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(formattedErrors);
        
        // Mostrar mensagem genérica de erro
        toast.error(t('validation_error'));
      } else {
        // Lidar com outros tipos de erro
        toast.error(t('error'));
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  // Função para obter o nome formatado da rede social
  const getMediaNameDisplayText = () => {
    switch (formData.mediaName) {
      case 'whatsapp': return 'WhatsApp';
      case 'telegram': return 'Telegram';
      case 'discord': return 'Discord';
      case 'email': return 'E-mail';
      default: return t('socialMediaPlaceholder');
    }
  };
  
  // Função para mudar a rede social
  const handleMediaChange = (mediaType: MediaType) => {
    handleChange('mediaName', mediaType);
    setPopoverOpen(false);
  };
  
  // Função para formatar o CPF para exibição
  const formatCpf = (cpf: string) => {
    if (!cpf) return '';
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length <= 6) {
      return cpf.replace(/(\d{3})(\d{0,3})/, '$1.$2');
    } else if (cpf.length <= 9) {
      return cpf.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
    } else {
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCloseAction()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FiUser className="w-5 h-5 text-primary" />
            <DialogTitle>{t('title')}</DialogTitle>
          </div>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('name')}</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cpf">{t('cpf')}</Label>
            <Input
              id="cpf"
              type="text"
              value={skipCpf ? '' : formData.cpf}
              onChange={handleCpfChange}
              className={errors.cpf ? 'border-destructive' : ''}
              maxLength={11}
              placeholder="00000000000"
              disabled={skipCpf}
            />
            {!skipCpf && formData.cpf && (
              <p className="text-xs text-muted-foreground">{formatCpf(formData.cpf)}</p>
            )}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="skipCpf"
                checked={skipCpf}
                onChange={handleSkipCpfChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="skipCpf" className="text-sm text-muted-foreground">
                {t('skipCpf')}
              </label>
            </div>
            {errors.cpf && <p className="text-destructive text-xs mt-1">{errors.cpf}</p>}
          </div>
          
          <div className="space-y-4">
            <Label>{t('socialMedia')}</Label>
            
            <div className="flex gap-3">
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={popoverOpen}
                    className="w-[200px] justify-between"
                  >
                    {getMediaNameDisplayText()}
                    <FiChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <div className="flex flex-col">
                    {(['whatsapp', 'telegram', 'discord', 'email'] as const).map((mediaType) => (
                      <Button
                        key={mediaType}
                        variant="ghost"
                        className="justify-start px-3 py-2 text-left"
                        onClick={() => handleMediaChange(mediaType)}
                      >
                        {mediaType === currentMediaName && (
                          <FiCheck className="mr-2 h-4 w-4" />
                        )}
                        {mediaType === 'whatsapp' && 'WhatsApp'}
                        {mediaType === 'telegram' && 'Telegram'}
                        {mediaType === 'discord' && 'Discord'}
                        {mediaType === 'email' && 'E-mail'}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              
              <Input
                id="mediaContact"
                type="text"
                value={formData.mediaContact}
                onChange={(e) => handleChange('mediaContact', e.target.value)}
                placeholder={t('socialMediaContact')}
                className={`flex-1 ${errors.mediaContact ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.mediaContact && <p className="text-destructive text-xs mt-1">{errors.mediaContact}</p>}
            {errors.mediaName && <p className="text-destructive text-xs mt-1">{errors.mediaName}</p>}
          </div>
          
          <div className="flex justify-end pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCloseAction} 
              className="mr-2"
              disabled={isSaving}
            >
              {t('cancel')}
            </Button>
            
            <Button 
              type="submit" 
              disabled={isSaving}
              className="flex items-center"
            >
              {isSaving ? (
                <>
                  <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                  {t('saving')}
                </>
              ) : (
                <>
                  <FiSave className="mr-2 h-4 w-4" />
                  {t('save')}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 