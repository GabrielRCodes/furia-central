// Função para gerar IDs únicos
export const generateUniqueId = () => {
  return 'id-' + Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) + 
         '-' + Date.now().toString(36);
}; 