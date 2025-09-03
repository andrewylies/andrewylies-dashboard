import { useSalesQuery } from '@/hooks/useSalesQuery.ts';
import { useProductsQuery } from '@/hooks/useProductsQuery.ts';

export function useDashboardData() {
  const productsQuery = useProductsQuery();
  const salesQuery = useSalesQuery();

  const isLoading = productsQuery.isLoading || salesQuery.isLoading;
  const error = productsQuery.error || salesQuery.error;

  return {
    isLoading,
    error,
    products: productsQuery.data,
    sales: salesQuery.data,
  };
}
