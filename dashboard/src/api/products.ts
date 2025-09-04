import type { ApiMeta } from '@/types/api';

export async function fetchMeta(): Promise<ApiMeta[]> {
  const res = await fetch(
    'https://challenge-cdn.real.piccoma-ext.com/fe/api/products'
  );
  if (!res.ok) {
    throw new Error('Failed to fetch meta data');
  }
  return res.json();
}
