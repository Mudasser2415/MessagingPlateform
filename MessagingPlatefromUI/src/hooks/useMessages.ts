import { useState, useEffect } from 'react';
import { messageService } from '../services/messageService';

export const useRecentMessages = (count = 10) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const data = await messageService.getRecentMessages(count);
        setMessages(data || []);
      } catch (err) {
        setError('Failed to fetch recent messages');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [count]);

  return { messages, loading, error };
};
