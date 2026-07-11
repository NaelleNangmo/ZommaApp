'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, RotateCcw, Calendar, Package, AlertTriangle } from 'lucide-react';
import { mockProducts, mockDepots } from '@/lib/mock-data';
import { useAuth } from '@/contexts/auth-context';

interface Retour {
  id: string;
  productId: string;
  depotId: string;
  quantity: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  returnType: 'defective' | 'expired' | 'customer_return' | 'overstock';
  processedBy?: string;
  processedAt?: Date;
  refundAmount?: number;
  notes?: string;
  createdAt: Date;
  createdBy: string;
}

const mockRetours: Retour[] = [
  {
    id: '1',
    productId: '1',
    depotId: '1',
    quantity: 5,
    reason: 'Produit défectueux - bouteilles cassées',
    status: 'pending',
    returnType: 'defective',
    createdAt: new Date('2024-01-20'),
    createdBy: 'Vendeur Principal',
  },
  {
    id: '2',
    productId: '2',
    depotId: '1',
    quantity: 20,
    reason: 'Date de péremption dépassée',
    status: 'approved',
    returnType: 'expired',
    processedBy: 'Admin Dépôt',
    processedAt: new Date('2024-01-19'),
    refundAmount: 4000,
    createdAt: new Date('2024-01-18'),
    createdBy: 'Vendeur Principal',
  },
];

export const RetourManagement: React.FC = () => {
  const { user } = useAuth();
  const [retours, setRetours] = useState<Retour[]>(mockRetours);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    reason: '',
    returnType: '',
    notes: '',
  });

  const userDepotId = user?.depotId;
  const isAdminGlobal = user?.role === 'admin_global';

  const filteredRetours = retours.filter(retour => {
    // Filter by user's depot if not admin global
    if (!isAdminGlobal && userDepotId && retour.depotId !== userDepotId) {
      return false;
    }

    const product = mockProducts.find(p => p.id === retour.productId);
    const matchesSearch = product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         retour.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || retour.status === selectedStatus;
    const matchesType = selectedType === 'all' || retour.returnType === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newRetour: Retour = {
      id: Date.now().toString(),
      productId: formData.productId,
      depotId: userDepotId || '1',
      quantity: parseInt(formData.quantity),
      reason: formData.reason,
      status: 'pending',
      returnType: formData.returnType as any,
      notes: formData.notes,
      createdAt: new Date(),
      createdBy: user?.name || 'Utilisateur',
    };

    setRetours([newRetour, ...retours]);

    setFormData({
      productId: '',
      quantity: '',
      reason: '',
      returnType: '',
      notes: '',
    });
    setIsAddDialogOpen(false);
  };

  const handleStatusChange = (retourId: string, newStatus: string, refundAmount?: number) => {
    setRetours(retours.map(r =>
      r.id === retourId
        ? {
            ...r,
            status: newStatus as any,
            processedBy: user?.name,
            processedAt: new Date(),
            refundAmount: refundAmount || r.refundAmount,
          }
        : r
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">En attente</Badge>;
      case 'approved':
        return <Badge variant="default">Approuvé</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeté</Badge>;
      case 'processed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Traité</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'defective':
        return <Badge variant="destructive">Défectueux</Badge>;
      case 'expired':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Expiré</Badge>;
      case 'customer_return':
        return <Badge variant="outline">Retour client</Badge>;
      case 'overstock':
        return <Badge variant="secondary">Surstock</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getProductName = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId);
    return product?.name || 'Produit inconnu';
  };

  const getDepotName = (depotId: string) => {
    const depot = mockDepots.find(d => d.id === depotId);
    return depot?.name || 'Dépôt inconnu';
  };

  const pendingCount = filteredRetours.filter(r => r.status === 'pending').length;
  const approvedCount = filteredRetours.filter(r => r.status === 'approved').length;
  const totalRefunds = filteredRetours.reduce((sum, r) => sum + (r.refundAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Retours</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Gérez les retours de produits et remboursements</p>
        </div>
        {(user?.role === 'vendeur' || user?.role === 'admin_depot' || user?.role === 'admin_global') && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setFormData({
                  productId: '',
                  quantity: '',
                  reason: '',
                  returnType: '',
                  notes: '',
                });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Retour
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enregistrer un Retour</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Produit</Label>
                  <Select value={formData.productId} onValueChange={(value) => setFormData({...formData, productId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un produit" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="returnType">Type de retour</Label>
                  <Select value={formData.returnType} onValueChange={(value) => setFormData({...formData, returnType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="defective">Produit défectueux</SelectItem>
                      <SelectItem value="expired">Produit expiré</SelectItem>
                      <SelectItem value="customer_return">Retour client</SelectItem>
                      <SelectItem value="overstock">Surstock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantité</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Raison du retour</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    placeholder="Décrivez la raison du retour..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes additionnelles</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Notes optionnelles..."
                  />
                </div>

                <Button type="submit" className="w-full">
                  Enregistrer le Retour
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Attente</p>
                <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approuvés</p>
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <RotateCcw className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Remboursements</p>
                <p className="text-2xl font-bold">{totalRefunds.toLocaleString()} FCFA</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
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
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un retour..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Approuvé</SelectItem>
                  <SelectItem value="rejected">Rejeté</SelectItem>
                  <SelectItem value="processed">Traité</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="defective">Défectueux</SelectItem>
                  <SelectItem value="expired">Expiré</SelectItem>
                  <SelectItem value="customer_return">Retour client</SelectItem>
                  <SelectItem value="overstock">Surstock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Retours ({filteredRetours.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Produit</TableHead>
                {isAdminGlobal && <TableHead>Dépôt</TableHead>}
                <TableHead>Quantité</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Raison</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRetours.map((retour) => (
                <TableRow key={retour.id}>
                  <TableCell className="font-medium">#{retour.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-orange-500" />
                      {getProductName(retour.productId)}
                    </div>
                  </TableCell>
                  {isAdminGlobal && (
                    <TableCell>{getDepotName(retour.depotId)}</TableCell>
                  )}
                  <TableCell>{retour.quantity}</TableCell>
                  <TableCell>{getTypeBadge(retour.returnType)}</TableCell>
                  <TableCell className="max-w-xs truncate">{retour.reason}</TableCell>
                  <TableCell>{getStatusBadge(retour.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {retour.createdAt.toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    {retour.status === 'pending' && (user?.role === 'admin_depot' || user?.role === 'admin_global') && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(retour.id, 'approved')}
                        >
                          Approuver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(retour.id, 'rejected')}
                        >
                          Rejeter
                        </Button>
                      </div>
                    )}
                    {retour.status === 'approved' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(retour.id, 'processed')}
                      >
                        Traiter
                      </Button>
                    )}
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