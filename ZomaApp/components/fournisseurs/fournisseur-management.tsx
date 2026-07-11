'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Search, Truck, Mail, Phone, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Fournisseur } from '@/lib/mock-data';
import { mapFournisseur } from '@/lib/mappers';
import { DataService } from '@/lib/services/data-service';
import { useBackend } from '@/contexts/backend-context';
import { DataPagination, usePagination } from '@/components/ui/data-pagination';

export const FournisseurManagement: React.FC = () => {
  const { backendReady } = useBackend();
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingFournisseur, setEditingFournisseur] = useState<Fournisseur | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    phone: '',
    email: '',
  });

  const fetchFournisseurs = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await DataService.getFournisseurs();
      setFournisseurs(raw.map(mapFournisseur));
    } catch (err: any) {
      toast.error('Erreur chargement fournisseurs: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (backendReady !== null) fetchFournisseurs();
  }, [backendReady, fetchFournisseurs]);

  const filteredFournisseurs = fournisseurs.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { slice: pageFournisseurs, paginationProps } = usePagination(filteredFournisseurs, 10);

  const resetForm = () => {
    setFormData({ name: '', contact: '', phone: '', email: '' });
    setEditingFournisseur(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingFournisseur) {
        await DataService.updateFournisseur(editingFournisseur.id, {
          ...formData,
          isActive: editingFournisseur.isActive,
        });
      } else {
        await DataService.createFournisseur(formData);
      }
      await fetchFournisseurs();
      resetForm();
      setIsAddDialogOpen(false);
      toast.success(editingFournisseur ? 'Fournisseur modifié' : 'Fournisseur ajouté');
    } catch (err: any) {
      toast.error('Erreur: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (f: Fournisseur) => {
    setEditingFournisseur(f);
    setFormData({ name: f.name, contact: f.contact, phone: f.phone, email: f.email });
    setIsAddDialogOpen(true);
  };

  const handleToggleStatus = async (f: Fournisseur) => {
    try {
      await DataService.updateFournisseur(f.id, {
        name: f.name, contact: f.contact, phone: f.phone, email: f.email,
        isActive: !f.isActive,
      });
      await fetchFournisseurs();
      toast.success('Statut mis à jour');
    } catch (err: any) {
      toast.error('Erreur: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Chargement des fournisseurs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Fournisseurs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Gérez vos partenaires fournisseurs</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un Fournisseur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingFournisseur ? 'Modifier le Fournisseur' : 'Ajouter un Nouveau Fournisseur'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nom de l'Entreprise</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Personne de Contact</Label>
                <Input value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingFournisseur ? 'Modifier' : 'Ajouter'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" />Recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input placeholder="Rechercher un fournisseur..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Fournisseurs ({filteredFournisseurs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entreprise</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageFournisseurs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">Aucun fournisseur trouvé</TableCell>
                </TableRow>
              ) : (
                pageFournisseurs.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-blue-500" />{f.name}</div>
                    </TableCell>
                    <TableCell><div className="flex items-center gap-2"><User className="h-4 w-4 text-gray-400" />{f.contact}</div></TableCell>
                    <TableCell><div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" />{f.phone}</div></TableCell>
                    <TableCell><div className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" />{f.email}</div></TableCell>
                    <TableCell>
                      <Badge variant={f.isActive ? 'default' : 'secondary'}>{f.isActive ? 'Actif' : 'Inactif'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(f)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="outline" size="sm" onClick={() => handleToggleStatus(f)}>{f.isActive ? 'Désactiver' : 'Activer'}</Button>
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
