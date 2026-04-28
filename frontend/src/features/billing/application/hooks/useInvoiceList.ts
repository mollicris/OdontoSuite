import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { invoiceService } from '../invoice.service';

interface UseInvoiceListParams {
  patientId?: string;
  status?: string;
  skip?: number;
  take?: number;
}

export function useInvoiceList(params: UseInvoiceListParams = {}) {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: invoices = [], isLoading, error, refetch } = useQuery({
    queryKey: ['invoices', params.patientId, params.status, page],
    queryFn: async () => {
      return invoiceService.list({
        patientId: params.patientId,
        status: params.status,
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
    },
    staleTime: 30_000,
  });

  const stats = useMemo(() => {
    if (invoices.length === 0) {
      return {
        total: 0,
        pending: 0,
        overdue: 0,
        paid: 0,
      };
    }

    return {
      total: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      pending: invoices
        .filter((inv) => inv.status === 'PENDING')
        .reduce((sum, inv) => sum + inv.remainingAmount, 0),
      overdue: invoices
        .filter((inv) => inv.status === 'OVERDUE')
        .reduce((sum, inv) => sum + inv.remainingAmount, 0),
      paid: invoices
        .filter((inv) => inv.status === 'PAID')
        .reduce((sum, inv) => sum + inv.totalAmount, 0),
    };
  }, [invoices]);

  return {
    invoices,
    isLoading,
    error: error ? (error as any)?.response?.data?.message || 'Error al cargar facturas' : null,
    refetch,
    page,
    setPage,
    pageSize,
    stats,
  };
}
