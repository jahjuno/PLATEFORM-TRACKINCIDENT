import { useState, useEffect } from 'react';
import { checkDatabaseConnection } from '../lib/supabase';

export function useDatabase() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkConnection() {
      try {
        setIsChecking(true);
        const connected = await checkDatabaseConnection();
        setIsConnected(connected);
        setError(null);
      } catch (err) {
        setIsConnected(false);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la vérification de la connexion');
      } finally {
        setIsChecking(false);
      }
    }

    checkConnection();
  }, []);

  const retryConnection = async () => {
    setIsChecking(true);
    setError(null);
    try {
      const connected = await checkDatabaseConnection();
      setIsConnected(connected);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la tentative de reconnexion');
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  return {
    isConnected,
    isChecking,
    error,
    retryConnection
  };
}