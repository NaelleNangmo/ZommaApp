'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface DataPaginationProps {
  /** Nombre total d'éléments filtrés */
  total: number;
  /** Page courante (1-indexed) */
  page: number;
  /** Nombre d'éléments par page */
  pageSize: number;
  /** Callback changement de page */
  onPageChange: (page: number) => void;
  /** Callback changement de taille de page */
  onPageSizeChange?: (size: number) => void;
  /** Options de taille de page */
  pageSizeOptions?: number[];
  className?: string;
}

export function DataPagination({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className,
}: DataPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  // Génère les numéros de pages à afficher (max 5 boutons)
  const getPages = (): (number | '…')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages: (number | '…')[] = [1];
    if (page > 3) pages.push('…');

    const start = Math.max(2, page - 1);
    const end   = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (page < totalPages - 2) pages.push('…');
    pages.push(totalPages);
    return pages;
  };

  if (total === 0) return null;

  return (
    <div className={cn(
      'flex flex-col sm:flex-row items-center justify-between gap-3 px-1 pt-4 pb-1',
      className
    )}>
      {/* Compteur */}
      <p className="text-sm text-gray-500 dark:text-gray-400 shrink-0">
        {from}–{to} sur <span className="font-medium text-gray-700 dark:text-gray-300">{total}</span>
      </p>

      {/* Navigation + sélecteur de taille */}
      <div className="flex items-center gap-2">

        {/* Sélecteur taille de page */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-gray-500 hidden sm:inline">Lignes</span>
            <Select
              value={String(pageSize)}
              onValueChange={v => { onPageSizeChange(Number(v)); onPageChange(1); }}
            >
              <SelectTrigger className="h-8 w-16 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map(s => (
                  <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Première page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          title="Première page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>

        {/* Page précédente */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          title="Page précédente"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        {/* Numéros de pages */}
        <div className="hidden sm:flex items-center gap-1">
          {getPages().map((p, i) =>
            p === '…' ? (
              <span key={`ellipsis-${i}`} className="w-8 text-center text-sm text-gray-400 select-none">
                …
              </span>
            ) : (
              <Button
                key={p}
                variant={p === page ? 'default' : 'outline'}
                size="icon"
                className={cn('h-8 w-8 text-sm font-medium transition-all',
                  p === page && 'pointer-events-none shadow-sm'
                )}
                onClick={() => onPageChange(p as number)}
              >
                {p}
              </Button>
            )
          )}
        </div>

        {/* Page actuelle sur mobile */}
        <span className="sm:hidden text-sm text-gray-600 dark:text-gray-400 px-1">
          {page} / {totalPages}
        </span>

        {/* Page suivante */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          title="Page suivante"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>

        {/* Dernière page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          title="Dernière page"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

/** Hook utilitaire: retourne la tranche paginée + les props à passer à DataPagination */
export function usePagination<T>(items: T[], defaultPageSize = 10) {
  const [page, setPage]           = React.useState(1);
  const [pageSize, setPageSize]   = React.useState(defaultPageSize);

  // Revenir à la page 1 quand les items changent (nouveau filtre)
  React.useEffect(() => { setPage(1); }, [items.length]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const slice      = items.slice((safePage - 1) * pageSize, safePage * pageSize);

  return {
    page: safePage,
    pageSize,
    totalPages,
    slice,
    paginationProps: {
      total: items.length,
      page: safePage,
      pageSize,
      onPageChange: setPage,
      onPageSizeChange: (s: number) => { setPageSize(s); setPage(1); },
    },
  };
}
