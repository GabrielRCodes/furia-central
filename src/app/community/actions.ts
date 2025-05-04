'use server'

import { auth } from '@/libs/auth'
import { prisma } from '@/libs/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Schema de validação para informações de contato
const contactSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  cpf: z.union([
    z.string().regex(/^\d{11}$/, { message: "CPF deve ter 11 dígitos numéricos" }),
    z.string().length(0)
  ]),
  mediaName: z.enum(["whatsapp", "telegram", "discord", "email"] as const, {
    message: "Selecione uma rede social válida"
  }),
  mediaContact: z.string().min(3, { message: "Contato deve ter pelo menos 3 caracteres" })
})

// Verificar se o usuário tem informações de contato
export async function getContactData() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return {
        status: 401,
        message: "Usuário não autenticado",
        hasContactInfo: false,
        data: null
      }
    }
    
    // Verificar se existe registro para este usuário
    const contactInfo = await prisma.contactInfos.findUnique({
      where: {
        userId: session.user.id
      }
    })
    
    if (contactInfo) {
      return {
        status: 200,
        message: "Informações de contato encontradas",
        hasContactInfo: true,
        data: contactInfo
      }
    } else {
      return {
        status: 200,
        message: "Informações de contato não encontradas",
        hasContactInfo: false,
        data: null
      }
    }
  } catch (error) {
    console.error("Erro ao buscar informações de contato:", error)
    return {
      status: 500,
      message: "Erro ao buscar informações de contato",
      hasContactInfo: false,
      data: null
    }
  }
}

// Criar informações de contato
export async function createContactInfo(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { success: false, message: "Usuário não autenticado" }
  }
  
  // Extrair dados do formulário
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const cpf = formData.get("cpf") as string
  const mediaName = formData.get("mediaName") as string
  const mediaContact = formData.get("mediaContact") as string
  
  // Validação com Zod
  const validationResult = contactSchema.safeParse({ 
    name, 
    email, 
    cpf, 
    mediaName, 
    mediaContact 
  })
  
  if (!validationResult.success) {
    // Retorna todos os erros de validação em um objeto
    const errorMessages = validationResult.error.errors.map(error => ({
      path: error.path.join('.'),
      message: error.message
    }))
    
    return { 
      success: false, 
      message: "Erro na validação dos dados", 
      errors: errorMessages 
    }
  }
  
  // Dados validados
  const validatedData = validationResult.data
  
  try {
    // Verificar se já existe um registro para este usuário
    const existingContact = await prisma.contactInfos.findUnique({
      where: {
        userId: session.user.id
      }
    })
    
    // Não permitir criação se já existir
    if (existingContact) {
      return {
        success: false,
        message: "Você já possui informações de contato cadastradas"
      }
    }
    
    // Criar novo registro
    await prisma.contactInfos.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        cpf: validatedData.cpf,
        mediaName: validatedData.mediaName,
        mediaContact: validatedData.mediaContact,
        userId: session.user.id
      }
    })
    
    revalidatePath("/community", "page")
    return { success: true, message: "Informações de contato cadastradas com sucesso" }
  } catch (error) {
    console.error("Erro ao criar informações de contato:", error)
    return { success: false, message: "Erro ao criar informações de contato" }
  }
} 