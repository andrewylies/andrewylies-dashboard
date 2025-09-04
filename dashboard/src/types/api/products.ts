export interface ApiMeta {
  productId: number;
  title: string;
  status: string;
  publisher: string;
  category: string;
  genre: string;
  author: string;
  tags: string;
  startedSaleAt: string;
  thumbPath: string;
}

export interface ApiProduct extends Omit<ApiMeta, 'tags'> {
  tags: string[];
}
