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
import { Plus, Edit, Search, Phone, Mail, MapPin, User, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Livreur, Depot } from '@/lib/mock-data';
import { mapLivreur, mapDepot } from '@/lib/mappers';
import { DataService } from '@/lib/services/data-service';
import { useBackend } from '@/contexts/backend-context';
import { DataPagination, usePagination } from '@/components/ui/data-pagination';

export const LivreurManagement: React.FC = () => {
  const { backendReady } = useBackend();

  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [depots, setDepots]     = useState<Depot[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const [searchTerm, setSearchTerm]       = useState('');
  const [selectedDepot, setSelectedDepot] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen]   = useState(false);
  const [editingLivreur, setEditingLivreur] = useState<Livreur | null>(null);

  const [form, setForm] = useState({ name: '', phone: '', email: '', depotId: '' });

  // ─── Chargement des données ──────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rawL, rawD] = await Promise.all([
        DataService.getLivreurs(),
        DataService.getDepots(),
      ]);
      const mappedL = rawL.map(mapLivreur);
      const mappedD = rawD.map(mapDepot);
      setLivreurs(mappedL);
      setDepots(mappedD);
    } catch (err: any) {
      const msg = err?.message ?? 'Erreur inconnue';
      setError(msg);
      toast.error('Erreur chargement livreurs: ' + msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (backendReady !== null) fetchData();
  }, [backendReady, fetchData]);

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const resetForm = () => {
    setForm({ name: '', phone: '', email: '', depotId: '' });
    setEditingLivreur(null);
  };

  const openAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEdit = (l: Livreur) => {
    setEditingLivreur(l);
    setForm({ name: l.name, phone: l.phone, email: l.email, depotId: l.depotId });
    setIsDialogOpen(true);
  };

  // Nom du dépôt : d'abord le champ jointé, sinon chercher dans le tableau
  const getDepotName = (l: Livreur): string => {
    if (l.depotName) return l.depotName;
    return depots.find(d => d.id === l.depotId)?.name ?? '—';
  };

  // ─── CRUD ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      toast.error('Tous les champs marqués * sont obligatoires');
      return;
    }

    setSaving(true);
    try {
      if (editingLivreur) {
        await DataService.updateLivreur(editingLivreur.id, {
          name: form.name,
          phone: form.phone,
          email: form.email,
          depotId: form.depotId || null,
          isActive: editingLivreur.isActive,
        });
        toast.success('Livreur modifié avec succès');
      } else {
        await DataService.createLivreur({
          name: form.name,
          phone: form.phone,
          email: form.email,
          depotId: form.depotId || null,
        });
        toast.success('Livreur ajouté avec succès');
      }
      resetForm();
      setIsDialogOpen(false);
      await fetchData();
    } catch (err: any) {
      toast.error('Erreur: ' + (err?.message ?? 'Erreur inconnue'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (l: Livreur) => {
    try {
      await DataService.updateLivreur(l.id, {
        name: l.name,
        phone: l.phone,
        email: l.email,
        depotId: l.depotId || null,
        isActive: !l.isActive,
      });
      toast.success(l.isActive ? 'Livreur désactivé' : 'Livreur activé');
      await fetchData();
    } catch (err: any) {
      toast.error('Erreur: ' + (err?.message ?? 'Erreur inconnue'));
    }
  };

  // ─── Filtrage ─────────────────────────────────────────────────────────────
  const filtered = livreurs.filter(l => {
    const search = searchTerm.toLowerCase();
    const matchSearch = l.name.toLowerCase().includes(search)
      || l.phone.includes(search)
      || l.email.toLowerCase().includes(search);
    const matchDepot = selectedDepot === 'all' || l.depotId === selectedDepot;
    return matchSearch && matchDepot;
  });

  const { slice: pageItems, paginationProps } = usePagination(filtered, 10);

  const activeCount   = livreurs.filter(l => l.isActive).length;
  const inactiveCount = livreurs.filter(l => !l.isActive).length;

  // ─── Rendu ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <span className="text-gray-600 dark:text-gray-400">Chargement des livreurs...</span>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <p className="text-red-600">Erreur: {error}</p>
      <Button onClick={fetchData} variant="outline">
        <RefreshCw className="h-4 w-4 mr-2" />Réessayer
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Livreurs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {livreurs.length} livreur{livreurs.length > 1 ? 's' : ''} —
            <span className="text-green-600 ml-1">{activeCount} actif{activeCount > 1 ? 's' : ''}</span>
            {inactiveCount > 0 && <span className="text-gray-400 ml-1">· {inactiveCount} inactif{inactiveCount > 1 ? 's' : ''}</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-1" />Actualiser
          </Button>

          {/* Dialog Ajouter / Modifier */}
          <Dialog open={isDialogOpen} onOpenChange={open => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button onClick={openAdd}>
                <Plus className="h-4 w-4 mr-2" />Ajouter un Livreur
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingLivreur ? 'Modifier le Livreur' : 'Ajouter un Livreur'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 pt-2">

                {/* Nom */}
                <div className="space-y-1">
                  <Label htmlFor="lv-name">Nom complet *</Label>
                  <Input
                    id="lv-name"
                    placeholder="Ex: Paul Mbarga"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>

                {/* Téléphone */}
                <div className="space-y-1">
                  <Label htmlFor="lv-phone">Téléphone *</Label>
                  <Input
                    id="lv-phone"
                    placeholder="+237 677 000 000"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <Label htmlFor="lv-email">Email *</Label>
                  <Input
                    id="lv-email"
                    type="email"
                    placeholder="livreur@zoma.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>

                {/* Dépôt */}
                <div className="space-y-1">
                  <Label htmlFor="lv-depot">Dépôt assigné</Label>
                  {depots.length === 0 ? (
                    <p className="text-sm text-orange-600 bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                      Aucun dépôt disponible — vérifiez la connexion au serveur
                    </p>
                  ) : (
                    <Select
                      value={form.depotId}
                      onValueChange={v => setForm(f => ({ ...f, depotId: v }))}
                    >
                      <SelectTrigger id="lv-depot">
                        <SelectValue placeholder="Sélectionnez un dépôt" />
                      </SelectTrigger>
                      <SelectContent>
                        {depots.map(d => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                            {!d.isActive && ' (inactif)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={saving}>
                  {saving
                    ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Enregistrement...</>
                    : editingLivreur ? 'Enregistrer les modifications' : 'Ajouter le livreur'
                  }
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4" />Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, téléphone ou email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="w-full sm:w-52">
              <Select value={selectedDepot} onValueChange={setSelectedDepot}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par dépôt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les dépôts</SelectItem>
                  {depots.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>
            Liste des Livreurs ({filtered.length}
            {filtered.length !== livreurs.length && ` / ${livreurs.length}`})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Livreur</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Dépôt</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-12">
                    {livreurs.length === 0 ? 'Aucun livreur enregistré' : 'Aucun livreur ne correspond aux filtres'}
                  </TableCell>
                </TableRow>
              ) : (
                pageItems.map(l => (
                  <TableRow key={l.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                          <User className="h-4 w-4 text-orange-600" />
                        </div>
                        <span className="font-medium">{l.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                        {l.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                        {l.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        {getDepotName(l)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={l.isActive ? 'default' : 'secondary'}>
                        {l.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(l)}
                          title="Modifier"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggle(l)}
                          className={l.isActive
                            ? 'text-red-600 hover:text-red-700 hover:border-red-300'
                            : 'text-green-600 hover:text-green-700 hover:border-green-300'
                          }
                        >
                          {l.isActive ? 'Désactiver' : 'Activer'}
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
