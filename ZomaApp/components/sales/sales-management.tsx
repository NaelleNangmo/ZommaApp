'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, ShoppingCart, TrendingUp, Calendar, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Sale, Product, Depot } from '@/lib/mock-data';
import { mapSale, mapProduct, mapDepot } from '@/lib/mappers';
import { DataService } from '@/lib/services/data-service';
import { useAuth } from '@/contexts/auth-context';
import { useBackend } from '@/contexts/backend-context';

export const SalesManagement: React.FC = () => {
  const { user } = useAuth();
  const { backendReady } = useBackend();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [depots, setDepots] = useState<Depot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    unitPrice: '',
  });

  const isAdminGlobal = user?.role === 'admin_global';
  const userDepotId = user?.depotId;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rawSales, rawProducts, rawDepots] = await Promise.all([
        DataService.getSales(),
        DataService.getProducts(),
        DataService.getDepots(),
      ]);
      setSales(rawSales.map(mapSale));
      setProducts(rawProducts.map(mapProduct));
      setDepots(rawDepots.map(mapDepot));
    } catch (err: any) {
      toast.error('Erreur chargement ventes: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (backendReady !== null) fetchData();
  }, [backendReady, fetchData]);

  // Pré-remplir le prix de vente quand on sélectionne un produit
  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setFormData(f => ({
      ...f,
      productId,
      unitPrice: product ? product.prixVente.toString() : '',
    }));
  };

  const filteredSales = sales.filter(sale => {
    if (!isAdminGlobal && userDepotId && sale.depotId !== userDepotId) return false;
    const name = (sale.productName ?? '').toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase());
    const matchesProduct = selectedProduct === 'all' || sale.productId === selectedProduct;

    let matchesPeriod = true;
    const now = new Date();
    if (selectedPeriod === 'today') {
      matchesPeriod = sale.createdAt.toDateString() === now.toDateString();
    } else if (selectedPeriod === 'week') {
      const wk = new Date(); wk.setDate(wk.getDate() - 7);
      matchesPeriod = sale.createdAt >= wk;
    } else if (selectedPeriod === 'month') {
      const mo = new Date(); mo.setMonth(mo.getMonth() - 1);
      matchesPeriod = sale.createdAt >= mo;
    }
    return matchesSearch && matchesProduct && matchesPeriod;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || !formData.quantity || !formData.unitPrice) return;
    setSaving(true);
    try {
      await DataService.createSale({
        productId: formData.productId,
        depotId: userDepotId,
        vendeurId: user?.id,
        quantity: parseInt(formData.quantity),
        unitPrice: parseFloat(formData.unitPrice),
      });
      setFormData({ productId: '', quantity: '', unitPrice: '' });
      setIsAddDialogOpen(false);
      await fetchData();
      toast.success('Vente enregistrée');
    } catch (err: any) {
      toast.error('Erreur enregistrement vente: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const totalSales = filteredSales.reduce((s, x) => s + x.totalAmount, 0);
  const totalQty   = filteredSales.reduce((s, x) => s + x.quantity, 0);
  const avgSale    = filteredSales.length ? totalSales / filteredSales.length : 0;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <span className="ml-2 text-gray-600">Chargement des ventes...</span>
    </div>
  );

  const canSell = ['vendeur','admin_depot','admin_global'].includes(user?.role ?? '');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Ventes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Enregistrez et suivez vos ventes</p>
        </div>
        {canSell && (
          <Dialog open={isAddDialogOpen} onOpenChange={(o) => { setIsAddDialogOpen(o); if (!o) setFormData({ productId:'', quantity:'', unitPrice:'' }); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nouvelle Vente</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Enregistrer une Nouvelle Vente</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Produit</Label>
                  <Select value={formData.productId} onValueChange={handleProductChange}>
                    <SelectTrigger><SelectValue placeholder="Sélectionnez un produit" /></SelectTrigger>
                    <SelectContent>
                      {products.filter(p => p.isActive).map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name} — {p.prixVente.toLocaleString()} FCFA</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quantité</Label>
                  <Input type="number" min="1" value={formData.quantity}
                    onChange={e => setFormData(f => ({ ...f, quantity: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Prix unitaire (FCFA)</Label>
                  <Input type="number" min="0" value={formData.unitPrice}
                    onChange={e => setFormData(f => ({ ...f, unitPrice: e.target.value }))} required />
                </div>
                {formData.quantity && formData.unitPrice && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                    <p className="text-xl font-bold text-blue-700">
                      {(parseInt(formData.quantity) * parseFloat(formData.unitPrice)).toLocaleString()} FCFA
                    </p>
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Enregistrer la Vente
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-600 dark:text-gray-400">Chiffre d'Affaires</p>
              <p className="text-2xl font-bold">{totalSales.toLocaleString()} FCFA</p></div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quantité Vendue</p>
              <p className="text-2xl font-bold">{totalQty.toLocaleString()}</p></div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vente Moyenne</p>
              <p className="text-2xl font-bold">{Math.round(avgSale).toLocaleString()} FCFA</p></div>
            <ShoppingCart className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" />Filtres</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="Rechercher un produit..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="w-full sm:w-48">
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger><SelectValue placeholder="Produit" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les produits</SelectItem>
                  {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger><SelectValue placeholder="Période" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les périodes</SelectItem>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Historique des Ventes ({filteredSales.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Produit</TableHead>
                {isAdminGlobal && <TableHead>Dépôt</TableHead>}
                <TableHead>Quantité</TableHead>
                <TableHead>Prix Unitaire</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.length === 0 ? (
                <TableRow><TableCell colSpan={isAdminGlobal ? 6 : 5} className="text-center text-gray-500 py-8">Aucune vente trouvée</TableCell></TableRow>
              ) : filteredSales.map(sale => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {sale.createdAt.toLocaleDateString('fr-FR')}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-500" />
                      {sale.productName || sale.productId}
                    </div>
                  </TableCell>
                  {isAdminGlobal && <TableCell>{sale.depotName || sale.depotId}</TableCell>}
                  <TableCell>{sale.quantity} {sale.unit}</TableCell>
                  <TableCell>{sale.unitPrice.toLocaleString()} FCFA</TableCell>
                  <TableCell className="font-medium">{sale.totalAmount.toLocaleString()} FCFA</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
