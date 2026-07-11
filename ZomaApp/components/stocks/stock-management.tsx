'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Package, AlertTriangle, TrendingUp, TrendingDown, Store, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Stock, Depot } from '@/lib/mock-data';
import { mapStock, mapDepot } from '@/lib/mappers';
import { DataService } from '@/lib/services/data-service';
import { useAuth } from '@/contexts/auth-context';
import { useBackend } from '@/contexts/backend-context';

export const StockManagement: React.FC = () => {
  const { user } = useAuth();
  const { backendReady } = useBackend();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [depots, setDepots] = useState<Depot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepot, setSelectedDepot] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');

  const isAdminGlobal = user?.role === 'admin_global';
  const userDepotId = user?.depotId;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rawStocks, rawDepots] = await Promise.all([
        DataService.getStocks(),
        DataService.getDepots(),
      ]);
      setStocks(rawStocks.map(mapStock));
      setDepots(rawDepots.map(mapDepot));
    } catch (err: any) {
      toast.error('Erreur chargement stocks: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (backendReady !== null) fetchData();
  }, [backendReady, fetchData]);

  const getStockStatus = (stock: Stock) => {
    if (stock.quantity === 0) return 'out';
    const seuil = stock.seuilStock ?? 0;
    if (stock.quantity <= seuil) return 'low';
    return 'good';
  };

  const filteredStocks = stocks.filter(stock => {
    // Filter by user's depot if not admin global
    if (!isAdminGlobal && userDepotId && stock.depotId !== userDepotId) return false;

    const matchesSearch = (stock.productName ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepot = selectedDepot === 'all' || stock.depotId === selectedDepot;

    const status = getStockStatus(stock);
    const matchesStockFilter =
      stockFilter === 'all' ||
      (stockFilter === 'low' && status === 'low') ||
      (stockFilter === 'out' && status === 'out') ||
      (stockFilter === 'good' && status === 'good');

    return matchesSearch && matchesDepot && matchesStockFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'out':
        return <Badge variant="destructive">Rupture</Badge>;
      case 'low':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Stock Faible</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Disponible</Badge>;
    }
  };

  const totalProducts = filteredStocks.length;
  const lowStockCount = filteredStocks.filter(s => getStockStatus(s) === 'low').length;
  const outOfStockCount = filteredStocks.filter(s => getStockStatus(s) === 'out').length;
  const totalValue = filteredStocks.reduce((sum, s) => sum + s.quantity * (s.prixAchat ?? 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Chargement des stocks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Stocks</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Suivez vos niveaux de stock en temps réel</p>
        </div>
        <Button variant="outline" onClick={fetchData}>
          Actualiser
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Références</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Stock Faible</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockCount}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ruptures</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Valeur Stock</p>
                <p className="text-2xl font-bold">{totalValue.toLocaleString()} FCFA</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {isAdminGlobal && (
              <div className="w-full sm:w-48">
                <Select value={selectedDepot} onValueChange={setSelectedDepot}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrer par dépôt" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les dépôts</SelectItem>
                    {depots.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="w-full sm:w-48">
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par état" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les stocks</SelectItem>
                  <SelectItem value="good">Stock suffisant</SelectItem>
                  <SelectItem value="low">Stock faible</SelectItem>
                  <SelectItem value="out">Rupture</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>État des Stocks ({filteredStocks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                {isAdminGlobal && <TableHead>Dépôt</TableHead>}
                <TableHead>Quantité</TableHead>
                <TableHead>Seuil</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead>Dernière MAJ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStocks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdminGlobal ? 7 : 6} className="text-center text-gray-500 py-8">
                    Aucun stock trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredStocks.map((stock) => {
                  const status = getStockStatus(stock);
                  const value = stock.quantity * (stock.prixAchat ?? 0);
                  return (
                    <TableRow key={stock.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-blue-500" />
                          {stock.productName || stock.productId}
                        </div>
                      </TableCell>
                      {isAdminGlobal && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Store className="h-4 w-4 text-gray-400" />
                            {stock.depotName || stock.depotId}
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <span className={`font-medium ${
                          status === 'out' ? 'text-red-600' :
                          status === 'low' ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                          {stock.quantity} {stock.unit}
                        </span>
                      </TableCell>
                      <TableCell>{stock.seuilStock ?? '-'} {stock.unit}</TableCell>
                      <TableCell>{getStatusBadge(status)}</TableCell>
                      <TableCell>{value.toLocaleString()} FCFA</TableCell>
                      <TableCell>{stock.lastUpdated.toLocaleDateString('fr-FR')}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
