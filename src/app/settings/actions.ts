"use server"

import { auth } from "@/libs/auth"
import { prisma } from "@/libs/prisma"
import { revalidatePath } from "next/cache"
import { CacheIDManager } from "@/utils/CacheIDManager"
import { z } from "zod"

// Schema para validação das informações de contato
const contactSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }).max(100, { message: "Nome deve ter no máximo 100 caracteres" }).trim(),
  email: z.string().email({ message: "Email inválido" }).trim(),
  cpf: z.string().regex(/^\d{11}$/, { message: "CPF deve ter 11 dígitos numéricos" }),
  mediaName: z.enum(["whatsapp", "telegram", "discord", "email"], {
    message: "Selecione uma rede social válida"
  }).optional(),
  mediaContact: z.string().min(3, { message: "Contato deve ter pelo menos 3 caracteres" })
    .max(100, { message: "Contato deve ter no máximo 100 caracteres" })
    .refine((val) => val !== undefined && val.length > 0, { message: "Contato não pode estar vazio" })
    .optional()
});

// Schema para validação das informações pessoais
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
});

// Schemas de validação com Zod
const nameSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(50, "Nome deve ter no máximo 50 caracteres").trim()
})

const deleteAccountSchema = z.object({
  confirmation: z.literal("DELETE", { 
    errorMap: () => ({ message: 'Digite exatamente "DELETE" para confirmar' }) 
  })
})

// Função para obter os dados do usuário atual
export async function getUserData() {
  try {
    const session = await auth()
    
    if (!session || !session.user) {
      return null
    }
    
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      }
    })
    
    return user
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error)
    return null
  }
}

// Obtém as informações de contato do usuário logado
export async function getContactData() {
  try {
    const session = await auth()
    
    if (!session || !session.user || !session.user.id) {
      return {
        status: 401,
        message: "Usuário não autenticado",
        exists: false,
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
        exists: true,
        data: contactInfo
      }
    } else {
      return {
        status: 200,
        message: "Informações de contato não encontradas",
        exists: false,
        data: null
      }
    }
  } catch (error) {
    console.error("Erro ao buscar informações de contato:", error)
    return {
      status: 500,
      message: "Erro ao buscar informações de contato",
      exists: false,
      data: null
    }
  }
}

// Obtém as informações pessoais do usuário logado
export async function getPersonalData() {
  try {
    const session = await auth()
    
    if (!session || !session.user || !session.user.id) {
      return {
        status: 401,
        message: "Usuário não autenticado",
        exists: false,
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
        exists: true,
        data: personalInfo
      }
    } else {
      return {
        status: 200,
        message: "Informações pessoais não encontradas",
        exists: false,
        data: null
      }
    }
  } catch (error) {
    console.error("Erro ao buscar informações pessoais:", error)
    return {
      status: 500,
      message: "Erro ao buscar informações pessoais",
      exists: false,
      data: null
    }
  }
}

// Função para atualizar o nome do usuário
export async function updateUserName(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.email) {
    return { success: false, message: "Usuário não autenticado" }
  }
  
  const newName = formData.get("name") as string
  
  // Validação com Zod
  const validationResult = nameSchema.safeParse({ name: newName })
  
  if (!validationResult.success) {
    const errorMessage = validationResult.error.errors[0]?.message || "Nome inválido"
    return { success: false, message: errorMessage }
  }

  const { name } = validationResult.data

  // Verificar se o usuário pode realizar esta ação (usando cacheIdManager)
  const cacheResult = await CacheIDManager({
    type: "update_user_name",
    waitTime: 600 // 600 segundos (10 minutos) de delay
  })

  if (cacheResult.status !== 200) {
    return { 
      success: false, 
      message: cacheResult.message,
      cooldown: true
    }
  }
  
  try {
    await prisma.user.update({
      where: {
        email: session.user.email
      },
      data: {
        name
      }
    })
    
    revalidatePath("/settings", "page")
    return { success: true, message: "Nome atualizado com sucesso" }
  } catch (error) {
    console.error("Erro ao atualizar nome:", error)
    return { success: false, message: "Erro ao atualizar nome" }
  }
}

// Função para deletar a conta do usuário
export async function deleteUserAccount(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.email) {
    return { success: false, message: "Usuário não autenticado" }
  }
  
  const confirmation = formData.get("confirmation") as string
  
  // Validação com Zod
  const validationResult = deleteAccountSchema.safeParse({ confirmation })
  
  if (!validationResult.success) {
    const errorMessage = validationResult.error.errors[0]?.message || "Confirmação inválida"
    return { success: false, message: errorMessage }
  }

  // Verificar se o usuário pode realizar esta ação (usando cacheIdManager)
  const cacheResult = await CacheIDManager({
    type: "delete_user_account",
    waitTime: 600 // 600 segundos (10 minutos) de delay
  })

  if (cacheResult.status !== 200) {
    return { 
      success: false, 
      message: cacheResult.message,
      cooldown: true
    }
  }
  
  try {
    await prisma.user.delete({
      where: {
        email: session.user.email
      }
    })
    
  } catch (error) {
    console.error("Erro ao deletar conta:", error)
    return { success: false, message: "Erro ao deletar conta" }
  }
}

// Função para atualizar/criar informações de contato
export async function updateContactInfo(formData: FormData) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { success: false, message: "Usuário não autenticado" };
  }
  
  // Extrair dados do formulário
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const cpf = formData.get("cpf") as string;
  const mediaName = formData.get("mediaName") as string;
  const mediaContact = formData.get("mediaContact") as string;
  
  // Validação com Zod
  const validationResult = contactSchema.safeParse({ 
    name, 
    email, 
    cpf, 
    mediaName, 
    mediaContact 
  });
  
  if (!validationResult.success) {
    // Retorna todos os erros de validação em um objeto
    const errorMessages = validationResult.error.errors.map(error => ({
      path: error.path.join('.'),
      message: error.message
    }));
    
    return { 
      success: false, 
      message: "Erro na validação dos dados", 
      errors: errorMessages 
    };
  }
  
  // Dados validados
  const validatedData = validationResult.data;
  
  // Verificar se o usuário pode realizar esta ação (usando CacheIDManager)
  const cacheResult = await CacheIDManager({
    type: "update_contact_info",
    waitTime: 86400 // 1 dia em segundos (24 * 60 * 60)
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
    });
    
    if (existingContact) {
      // Atualizar registro existente
      await prisma.contactInfos.update({
        where: {
          userId: session.user.id
        },
        data: {
          name: validatedData.name,
          email: validatedData.email,
          cpf: validatedData.cpf,
          mediaName: validatedData.mediaName,
          mediaContact: validatedData.mediaContact
        }
      });
    } else {
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
      });
    }
    
    revalidatePath("/settings", "page");
    return { success: true, message: "Informações de contato atualizadas com sucesso" };
  } catch (error) {
    console.error("Erro ao atualizar informações de contato:", error);
    return { success: false, message: "Erro ao atualizar informações de contato" };
  }
}

// Função para atualizar informações pessoais
export async function updatePersonalInfo(formData: FormData) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { success: false, message: "Usuário não autenticado" };
  }
  
  // Extrair dados do formulário
  const age = formData.get("age") as string;
  const address = formData.get("address") as string;
  const state = formData.get("state") as string;
  const zipCode = formData.get("zipCode") as string;
  const interests = formData.get("interests") as string;
  const twitter = formData.get("twitter") as string;
  const twitch = formData.get("twitch") as string;
  const instagram = formData.get("instagram") as string;
  
  // Validação com Zod
  const validationResult = personalSchema.safeParse({ 
    age, 
    address, 
    state, 
    zipCode, 
    interests, 
    twitter, 
    twitch, 
    instagram 
  });
  
  if (!validationResult.success) {
    // Retorna todos os erros de validação em um objeto
    const errorMessages = validationResult.error.errors.map(error => ({
      path: error.path.join('.'),
      message: error.message
    }));
    
    return { 
      success: false, 
      message: "Erro na validação dos dados", 
      errors: errorMessages 
    };
  }
  
  // Dados validados
  const validatedData = validationResult.data;
  
  // Verificar se o usuário pode realizar esta ação (usando CacheIDManager)
  const cacheResult = await CacheIDManager({
    type: "update_personal_info",
    waitTime: 86400 // 1 dia em segundos (24 * 60 * 60)
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
    });
    
    if (existingPersonal) {
      // Atualizar registro existente, preservando os campos hasBuyed e isCrowd
      await prisma.personalInfos.update({
        where: {
          userId: session.user.id
        },
        data: {
          age: validatedData.age,
          address: validatedData.address || null,
          state: validatedData.state || null,
          zipCode: validatedData.zipCode || null,
          interests: validatedData.interests || null,
          twitter: validatedData.twitter || null,
          twitch: validatedData.twitch || null,
          instagram: validatedData.instagram || null
        }
      });
    } else {
      // Criar novo registro (isso não deveria acontecer na edição, mas por segurança)
      await prisma.personalInfos.create({
        data: {
          age: validatedData.age,
          hasBuyed: false,
          isCrowd: false,
          address: validatedData.address || null,
          state: validatedData.state || null,
          zipCode: validatedData.zipCode || null,
          interests: validatedData.interests || null,
          twitter: validatedData.twitter || null,
          twitch: validatedData.twitch || null,
          instagram: validatedData.instagram || null,
          userId: session.user.id
        }
      });
    }
    
    revalidatePath("/settings", "page");
    return { success: true, message: "Informações pessoais atualizadas com sucesso" };
  } catch (error) {
    console.error("Erro ao atualizar informações pessoais:", error);
    return { success: false, message: "Erro ao atualizar informações pessoais" };
  }
} 