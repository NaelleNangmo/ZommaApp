'use client';

import { DataService } from './services/data-service';

export type UserRole = 'admin_global' | 'admin_depot' | 'vendeur' | 'livreur';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  depotId?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const result = await DataService.authenticate(email, password);
    
    if (result && result.user) {
      return {
        ...result.user,
        createdAt: new Date(result.user.createdAt)
      };
    }
    
    return result;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
};

export const getUserFromStorage = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem('zoma_user');
  if (!stored) return null;
  
  try {
    const user = JSON.parse(stored);
    return {
      ...user,
      createdAt: new Date(user.createdAt)
    };
  } catch {
    return null;
  }
};

export const setUserToStorage = (user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('zoma_user', JSON.stringify(user));
};

export const removeUserFromStorage = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('zoma_user');
};