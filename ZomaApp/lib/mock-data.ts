// This file now serves as type definitions and fallback data
// The actual data is loaded from JSON files or backend API

export interface Depot {
  id: string;
  name: string;
  address: string;
  phone: string;
  adminId: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  fournisseurId: string;
  unit: string;
  prixAchat: number;
  prixVente: number;
  seuilStock: number;
  isActive: boolean;
  createdAt: Date;
}

export interface Fournisseur {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Stock {
  id: string;
  productId: string;
  depotId: string;
  quantity: number;
  lastUpdated: Date;
  // Joined fields from backend
  productName?: string;
  unit?: string;
  seuilStock?: number;
  depotName?: string;
  prixAchat?: number;
}

export interface Sale {
  id: string;
  productId: string;
  depotId: string;
  vendeurId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  createdAt: Date;
  // Joined fields from backend
  productName?: string;
  unit?: string;
  depotName?: string;
  vendeurName?: string;
}

export interface Livraison {
  id: string;
  fournisseurId: string;
  depotId: string;
  livreurId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: Date;
  completedAt?: Date;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  totalAmount: number;
  createdAt: Date;
  // Joined fields from backend
  fournisseurName?: string;
  depotName?: string;
  livreurName?: string;
}

export interface Livreur {
  id: string;
  name: string;
  phone: string;
  email: string;
  depotId: string;
  isActive: boolean;
  createdAt: Date;
}

// Export empty arrays as fallback - data will be loaded from services
export const mockDepots: Depot[] = [];
export const mockFournisseurs: Fournisseur[] = [];
export const mockProducts: Product[] = [];
export const mockStocks: Stock[] = [];
export const mockLivreurs: Livreur[] = [];
export const mockSales: Sale[] = [];
export const mockLivraisons: Livraison[] = [];