'use client';

import React, { useEffect, useState } from 'react';
import { StatsCard } from './stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, AlertTriangle, ShoppingCart, Truck, Loader2 } from 'lucide-react';
import { Stock, Sale, Livraison } from '@/lib/mock-data';
import { mapStock, mapSale, mapLivraison } from '@/lib/mappers';
import { DataService } from '@/lib/services/data-service';
import { useAuth } from '@/contexts/auth-context';

export const AdminDepotDashboard: React.FC = () => {
  const { user } = useAuth();
  const userDepotId = user?.depotId ?? '';

  const [stocks, setStocks] = useState<Stock[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [rawStocks, rawSales, rawLivraisons] = await Promise.all([
          DataService.getStocks(),
          DataService.getSales(),
          DataService.getLivraisons(),
        ]);
        setStocks(rawStocks.map(mapStock));
        setSales(rawSales.map(mapSale));
        setLivraisons(rawLivraisons.map(mapLivraison));
      } catch (err) {
        console.error('Erreur chargement dashboard dépôt:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const depotStocks = stocks.filter(s => s.depotId === userDepotId);
  const depotSales = sales.filter(s => s.depotId === userDepotId);
  const depotLivraisons = livraisons.filter(l => l.depotId === userDepotId);

  const totalSales = depotSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const lowStockCount = depotStocks.filter(s => s.quantity <= (s.seuilStock ?? 0)).length;
  const pendingLivraisons = depotLivraisons.filter(l => l.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mon Dépôt</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Gestion de votre dépôt</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Produits en Stock" value={depotStocks.length} description="Références disponibles" icon={Package} />
        <StatsCard
          title="Ventes Totales"
          value={`${totalSales.toLocaleString()} FCFA`}
          description="Chiffre d'affaires"
          icon={TrendingUp}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatsCard title="Alertes Stock" value={lowStockCount} description="Produits en stock faible" icon={AlertTriangle} />
        <StatsCard title="Livraisons en Attente" value={pendingLivraisons} description="À recevoir" icon={Truck} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />État des Stocks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {depotStocks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucun stock pour ce dépôt</p>
              ) : (
                depotStocks.slice(0, 5).map((stock) => {
                  const isLow = stock.quantity <= (stock.seuilStock ?? 0);
                  return (
                    <div key={stock.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium">{stock.productName || stock.productId}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{stock.quantity} {stock.unit}</p>
                      </div>
                      <Badge variant={isLow ? 'destructive' : 'default'}>
                        {isLow ? 'Stock faible' : 'Disponible'}
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" />Ventes Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {depotSales.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucune vente pour ce dépôt</p>
              ) : (
                depotSales.slice(0, 5).map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">{sale.productName || sale.productId}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {sale.quantity} {sale.unit} × {sale.unitPrice.toLocaleString()} FCFA
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{sale.totalAmount.toLocaleString()} FCFA</p>
                      <p className="text-xs text-gray-500">{sale.createdAt.toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" />Prochaines Livraisons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {depotLivraisons.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucune livraison pour ce dépôt</p>
            ) : (
              depotLivraisons.slice(0, 3).map((livraison) => (
                <div key={livraison.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">{livraison.fournisseurName || `Livraison #${livraison.id.slice(0, 8)}`}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {livraison.scheduledDate.toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{livraison.totalAmount.toLocaleString()} FCFA</p>
                    <Badge variant={livraison.status === 'completed' ? 'default' : 'secondary'}>
                      {livraison.status === 'completed' ? 'Terminée' : 'En attente'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
