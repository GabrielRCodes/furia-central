// Função para gerar IDs únicos
export const generateUniqueId = () => {
  return 'id-' + Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) + 
         '-' + Date.now().toString(36);
};

// Função para fazer upload de imagem para Cloudinary
export const uploadImage = async (file: File): Promise<string> => {
  try {
    // Obter a assinatura do servidor
    const signatureResponse = await fetch('/api/cloudinary/signature');
    
    if (!signatureResponse.ok) {
      throw new Error('Falha ao obter assinatura para upload');
    }
    
    const { signature, timestamp, apiKey, cloudName, folder } = await signatureResponse.json();
    
    // Criar o formulário para upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('folder', folder);
    formData.append('transformation', 'f_auto,q_auto');
    
    // Fazer o upload
    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!uploadResponse.ok) {
      throw new Error('Falha no upload da imagem');
    }
    
    const uploadResult = await uploadResponse.json();
    return uploadResult.secure_url;
  } catch (error) {
    console.error('Erro no upload:', error);
    throw error;
  }
}; 