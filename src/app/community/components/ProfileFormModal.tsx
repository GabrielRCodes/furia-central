'use client';

import { useState, useRef, useEffect } from 'react';
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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { FiUser, FiSave, FiLoader, FiCamera } from 'react-icons/fi';
import { updateUserProfile } from '../actions';
import Image from 'next/image';

interface ProfileFormModalProps {
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

export function ProfileFormModal({ isOpen, onCloseAction, onCompleteAction, user }: ProfileFormModalProps) {
  const t = useTranslations('Community.profileForm');
  
  // Estado para o loading do botão de salvar
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado para erros de validação
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Referência para input de arquivo
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    name: user?.name || '',
  });
  
  // Estado para preview da imagem
  const [imagePreview, setImagePreview] = useState<string | null>(user?.image || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Estado para confirmação de imagem
  const [showImagePreview, setShowImagePreview] = useState(false);
  
  // Manipulador de mudança de nome
  const handleNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, name: value }));
    
    // Limpar erro se presente
    if (errors.name) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.name;
        return newErrors;
      });
    }
  };
  
  // Manipulador para seleção de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (files && files.length > 0) {
      const file = files[0];
      const fileSize = file.size / 1024 / 1024; // Tamanho em MB
      
      // Verificar tamanho (max 5MB)
      if (fileSize > 5) {
        toast.error(t('fileTooLarge') || 'Arquivo muito grande (máximo 5MB)');
        return;
      }
      
      // Verificar tipo (apenas imagens)
      if (!file.type.startsWith('image/')) {
        toast.error(t('fileTypeInvalid') || 'Tipo de arquivo inválido (apenas imagens)');
        return;
      }
      
      // Limpar URL anterior se existir
      if (imagePreview && !imagePreview.startsWith('http')) {
        URL.revokeObjectURL(imagePreview);
      }
      
      // Criar URL da imagem para preview
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      setImageFile(file);
      setShowImagePreview(true);
      
      // Limpar erro se presente
      if (errors.image) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.image;
          return newErrors;
        });
      }
    }
  };
  
  // Manipulador para clique no botão de upload
  const handleImageClick = () => {
    // Apenas abre o seletor de arquivos
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Confirmar imagem selecionada
  const confirmImage = () => {
    setShowImagePreview(false);
  };
  
  // Limpar recursos quando o componente é desmontado
  useEffect(() => {
    return () => {
      // Limpar URLs de objeto ao desmontar o componente
      if (imagePreview && !imagePreview.startsWith('http')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);
  
  // Validação e envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    const validationErrors: Record<string, string> = {};
    
    if (!formData.name || formData.name.trim().length < 3) {
      validationErrors.name = t('nameRequired') || 'Nome deve ter pelo menos 3 caracteres';
    }
    
    if (!imagePreview && !imageFile) {
      validationErrors.image = t('imageRequired') || 'Avatar é obrigatório';
    }
    
    // Se tiver erros, mostrar e não prosseguir
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error(t('validation_error') || 'Verifique os campos destacados');
      return;
    }
    
    try {
      // Prepara os dados para envio
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      
      // Verificar se temos um arquivo de imagem
      if (imageFile) {
        console.log('Anexando imagem ao formulário:', {
          name: imageFile.name,
          type: imageFile.type,
          size: imageFile.size
        });
        formDataToSend.append('image', imageFile);
      }
      
      // Mostrar dados que serão enviados
      console.log('Enviando formulário com:', {
        name: formData.name,
        hasImage: !!imageFile
      });
      
      // Inicia o estado de salvando
      setIsSaving(true);
      
      // Envia os dados para o servidor
      const result = await updateUserProfile(formDataToSend);
      
      // Processa o resultado
      if (result.success) {
        toast.success(t('success') || 'Perfil atualizado com sucesso');
        // Limpar erros de validação
        setErrors({});
        // Fechar modal e atualizar status
        onCompleteAction();
        
        // Recarregar a página para atualizar o avatar no header
        setTimeout(() => {
          window.location.reload();
        }, 1000); // Pequeno delay para a toast ser exibida
      } else {
        console.error('Erro no servidor:', result);
        if (result.errors) {
          // Processa erros de validação do servidor
          const serverErrors: Record<string, string> = {};
          result.errors.forEach((err: { path: string; message: string }) => {
            serverErrors[err.path] = err.message;
          });
          setErrors(serverErrors);
          toast.error(t('validation_error') || 'Verifique os campos destacados');
        } else {
          toast.error(result.message || t('error') || 'Ocorreu um erro ao atualizar o perfil');
        }
      }
    } catch (error) {
      // Lidar com erro
      console.error('Erro ao atualizar perfil:', error);
      toast.error(t('error') || 'Ocorreu um erro ao atualizar o perfil');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onCloseAction()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <FiUser className="w-5 h-5 text-primary" />
              <DialogTitle>{t('title') || 'Complete seu perfil'}</DialogTitle>
            </div>
            <DialogDescription>{t('description') || 'Adicione uma foto de perfil e seu nome para finalizar seu cadastro.'}</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="space-y-6 py-4">
              {/* Upload de Avatar */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 bg-muted">
                    {imagePreview ? (
                      <AvatarImage src={imagePreview} alt="Preview" />
                    ) : (
                      <AvatarFallback>
                        <FiUser className="h-12 w-12 text-muted-foreground" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <Button 
                    type="button"
                    onClick={handleImageClick}
                    className="absolute bottom-0 right-0 rounded-full p-1 h-8 w-8 flex items-center justify-center"
                    size="icon"
                    variant="default"
                  >
                    <FiCamera className="h-4 w-4" />
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="image"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <span className="text-sm text-muted-foreground">
                  {t('clickToUpload') || 'Clique para enviar uma foto'}
                </span>
                {errors.image && <p className="text-destructive text-xs">{errors.image}</p>}
              </div>
              
              {/* Nome do usuário */}
              <div className="space-y-2">
                <Label htmlFor="name">{t('name') || 'Nome'}*</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={errors.name ? 'border-destructive' : ''}
                  placeholder={t('namePlaceholder') || "Digite seu nome completo"}
                  required
                />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
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
                    {t('saving') || 'Salvando...'}
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2 h-4 w-4" />
                    {t('save') || 'Salvar perfil'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Modal de confirmação de imagem */}
      {showImagePreview && imagePreview && (
        <Dialog open={showImagePreview} onOpenChange={setShowImagePreview}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('previewTitle') || 'Visualização da imagem'}</DialogTitle>
            </DialogHeader>
            
            <div className="w-full relative my-2 rounded-md overflow-hidden" style={{ height: '300px' }}>
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                style={{ objectFit: 'contain' }}
                className="rounded-md"
              />
            </div>
            
            <div className="flex justify-between gap-2 mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setImagePreview(null);
                  setImageFile(null);
                  setShowImagePreview(false);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                {t('cancelButton') || 'Cancelar'}
              </Button>
              <Button type="button" onClick={confirmImage}>
                {t('confirmButton') || 'Confirmar imagem'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
} 