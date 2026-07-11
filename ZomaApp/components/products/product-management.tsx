'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Search, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Product, Fournisseur } from '@/lib/mock-data';
import { mapProduct, mapFournisseur } from '@/lib/mappers';
import { DataService } from '@/lib/services/data-service';
import { useBackend } from '@/contexts/backend-context';
import { DataPagination, usePagination } from '@/components/ui/data-pagination';

export const ProductManagement: React.FC = () => {
  const { backendReady } = useBackend();
  const [products, setProducts] = useState<Product[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFournisseur, setSelectedFournisseur] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    fournisseurId: '',
    unit: '',
    prixAchat: '',
    prixVente: '',
    seuilStock: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rawProducts, rawFournisseurs] = await Promise.all([
        DataService.getProducts(),
        DataService.getFournisseurs(),
      ]);
      setProducts(rawProducts.map(mapProduct));
      setFournisseurs(rawFournisseurs.map(mapFournisseur));
    } catch (err: any) {
      toast.error('Erreur chargement produits: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger dès que le backend est confirmé disponible
  useEffect(() => {
    if (backendReady !== null) fetchData();
  }, [backendReady, fetchData]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFournisseur = selectedFournisseur === 'all' || product.fournisseurId === selectedFournisseur;
    return matchesSearch && matchesFournisseur;
  });

  const { slice: pageProducts, paginationProps } = usePagination(filteredProducts, 10);

  const resetForm = () => {
    setFormData({ name: '', fournisseurId: '', unit: '', prixAchat: '', prixVente: '', seuilStock: '' });
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        fournisseurId: formData.fournisseurId,
        unit: formData.unit,
        prixAchat: parseFloat(formData.prixAchat),
        prixVente: parseFloat(formData.prixVente),
        seuilStock: parseInt(formData.seuilStock),
      };

      if (editingProduct) {
        await DataService.updateProduct(editingProduct.id, { ...payload, isActive: editingProduct.isActive });
      } else {
        await DataService.createProduct(payload);
      }
      await fetchData();
      resetForm();
      setIsAddDialogOpen(false);
      toast.success(editingProduct ? 'Produit modifié' : 'Produit ajouté');
    } catch (err: any) {
      toast.error('Erreur: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      fournisseurId: product.fournisseurId,
      unit: product.unit,
      prixAchat: product.prixAchat.toString(),
      prixVente: product.prixVente.toString(),
      seuilStock: product.seuilStock.toString(),
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await DataService.deleteProduct(id);
      await fetchData();
      toast.success('Produit supprimé');
    } catch (err: any) {
      toast.error('Erreur suppression: ' + err.message);
    }
  };

  const getFournisseurName = (fournisseurId: string) => {
    const f = fournisseurs.find(f => f.id === fournisseurId);
    return f?.name || 'Inconnu';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Chargement des produits...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Produits</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Gérez votre catalogue de produits</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un Produit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Modifier le Produit' : 'Ajouter un Nouveau Produit'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du Produit</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fournisseur">Fournisseur</Label>
                <Select value={formData.fournisseurId} onValueChange={(value) => setFormData({...formData, fournisseurId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un fournisseur" />
                  </SelectTrigger>
                  <SelectContent>
                    {fournisseurs.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unité</Label>
                <Input id="unit" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} placeholder="ex: bouteille, pack, carton" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prixAchat">Prix d'Achat (FCFA)</Label>
                  <Input id="prixAchat" type="number" value={formData.prixAchat} onChange={(e) => setFormData({...formData, prixAchat: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prixVente">Prix de Vente (FCFA)</Label>
                  <Input id="prixVente" type="number" value={formData.prixVente} onChange={(e) => setFormData({...formData, prixVente: e.target.value})} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seuilStock">Seuil de Stock</Label>
                <Input id="seuilStock" type="number" value={formData.seuilStock} onChange={(e) => setFormData({...formData, seuilStock: e.target.value})} required />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingProduct ? 'Modifier' : 'Ajouter'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="Rechercher un produit..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="w-full sm:w-64">
              <Select value={selectedFournisseur} onValueChange={setSelectedFournisseur}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les fournisseurs</SelectItem>
                  {fournisseurs.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Produits ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Unité</TableHead>
                <TableHead>Prix d'Achat</TableHead>
                <TableHead>Prix de Vente</TableHead>
                <TableHead>Seuil Stock</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-8">Aucun produit trouvé</TableCell>
                </TableRow>
              ) : (
                pageProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{getFournisseurName(product.fournisseurId)}</TableCell>
                    <TableCell>{product.unit}</TableCell>
                    <TableCell>{product.prixAchat.toLocaleString()} FCFA</TableCell>
                    <TableCell>{product.prixVente.toLocaleString()} FCFA</TableCell>
                    <TableCell>{product.seuilStock}</TableCell>
                    <TableCell>
                      <Badge variant={product.isActive ? 'default' : 'secondary'}>
                        {product.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <DataPagination {...paginationProps} />
        </CardContent>
      </Card>
    </div>
  );
};
