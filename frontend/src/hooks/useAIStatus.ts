import { useState, useEffect, useCallback } from 'react';
import { AIStatus } from '../types';
import { api } from '../services/api';

export function useAIStatus() {
  const [status, setStatus] = useState<AIStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAIStatus();
      setStatus(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to reach AI status endpoint');
      setStatus({
        connected: false,
        model_available: false,
        configured_model: 'qwen2.5:3b',
        installed_models: [],
        fallback_mode: true,
        message: 'Backend AI service unreachable. Running in offline template mode.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    // Re-check periodically every 45 seconds gently without spamming
    const interval = setInterval(fetchStatus, 45000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return { status, loading, error, refresh: fetchStatus };
}
