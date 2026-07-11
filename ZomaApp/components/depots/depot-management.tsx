'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Search, Store, MapPin, Phone, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Depot } from '@/lib/mock-data';
import { mapDepot } from '@/lib/mappers';
import { DataService } from '@/lib/services/data-service';
import { useBackend } from '@/contexts/backend-context';
import { DataPagination, usePagination } from '@/components/ui/data-pagination';

export const DepotManagement: React.FC = () => {
  const { backendReady } = useBackend();
  const [depots, setDepots] = useState<Depot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDepot, setEditingDepot] = useState<Depot | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    adminId: '',
  });

  const fetchDepots = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await DataService.getDepots();
      setDepots(raw.map(mapDepot));
    } catch (err: any) {
      toast.error('Erreur chargement dépôts: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (backendReady !== null) fetchDepots();
  }, [backendReady, fetchDepots]);

  const filteredDepots = depots.filter(depot =>
    depot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    depot.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { slice: pageDepots, paginationProps } = usePagination(filteredDepots, 6);

  const resetForm = () => {
    setFormData({ name: '', address: '', phone: '', adminId: '' });
    setEditingDepot(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingDepot) {
        await DataService.updateDepot(editingDepot.id, {
          ...formData,
          isActive: editingDepot.isActive,
        });
      } else {
        await DataService.createDepot(formData);
      }
      await fetchDepots();
      resetForm();
      setIsAddDialogOpen(false);
      toast.success(editingDepot ? 'Dépôt modifié' : 'Dépôt ajouté');
    } catch (err: any) {
      toast.error('Erreur: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (depot: Depot) => {
    setEditingDepot(depot);
    setFormData({
      name: depot.name,
      address: depot.address,
      phone: depot.phone,
      adminId: depot.adminId,
    });
    setIsAddDialogOpen(true);
  };

  const handleToggleStatus = async (depot: Depot) => {
    try {
      await DataService.updateDepot(depot.id, {
        name: depot.name,
        address: depot.address,
        phone: depot.phone,
        adminId: depot.adminId,
        isActive: !depot.isActive,
      });
      await fetchDepots();
      toast.success('Statut mis à jour');
    } catch (err: any) {
      toast.error('Erreur: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Chargement des dépôts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Dépôts</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Gérez vos points de vente et entrepôts</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un Dépôt
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDepot ? 'Modifier le Dépôt' : 'Ajouter un Nouveau Dépôt'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du Dépôt</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminId">ID Administrateur (optionnel)</Label>
                <Input id="adminId" value={formData.adminId} onChange={(e) => setFormData({...formData, adminId: e.target.value})} placeholder="UUID de l'admin" />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingDepot ? 'Modifier' : 'Ajouter'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un dépôt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {filteredDepots.length === 0 ? (
        <Card>
          <CardContent className="text-center text-gray-500 py-12">Aucun dépôt trouvé</CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageDepots.map((depot) => (
              <Card key={depot.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Store className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate">{depot.name}</span>
                    </CardTitle>
                    <Badge variant={depot.isActive ? 'default' : 'secondary'}>
                      {depot.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{depot.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="h-4 w-4" />
                    {depot.phone}
                  </div>
                  {depot.adminId && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <User className="h-4 w-4" />
                      <span className="truncate text-xs">Admin: {depot.adminId}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-3">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(depot)}>
                      <Edit className="h-4 w-4 mr-1" />Modifier
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleToggleStatus(depot)}>
                      {depot.isActive ? 'Désactiver' : 'Activer'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <DataPagination {...paginationProps} />
        </>
      )}
    </div>
  );
};
