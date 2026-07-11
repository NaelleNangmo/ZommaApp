'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, ArrowLeftRight, Calendar, Package, CheckCircle, XCircle } from 'lucide-react';
import { mockProducts, mockDepots } from '@/lib/mock-data';
import { useAuth } from '@/contexts/auth-context';

interface Transfert {
  id: string;
  productId: string;
  fromDepotId: string;
  toDepotId: string;
  quantity: number;
  status: 'pending' | 'approved' | 'in_transit' | 'completed' | 'rejected';
  requestedBy: string;
  requestedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  completedAt?: Date;
  notes?: string;
}

const mockTransferts: Transfert[] = [
  {
    id: '1',
    productId: '1',
    fromDepotId: '1',
    toDepotId: '2',
    quantity: 50,
    status: 'pending',
    requestedBy: 'Admin Dépôt 2',
    requestedAt: new Date('2024-01-20'),
    notes: 'Stock faible, besoin urgent',
  },
  {
    id: '2',
    productId: '2',
    fromDepotId: '2',
    toDepotId: '1',
    quantity: 100,
    status: 'completed',
    requestedBy: 'Admin Dépôt 1',
    requestedAt: new Date('2024-01-18'),
    approvedBy: 'Admin Global',
    approvedAt: new Date('2024-01-18'),
    completedAt: new Date('2024-01-19'),
  },
];

export const TransfertManagement: React.FC = () => {
  const { user } = useAuth();
  const [transferts, setTransferts] = useState<Transfert[]>(mockTransferts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    productId: '',
    fromDepotId: '',
    toDepotId: '',
    quantity: '',
    notes: '',
  });

  const userDepotId = user?.depotId;
  const isAdminGlobal = user?.role === 'admin_global';

  const filteredTransferts = transferts.filter(transfert => {
    // Filter by user's depot if not admin global
    if (!isAdminGlobal && userDepotId && 
        transfert.fromDepotId !== userDepotId && transfert.toDepotId !== userDepotId) {
      return false;
    }

    const product = mockProducts.find(p => p.id === transfert.productId);
    const matchesSearch = product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfert.id.includes(searchTerm);
    const matchesStatus = selectedStatus === 'all' || transfert.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newTransfert: Transfert = {
      id: Date.now().toString(),
      productId: formData.productId,
      fromDepotId: formData.fromDepotId,
      toDepotId: formData.toDepotId,
      quantity: parseInt(formData.quantity),
      status: 'pending',
      requestedBy: user?.name || 'Utilisateur',
      requestedAt: new Date(),
      notes: formData.notes,
    };

    setTransferts([newTransfert, ...transferts]);

    setFormData({
      productId: '',
      fromDepotId: '',
      toDepotId: '',
      quantity: '',
      notes: '',
    });
    setIsAddDialogOpen(false);
  };

  const handleStatusChange = (transfertId: string, newStatus: string) => {
    setTransferts(transferts.map(t =>
      t.id === transfertId
        ? {
            ...t,
            status: newStatus as any,
            approvedBy: newStatus === 'approved' ? user?.name : t.approvedBy,
            approvedAt: newStatus === 'approved' ? new Date() : t.approvedAt,
            completedAt: newStatus === 'completed' ? new Date() : t.completedAt,
          }
        : t
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">En attente</Badge>;
      case 'approved':
        return <Badge variant="secondary">Approuvé</Badge>;
      case 'in_transit':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">En transit</Badge>;
      case 'completed':
        return <Badge variant="default">Terminé</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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

  const pendingCount = filteredTransferts.filter(t => t.status === 'pending').length;
  const approvedCount = filteredTransferts.filter(t => t.status === 'approved').length;
  const completedCount = filteredTransferts.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transferts Inter-Dépôts</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Gérez les transferts de stock entre dépôts</p>
        </div>
        {(user?.role === 'admin_depot' || user?.role === 'admin_global') && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setFormData({
                  productId: '',
                  fromDepotId: '',
                  toDepotId: '',
                  quantity: '',
                  notes: '',
                });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Transfert
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Demander un Transfert</DialogTitle>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromDepot">Dépôt source</Label>
                    <Select value={formData.fromDepotId} onValueChange={(value) => setFormData({...formData, fromDepotId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="De" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockDepots.map((depot) => (
                          <SelectItem key={depot.id} value={depot.id}>
                            {depot.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="toDepot">Dépôt destination</Label>
                    <Select value={formData.toDepotId} onValueChange={(value) => setFormData({...formData, toDepotId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Vers" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockDepots.filter(d => d.id !== formData.fromDepotId).map((depot) => (
                          <SelectItem key={depot.id} value={depot.id}>
                            {depot.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                  <Label htmlFor="notes">Notes (optionnel)</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Raison du transfert, urgence..."
                  />
                </div>

                <Button type="submit" className="w-full">
                  Demander le Transfert
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
              <ArrowLeftRight className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approuvés</p>
                <p className="text-2xl font-bold text-blue-600">{approvedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Terminés</p>
                <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              </div>
              <Package className="h-8 w-8 text-green-500" />
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
                  placeholder="Rechercher un transfert..."
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
                  <SelectItem value="in_transit">En transit</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="rejected">Rejeté</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Transferts ({filteredTransferts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>De → Vers</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Demandé par</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransferts.map((transfert) => (
                <TableRow key={transfert.id}>
                  <TableCell className="font-medium">#{transfert.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-orange-500" />
                      {getProductName(transfert.productId)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{getDepotName(transfert.fromDepotId)}</span>
                      <ArrowLeftRight className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{getDepotName(transfert.toDepotId)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{transfert.quantity}</TableCell>
                  <TableCell>{transfert.requestedBy}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {transfert.requestedAt.toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(transfert.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isAdminGlobal && transfert.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(transfert.id, 'approved')}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(transfert.id, 'rejected')}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {transfert.status === 'approved' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(transfert.id, 'in_transit')}
                        >
                          Expédier
                        </Button>
                      )}
                      {transfert.status === 'in_transit' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(transfert.id, 'completed')}
                        >
                          Recevoir
                        </Button>
                      )}
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