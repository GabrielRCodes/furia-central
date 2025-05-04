"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { User } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslations } from "next-intl"
import { FiUser, FiSave, FiLoader } from "react-icons/fi"
import { updatePersonalInfo } from "../actions"
import { toast } from "sonner"

// Schema de validação
const personalSchema = z.object({
  age: z.preprocess(
    (val) => val === '' ? null : Number(val),
    z.number().min(13, { message: "Idade deve ser maior que 13 anos" }).nullable()
  ),
  address: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  zipCode: z.string().nullable().optional(),
  interests: z.string().nullable().optional(),
  twitter: z.union([
    z.string().url().startsWith('https://twitter.com/', { message: "URL do Twitter inválida" }).optional(),
    z.string().url().startsWith('https://x.com/', { message: "URL do Twitter inválida" }).optional(),
    z.string().length(0).optional(),
    z.null()
  ]),
  twitch: z.union([
    z.string().url().startsWith('https://twitch.tv/', { message: "URL da Twitch inválida" }).optional(),
    z.string().length(0).optional(),
    z.null()
  ]),
  instagram: z.union([
    z.string().url().startsWith('https://instagram.com/', { message: "URL do Instagram inválida" }).optional(),
    z.string().length(0).optional(),
    z.null()
  ])
})

type PersonalFormData = z.infer<typeof personalSchema>

interface PersonalFormProps {
  user: User | null;
  personalInfo?: {
    id: string;
    age: number | null;
    hasBuyed: boolean;
    isCrowd: boolean;
    address: string | null;
    state: string | null;
    zipCode: string | null;
    interests: string | null;
    twitter: string | null;
    twitch: string | null;
    instagram: string | null;
    createdAt: Date;
    userId: string;
  } | null;
  exists: boolean;
}

export function PersonalForm({  personalInfo, exists }: PersonalFormProps) {
  const t = useTranslations('Settings.personal')
  
  // Estado para o loading do botão de salvar
  const [isSaving, setIsSaving] = useState(false)
  
  // Estado para mensagem de erro ou sucesso
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)
  
  // Estado de cooldown
  const [isCooldown, setIsCooldown] = useState(false)
  
  // Estado inicial do formulário
  const [formData, setFormData] = useState<PersonalFormData>({
    age: personalInfo?.age || null,
    address: personalInfo?.address || "",
    state: personalInfo?.state || "",
    zipCode: personalInfo?.zipCode || "",
    interests: personalInfo?.interests || "",
    twitter: personalInfo?.twitter || "",
    twitch: personalInfo?.twitch || "",
    instagram: personalInfo?.instagram || ""
  })
  
  // Estado para erros de validação
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Limpar mensagem após 5 segundos
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null)
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [message])
  
  // Atualiza os dados quando as props mudarem
  useEffect(() => {
    if (!exists) return
    
    if (personalInfo) {
      setFormData({
        age: personalInfo.age,
        address: personalInfo.address || "",
        state: personalInfo.state || "",
        zipCode: personalInfo.zipCode || "",
        interests: personalInfo.interests || "",
        twitter: personalInfo.twitter || "",
        twitch: personalInfo.twitch || "",
        instagram: personalInfo.instagram || ""
      })
    }
  }, [personalInfo, exists])
  
  // Manipulador de mudança de campo
  const handleChange = (field: keyof PersonalFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpa o erro do campo quando o usuário altera o valor
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }
  
  // Validação e envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Limpa mensagens
    setMessage(null)
    setIsCooldown(false)
    
    try {
      // Valida os dados do formulário
      personalSchema.parse(formData)
      
      // Prepara os dados para envio
      const formDataToSend = new FormData()
      formDataToSend.append('age', formData.age?.toString() || '')
      formDataToSend.append('address', formData.address || '')
      formDataToSend.append('state', formData.state || '')
      formDataToSend.append('zipCode', formData.zipCode || '')
      formDataToSend.append('interests', formData.interests || '')
      formDataToSend.append('twitter', formData.twitter || '')
      formDataToSend.append('twitch', formData.twitch || '')
      formDataToSend.append('instagram', formData.instagram || '')
      
      // Inicia o estado de salvando
      setIsSaving(true)
      
      // Envia os dados para o servidor
      const result = await updatePersonalInfo(formDataToSend)
      
      // Processa o resultado
      if (result.success) {
        setMessage({ type: "success", text: t('success') })
        toast.success(t('success'))
        // Limpar erros de validação
        setErrors({})
      } else {
        if (result.cooldown) {
          setIsCooldown(true)
          setMessage({ type: "error", text: t('cooldown') })
          toast.error(t('cooldown'))
        } else if (result.errors) {
          // Processa erros de validação do servidor
          const serverErrors: Record<string, string> = {}
          result.errors.forEach((err: { path: string; message: string }) => {
            serverErrors[err.path] = err.message
          })
          setErrors(serverErrors)
          setMessage({ type: "error", text: t('validation_error') })
          toast.error(t('validation_error'))
        } else {
          setMessage({ type: "error", text: result.message || t('error') })
          toast.error(result.message || t('error'))
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Formatar erros do Zod
        const formattedErrors: Record<string, string> = {}
        error.errors.forEach(err => {
          if (err.path[0]) {
            formattedErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(formattedErrors)
        
        // Mostrar mensagem genérica de erro
        setMessage({ type: "error", text: t('validation_error') })
        toast.error(t('validation_error'))
      } else {
        // Lidar com outros tipos de erro
        setMessage({ type: "error", text: t('error') })
        toast.error(t('error'))
      }
    } finally {
      setIsSaving(false)
    }
  }

  // Se não existir informações pessoais, não renderiza o componente
  if (!exists) {
    return null
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FiUser className="w-5 h-5 text-primary" />
          <CardTitle>{t('title')}</CardTitle>
        </div>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {message && (
          <div className={`p-3 rounded mb-4 ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          } transition-opacity`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="age">{t('age')}</Label>
            <Input
              id="age"
              type="number"
              value={formData.age === null ? '' : formData.age}
              onChange={(e) => handleChange('age', e.target.value)}
              className={errors.age ? 'border-destructive' : ''}
              min={13}
            />
            {errors.age && <p className="text-destructive text-xs mt-1">{errors.age}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">{t('address')}</Label>
            <Input
              id="address"
              type="text"
              value={formData.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
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
                onChange={(e) => handleChange('state', e.target.value)}
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
                onChange={(e) => handleChange('zipCode', e.target.value)}
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
              onChange={(e) => handleChange('interests', e.target.value)}
              className={errors.interests ? 'border-destructive' : ''}
              placeholder={t('interestsPlaceholder')}
            />
            {errors.interests && <p className="text-destructive text-xs mt-1">{errors.interests}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="twitter">{t('twitter')}</Label>
            <Input
              id="twitter"
              type="url"
              value={formData.twitter || ''}
              onChange={(e) => handleChange('twitter', e.target.value)}
              className={errors.twitter ? 'border-destructive' : ''}
              placeholder="https://twitter.com/seu_usuario ou https://x.com/seu_usuario"
            />
            {errors.twitter && <p className="text-destructive text-xs mt-1">{errors.twitter}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="twitch">{t('twitch')}</Label>
            <Input
              id="twitch"
              type="url"
              value={formData.twitch || ''}
              onChange={(e) => handleChange('twitch', e.target.value)}
              className={errors.twitch ? 'border-destructive' : ''}
              placeholder="https://twitch.tv/seu_usuario"
            />
            {errors.twitch && <p className="text-destructive text-xs mt-1">{errors.twitch}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="instagram">{t('instagram')}</Label>
            <Input
              id="instagram"
              type="url"
              value={formData.instagram || ''}
              onChange={(e) => handleChange('instagram', e.target.value)}
              className={errors.instagram ? 'border-destructive' : ''}
              placeholder="https://instagram.com/seu_usuario"
            />
            {errors.instagram && <p className="text-destructive text-xs mt-1">{errors.instagram}</p>}
          </div>
          
          <Button 
            type="submit" 
            className="mt-4 w-full"
            disabled={isSaving || isCooldown}
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
        </form>
      </CardContent>
    </Card>
  );
} 