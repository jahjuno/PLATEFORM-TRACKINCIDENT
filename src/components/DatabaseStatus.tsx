import React from 'react';
import { useDatabase } from '../hooks/useDatabase';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export function DatabaseStatus() {
  const { isConnected, isChecking, error, retryConnection } = useDatabase();

  if (isChecking) {
    return (
      <div className="flex items-center space-x-2 text-primary-navy">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span className="text-sm">Vérification de la connexion...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-primary-red">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">{error}</span>
        <button
          onClick={retryConnection}
          className="text-sm underline hover:text-primary-red/80"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <CheckCircle2 className="h-4 w-4" />
        <span className="text-sm">Connecté à la base de données</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-primary-red">
      <AlertCircle className="h-4 w-4" />
      <span className="text-sm">Non connecté</span>
      <button
        onClick={retryConnection}
        className="text-sm underline hover:text-primary-red/80"
      >
        Réessayer
      </button>
    </div>
  );
}