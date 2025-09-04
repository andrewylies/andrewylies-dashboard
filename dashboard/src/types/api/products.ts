import type { Id } from '@/types/common.ts';

export interface Meta {
  productId: Id;
  title: string;
  status: 'A' | 'I' | 'S';
  publisher: string;
  category: string;
  genre: string;
  author: string;
  tags: string;
  startedSaleAt: string;
  thumbPath: string;
}

export interface Product extends Omit<Meta, 'tags'> {
  tags: string[];
}
