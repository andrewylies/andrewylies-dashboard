import type { Sales } from '@/types/api';

export async function fetchSales(): Promise<Sales[]> {
  const res = await fetch(
    'https://challenge-cdn.real.piccoma-ext.com/fe/api/sales'
  );
  if (!res.ok) {
    throw new Error('Failed to fetch sales data');
  }
  return res.json();
}
