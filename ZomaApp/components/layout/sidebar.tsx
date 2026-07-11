'use client';

import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  Store, 
  BarChart3, 
  Users, 
  ShoppingCart, 
  ArrowLeftRight, 
  FileText, 
  Clipboard,
  UserCog,
  PackageCheck
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const { user } = useAuth();

  const getMenuItems = () => {
    const commonItems = [
      { key: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
    ];

    switch (user?.role) {
      case 'admin_global':
        return [
          ...commonItems,
          { key: 'depots', label: 'Dépôts', icon: Store },
          { key: 'products', label: 'Produits', icon: Package },
          { key: 'fournisseurs', label: 'Fournisseurs', icon: Truck },
          { key: 'stocks', label: 'Stocks', icon: PackageCheck },
          { key: 'users', label: 'Utilisateurs', icon: Users },
          { key: 'livreurs', label: 'Livreurs', icon: UserCog },
          { key: 'sales', label: 'Ventes', icon: ShoppingCart },
          { key: 'livraisons', label: 'Livraisons', icon: Truck },
          { key: 'transferts', label: 'Transferts', icon: ArrowLeftRight },
          { key: 'reports', label: 'Rapports', icon: BarChart3 },
        ];
      
      case 'admin_depot':
        return [
          ...commonItems,
          { key: 'products', label: 'Produits', icon: Package },
          { key: 'stocks', label: 'Stocks', icon: PackageCheck },
          { key: 'sales', label: 'Ventes', icon: ShoppingCart },
          { key: 'livraisons', label: 'Livraisons', icon: Truck },
          { key: 'transferts', label: 'Transferts', icon: ArrowLeftRight },
          { key: 'reports', label: 'Rapports', icon: BarChart3 },
        ];
      
      case 'vendeur':
        return [
          ...commonItems,
          { key: 'products', label: 'Produits', icon: Package },
          { key: 'stocks', label: 'Stocks', icon: PackageCheck },
          { key: 'sales', label: 'Ventes', icon: ShoppingCart },
          { key: 'retours', label: 'Retours', icon: FileText },
        ];
      
      case 'livreur':
        return [
          ...commonItems,
          { key: 'tasks', label: 'Mes Tâches', icon: Clipboard },
          { key: 'livraisons', label: 'Livraisons', icon: Truck },
        ];
      
      default:
        return commonItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="hidden md:block w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen overflow-y-auto">
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.key}
              variant={currentPage === item.key ? 'default' : 'ghost'}
              className={cn(
                'w-full justify-start',
                currentPage === item.key && 'bg-blue-500 hover:bg-blue-600 text-white'
              )}
              onClick={() => onPageChange(item.key)}
            >
              <item.icon className="h-4 w-4 mr-3" />
              {item.label}
            </Button>
          ))}
        </nav>
      </div>
    </div>
  );
};