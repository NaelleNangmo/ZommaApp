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
import { Plus, Edit, Search, Truck, Phone, Mail, MapPin, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Livreur, Depot } from '@/lib/mock-data';
import { mapLivreur, mapDepot } from '@/lib/mappers';
import { DataService } from '@/lib/services/data-service';
import { useBackend } from '@/contexts/backend-context';

export const LivreurManagement: React.FC = () => {
  const { backendReady } = useBackend();
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [depots, setDepots] = useState<Depot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepot, setSelectedDepot] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLivreur, setEditingLivreur] = useState<Livreur | null>(null);

  const [formData, setFormData] = useState({ name: '', phone: '', email: '', depotId: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rawL, rawD] = await Promise.all([DataService.getLivreurs(), DataService.getDepots()]);
      setLivreurs(rawL.map(mapLivreur));
      setDepots(rawD.map(mapDepot));
    } catch (err: any) { toast.error('Erreur chargement livreurs: ' + err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (backendReady !== null) fetchData();
  }, [backendReady, fetchData]);

  const resetForm = () => { setFormData({ name:'', phone:'', email:'', depotId:'' }); setEditingLivreur(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingLivreur) {
        await DataService.updateLivreur(editingLivreur.id, { ...formData, isActive: editingLivreur.isActive });
      } else {
        await DataService.createLivreur(formData);
      }
      await fetchData();
      resetForm();
      setIsAddDialogOpen(false);
      toast.success(editingLivreur ? 'Livreur modifié' : 'Livreur ajouté');
    } catch (err: any) { toast.error('Erreur: ' + err.message); }
    finally { setSaving(false); }
  };

  const handleEdit = (l: Livreur) => {
    setEditingLivreur(l);
    setFormData({ name: l.name, phone: l.phone, email: l.email, depotId: l.depotId });
    setIsAddDialogOpen(true);
  };

  const handleToggle = async (l: Livreur) => {
    try {
      await DataService.updateLivreur(l.id, { name: l.name, phone: l.phone, email: l.email, depotId: l.depotId, isActive: !l.isActive });
      await fetchData();
      toast.success('Statut mis à jour');
    } catch (err: any) { toast.error('Erreur: ' + err.message); }
  };

  const filtered = livreurs.filter(l => {
    const ms = l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.phone.includes(searchTerm);
    const md = selectedDepot === 'all' || l.depotId === selectedDepot;
    return ms && md;
  });

  const getDepotName = (id: string) => depots.find(d => d.id === id)?.name ?? 'Inconnu';

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <span className="ml-2 text-gray-600">Chargement des livreurs...</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Livreurs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Gérez votre équipe de livraison</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={o => { setIsAddDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}><Plus className="h-4 w-4 mr-2" />Ajouter un Livreur</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingLivreur ? 'Modifier le Livreur' : 'Ajouter un Livreur'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nom complet</Label>
                <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Dépôt assigné</Label>
                <Select value={formData.depotId} onValueChange={v => setFormData(f => ({ ...f, depotId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionnez un dépôt" /></SelectTrigger>
                  <SelectContent>
                    {depots.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingLivreur ? 'Modifier' : 'Ajouter'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" />Filtres</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="Rechercher un livreur..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="w-full sm:w-48">
              <Select value={selectedDepot} onValueChange={setSelectedDepot}>
                <SelectTrigger><SelectValue placeholder="Dépôt" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les dépôts</SelectItem>
                  {depots.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Liste des Livreurs ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Livreur</TableHead><TableHead>Téléphone</TableHead>
                <TableHead>Email</TableHead><TableHead>Dépôt</TableHead>
                <TableHead>Statut</TableHead><TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-8">Aucun livreur trouvé</TableCell></TableRow>
              ) : filtered.map(l => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2"><User className="h-4 w-4 text-orange-500" />{l.name}</div>
                  </TableCell>
                  <TableCell><div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" />{l.phone}</div></TableCell>
                  <TableCell><div className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" />{l.email}</div></TableCell>
                  <TableCell><div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" />{getDepotName(l.depotId)}</div></TableCell>
                  <TableCell><Badge variant={l.isActive ? 'default' : 'secondary'}>{l.isActive ? 'Actif' : 'Inactif'}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(l)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="outline" size="sm" onClick={() => handleToggle(l)}>{l.isActive ? 'Désactiver' : 'Activer'}</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
