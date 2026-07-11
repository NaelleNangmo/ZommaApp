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
import { Plus, Edit, Search, Users, Mail, Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Depot } from '@/lib/mock-data';
import { mapDepot } from '@/lib/mappers';
import { DataService } from '@/lib/services/data-service';
import { useBackend } from '@/contexts/backend-context';

// ... (mapUser défini plus bas dans le fichier)

interface AppUser {
  id: string; name: string; email: string;
  role: 'admin_global' | 'admin_depot' | 'vendeur' | 'livreur';
  depot_id?: string; depotName?: string;
  is_active: boolean; created_at: string;
}

function mapUser(row: any): AppUser {
  return {
    id: row.id, name: row.name, email: row.email,
    role: row.role,
    depot_id: row.depot_id ?? row.depotId,
    depotName: row.depot_name ?? row.depotName,
    is_active: row.is_active ?? row.isActive ?? true,
    created_at: row.created_at ?? row.createdAt,
  };
}

export const UserManagement: React.FC = () => {
  const { backendReady } = useBackend();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [depots, setDepots] = useState<Depot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', role: '', depotId: '', password: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rawUsers, rawDepots] = await Promise.all([DataService.getUsers(), DataService.getDepots()]);
      setUsers(rawUsers.map(mapUser));
      setDepots(rawDepots.map(mapDepot));
    } catch (err: any) { toast.error('Erreur chargement utilisateurs: ' + err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (backendReady !== null) fetchData();
  }, [backendReady, fetchData]);

  const resetForm = () => { setFormData({ name:'', email:'', role:'', depotId:'', password:'' }); setEditingUser(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingUser) {
        await DataService.updateUser(editingUser.id, {
          name: formData.name, email: formData.email,
          role: formData.role, depotId: formData.depotId || null,
          isActive: editingUser.is_active,
        });
      } else {
        await DataService.createUser({
          name: formData.name, email: formData.email,
          role: formData.role, depotId: formData.depotId || null,
          password: formData.password,
        });
      }
      await fetchData();
      resetForm();
      setIsAddDialogOpen(false);
      toast.success(editingUser ? 'Utilisateur modifié' : 'Utilisateur créé');
    } catch (err: any) { toast.error('Erreur: ' + err.message); }
    finally { setSaving(false); }
  };

  const handleEdit = (u: AppUser) => {
    setEditingUser(u);
    setFormData({ name: u.name, email: u.email, role: u.role, depotId: u.depot_id ?? '', password: '' });
    setIsAddDialogOpen(true);
  };

  const handleToggle = async (u: AppUser) => {
    try {
      await DataService.updateUser(u.id, {
        name: u.name, email: u.email, role: u.role,
        depotId: u.depot_id ?? null, isActive: !u.is_active,
      });
      await fetchData();
      toast.success('Statut mis à jour');
    } catch (err: any) { toast.error('Erreur: ' + err.message); }
  };

  const roleLabel = (r: string) => ({ admin_global:'Admin Global', admin_depot:'Admin Dépôt', vendeur:'Vendeur', livreur:'Livreur' }[r] ?? r);

  const filtered = users.filter(u => {
    const ms = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const mr = selectedRole === 'all' || u.role === selectedRole;
    return ms && mr;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <span className="ml-2 text-gray-600">Chargement des utilisateurs...</span>
    </div>
  );

  const needsDepot = ['admin_depot','vendeur','livreur'].includes(formData.role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Utilisateurs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Gérez les comptes et permissions</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={o => { setIsAddDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}><Plus className="h-4 w-4 mr-2" />Ajouter un Utilisateur</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingUser ? "Modifier l'Utilisateur" : 'Ajouter un Utilisateur'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nom complet</Label>
                <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Rôle</Label>
                <Select value={formData.role} onValueChange={v => setFormData(f => ({ ...f, role: v, depotId: '' }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionnez un rôle" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin_global">Admin Global</SelectItem>
                    <SelectItem value="admin_depot">Admin Dépôt</SelectItem>
                    <SelectItem value="vendeur">Vendeur</SelectItem>
                    <SelectItem value="livreur">Livreur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {needsDepot && (
                <div className="space-y-2">
                  <Label>Dépôt</Label>
                  <Select value={formData.depotId} onValueChange={v => setFormData(f => ({ ...f, depotId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Sélectionnez un dépôt" /></SelectTrigger>
                    <SelectContent>
                      {depots.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {!editingUser && (
                <div className="space-y-2">
                  <Label>Mot de passe</Label>
                  <div className="relative">
                    <Input type={showPassword ? 'text' : 'password'} value={formData.password}
                      onChange={e => setFormData(f => ({ ...f, password: e.target.value }))} required />
                    <Button type="button" variant="ghost" size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(s => !s)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingUser ? 'Modifier' : 'Ajouter'}
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
              <Input placeholder="Rechercher..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="w-full sm:w-48">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger><SelectValue placeholder="Rôle" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="admin_global">Admin Global</SelectItem>
                  <SelectItem value="admin_depot">Admin Dépôt</SelectItem>
                  <SelectItem value="vendeur">Vendeur</SelectItem>
                  <SelectItem value="livreur">Livreur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Utilisateurs ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead><TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead><TableHead>Dépôt</TableHead>
                <TableHead>Statut</TableHead><TableHead>Créé le</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-gray-500 py-8">Aucun utilisateur trouvé</TableCell></TableRow>
              ) : filtered.map(u => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2"><Users className="h-4 w-4 text-orange-500" />{u.name}</div>
                  </TableCell>
                  <TableCell><div className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" />{u.email}</div></TableCell>
                  <TableCell><div className="flex items-center gap-2"><Shield className="h-4 w-4 text-gray-400" />{roleLabel(u.role)}</div></TableCell>
                  <TableCell>{u.depotName ?? (u.depot_id ? u.depot_id.slice(0,8)+'…' : '—')}</TableCell>
                  <TableCell><Badge variant={u.is_active ? 'default' : 'secondary'}>{u.is_active ? 'Actif' : 'Inactif'}</Badge></TableCell>
                  <TableCell>{new Date(u.created_at).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(u)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="outline" size="sm" onClick={() => handleToggle(u)}>{u.is_active ? 'Désactiver' : 'Activer'}</Button>
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
