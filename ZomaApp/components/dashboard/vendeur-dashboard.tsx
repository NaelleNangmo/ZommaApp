'use client';

import React, { useEffect, useState } from 'react';
import { StatsCard } from './stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, TrendingUp, Package, RotateCcw, Loader2 } from 'lucide-react';
import { Stock, Sale, Product } from '@/lib/mock-data';
import { mapStock, mapSale, mapProduct } from '@/lib/mappers';
import { DataService } from '@/lib/services/data-service';
import { useAuth } from '@/contexts/auth-context';

export const VendeurDashboard: React.FC = () => {
  const { user } = useAuth();
  const userDepotId = user?.depotId ?? '';

  const [stocks, setStocks] = useState<Stock[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [rawStocks, rawSales, rawProducts] = await Promise.all([
          DataService.getStocks(),
          DataService.getSales(),
          DataService.getProducts(),
        ]);
        setStocks(rawStocks.map(mapStock));
        setSales(rawSales.map(mapSale));
        setProducts(rawProducts.map(mapProduct));
      } catch (err) {
        console.error('Erreur chargement dashboard vendeur:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const depotStocks = stocks.filter(s => s.depotId === userDepotId);
  const mySales = sales.filter(s => s.vendeurId === user?.id);

  const totalSales = mySales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalQuantitySold = mySales.reduce((sum, s) => sum + s.quantity, 0);
  const availableProducts = depotStocks.filter(s => s.quantity > 0).length;

  const today = new Date().toDateString();
  const todaySales = mySales.filter(s => s.createdAt.toDateString() === today);
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);

  // Aggregate sales per product for top sellers
  const productSalesMap: Record<string, { name: string; unit: string; qty: number; revenue: number; prix: number }> = {};
  mySales.forEach(sale => {
    const key = sale.productId;
    if (!productSalesMap[key]) {
      const prod = products.find(p => p.id === key);
      productSalesMap[key] = {
        name: sale.productName || prod?.name || key,
        unit: sale.unit || prod?.unit || '',
        qty: 0,
        revenue: 0,
        prix: sale.unitPrice,
      };
    }
    productSalesMap[key].qty += sale.quantity;
    productSalesMap[key].revenue += sale.totalAmount;
  });
  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mes Ventes</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Tableau de bord vendeur</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Ventes Aujourd'hui" value={`${todayRevenue.toLocaleString()} FCFA`} description="Chiffre du jour" icon={ShoppingCart} />
        <StatsCard title="Ventes Totales" value={`${totalSales.toLocaleString()} FCFA`} description="Total des ventes" icon={TrendingUp} trend={{ value: 15.3, isPositive: true }} />
        <StatsCard title="Produits Disponibles" value={availableProducts} description="En stock dans mon dépôt" icon={Package} />
        <StatsCard title="Quantité Vendue" value={totalQuantitySold} description="Unités vendues" icon={RotateCcw} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" />Ventes du Jour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaySales.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucune vente aujourd'hui</p>
              ) : (
                todaySales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">{sale.productName || sale.productId}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{sale.quantity} {sale.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{sale.totalAmount.toLocaleString()} FCFA</p>
                      <p className="text-xs text-gray-500">{sale.createdAt.toLocaleTimeString('fr-FR')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Produits les Plus Vendus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucune vente enregistrée</p>
              ) : (
                topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{p.qty} {p.unit} vendues</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{p.revenue.toLocaleString()} FCFA</p>
                      <Badge variant="outline">{p.prix.toLocaleString()} FCFA</Badge>
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
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Mes Performances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Vente Moyenne</h4>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {Math.round(totalSales / Math.max(mySales.length, 1)).toLocaleString()} FCFA
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">par transaction</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-100">Transactions</h4>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{mySales.length}</p>
              <p className="text-sm text-green-600 dark:text-green-400">total</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-purple-900 dark:text-purple-100">Objectif Mensuel</h4>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {Math.min(Math.round((totalSales / 500000) * 100), 100)}%
              </p>
              <p className="text-sm text-purple-600 dark:text-purple-400">cible: 500 000 FCFA</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
