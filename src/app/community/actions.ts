'use server'

import { auth } from '@/libs/auth'
import { prisma } from '@/libs/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { CacheIDManager } from "@/utils/CacheIDManager"

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

// Schema de validação para informações pessoais
const personalSchema = z.object({
  age: z.preprocess(
    (val) => val === '' ? null : Number(val),
    z.number().min(13, { message: "Idade deve ser maior que 13 anos" }).nullable()
  ),
  hasBuyed: z.boolean().default(false),
  isCrowd: z.boolean().default(false),
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

// Verificar se o usuário tem informações pessoais
export async function getPersonalData() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return {
        status: 401,
        message: "Usuário não autenticado",
        hasPersonalInfo: false,
        data: null
      }
    }
    
    // Verificar se existe registro para este usuário
    const personalInfo = await prisma.personalInfos.findUnique({
      where: {
        userId: session.user.id
      }
    })
    
    if (personalInfo) {
      return {
        status: 200,
        message: "Informações pessoais encontradas",
        hasPersonalInfo: true,
        data: personalInfo
      }
    } else {
      return {
        status: 200,
        message: "Informações pessoais não encontradas",
        hasPersonalInfo: false,
        data: null
      }
    }
  } catch (error) {
    console.error("Erro ao buscar informações pessoais:", error)
    return {
      status: 500,
      message: "Erro ao buscar informações pessoais",
      hasPersonalInfo: false,
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
  
  // Verificar se o usuário pode realizar esta ação (usando CacheIDManager)
  const cacheResult = await CacheIDManager({
    type: "create_contact_info",
    waitTime: 600 // 10 minutos em segundos (10 * 60)
  });

  if (cacheResult.status !== 200) {
    return { 
      success: false, 
      message: cacheResult.message,
      cooldown: true
    };
  }
  
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

// Criar informações pessoais
export async function createPersonalInfo(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { success: false, message: "Usuário não autenticado" }
  }
  
  // Extrair dados do formulário
  const age = formData.get("age") as string
  const hasBuyed = formData.get("hasBuyed") === "true"
  const isCrowd = formData.get("isCrowd") === "true"
  const address = formData.get("address") as string
  const state = formData.get("state") as string
  const zipCode = formData.get("zipCode") as string
  const interests = formData.get("interests") as string
  const twitter = formData.get("twitter") as string
  const twitch = formData.get("twitch") as string
  const instagram = formData.get("instagram") as string
  
  // Validação com Zod
  const validationResult = personalSchema.safeParse({ 
    age, 
    hasBuyed, 
    isCrowd, 
    address, 
    state, 
    zipCode, 
    interests, 
    twitter, 
    twitch, 
    instagram 
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
  
  // Verificar se o usuário pode realizar esta ação (usando CacheIDManager)
  const cacheResult = await CacheIDManager({
    type: "create_personal_info",
    waitTime: 600 // 10 minutos em segundos (10 * 60)
  });

  if (cacheResult.status !== 200) {
    return { 
      success: false, 
      message: cacheResult.message,
      cooldown: true
    };
  }
  
  try {
    // Verificar se já existe um registro para este usuário
    const existingPersonal = await prisma.personalInfos.findUnique({
      where: {
        userId: session.user.id
      }
    })
    
    // Não permitir criação se já existir
    if (existingPersonal) {
      return {
        success: false,
        message: "Você já possui informações pessoais cadastradas"
      }
    }
    
    // Criar novo registro
    await prisma.personalInfos.create({
      data: {
        age: validatedData.age,
        hasBuyed: validatedData.hasBuyed,
        isCrowd: validatedData.isCrowd,
        address: validatedData.address || null,
        state: validatedData.state || null,
        zipCode: validatedData.zipCode || null,
        interests: validatedData.interests || null,
        twitter: validatedData.twitter || null,
        twitch: validatedData.twitch || null,
        instagram: validatedData.instagram || null,
        userId: session.user.id
      }
    })
    
    revalidatePath("/community", "page")
    return { success: true, message: "Informações pessoais cadastradas com sucesso" }
  } catch (error) {
    console.error("Erro ao criar informações pessoais:", error)
    return { success: false, message: "Erro ao criar informações pessoais" }
  }
} 