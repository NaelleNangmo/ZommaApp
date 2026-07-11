'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { LoginForm } from '@/components/auth/login-form';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { AdminGlobalDashboard } from '@/components/dashboard/admin-global-dashboard';
import { AdminDepotDashboard } from '@/components/dashboard/admin-depot-dashboard';
import { VendeurDashboard } from '@/components/dashboard/vendeur-dashboard';
import { LivreurDashboard } from '@/components/dashboard/livreur-dashboard';
import { ProductManagement } from '@/components/products/product-management';
import { ProfilePage } from '@/components/profile/profile-page';
import { DepotManagement } from '@/components/depots/depot-management';
import { FournisseurManagement } from '@/components/fournisseurs/fournisseur-management';
import { StockManagement } from '@/components/stocks/stock-management';
import { UserManagement } from '@/components/users/user-management';
import { LivreurManagement } from '@/components/livreurs/livreur-management';
import { SalesManagement } from '@/components/sales/sales-management';
import { LivraisonManagement } from '@/components/livraisons/livraison-management';
import { TransfertManagement } from '@/components/transferts/transfert-management';
import { RetourManagement } from '@/components/retours/retour-management';
import { TaskManagement } from '@/components/tasks/task-management';
import { ReportManagement } from '@/components/reports/report-management';

export default function Home() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'admin_global':
        return <AdminGlobalDashboard />;
      case 'admin_depot':
        return <AdminDepotDashboard />;
      case 'vendeur':
        return <VendeurDashboard />;
      case 'livreur':
        return <LivreurDashboard />;
      default:
        return <AdminGlobalDashboard />;
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return renderDashboard();
      case 'profile':
        return <ProfilePage />;
      case 'products':
        return <ProductManagement />;
      case 'depots':
        return <DepotManagement />;
      case 'fournisseurs':
        return <FournisseurManagement />;
      case 'stocks':
        return <StockManagement />;
      case 'users':
        return <UserManagement />;
      case 'livreurs':
        return <LivreurManagement />;
      case 'sales':
        return <SalesManagement />;
      case 'livraisons':
        return <LivraisonManagement />;
      case 'transferts':
        return <TransfertManagement />;
      case 'retours':
        return <RetourManagement />;
      case 'tasks':
        return <TaskManagement />;
      case 'reports':
        return <ReportManagement />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex">
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}