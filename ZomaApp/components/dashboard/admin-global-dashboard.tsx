'use client';

import React, { useEffect, useState } from 'react';
import { StatsCard } from './stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Store, Package, TrendingUp, AlertTriangle, Truck, Loader2 } from 'lucide-react';
import { Depot, Stock, Product, Sale, Livraison } from '@/lib/mock-data';
import { mapDepot, mapStock, mapProduct, mapSale, mapLivraison } from '@/lib/mappers';
import { DataService } from '@/lib/services/data-service';

export const AdminGlobalDashboard: React.FC = () => {
  const [depots, setDepots] = useState<Depot[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [rawDepots, rawProducts, rawStocks, rawSales, rawLivraisons] = await Promise.all([
          DataService.getDepots(),
          DataService.getProducts(),
          DataService.getStocks(),
          DataService.getSales(),
          DataService.getLivraisons(),
        ]);
        setDepots(rawDepots.map(mapDepot));
        setProducts(rawProducts.map(mapProduct));
        setStocks(rawStocks.map(mapStock));
        setSales(rawSales.map(mapSale));
        setLivraisons(rawLivraisons.map(mapLivraison));
      } catch (err) {
        console.error('Erreur chargement dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const totalDepots = depots.filter(d => d.isActive).length;
  const totalProducts = products.filter(p => p.isActive).length;
  const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);

  const lowStockItems = stocks.filter(stock => {
    const seuil = stock.seuilStock ?? 0;
    return stock.quantity <= seuil;
  });

  const pendingLivraisons = livraisons.filter(l => l.status === 'pending').length;
  const completedLivraisons = livraisons.filter(l => l.status === 'completed').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Chargement du tableau de bord...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tableau de Bord Global</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Vue d'ensemble des opérations ZOMA SARL</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Dépôts Actifs" value={totalDepots} description="Dépôts en fonctionnement" icon={Store} />
        <StatsCard title="Produits" value={totalProducts} description="Produits référencés" icon={Package} />
        <StatsCard
          title="Ventes Totales"
          value={`${totalSales.toLocaleString()} FCFA`}
          description="Chiffre d'affaires cumulé"
          icon={TrendingUp}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatsCard title="Alertes Stock" value={lowStockItems.length} description="Produits en stock faible" icon={AlertTriangle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Statut des Dépôts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {depots.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucun dépôt</p>
              ) : (
                depots.map((depot) => (
                  <div key={depot.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">{depot.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{depot.address}</p>
                    </div>
                    <Badge variant={depot.isActive ? 'default' : 'secondary'}>
                      {depot.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Livraisons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">En attente</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingLivraisons}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Terminées</p>
                  <p className="text-2xl font-bold text-green-600">{completedLivraisons}</p>
                </div>
              </div>
              <div className="space-y-2">
                {livraisons.slice(0, 4).map((livraison) => (
                  <div key={livraison.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div>
                      <p className="text-sm font-medium">
                        {livraison.fournisseurName || `Livraison #${livraison.id.slice(0, 8)}`}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {livraison.scheduledDate.toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <Badge variant={livraison.status === 'completed' ? 'default' : 'secondary'}>
                      {livraison.status === 'completed' ? 'Terminée' :
                       livraison.status === 'pending' ? 'En attente' :
                       livraison.status === 'in_progress' ? 'En cours' : 'Annulée'}
                    </Badge>
                  </div>
                ))}
                {livraisons.length === 0 && (
                  <p className="text-gray-500 text-center py-2">Aucune livraison</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Alertes Stock Critique
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.map((stock) => (
                <div key={stock.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-100">
                      {stock.productName || stock.productId}
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {stock.depotName || stock.depotId} — Stock: {stock.quantity} {stock.unit} (seuil: {stock.seuilStock})
                    </p>
                  </div>
                  <Badge variant="destructive">Critique</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
