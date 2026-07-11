/**
 * Normalise les champs snake_case renvoyés par le backend en camelCase
 * utilisé par les interfaces TypeScript du front.
 */

import type { Depot, Product, Fournisseur, Stock, Sale, Livreur, Livraison } from './mock-data';

export function mapDepot(row: any): Depot {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    phone: row.phone,
    adminId: row.admin_id ?? row.adminId ?? '',
    isActive: row.is_active ?? row.isActive ?? true,
    createdAt: new Date(row.created_at ?? row.createdAt),
  };
}

export function mapProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    fournisseurId: row.fournisseur_id ?? row.fournisseurId ?? '',
    unit: row.unit,
    prixAchat: Number(row.prix_achat ?? row.prixAchat ?? 0),
    prixVente: Number(row.prix_vente ?? row.prixVente ?? 0),
    seuilStock: Number(row.seuil_stock ?? row.seuilStock ?? 0),
    isActive: row.is_active ?? row.isActive ?? true,
    createdAt: new Date(row.created_at ?? row.createdAt),
  };
}

export function mapFournisseur(row: any): Fournisseur {
  return {
    id: row.id,
    name: row.name,
    contact: row.contact,
    phone: row.phone,
    email: row.email,
    isActive: row.is_active ?? row.isActive ?? true,
    createdAt: new Date(row.created_at ?? row.createdAt),
  };
}

export function mapStock(row: any): Stock {
  return {
    id: row.id,
    productId: row.product_id ?? row.productId ?? '',
    depotId: row.depot_id ?? row.depotId ?? '',
    quantity: Number(row.quantity ?? 0),
    lastUpdated: new Date(row.last_updated ?? row.lastUpdated ?? row.updated_at ?? Date.now()),
    // bonus fields joined from backend
    productName: row.product_name ?? '',
    unit: row.unit ?? '',
    seuilStock: Number(row.seuil_stock ?? row.seuilStock ?? 0),
    depotName: row.depot_name ?? '',
    prixAchat: Number(row.prix_achat ?? row.prixAchat ?? 0),
  };
}

export function mapSale(row: any): Sale {
  return {
    id: row.id,
    productId: row.product_id ?? row.productId ?? '',
    depotId: row.depot_id ?? row.depotId ?? '',
    vendeurId: row.vendeur_id ?? row.vendeurId ?? '',
    quantity: Number(row.quantity ?? 0),
    unitPrice: Number(row.unit_price ?? row.unitPrice ?? 0),
    totalAmount: Number(row.total_amount ?? row.totalAmount ?? 0),
    createdAt: new Date(row.created_at ?? row.createdAt),
    // bonus joined fields
    productName: row.product_name ?? '',
    unit: row.unit ?? '',
    depotName: row.depot_name ?? '',
    vendeurName: row.vendeur_name ?? '',
  };
}

export function mapLivreur(row: any): Livreur {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    depotId: row.depot_id ?? row.depotId ?? '',
    isActive: row.is_active ?? row.isActive ?? true,
    createdAt: new Date(row.created_at ?? row.createdAt),
    depotName: row.depot_name ?? row.depotName ?? '',
  };
}

export function mapLivraison(row: any): Livraison {
  return {
    id: row.id,
    fournisseurId: row.fournisseur_id ?? row.fournisseurId ?? '',
    depotId: row.depot_id ?? row.depotId ?? '',
    livreurId: row.livreur_id ?? row.livreurId ?? '',
    status: row.status,
    scheduledDate: new Date(row.scheduled_date ?? row.scheduledDate),
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    items: row.items ?? [],
    totalAmount: Number(row.total_amount ?? row.totalAmount ?? 0),
    createdAt: new Date(row.created_at ?? row.createdAt),
    // bonus joined fields
    fournisseurName: row.fournisseur_name ?? '',
    depotName: row.depot_name ?? '',
    livreurName: row.livreur_name ?? '',
  };
}
