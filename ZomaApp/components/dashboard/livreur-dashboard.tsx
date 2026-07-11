'use client';

import React from 'react';
import { StatsCard } from './stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { mockLivraisons } from '@/lib/mock-data';
import { useAuth } from '@/contexts/auth-context';

export const LivreurDashboard: React.FC = () => {
  const { user } = useAuth();
  
  const myLivraisons = mockLivraisons.filter(l => l.livreurId === user?.id);
  const pendingLivraisons = myLivraisons.filter(l => l.status === 'pending');
  const inProgressLivraisons = myLivraisons.filter(l => l.status === 'in_progress');
  const completedLivraisons = myLivraisons.filter(l => l.status === 'completed');

  const todayLivraisons = myLivraisons.filter(livraison => {
    const today = new Date();
    return livraison.scheduledDate.toDateString() === today.toDateString();
  });

  const handleStartLivraison = (livraisonId: string) => {
    console.log('Starting livraison:', livraisonId);
    // In a real app, this would update the status in the database
  };

  const handleCompleteLivraison = (livraisonId: string) => {
    console.log('Completing livraison:', livraisonId);
    // In a real app, this would update the status and completion time
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mes Livraisons</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Tableau de bord livreur</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Aujourd'hui"
          value={todayLivraisons.length}
          description="Livraisons du jour"
          icon={Clock}
        />
        <StatsCard
          title="En Attente"
          value={pendingLivraisons.length}
          description="À démarrer"
          icon={AlertCircle}
        />
        <StatsCard
          title="En Cours"
          value={inProgressLivraisons.length}
          description="En progression"
          icon={Truck}
        />
        <StatsCard
          title="Terminées"
          value={completedLivraisons.length}
          description="Livrées"
          icon={CheckCircle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Livraisons du Jour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayLivraisons.length > 0 ? (
                todayLivraisons.map((livraison) => (
                  <div key={livraison.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">Livraison #{livraison.id}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {livraison.scheduledDate.toLocaleTimeString()}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {livraison.totalAmount.toLocaleString()} FCFA
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        livraison.status === 'completed' ? 'default' : 
                        livraison.status === 'in_progress' ? 'secondary' : 'outline'
                      }>
                        {livraison.status === 'completed' ? 'Terminée' : 
                         livraison.status === 'in_progress' ? 'En cours' : 'En attente'}
                      </Badge>
                      {livraison.status === 'pending' && (
                        <Button size="sm" onClick={() => handleStartLivraison(livraison.id)}>
                          Démarrer
                        </Button>
                      )}
                      {livraison.status === 'in_progress' && (
                        <Button size="sm" onClick={() => handleCompleteLivraison(livraison.id)}>
                          Terminer
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Aucune livraison aujourd'hui</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Toutes Mes Livraisons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myLivraisons.slice(0, 5).map((livraison) => (
                <div key={livraison.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">Livraison #{livraison.id}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {livraison.scheduledDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{livraison.totalAmount.toLocaleString()} FCFA</p>
                    <Badge variant={
                      livraison.status === 'completed' ? 'default' : 
                      livraison.status === 'in_progress' ? 'secondary' : 'outline'
                    }>
                      {livraison.status === 'completed' ? 'Terminée' : 
                       livraison.status === 'in_progress' ? 'En cours' : 'En attente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Mes Performances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Taux de Réussite</h4>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {myLivraisons.length > 0 ? Math.round((completedLivraisons.length / myLivraisons.length) * 100) : 0}%
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">livraisons terminées</p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-100">Temps Moyen</h4>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                2.5h
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">par livraison</p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Total Livré</h4>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {myLivraisons.reduce((sum, l) => sum + l.totalAmount, 0).toLocaleString()}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">FCFA</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};