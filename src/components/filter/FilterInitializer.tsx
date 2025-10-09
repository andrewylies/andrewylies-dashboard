import { useEffect } from 'react';
import { useProductsQuery } from '@/hooks/useProductsQuery';
import { useFilterStore } from '@/stores/filterStore';

export function FilterInitializer() {
  const { data: products } = useProductsQuery();
  const setOptions = useFilterStore((s) => s.setOptions);

  useEffect(() => {
    if (products?.length) {
      setOptions(products);
    }
  }, [products, setOptions]);

  return null;
}
