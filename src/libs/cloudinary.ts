import { v2 as cloudinary } from 'cloudinary';

// Configuração do Cloudinary (as chaves devem ser definidas no .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Gera uma assinatura para upload direto pelo lado do cliente
export const generateSignature = async (
  folder = 'chat_images',
  transformation = 'f_auto,q_auto'
) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Criar o objeto de parâmetros
    const params = {
      timestamp: timestamp,
      folder: folder,
      transformation: transformation
    };
    
    // Gerar a assinatura
    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET!
    );
    
    // Retornar os dados necessários para o upload no cliente
    return {
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder
    };
  } catch (error) {
    console.error('Erro ao gerar assinatura Cloudinary:', error);
    throw new Error('Falha ao gerar assinatura para upload');
  }
};

export default cloudinary; 