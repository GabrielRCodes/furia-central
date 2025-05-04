'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';

interface TimeAgoProps {
  date: Date | string;
  className?: string;
  updateInterval?: number;
}

export function TimeAgo({ date, className = '', updateInterval = 60000 }: TimeAgoProps) {
  const locale = useLocale();
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    // Função para formatar o tempo dentro do useEffect
    const formatTime = () => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Verificar se a data é válida
      if (isNaN(dateObj.getTime())) {
        return locale.startsWith('pt') ? 'Data inválida' : 'Invalid date';
      }
      
      // Selecionar o locale com base no idioma atual
      // O locale pode ser 'pt-BR' ou 'en' dependendo da configuração
      const dateLocale = locale.startsWith('pt') ? ptBR : enUS;
      
      try {
        // Verificar se a mensagem foi enviada há menos de 1 minuto
        const secondsAgo = Math.round((new Date().getTime() - dateObj.getTime()) / 1000);
        if (secondsAgo < 60) {
          return locale.startsWith('pt') ? 'agora' : 'now';
        }
        
        // Formatação relativa (há X tempo/X time ago)
        const formattedTime = formatDistanceToNow(dateObj, { 
          addSuffix: true,
          locale: dateLocale
        });
        
        // Remover "cerca de" em português, mantendo apenas o "há X"
        if (locale.startsWith('pt')) {
          return formattedTime.replace('há cerca de ', 'há ');
        }
        
        return formattedTime;
      } catch (error) {
        console.error('Erro ao formatar data:', error);
        return locale.startsWith('pt') ? 'há algum tempo' : 'some time ago';
      }
    };
    
    // Formatar imediatamente
    setFormattedDate(formatTime());
    
    // Atualizar a cada intervalo (por padrão a cada 1 minuto)
    const intervalId = setInterval(() => {
      setFormattedDate(formatTime());
    }, updateInterval);
    
    // Limpar o intervalo ao desmontar
    return () => clearInterval(intervalId);
  }, [date, locale, updateInterval]);

  // Para o tooltip, usar o formato completo de data baseado no locale
  const tooltipDate = typeof date === 'string' ? new Date(date) : date;
  const tooltipFormat = tooltipDate.toLocaleString(
    locale.startsWith('pt') ? 'pt-BR' : 'en-US',
    { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  );

  return (
    <span className={className} title={tooltipFormat}>
      {formattedDate}
    </span>
  );
} 