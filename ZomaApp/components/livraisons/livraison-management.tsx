'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Truck, Calendar, Package, Clock, Loader2, X } from 'lucide-react';
import { Livraison, Fournisseur, Livreur, Depot, Product } from '@/lib/mock-data';
import { mapLivraison, mapFournisseur, mapLivreur, mapDepot, mapProduct } from '@/lib/mappers';
import { DataService } from '@/lib/services/data-service';
import { useAuth } from '@/contexts/auth-context';
import { useBackend } from '@/contexts/backend-context';
import { DataPagination, usePagination } from '@/components/ui/data-pagination';

export const LivraisonManagement: React.FC = () => {
  const { user } = useAuth();
  const { backendReady } = useBackend();

  const [livraisons, setLivraisons]     = useState<Livraison[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [livreurs, setLivreurs]         = useState<Livreur[]>([]);
  const [depots, setDepots]             = useState<Depot[]>([]);
  const [products, setProducts]         = useState<Product[]>([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);

  const [searchTerm, setSearchTerm]       = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    fournisseurId: '',
    livreurId: '',
    scheduledDate: '',
    items: [{ productId: '', quantity: '', unitPrice: '' }],
  });

  const isAdminGlobal = user?.role === 'admin_global';
  const isAdmin = user?.role === 'admin_global' || user?.role === 'admin_depot';
  const userDepotId = user?.depotId ?? '';

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rL, rF, rLiv, rD, rP] = await Promise.all([
        DataService.getLivraisons(),
        DataService.getFournisseurs(),
        DataService.getLivreurs(),
        DataService.getDepots(),
        DataService.getProducts(),
      ]);
      setLivraisons(rL.map(mapLivraison));
      setFournisseurs(rF.map(mapFournisseur));
      setLivreurs(rLiv.map(mapLivreur));
      setDepots(rD.map(mapDepot));
      setProducts(rP.map(mapProduct));
    } catch (err: any) {
      toast.error('Erreur chargement livraisons: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (backendReady !== null) fetchData();
  }, [backendReady, fetchData]);

  const resetForm = () => setFormData({
    fournisseurId: '', livreurId: '', scheduledDate: '',
    items: [{ productId: '', quantity: '', unitPrice: '' }],
  });

  const addItem = () => setFormData(f => ({
    ...f, items: [...f.items, { productId: '', quantity: '', unitPrice: '' }],
  }));

  const removeItem = (i: number) => setFormData(f => ({
    ...f, items: f.items.filter((_, idx) => idx !== i),
  }));

  const updateItem = (i: number, field: string, value: string) => {
    setFormData(f => {
      const items = [...f.items];
      items[i] = { ...items[i], [field]: value };
      // Pré-remplir prix achat quand on choisit un produit
      if (field === 'productId') {
        const prod = products.find(p => p.id === value);
        if (prod) items[i].unitPrice = prod.prixAchat.toString();
      }
      return { ...f, items };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fournisseurId || !formData.livreurId || !formData.scheduledDate) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    const validItems = formData.items.filter(it => it.productId && it.quantity && it.unitPrice);
    if (validItems.length === 0) {
      toast.error('Ajoutez au moins un produit');
      return;
    }

    setSaving(true);
    try {
      const totalAmount = validItems.reduce(
        (s, it) => s + parseInt(it.quantity) * parseFloat(it.unitPrice), 0
      );
      await DataService.createLivraison({
        fournisseurId: formData.fournisseurId,
        depotId: userDepotId,
        livreurId: formData.livreurId,
        scheduledDate: new Date(formData.scheduledDate).toISOString(),
        totalAmount,
        items: validItems.map(it => ({
          productId: it.productId,
          quantity: parseInt(it.quantity),
          unitPrice: parseFloat(it.unitPrice),
        })),
      });
      toast.success('Livraison planifiée avec succès');
      resetForm();
      setIsAddDialogOpen(false);
      await fetchData();
    } catch (err: any) {
      toast.error('Erreur: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (livraison: Livraison, newStatus: string) => {
    try {
      await DataService.updateLivraison(livraison.id, { status: newStatus });
      toast.success('Statut mis à jour');
      await fetchData();
    } catch (err: any) {
      toast.error('Erreur mise à jour statut: ' + err.message);
    }
  };

  const filtered = livraisons.filter(l => {
    if (!isAdminGlobal && userDepotId && l.depotId !== userDepotId) return false;
    const fName = ((l as any).fournisseurName ?? '').toLowerCase();
    const ms = fName.includes(searchTerm.toLowerCase()) || l.id.includes(searchTerm);
    const mst = selectedStatus === 'all' || l.status === selectedStatus;
    return ms && mst;
  });

  const { slice: pageLivraisons, paginationProps } = usePagination(filtered, 10);

  const statusBadge = (s: string) => {
    const map: Record<string, { label: string; variant: 'default'|'secondary'|'destructive'|'outline' }> = {
      pending:     { label: 'En attente',  variant: 'outline' },
      in_progress: { label: 'En cours',    variant: 'secondary' },
      completed:   { label: 'Terminée',    variant: 'default' },
      cancelled:   { label: 'Annulée',     variant: 'destructive' },
    };
    const { label, variant } = map[s] ?? { label: s, variant: 'outline' };
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <span className="ml-2 text-gray-600">Chargement des livraisons...</span>
    </div>
  );

  const pendingCount    = filtered.filter(l => l.status === 'pending').length;
  const inProgressCount = filtered.filter(l => l.status === 'in_progress').length;
  const completedCount  = filtered.filter(l => l.status === 'completed').length;

  const totalAmount = filtered.reduce((s, l) => s + l.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Livraisons</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Planifiez et suivez vos livraisons fournisseurs</p>
        </div>
        {isAdmin && (
          <Dialog open={isAddDialogOpen} onOpenChange={o => { setIsAddDialogOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}><Plus className="h-4 w-4 mr-2" />Nouvelle Livraison</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Planifier une Nouvelle Livraison</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fournisseur *</Label>
                    <Select value={formData.fournisseurId} onValueChange={v => setFormData(f => ({ ...f, fournisseurId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                      <SelectContent>
                        {fournisseurs.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Livreur *</Label>
                    <Select value={formData.livreurId} onValueChange={v => setFormData(f => ({ ...f, livreurId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                      <SelectContent>
                        {livreurs.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isAdminGlobal && (
                  <div className="space-y-2">
                    <Label>Dépôt destination</Label>
                    <p className="text-sm text-gray-500 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      {depots.find(d => d.id === userDepotId)?.name ?? 'Dépôt de l\'utilisateur connecté'}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Date prévue *</Label>
                  <Input type="datetime-local" value={formData.scheduledDate}
                    onChange={e => setFormData(f => ({ ...f, scheduledDate: e.target.value }))} required />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Produits à livrer</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                      <Plus className="h-3 w-3 mr-1" />Ajouter
                    </Button>
                  </div>
                  {formData.items.map((item, i) => (
                    <div key={i} className="grid grid-cols-[1fr_80px_100px_36px] gap-2 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                      <Select value={item.productId} onValueChange={v => updateItem(i, 'productId', v)}>
                        <SelectTrigger><SelectValue placeholder="Produit" /></SelectTrigger>
                        <SelectContent>
                          {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Input placeholder="Qté" type="number" min="1" value={item.quantity}
                        onChange={e => updateItem(i, 'quantity', e.target.value)} />
                      <Input placeholder="Prix (FCFA)" type="number" min="0" value={item.unitPrice}
                        onChange={e => updateItem(i, 'unitPrice', e.target.value)} />
                      <Button type="button" variant="ghost" size="sm"
                        onClick={() => removeItem(i)} disabled={formData.items.length === 1}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {/* total prévisionnel */}
                  {formData.items.some(it => it.quantity && it.unitPrice) && (
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-right">
                      <span className="text-sm text-gray-600">Total prévu: </span>
                      <span className="font-bold text-blue-700">
                        {formData.items.reduce((s, it) =>
                          s + (parseInt(it.quantity || '0') * parseFloat(it.unitPrice || '0')), 0
                        ).toLocaleString()} FCFA
                      </span>
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Planifier la Livraison
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-600 dark:text-gray-400">En Attente</p>
              <p className="text-2xl font-bold text-orange-600">{pendingCount}</p></div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-600 dark:text-gray-400">En Cours</p>
              <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p></div>
            <Truck className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-600 dark:text-gray-400">Terminées</p>
              <p className="text-2xl font-bold text-green-600">{completedCount}</p></div>
            <Package className="h-8 w-8 text-green-500" />
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-600 dark:text-gray-400">Montant Total</p>
              <p className="text-xl font-bold">{totalAmount.toLocaleString()} FCFA</p></div>
            <Truck className="h-8 w-8 text-gray-400" />
          </div>
        </CardContent></Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" />Filtres</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="Rechercher un fournisseur..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="w-full sm:w-48">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminée</SelectItem>
                  <SelectItem value="cancelled">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card>
        <CardHeader><CardTitle>Livraisons ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Livreur</TableHead>
                {isAdminGlobal && <TableHead>Dépôt</TableHead>}
                <TableHead>Date prévue</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageLivraisons.length === 0 ? (
                <TableRow><TableCell colSpan={isAdminGlobal ? 7 : 6} className="text-center text-gray-500 py-8">Aucune livraison trouvée</TableCell></TableRow>
              ) : pageLivraisons.map(l => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{(l as any).fournisseurName ?? l.fournisseurId}</TableCell>
                  <TableCell>{(l as any).livreurName ?? l.livreurId}</TableCell>
                  {isAdminGlobal && <TableCell className="text-sm text-gray-600">{(l as any).depotName ?? l.depotId}</TableCell>}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {l.scheduledDate.toLocaleDateString('fr-FR')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{l.totalAmount.toLocaleString()} FCFA</TableCell>
                  <TableCell>{statusBadge(l.status)}</TableCell>
                  <TableCell>
                    {l.status === 'pending' && (
                      <Button variant="outline" size="sm" onClick={() => handleStatusChange(l, 'in_progress')}>Démarrer</Button>
                    )}
                    {l.status === 'in_progress' && (
                      <Button variant="outline" size="sm" onClick={() => handleStatusChange(l, 'completed')}>Terminer</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <DataPagination {...paginationProps} />
        </CardContent>
      </Card>
    </div>
  );
};
