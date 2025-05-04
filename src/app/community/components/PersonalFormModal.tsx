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
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { FiUser, FiSave, FiLoader } from 'react-icons/fi';
import { createPersonalInfo } from '../actions';

// Schema de validação
const personalSchema = z.object({
  age: z.preprocess(
    (val) => val === '' ? null : Number(val),
    z.number().min(18, { message: "Idade deve ser maior ou igual a 18 anos" }).max(150, { message: "Idade deve ser menor ou igual a 150 anos" })
  ),
  hasBuyed: z.boolean().default(false),
  isCrowd: z.boolean().default(false),
  address: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  zipCode: z.string().nullable().optional(),
  interests: z.string().nullable().optional(),
  twitter: z.string().nullable().optional(),
  twitch: z.string().nullable().optional(),
  instagram: z.string().nullable().optional()
});

type PersonalFormData = z.infer<typeof personalSchema>;

interface PersonalFormModalProps {
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

export function PersonalFormModal({ isOpen, onCloseAction, onCompleteAction }: PersonalFormModalProps) {
  const t = useTranslations('Community.personalForm');
  
  // Estado para o loading do botão de salvar
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado para erros de validação
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Estado inicial do formulário
  const [formData, setFormData] = useState({
    age: undefined as number | undefined,
    hasBuyed: false,
    isCrowd: false,
    address: '',
    state: '',
    zipCode: '',
    interests: '',
    twitter: '',
    twitch: '',
    instagram: ''
  });
  
  // Manipulador de mudança de campo de texto
  const handleTextChange = (field: keyof PersonalFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpa o erro do campo quando o usuário altera o valor
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Manipulador de mudança de campo de checkbox
  const handleCheckboxChange = (field: 'hasBuyed' | 'isCrowd', checked: boolean) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
    
    // Limpa o erro do campo quando o usuário altera o valor
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Validação e envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Valida os dados do formulário
      personalSchema.parse(formData);
      
      // Prepara os dados para envio
      const formDataToSend = new FormData();
      formDataToSend.append('age', formData.age?.toString() || '');
      formDataToSend.append('hasBuyed', formData.hasBuyed.toString());
      formDataToSend.append('isCrowd', formData.isCrowd.toString());
      formDataToSend.append('address', formData.address || '');
      formDataToSend.append('state', formData.state || '');
      formDataToSend.append('zipCode', formData.zipCode || '');
      formDataToSend.append('interests', formData.interests || '');
      formDataToSend.append('twitter', formData.twitter || '');
      formDataToSend.append('twitch', formData.twitch || '');
      formDataToSend.append('instagram', formData.instagram || '');
      
      // Inicia o estado de salvando
      setIsSaving(true);
      
      // Envia os dados para o servidor
      const result = await createPersonalInfo(formDataToSend);
      
      // Processa o resultado
      if (result.success) {
        toast.success(t('success'));
        // Limpar erros de validação
        setErrors({});
        // Fechar modal e atualizar status
        onCompleteAction();
      } else {
        if (result.cooldown) {
          // Mensagem de cooldown
          toast.error(result.message || t('cooldown'));
        } else if (result.errors) {
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
        
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label htmlFor="age">{t('age')}*</Label>
              <Input
                id="age"
                type="number"
                value={formData.age || ''}
                onChange={(e) => handleTextChange('age', e.target.value)}
                className={errors.age ? 'border-destructive' : ''}
                min={18}
                max={150}
                required
              />
              {errors.age && <p className="text-destructive text-xs mt-1">{errors.age}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasBuyed"
                checked={formData.hasBuyed}
                onChange={(e) => handleCheckboxChange('hasBuyed', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="hasBuyed">{t('hasBuyed')}</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox" 
                id="isCrowd"
                checked={formData.isCrowd}
                onChange={(e) => handleCheckboxChange('isCrowd', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="isCrowd">{t('isCrowd')}</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">{t('address')}</Label>
              <Input
                id="address"
                type="text"
                value={formData.address || ''}
                onChange={(e) => handleTextChange('address', e.target.value)}
                className={errors.address ? 'border-destructive' : ''}
              />
              {errors.address && <p className="text-destructive text-xs mt-1">{errors.address}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">{t('state')}</Label>
                <Input
                  id="state"
                  type="text"
                  value={formData.state || ''}
                  onChange={(e) => handleTextChange('state', e.target.value)}
                  className={errors.state ? 'border-destructive' : ''}
                />
                {errors.state && <p className="text-destructive text-xs mt-1">{errors.state}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zipCode">{t('zipCode')}</Label>
                <Input
                  id="zipCode"
                  type="text"
                  value={formData.zipCode || ''}
                  onChange={(e) => handleTextChange('zipCode', e.target.value)}
                  className={errors.zipCode ? 'border-destructive' : ''}
                />
                {errors.zipCode && <p className="text-destructive text-xs mt-1">{errors.zipCode}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="interests">{t('interests')}</Label>
              <Input
                id="interests"
                type="text"
                value={formData.interests || ''}
                onChange={(e) => handleTextChange('interests', e.target.value)}
                className={errors.interests ? 'border-destructive' : ''}
                placeholder={t('interestsPlaceholder')}
              />
              {errors.interests && <p className="text-destructive text-xs mt-1">{errors.interests}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="twitter">{t('twitter')}</Label>
              <Input
                id="twitter"
                type="text"
                value={formData.twitter || ''}
                onChange={(e) => handleTextChange('twitter', e.target.value)}
                className={errors.twitter ? 'border-destructive' : ''}
                placeholder="Seu nome de usuário do Twitter/X"
              />
              {errors.twitter && <p className="text-destructive text-xs mt-1">{errors.twitter}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="twitch">{t('twitch')}</Label>
              <Input
                id="twitch"
                type="text"
                value={formData.twitch || ''}
                onChange={(e) => handleTextChange('twitch', e.target.value)}
                className={errors.twitch ? 'border-destructive' : ''}
                placeholder="Seu nome de usuário da Twitch"
              />
              {errors.twitch && <p className="text-destructive text-xs mt-1">{errors.twitch}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="instagram">{t('instagram')}</Label>
              <Input
                id="instagram"
                type="text"
                value={formData.instagram || ''}
                onChange={(e) => handleTextChange('instagram', e.target.value)}
                className={errors.instagram ? 'border-destructive' : ''}
                placeholder="Seu nome de usuário do Instagram"
              />
              {errors.instagram && <p className="text-destructive text-xs mt-1">{errors.instagram}</p>}
            </div>
          </div>
          
          <div className="pt-4 border-t mt-2">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSaving}
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