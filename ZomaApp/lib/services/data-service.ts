'use client';

import { apiService } from './api';

export class DataService {
  // Depots
  static async getDepots() {
    return await apiService.getAll('depots');
  }

  static async getDepotById(id: string) {
    return await apiService.getById('depots', id);
  }

  static async createDepot(data: any) {
    return await apiService.create('depots', data);
  }

  static async updateDepot(id: string, data: any) {
    return await apiService.update('depots', id, data);
  }

  static async deleteDepot(id: string) {
    return await apiService.delete('depots', id);
  }

  // Products
  static async getProducts() {
    return await apiService.getAll('products');
  }

  static async getProductById(id: string) {
    return await apiService.getById('products', id);
  }

  static async createProduct(data: any) {
    return await apiService.create('products', data);
  }

  static async updateProduct(id: string, data: any) {
    return await apiService.update('products', id, data);
  }

  static async deleteProduct(id: string) {
    return await apiService.delete('products', id);
  }

  // Fournisseurs
  static async getFournisseurs() {
    return await apiService.getAll('fournisseurs');
  }

  static async getFournisseurById(id: string) {
    return await apiService.getById('fournisseurs', id);
  }

  static async createFournisseur(data: any) {
    return await apiService.create('fournisseurs', data);
  }

  static async updateFournisseur(id: string, data: any) {
    return await apiService.update('fournisseurs', id, data);
  }

  static async deleteFournisseur(id: string) {
    return await apiService.delete('fournisseurs', id);
  }

  // Users
  static async getUsers() {
    return await apiService.getAll('users');
  }

  static async getUserById(id: string) {
    return await apiService.getById('users', id);
  }

  static async createUser(data: any) {
    return await apiService.create('users', data);
  }

  static async updateUser(id: string, data: any) {
    return await apiService.update('users', id, data);
  }

  static async deleteUser(id: string) {
    return await apiService.delete('users', id);
  }

  // Stocks
  static async getStocks() {
    return await apiService.getAll('stocks');
  }

  static async getStockById(id: string) {
    return await apiService.getById('stocks', id);
  }

  static async updateStock(id: string, data: any) {
    return await apiService.update('stocks', id, data);
  }

  // Sales
  static async getSales() {
    return await apiService.getAll('sales');
  }

  static async createSale(data: any) {
    return await apiService.create('sales', data);
  }

  // Livreurs
  static async getLivreurs() {
    return await apiService.getAll('livreurs');
  }

  static async createLivreur(data: any) {
    return await apiService.create('livreurs', data);
  }

  static async updateLivreur(id: string, data: any) {
    return await apiService.update('livreurs', id, data);
  }

  static async deleteLivreur(id: string) {
    return await apiService.delete('livreurs', id);
  }

  // Livraisons
  static async getLivraisons() {
    return await apiService.getAll('livraisons');
  }

  static async createLivraison(data: any) {
    return await apiService.create('livraisons', data);
  }

  static async updateLivraison(id: string, data: any) {
    return await apiService.update('livraisons', id, data);
  }

  // Authentication
  static async authenticate(email: string, password: string) {
    return await apiService.authenticate(email, password);
  }

  // Health check
  static async checkBackendHealth() {
    return await apiService.healthCheck();
  }
}