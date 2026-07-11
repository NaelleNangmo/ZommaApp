'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu,
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

interface MobileNavProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentPage, onPageChange }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

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

  const handlePageChange = (page: string) => {
    onPageChange(page);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Z</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">ZOMA SARL</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Gestion des Dépôts</p>
            </div>
          </div>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.key}
                variant={currentPage === item.key ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  currentPage === item.key && 'bg-blue-500 hover:bg-blue-600 text-white'
                )}
                onClick={() => handlePageChange(item.key)}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};