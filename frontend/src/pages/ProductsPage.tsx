import { useEffect, useState } from 'react';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { useSearchParams } from 'react-router-dom';
import { ProductImage } from '../components/catalog/ProductImage';
import SectionTitle from '../components/ui/SectionTitle';
import { api, money } from '../lib/api';
import type { ApiResponse, Product } from '../types/catalog';

const SearchIcon: IconSvgElement = [['circle', { cx: 11, cy: 11, r: 7 }], ['path', { d: 'm16 16 4 4' }]];
const PlusIcon: IconSvgElement = [['path', { d: 'M12 5v14' }], ['path', { d: 'M5 12h14' }]];

type ProductsPageProps = {
  onOpenProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
};

export default function ProductsPage({ onOpenProduct, onAddToCart }: ProductsPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // oxlint-disable-next-line react/set-state-in-effect
    setLoading(true);
    api.get<ApiResponse<Product[]>>('/products/search', { params: { q: query } })
      .then((response) => {
        if (!cancelled) setProducts(response.data.data);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <section className="mx-auto max-w-6xl">
      <div className="rounded-[28px] bg-white p-4 shadow-[0_20px_55px_rgb(42_37_30_/_0.08)] md:p-6">
        <SectionTitle title="All products" />
        <form onSubmit={(event) => { event.preventDefault(); setSearchParams(query.trim() ? { q: query.trim() } : {}); }} className="mb-6 flex h-12 items-center gap-3 rounded-full bg-[#f7f7f5] px-4 text-[#8e8e8e] shadow-inner">
          <HugeiconsIcon icon={SearchIcon} size={19} strokeWidth={1.6} />
          <input className="w-full border-0 bg-transparent text-sm font-semibold text-[#202020] outline-0 placeholder:text-[#9c9c9c]" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products or stores" aria-label="Search all products" />
          <button type="submit" className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-white text-[#0d0d0d] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#a8d843]" aria-label="Search all products"><HugeiconsIcon icon={SearchIcon} size={18} strokeWidth={1.7} /></button>
        </form>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => <div className="h-80 animate-pulse rounded-2xl bg-[#f1f1ef]" key={index} />)}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article className="overflow-hidden rounded-2xl bg-[#f7f7f5] p-3" key={product.id}>
                <button type="button" onClick={() => onOpenProduct(product)} className="block h-56 w-full cursor-pointer overflow-hidden rounded-xl border-0 bg-[#e7e7e7] p-0 text-left focus:outline-none focus:ring-2 focus:ring-[#a8d843]" aria-label={`View ${product.name}`}><ProductImage product={product} /></button>
                <div className="pt-4"><button type="button" onClick={() => onOpenProduct(product)} className="block w-full cursor-pointer truncate border-0 bg-transparent p-0 text-left focus:outline-none focus:ring-2 focus:ring-[#a8d843]"><h3 className="m-0 truncate text-base font-black text-[#171717]">{product.name}</h3><p className="m-0 mt-1 truncate text-sm font-bold text-[#858585]">{product.vendor.name}</p></button><div className="mt-4 flex items-center justify-between gap-3"><strong className="text-lg font-black text-[#171717]">{money(product.price)}</strong><button type="button" onClick={() => onAddToCart(product)} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border-0 bg-[#101010] px-4 text-sm font-extrabold text-white transition hover:bg-[#a8d843] hover:text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#a8d843]"><HugeiconsIcon icon={PlusIcon} size={17} strokeWidth={2} />Add</button></div></div>
              </article>
            ))}
          </div>
        ) : <div className="rounded-2xl bg-[#f7f7f5] p-10 text-center text-sm font-bold text-[#777]">No products match your search.</div>}
      </div>
    </section>
  );
}
