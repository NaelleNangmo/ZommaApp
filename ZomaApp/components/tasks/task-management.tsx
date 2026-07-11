'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clipboard, Clock, CheckCircle, Calendar, MapPin, Package } from 'lucide-react';
import { mockLivraisons, mockProducts, mockDepots } from '@/lib/mock-data';
import { useAuth } from '@/contexts/auth-context';

export const TaskManagement: React.FC = () => {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const myTasks = mockLivraisons.filter(l => l.livreurId === user?.id);

  const filteredTasks = myTasks.filter(task => {
    if (selectedStatus === 'all') return true;
    return task.status === selectedStatus;
  });

  const handleStartTask = (taskId: string) => {
    console.log('Starting task:', taskId);
    // In a real app, this would update the status in the database
  };

  const handleCompleteTask = (taskId: string) => {
    console.log('Completing task:', taskId);
    // In a real app, this would update the status and completion time
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">À faire</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">En cours</Badge>;
      case 'completed':
        return <Badge variant="default">Terminée</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Annulée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDepotName = (depotId: string) => {
    const depot = mockDepots.find(d => d.id === depotId);
    return depot?.name || 'Dépôt inconnu';
  };

  const todayTasks = filteredTasks.filter(task => {
    const today = new Date();
    return task.scheduledDate.toDateString() === today.toDateString();
  });

  const pendingCount = filteredTasks.filter(t => t.status === 'pending').length;
  const inProgressCount = filteredTasks.filter(t => t.status === 'in_progress').length;
  const completedCount = filteredTasks.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mes Tâches</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Gérez vos livraisons et tâches assignées</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">À Faire</p>
                <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
              </div>
              <Clipboard className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Cours</p>
                <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Terminées</p>
                <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Tâches du Jour ({todayTasks.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todayTasks.length > 0 ? (
              todayTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">Livraison #{task.id}</span>
                      {getStatusBadge(task.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {getDepotName(task.depotId)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {task.scheduledDate.toLocaleTimeString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        {task.totalAmount.toLocaleString()} FCFA
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.status === 'pending' && (
                      <Button size="sm" onClick={() => handleStartTask(task.id)}>
                        Démarrer
                      </Button>
                    )}
                    {task.status === 'in_progress' && (
                      <Button size="sm" onClick={() => handleCompleteTask(task.id)}>
                        Terminer
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clipboard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune tâche prévue pour aujourd'hui</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Toutes Mes Tâches</CardTitle>
            <div className="w-48">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">À faire</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminées</SelectItem>
                  <SelectItem value="cancelled">Annulées</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tâche</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Date prévue</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-orange-500" />
                      Livraison #{task.id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {getDepotName(task.depotId)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {task.scheduledDate.toLocaleDateString()} à {task.scheduledDate.toLocaleTimeString()}
                    </div>
                  </TableCell>
                  <TableCell>{task.totalAmount.toLocaleString()} FCFA</TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>
                    {task.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartTask(task.id)}
                      >
                        Démarrer
                      </Button>
                    )}
                    {task.status === 'in_progress' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCompleteTask(task.id)}
                      >
                        Terminer
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