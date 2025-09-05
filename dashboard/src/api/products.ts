import type { Meta } from '@/types/api';

export async function fetchProducts(): Promise<Meta[]> {
  const res = await fetch(
    'https://challenge-cdn.real.piccoma-ext.com/fe/api/products'
  );
  if (!res.ok) {
    throw new Error('Failed to fetch meta data');
  }
  return res.json();
}
