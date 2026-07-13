'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, RotateCcw, Calendar, Package, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Product, Depot } from '@/lib/mock-data';
import { mapProduct, mapDepot } from '@/lib/mappers';
import { DataService } from '@/lib/services/data-service';
import { useAuth } from '@/contexts/auth-context';
import { useBackend } from '@/contexts/backend-context';
import { DataPagination, usePagination } from '@/components/ui/data-pagination';

interface Retour {
  id: string; productId: string; depotId: string; quantity: number;
  reason: string; status: 'pending' | 'approved' | 'rejected' | 'processed';
  returnType: 'defective' | 'expired' | 'customer_return' | 'overstock';
  processedBy?: string; processedAt?: Date; refundAmount?: number;
  notes?: string; createdAt: Date; createdBy: string;
}

export const RetourManagement: React.FC = () => {
  const { user } = useAuth();
  const { backendReady } = useBackend();
  const [retours, setRetours]   = useState<Retour[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [depots, setDepots]     = useState<Depot[]>([]);
  const [loading, setLoading]   = useState(true);
  const [searchTerm, setSearchTerm]           = useState('');
  const [selectedStatus, setSelectedStatus]   = useState<string>('all');
  const [selectedType, setSelectedType]       = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ productId:'', quantity:'', reason:'', returnType:'', notes:'' });

  const isAdminGlobal = user?.role === 'admin_global';
  const isCanCreate   = ['vendeur','admin_depot','admin_global'].includes(user?.role ?? '');
  const userDepotId   = user?.depotId ?? '';

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rawP, rawD] = await Promise.all([DataService.getProducts(), DataService.getDepots()]);
      setProducts(rawP.map(mapProduct));
      setDepots(rawD.map(mapDepot));
    } catch (err: any) { toast.error('Erreur: ' + err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (backendReady !== null) fetchData(); }, [backendReady, fetchData]);

  const resetForm = () => setFormData({ productId:'', quantity:'', reason:'', returnType:'', notes:'' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || !formData.quantity || !formData.reason || !formData.returnType) {
      toast.error('Remplissez tous les champs'); return;
    }
    const newR: Retour = {
      id: Date.now().toString(), productId: formData.productId, depotId: userDepotId,
      quantity: parseInt(formData.quantity), reason: formData.reason, status: 'pending',
      returnType: formData.returnType as any, notes: formData.notes,
      createdAt: new Date(), createdBy: user?.name ?? 'Utilisateur',
    };
    setRetours(prev => [newR, ...prev]);
    toast.success('Retour enregistre'); resetForm(); setIsAddDialogOpen(false);
  };

  const handleStatusChange = (id: string, s: string) => {
    setRetours(prev => prev.map(r => r.id === id ? { ...r, status: s as any, processedBy: user?.name, processedAt: new Date() } : r));
    toast.success('Statut mis a jour');
  };

  const getProductName = (pid: string) => products.find(p => p.id === pid)?.name ?? 'Inconnu';
  const getDepotName   = (did: string) => depots.find(d => d.id === did)?.name ?? 'Inconnu';

  const statusBadge = (s: string) => {
    const m: Record<string,string> = { pending:'text-orange-600', approved:'bg-green-100 text-green-700', rejected:'bg-red-100 text-red-700', processed:'bg-blue-100 text-blue-700' };
    const l: Record<string,string> = { pending:'En attente', approved:'Approuve', rejected:'Rejete', processed:'Traite' };
    return <Badge variant='outline' className={m[s]??''}>{l[s]??s}</Badge>;
  };
  const typeBadge = (t: string) => {
    const l: Record<string,string> = { defective:'Defectueux', expired:'Expire', customer_return:'Retour client', overstock:'Surstock' };
    return <Badge variant='secondary'>{l[t]??t}</Badge>;
  };

  const filtered = retours.filter(r => {
    if (!isAdminGlobal && userDepotId && r.depotId !== userDepotId) return false;
    const pName = products.find(p => p.id === r.productId)?.name ?? '';
    const ms = pName.toLowerCase().includes(searchTerm.toLowerCase()) || r.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return ms && (selectedStatus === 'all' || r.status === selectedStatus) && (selectedType === 'all' || r.returnType === selectedType);
  });

  const { slice: pageItems, paginationProps } = usePagination(filtered, 10);
  const pendingCount  = filtered.filter(r => r.status === 'pending').length;
  const approvedCount = filtered.filter(r => r.status === 'approved').length;
  const totalRefunds  = filtered.reduce((s, r) => s + (r.refundAmount ?? 0), 0);

  if (loading) return (<div className='flex items-center justify-center h-64'><Loader2 className='h-8 w-8 animate-spin text-blue-500'/><span className='ml-2'>Chargement...</span></div>);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>Gestion des Retours</h1>
          <p className='text-gray-600 dark:text-gray-400 mt-2'>Retours de produits et remboursements</p>
        </div>
        {isCanCreate && (
          <Dialog open={isAddDialogOpen} onOpenChange={o => { setIsAddDialogOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild><Button onClick={resetForm}><Plus className='h-4 w-4 mr-2'/>Nouveau Retour</Button></DialogTrigger>
            <DialogContent className='sm:max-w-lg'>
              <DialogHeader><DialogTitle>Enregistrer un Retour</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className='space-y-4 pt-2'>
                <div className='space-y-1.5'><Label>Produit *</Label>
                  <Select value={formData.productId} onValueChange={v=>setFormData(f=>({...f,productId:v}))}><SelectTrigger><SelectValue placeholder='Produit'/></SelectTrigger>
                  <SelectContent>{products.filter(p=>p.isActive).map(p=><SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
                <div className='space-y-1.5'><Label>Type *</Label>
                  <Select value={formData.returnType} onValueChange={v=>setFormData(f=>({...f,returnType:v}))}><SelectTrigger><SelectValue placeholder='Type'/></SelectTrigger>
                  <SelectContent><SelectItem value='defective'>Defectueux</SelectItem><SelectItem value='expired'>Expire</SelectItem><SelectItem value='customer_return'>Retour client</SelectItem><SelectItem value='overstock'>Surstock</SelectItem></SelectContent></Select></div>
                <div className='space-y-1.5'><Label>Quantite *</Label><Input type='number' min='1' value={formData.quantity} onChange={e=>setFormData(f=>({...f,quantity:e.target.value}))} required/></div>
                <div className='space-y-1.5'><Label>Raison *</Label><Textarea value={formData.reason} onChange={e=>setFormData(f=>({...f,reason:e.target.value}))} placeholder='Raison...' required/></div>
                <div className='space-y-1.5'><Label>Notes</Label><Textarea value={formData.notes} onChange={e=>setFormData(f=>({...f,notes:e.target.value}))} placeholder='Notes...'/></div>
                <Button type='submit' className='w-full'>Enregistrer</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card><CardContent className='pt-6'><div className='flex items-center justify-between'><div><p className='text-sm text-gray-600 dark:text-gray-400'>En Attente</p><p className='text-2xl font-bold text-orange-600'>{pendingCount}</p></div><AlertTriangle className='h-8 w-8 text-orange-500'/></div></CardContent></Card>
        <Card><CardContent className='pt-6'><div className='flex items-center justify-between'><div><p className='text-sm text-gray-600 dark:text-gray-400'>Approuves</p><p className='text-2xl font-bold text-green-600'>{approvedCount}</p></div><RotateCcw className='h-8 w-8 text-green-500'/></div></CardContent></Card>
        <Card><CardContent className='pt-6'><div className='flex items-center justify-between'><div><p className='text-sm text-gray-600 dark:text-gray-400'>Remboursements</p><p className='text-2xl font-bold'>{totalRefunds.toLocaleString()} FCFA</p></div><Package className='h-8 w-8 text-blue-500'/></div></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className='flex items-center gap-2'><Search className='h-5 w-5'/>Filtres</CardTitle></CardHeader>
        <CardContent><div className='flex flex-col sm:flex-row gap-4'>
          <div className='flex-1 relative'><Search className='absolute left-3 top-3 h-4 w-4 text-gray-400'/><Input placeholder='Rechercher...' value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className='pl-10'/></div>
          <div className='w-44'><Select value={selectedStatus} onValueChange={setSelectedStatus}><SelectTrigger><SelectValue placeholder='Statut'/></SelectTrigger><SelectContent><SelectItem value='all'>Tous</SelectItem><SelectItem value='pending'>En attente</SelectItem><SelectItem value='approved'>Approuve</SelectItem><SelectItem value='rejected'>Rejete</SelectItem><SelectItem value='processed'>Traite</SelectItem></SelectContent></Select></div>
          <div className='w-44'><Select value={selectedType} onValueChange={setSelectedType}><SelectTrigger><SelectValue placeholder='Type'/></SelectTrigger><SelectContent><SelectItem value='all'>Tous</SelectItem><SelectItem value='defective'>Defectueux</SelectItem><SelectItem value='expired'>Expire</SelectItem><SelectItem value='customer_return'>Retour client</SelectItem><SelectItem value='overstock'>Surstock</SelectItem></SelectContent></Select></div>
        </div></CardContent></Card>
      <Card><CardHeader><CardTitle>Retours ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Produit</TableHead>{isAdminGlobal&&<TableHead>Depot</TableHead>}<TableHead>Qte</TableHead><TableHead>Type</TableHead><TableHead>Raison</TableHead><TableHead>Statut</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {pageItems.length===0?(
                <TableRow><TableCell colSpan={isAdminGlobal?8:7} className='text-center py-10 text-gray-500'>{retours.length===0?'Aucun retour':'Aucun resultat'}</TableCell></TableRow>
              ):pageItems.map(r=>(
                <TableRow key={r.id}>
                  <TableCell className='font-medium'><div className='flex items-center gap-2'><Package className='h-4 w-4 text-orange-500'/>{getProductName(r.productId)}</div></TableCell>
                  {isAdminGlobal&&<TableCell className='text-sm text-gray-600'>{getDepotName(r.depotId)}</TableCell>}
                  <TableCell>{r.quantity}</TableCell>
                  <TableCell>{typeBadge(r.returnType)}</TableCell>
                  <TableCell className='max-w-xs truncate text-sm'>{r.reason}</TableCell>
                  <TableCell>{statusBadge(r.status)}</TableCell>
                  <TableCell><div className='flex items-center gap-1.5 text-sm'><Calendar className='h-3.5 w-3.5 text-gray-400'/>{r.createdAt.toLocaleDateString('fr-FR')}</div></TableCell>
                  <TableCell>
                    {r.status==='pending'&&(user?.role==='admin_depot'||user?.role==='admin_global')&&(
                      <div className='flex gap-2'>
                        <Button variant='outline' size='sm' className='text-green-600' onClick={()=>handleStatusChange(r.id,'approved')}>Approuver</Button>
                        <Button variant='outline' size='sm' className='text-red-600' onClick={()=>handleStatusChange(r.id,'rejected')}>Rejeter</Button>
                      </div>
                    )}
                    {r.status==='approved'&&<Button variant='outline' size='sm' onClick={()=>handleStatusChange(r.id,'processed')}>Traiter</Button>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <DataPagination {...paginationProps}/>
        </CardContent>
      </Card>
    </div>
  );
};
