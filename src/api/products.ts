import type { Meta } from '@/types/api';

export async function fetchProducts(): Promise<Meta[]> {
  const res = await fetch(
    'https://dashboard-mocking-api.vercel.app/api/products'
  );
  if (!res.ok) {
    throw new Error('Failed to fetch meta data');
  }
  return res.json();
}
