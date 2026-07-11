'use client';

/**
 * BackendProvider — vérifie la disponibilité du backend au démarrage
 * et expose `backendReady` à toute l'app.
 * Ça évite que chaque composant fasse son propre health-check en parallèle.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { checkBackend } from '@/lib/services/api';

interface BackendContextType {
  backendReady: boolean | null; // null = en cours de vérification
}

const BackendContext = createContext<BackendContextType>({ backendReady: null });

export function useBackend() {
  return useContext(BackendContext);
}

export const BackendProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [backendReady, setBackendReady] = useState<boolean | null>(null);

  useEffect(() => {
    // Déclencher le health-check une seule fois au montage
    checkBackend().then(ok => setBackendReady(ok));
  }, []);

  return (
    <BackendContext.Provider value={{ backendReady }}>
      {children}
    </BackendContext.Provider>
  );
};
