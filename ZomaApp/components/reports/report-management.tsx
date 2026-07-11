'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart3, FileText, Download, TrendingUp, Package, Loader2, RefreshCw } from 'lucide-react';
import { Sale, Stock, Livraison, Depot, Product } from '@/lib/mock-data';
import { mapSale, mapStock, mapLivraison, mapDepot, mapProduct } from '@/lib/mappers';
import { DataService } from '@/lib/services/data-service';
import { useAuth } from '@/contexts/auth-context';
import { useBackend } from '@/contexts/backend-context';

export const ReportManagement: React.FC = () => {
  const { user } = useAuth();
  const { backendReady } = useBackend();
  const [sales, setSales] = useState<Sale[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [depots, setDepots] = useState<Depot[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [reportType, setReportType] = useState('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDepot, setSelectedDepot] = useState('all');

  const isAdminGlobal = user?.role === 'admin_global';
  const userDepotId = user?.depotId;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [rs, rk, rl, rd, rp] = await Promise.all([
        DataService.getSales(),
        DataService.getStocks(),
        DataService.getLivraisons(),
        DataService.getDepots(),
        DataService.getProducts(),
      ]);
      setSales(rs.map(mapSale));
      setStocks(rk.map(mapStock));
      setLivraisons(rl.map(mapLivraison));
      setDepots(rd.map(mapDepot));
      setProducts(rp.map(mapProduct));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (backendReady !== null) fetchAll();
  }, [backendReady, fetchAll]);

  // ─── Filtres communs ──────────────────────────────────────────────────────
  const applyDepotFilter = <T extends { depotId: string }>(arr: T[]) => {
    if (!isAdminGlobal && userDepotId) return arr.filter(x => x.depotId === userDepotId);
    if (selectedDepot !== 'all') return arr.filter(x => x.depotId === selectedDepot);
    return arr;
  };

  const applyDateFilter = <T extends { createdAt?: Date; scheduledDate?: Date }>(arr: T[]) => {
    if (!startDate || !endDate) return arr;
    const s = new Date(startDate);
    const e = new Date(endDate); e.setHours(23,59,59);
    return arr.filter(x => {
      const d = x.createdAt ?? x.scheduledDate;
      return d && d >= s && d <= e;
    });
  };

  const salesData    = applyDateFilter(applyDepotFilter(sales));
  const stockData    = applyDepotFilter(stocks);
  const livraisonData = applyDateFilter(applyDepotFilter(
    livraisons.map(l => ({ ...l, createdAt: l.scheduledDate }))
  ));

  // ─── KPIs sommaire ────────────────────────────────────────────────────────
  const totalRevenu   = salesData.reduce((s, x) => s + x.totalAmount, 0);
  const totalQty      = salesData.reduce((s, x) => s + x.quantity, 0);
  const totalStockVal = stockData.reduce((s, x) => s + x.quantity * (x.prixAchat ?? 0), 0);
  const lowStockCount = stockData.filter(x => x.quantity <= (x.seuilStock ?? 0)).length;

  // ─── Ventes par produit (rapport global) ─────────────────────────────────
  const salesByProduct: Record<string, { name: string; qty: number; revenue: number }> = {};
  salesData.forEach(s => {
    const key = s.productId;
    if (!salesByProduct[key]) salesByProduct[key] = { name: s.productName ?? key, qty: 0, revenue: 0 };
    salesByProduct[key].qty += s.quantity;
    salesByProduct[key].revenue += s.totalAmount;
  });
  const topProducts = Object.values(salesByProduct).sort((a, b) => b.revenue - a.revenue);

  // ─── Ventes par dépôt (rapport global) ───────────────────────────────────
  const salesByDepot: Record<string, { name: string; revenue: number; qty: number }> = {};
  salesData.forEach(s => {
    const key = s.depotId;
    if (!salesByDepot[key]) salesByDepot[key] = { name: s.depotName ?? key, revenue: 0, qty: 0 };
    salesByDepot[key].revenue += s.totalAmount;
    salesByDepot[key].qty += s.quantity;
  });
  const depotPerf = Object.values(salesByDepot).sort((a, b) => b.revenue - a.revenue);

  // ─── Export CSV ───────────────────────────────────────────────────────────
  const exportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (reportType === 'sales') {
      headers = ['Date','Produit','Dépôt','Quantité','Prix Unitaire','Total (FCFA)'];
      rows = salesData.map(s => [
        s.createdAt.toLocaleDateString('fr-FR'),
        s.productName ?? s.productId,
        s.depotName ?? s.depotId,
        String(s.quantity),
        String(s.unitPrice),
        String(s.totalAmount),
      ]);
    } else if (reportType === 'stock') {
      headers = ['Produit','Dépôt','Quantité','Seuil','Statut','Valeur (FCFA)'];
      rows = stockData.map(s => [
        s.productName ?? s.productId,
        s.depotName ?? s.depotId,
        String(s.quantity),
        String(s.seuilStock ?? 0),
        s.quantity <= (s.seuilStock ?? 0) ? 'Faible' : 'Normal',
        String(s.quantity * (s.prixAchat ?? 0)),
      ]);
    } else if (reportType === 'livraisons') {
      headers = ['Date prévue','Fournisseur','Dépôt','Livreur','Montant (FCFA)','Statut'];
      rows = livraisonData.map(l => [
        l.scheduledDate.toLocaleDateString('fr-FR'),
        (l as any).fournisseurName ?? l.fournisseurId,
        (l as any).depotName ?? l.depotId,
        (l as any).livreurName ?? l.livreurId,
        String(l.totalAmount),
        l.status,
      ]);
    } else {
      headers = ['Produit','Quantité Vendue','CA (FCFA)'];
      rows = topProducts.map(p => [p.name, String(p.qty), String(p.revenue)]);
    }

    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `rapport_${reportType}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const statusLabel = (s: string) =>
    ({ completed:'Terminée', in_progress:'En cours', pending:'En attente', cancelled:'Annulée' }[s] ?? s);

  const statusVariant = (s: string): 'default' | 'secondary' | 'destructive' | 'outline' =>
    ({ completed:'default', in_progress:'secondary', pending:'outline', cancelled:'destructive' }[s] as any ?? 'outline');

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <span className="ml-2 text-gray-600">Chargement des données...</span>
    </div>
  );

  return (
    <div className="space-y-6 print:space-y-4">

      {/* En-tête */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Rapports & Analyses</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Analysez les performances de ZOMA SARL</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAll}><RefreshCw className="h-4 w-4 mr-2" />Actualiser</Button>
          <Button variant="outline" onClick={() => window.print()}><FileText className="h-4 w-4 mr-2" />Imprimer</Button>
          <Button onClick={exportCSV}><Download className="h-4 w-4 mr-2" />Exporter CSV</Button>
        </div>
      </div>

      {/* En-tête impression */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-2xl font-bold">ZOMA SARL — Rapport d'Activité</h1>
        <p className="text-gray-600">Généré le {new Date().toLocaleDateString('fr-FR')}</p>
        {startDate && endDate && (
          <p className="text-gray-600">Période : du {new Date(startDate).toLocaleDateString('fr-FR')} au {new Date(endDate).toLocaleDateString('fr-FR')}</p>
        )}
      </div>

      {/* Paramètres */}
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Paramètres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Type de rapport</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Ventes</SelectItem>
                  <SelectItem value="stock">Stocks</SelectItem>
                  <SelectItem value="livraisons">Livraisons</SelectItem>
                  <SelectItem value="global">Résumé Global</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isAdminGlobal && (
              <div className="space-y-2">
                <Label>Dépôt</Label>
                <Select value={selectedDepot} onValueChange={setSelectedDepot}>
                  <SelectTrigger><SelectValue placeholder="Tous les dépôts" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les dépôts</SelectItem>
                    {depots.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Date de début</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Date de fin</Label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Chiffre d'Affaires</p>
              <p className="text-2xl font-bold text-green-700">{totalRevenu.toLocaleString()}</p>
              <p className="text-xs text-gray-400">FCFA</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-400" />
          </div>
        </CardContent></Card>

        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Qté Vendue</p>
              <p className="text-2xl font-bold text-blue-700">{totalQty.toLocaleString()}</p>
              <p className="text-xs text-gray-400">unités ({salesData.length} ventes)</p>
            </div>
            <Package className="h-8 w-8 text-blue-400" />
          </div>
        </CardContent></Card>

        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Valeur Stock</p>
              <p className="text-2xl font-bold text-orange-700">{totalStockVal.toLocaleString()}</p>
              <p className="text-xs text-gray-400">FCFA</p>
            </div>
            <Package className="h-8 w-8 text-orange-400" />
          </div>
        </CardContent></Card>

        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Alertes Stock</p>
              <p className="text-2xl font-bold text-red-700">{lowStockCount}</p>
              <p className="text-xs text-gray-400">produits sous seuil</p>
            </div>
            <Package className="h-8 w-8 text-red-400" />
          </div>
        </CardContent></Card>
      </div>

      {/* ── Rapport Ventes ─────────────────────────────────────────────── */}
      {reportType === 'sales' && (
        <Card>
          <CardHeader><CardTitle>Rapport des Ventes ({salesData.length} transactions)</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Produit</TableHead>
                  {isAdminGlobal && <TableHead>Dépôt</TableHead>}
                  <TableHead>Qté</TableHead>
                  <TableHead>Prix Unit.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesData.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-8">Aucune vente sur la période</TableCell></TableRow>
                ) : salesData.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="text-sm">{s.createdAt.toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell className="font-medium">{s.productName ?? s.productId}</TableCell>
                    {isAdminGlobal && <TableCell className="text-sm text-gray-600">{s.depotName ?? s.depotId}</TableCell>}
                    <TableCell>{s.quantity} {s.unit}</TableCell>
                    <TableCell>{s.unitPrice.toLocaleString()} FCFA</TableCell>
                    <TableCell className="text-right font-semibold">{s.totalAmount.toLocaleString()} FCFA</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {salesData.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-end gap-8">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total quantité</p>
                  <p className="font-bold">{totalQty.toLocaleString()} unités</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total CA</p>
                  <p className="font-bold text-green-700">{totalRevenu.toLocaleString()} FCFA</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Rapport Stock ──────────────────────────────────────────────── */}
      {reportType === 'stock' && (
        <Card>
          <CardHeader><CardTitle>Rapport des Stocks ({stockData.length} références)</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  {isAdminGlobal && <TableHead>Dépôt</TableHead>}
                  <TableHead>Quantité</TableHead>
                  <TableHead>Seuil</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Valeur</TableHead>
                  <TableHead>Dernière MAJ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockData.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-8">Aucun stock</TableCell></TableRow>
                ) : stockData.map(s => {
                  const isLow = s.quantity <= (s.seuilStock ?? 0);
                  const val = s.quantity * (s.prixAchat ?? 0);
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.productName ?? s.productId}</TableCell>
                      {isAdminGlobal && <TableCell className="text-sm text-gray-600">{s.depotName ?? s.depotId}</TableCell>}
                      <TableCell>
                        <span className={isLow ? 'text-red-600 font-semibold' : 'text-green-700'}>
                          {s.quantity} {s.unit}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-500">{s.seuilStock ?? 0} {s.unit}</TableCell>
                      <TableCell>
                        <Badge variant={isLow ? 'destructive' : 'default'}>
                          {isLow ? 'Faible' : 'Normal'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{val.toLocaleString()} FCFA</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {s.lastUpdated.toLocaleDateString('fr-FR')}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {stockData.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Valeur totale du stock</p>
                  <p className="font-bold text-orange-700">{totalStockVal.toLocaleString()} FCFA</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Rapport Livraisons ─────────────────────────────────────────── */}
      {reportType === 'livraisons' && (
        <Card>
          <CardHeader><CardTitle>Rapport des Livraisons ({livraisonData.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date prévue</TableHead>
                  <TableHead>Fournisseur</TableHead>
                  {isAdminGlobal && <TableHead>Dépôt</TableHead>}
                  <TableHead>Livreur</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {livraisonData.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-8">Aucune livraison</TableCell></TableRow>
                ) : livraisonData.map(l => (
                  <TableRow key={l.id}>
                    <TableCell className="text-sm">{l.scheduledDate.toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell className="font-medium">{(l as any).fournisseurName ?? l.fournisseurId}</TableCell>
                    {isAdminGlobal && <TableCell className="text-sm text-gray-600">{(l as any).depotName ?? l.depotId}</TableCell>}
                    <TableCell className="text-sm">{(l as any).livreurName ?? l.livreurId}</TableCell>
                    <TableCell className="text-right">{l.totalAmount.toLocaleString()} FCFA</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(l.status)}>{statusLabel(l.status)}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {livraisonData.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between">
                <div className="flex gap-6 text-sm">
                  {['completed','in_progress','pending'].map(st => (
                    <div key={st}>
                      <span className="text-gray-500">{statusLabel(st)}: </span>
                      <span className="font-semibold">{livraisonData.filter(l => l.status === st).length}</span>
                    </div>
                  ))}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Montant total</p>
                  <p className="font-bold">{livraisonData.reduce((s,l) => s+l.totalAmount,0).toLocaleString()} FCFA</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Résumé Global ─────────────────────────────────────────────── */}
      {reportType === 'global' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Top Produits par CA</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topProducts.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Aucune donnée</p>
                  ) : topProducts.slice(0,8).map((p, i) => {
                    const pct = topProducts[0].revenue > 0 ? Math.round((p.revenue / topProducts[0].revenue) * 100) : 0;
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{p.name}</span>
                          <span className="text-gray-600">{p.revenue.toLocaleString()} FCFA ({p.qty} unités)</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Performance par Dépôt</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {depotPerf.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Aucune donnée</p>
                  ) : depotPerf.map((d, i) => {
                    const pct = depotPerf[0].revenue > 0 ? Math.round((d.revenue / depotPerf[0].revenue) * 100) : 0;
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{d.name}</span>
                          <span className="text-gray-600">{d.revenue.toLocaleString()} FCFA</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tableau récap */}
          <Card>
            <CardHeader><CardTitle>Tableau Récapitulatif</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead className="text-right">Qté Vendue</TableHead>
                    <TableHead className="text-right">CA (FCFA)</TableHead>
                    <TableHead className="text-right">CA %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-gray-500 py-8">Aucune vente</TableCell></TableRow>
                  ) : topProducts.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-right">{p.qty.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{p.revenue.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        {totalRevenu > 0 ? Math.round((p.revenue / totalRevenu) * 100) : 0}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pied de page impression */}
      <div className="hidden print:block text-center mt-8 pt-4 border-t">
        <p className="text-sm text-gray-600">ZOMA SARL — Système de Gestion des Dépôts | Rapport automatique</p>
      </div>
    </div>
  );
};
