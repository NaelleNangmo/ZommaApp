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
import { Plus, Search, ArrowLeftRight, Calendar, Package, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Product, Depot } from '@/lib/mock-data';
import { mapProduct, mapDepot } from '@/lib/mappers';
import { DataService } from '@/lib/services/data-service';
import { useAuth } from '@/contexts/auth-context';
import { useBackend } from '@/contexts/backend-context';
import { DataPagination, usePagination } from '@/components/ui/data-pagination';

interface Transfert {
  id: string; productId: string; fromDepotId: string; toDepotId: string;
  quantity: number; status: 'pending' | 'approved' | 'in_transit' | 'completed' | 'rejected';
  requestedBy: string; requestedAt: Date; approvedBy?: string; notes?: string;
}

export const TransfertManagement: React.FC = () => {
  const { user } = useAuth();
  const { backendReady } = useBackend();
  const [transferts, setTransferts] = useState<Transfert[]>([]);
  const [products, setProducts]     = useState<Product[]>([]);
  const [depots, setDepots]         = useState<Depot[]>([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm]           = useState('');
  const [selectedStatus, setSelectedStatus]   = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ productId:'', fromDepotId:'', toDepotId:'', quantity:'', notes:'' });

  const isAdminGlobal = user?.role === 'admin_global';
  const isAdmin       = user?.role === 'admin_global' || user?.role === 'admin_depot';
  const userDepotId   = user?.depotId ?? '';

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rawP, rawD] = await Promise.all([DataService.getProducts(), DataService.getDepots()]);
      setProducts(rawP.map(mapProduct));
      setDepots(rawD.map(mapDepot));
    } catch (err) { toast.error('Erreur chargement: ' + err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (backendReady !== null) fetchData(); }, [backendReady, fetchData]);

  const resetForm = () => setFormData({ productId:'', fromDepotId:'', toDepotId:'', quantity:'', notes:'' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.productId || !formData.fromDepotId || !formData.toDepotId || !formData.quantity) {
      toast.error('Remplissez tous les champs obligatoires'); return;
    }
    if (formData.fromDepotId === formData.toDepotId) {
      toast.error('Source et destination doivent etre differents'); return;
    }
    const qty = parseInt(formData.quantity);
    if (isNaN(qty) || qty <= 0) { toast.error('Quantite invalide'); return; }
    const newT: Transfert = {
      id: Date.now().toString(), productId: formData.productId,
      fromDepotId: formData.fromDepotId, toDepotId: formData.toDepotId,
      quantity: qty, status: 'pending',
      requestedBy: user?.name ?? 'Utilisateur', requestedAt: new Date(), notes: formData.notes,
    };
    setTransferts(prev => [newT, ...prev]);
    toast.success('Transfert demande'); resetForm(); setIsAddDialogOpen(false);
  };

  const handleStatusChange = (id: string, s: string) => {
    setTransferts(prev => prev.map(t => t.id === id ? { ...t, status: s as any, approvedBy: user?.name } : t));
    toast.success('Statut mis a jour');
  };

  const filtered = transferts.filter(t => {
    if (!isAdminGlobal && userDepotId && t.fromDepotId !== userDepotId && t.toDepotId !== userDepotId) return false;
    const pName = products.find(p => p.id === t.productId)?.name ?? '';
    return pName.toLowerCase().includes(searchTerm.toLowerCase()) && (selectedStatus === 'all' || t.status === selectedStatus);
  });

  const { slice: pageItems, paginationProps } = usePagination(filtered, 10);

  const getProductName = (id: string) => products.find(p => p.id === id)?.name ?? 'Inconnu';
  const getDepotName   = (id: string) => depots.find(d => d.id === id)?.name ?? 'Inconnu';

  const statusCls: Record<string,string> = { pending:'text-orange-600', approved:'bg-blue-100 text-blue-700', in_transit:'bg-purple-100 text-purple-700', completed:'bg-green-100 text-green-700', rejected:'bg-red-100 text-red-700' };
  const statusLbl: Record<string,string> = { pending:'En attente', approved:'Approuve', in_transit:'En transit', completed:'Termine', rejected:'Rejete' };
  const statusBadge = (s: string) => <Badge variant='outline' className={statusCls[s]??''}>{statusLbl[s]??s}</Badge>;

  const pendingCount   = filtered.filter(t => t.status === 'pending').length;
  const approvedCount  = filtered.filter(t => t.status === 'approved').length;
  const completedCount = filtered.filter(t => t.status === 'completed').length;

  if (loading) return (<div className='flex items-center justify-center h-64'><Loader2 className='h-8 w-8 animate-spin text-blue-500'/><span className='ml-2'>Chargement...</span></div>);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>Transferts Inter-Depots</h1>
          <p className='text-gray-600 dark:text-gray-400 mt-2'>Transferts de stock entre depots</p>
        </div>
        {isAdmin && (
          <Dialog open={isAddDialogOpen} onOpenChange={o => { setIsAddDialogOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild><Button onClick={resetForm}><Plus className='h-4 w-4 mr-2'/>Nouveau Transfert</Button></DialogTrigger>
            <DialogContent className='sm:max-w-lg'>
              <DialogHeader><DialogTitle>Demander un Transfert Inter-Depots</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className='space-y-4 pt-2'>
                <div className='space-y-1.5'><Label>Produit *</Label>
                  <Select value={formData.productId} onValueChange={v=>setFormData(f=>({...f,productId:v}))}>
                    <SelectTrigger><SelectValue placeholder='Produit'/></SelectTrigger>
                    <SelectContent>{products.filter(p=>p.isActive).map(p=><SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select></div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-1.5'><Label>Depot source *</Label>
                    <Select value={formData.fromDepotId} onValueChange={v=>setFormData(f=>({...f,fromDepotId:v}))}>
                      <SelectTrigger><SelectValue placeholder='De'/></SelectTrigger>
                      <SelectContent>{depots.map(d=><SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                    </Select></div>
                  <div className='space-y-1.5'><Label>Depot destination *</Label>
                    <Select value={formData.toDepotId} onValueChange={v=>setFormData(f=>({...f,toDepotId:v}))}>
                      <SelectTrigger><SelectValue placeholder='Vers'/></SelectTrigger>
                      <SelectContent>{depots.filter(d=>d.id!==formData.fromDepotId).map(d=><SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                    </Select></div>
                </div>
                <div className='space-y-1.5'><Label>Quantite *</Label>
                  <Input type='number' min='1' value={formData.quantity} onChange={e=>setFormData(f=>({...f,quantity:e.target.value}))} required/></div>
                <div className='space-y-1.5'><Label>Notes</Label>
                  <Input placeholder='Raison du transfert...' value={formData.notes} onChange={e=>setFormData(f=>({...f,notes:e.target.value}))}/></div>
                <Button type='submit' className='w-full'>Demander le Transfert</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card><CardContent className='pt-6'><div className='flex items-center justify-between'><div><p className='text-sm text-gray-600 dark:text-gray-400'>En Attente</p><p className='text-2xl font-bold text-orange-600'>{pendingCount}</p></div><ArrowLeftRight className='h-8 w-8 text-orange-500'/></div></CardContent></Card>
        <Card><CardContent className='pt-6'><div className='flex items-center justify-between'><div><p className='text-sm text-gray-600 dark:text-gray-400'>Approuves</p><p className='text-2xl font-bold text-blue-600'>{approvedCount}</p></div><CheckCircle className='h-8 w-8 text-blue-500'/></div></CardContent></Card>
        <Card><CardContent className='pt-6'><div className='flex items-center justify-between'><div><p className='text-sm text-gray-600 dark:text-gray-400'>Termines</p><p className='text-2xl font-bold text-green-600'>{completedCount}</p></div><Package className='h-8 w-8 text-green-500'/></div></CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle className='flex items-center gap-2'><Search className='h-5 w-5'/>Filtres</CardTitle></CardHeader>
        <CardContent><div className='flex flex-col sm:flex-row gap-4'>
          <div className='flex-1 relative'><Search className='absolute left-3 top-3 h-4 w-4 text-gray-400'/><Input placeholder='Rechercher...' value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className='pl-10'/></div>
          <div className='w-48'><Select value={selectedStatus} onValueChange={setSelectedStatus}><SelectTrigger><SelectValue placeholder='Statut'/></SelectTrigger><SelectContent><SelectItem value='all'>Tous</SelectItem><SelectItem value='pending'>En attente</SelectItem><SelectItem value='approved'>Approuve</SelectItem><SelectItem value='in_transit'>En transit</SelectItem><SelectItem value='completed'>Termine</SelectItem><SelectItem value='rejected'>Rejete</SelectItem></SelectContent></Select></div>
        </div></CardContent></Card>

      <Card><CardHeader><CardTitle>Transferts ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Produit</TableHead><TableHead>Trajet</TableHead>
              <TableHead>Qte</TableHead><TableHead>Demande par</TableHead>
              <TableHead>Date</TableHead><TableHead>Statut</TableHead><TableHead>Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {pageItems.length===0?(
                <TableRow><TableCell colSpan={7} className='text-center py-10 text-gray-500'>{transferts.length===0?'Aucun transfert':'Aucun resultat'}</TableCell></TableRow>
              ):pageItems.map(t=>(
                <TableRow key={t.id}>
                  <TableCell className='font-medium'><div className='flex items-center gap-2'><Package className='h-4 w-4 text-orange-500'/>{getProductName(t.productId)}</div></TableCell>
                  <TableCell><div className='flex items-center gap-1.5 text-sm'><span>{getDepotName(t.fromDepotId)}</span><ArrowLeftRight className='h-3.5 w-3.5 text-blue-400'/><span>{getDepotName(t.toDepotId)}</span></div></TableCell>
                  <TableCell className='font-medium'>{t.quantity}</TableCell>
                  <TableCell className='text-sm'>{t.requestedBy}</TableCell>
                  <TableCell><div className='flex items-center gap-1.5 text-sm'><Calendar className='h-3.5 w-3.5 text-gray-400'/>{t.requestedAt.toLocaleDateString('fr-FR')}</div></TableCell>
                  <TableCell>{statusBadge(t.status)}</TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      {isAdminGlobal&&t.status==='pending'&&(<>
                        <Button variant='outline' size='sm' className='text-green-600' onClick={()=>handleStatusChange(t.id,'approved')}><CheckCircle className='h-4 w-4'/></Button>
                        <Button variant='outline' size='sm' className='text-red-600' onClick={()=>handleStatusChange(t.id,'rejected')}><XCircle className='h-4 w-4'/></Button>
                      </>)}
                      {t.status==='approved'&&<Button variant='outline' size='sm' onClick={()=>handleStatusChange(t.id,'in_transit')}>Expedier</Button>}
                      {t.status==='in_transit'&&<Button variant='outline' size='sm' onClick={()=>handleStatusChange(t.id,'completed')}>Recevoir</Button>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <DataPagination {...paginationProps}/>
        </CardContent></Card>
    </div>
  );
};
