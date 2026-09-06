import { useState } from 'react';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { ProductImage } from '../components/catalog/ProductImage';
import { money } from '../lib/api';
import type { Product } from '../types/catalog';

const BagIcon: IconSvgElement = [['path', { d: 'M7 9h10l1 11H6L7 9Z' }], ['path', { d: 'M9 9V7a3 3 0 0 1 6 0v2' }]];
const HeartIcon: IconSvgElement = [['path', { d: 'M12 20s-7-4.2-9-8.6C1.6 8.2 3.7 5 7 5c2 0 3.2 1.1 5 3 1.8-1.9 3-3 5-3 3.3 0 5.4 3.2 4 6.4C19 15.8 12 20 12 20Z' }]];
const PlusIcon: IconSvgElement = [['path', { d: 'M12 5v14' }], ['path', { d: 'M5 12h14' }]];
const MinusIcon: IconSvgElement = [['path', { d: 'M5 12h14' }]];

type ProductDetailsPageProps = {
  product: Product;
  onBack: () => void;
  onAddToCart: (quantity: number) => void;
  onVendorClick: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
};

export default function ProductDetailsPage({ product, onBack, onAddToCart, onVendorClick, onToggleFavorite, isFavorite }: ProductDetailsPageProps) {
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  return (
    <section className="mx-auto max-w-3xl pb-3">
      <div className="mb-4 flex items-center justify-between px-1">
        <button type="button" onClick={onBack} className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-white text-[#171717] shadow-[0_7px_16px_rgb(18_16_14_/_0.08)] transition duration-200 hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#a8d843]" aria-label="Back to products"><span className="text-2xl leading-none">&#8249;</span></button>
        <h2 className="m-0 text-xl font-black text-[#171717]">Details</h2>
      </div>

      <div className="rounded-[28px] bg-white p-3 shadow-[0_20px_55px_rgb(42_37_30_/_0.08)] sm:p-5">
        <div className="aspect-[1.15] overflow-hidden rounded-[22px] bg-[#e7e7e7] sm:aspect-[1.45]"><ProductImage product={product} /></div>
        <div className="flex justify-center gap-1.5 py-3" aria-label="Product image position"><span className="h-1.5 w-1.5 rounded-full bg-[#d1d1d1]" /><span className="h-1.5 w-6 rounded-full bg-[#101010]" /><span className="h-1.5 w-1.5 rounded-full bg-[#d1d1d1]" /></div>

        <div className="px-1 sm:px-2">
          <div className="flex items-start justify-between gap-3">
            <div><p className="m-0 text-xs font-bold text-[#999]">Men Footwear</p><h1 className="mb-0 mt-1 text-2xl font-black leading-tight text-[#171717]">{product.name}</h1></div>
            <button type="button" onClick={onToggleFavorite} className={`flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#ededeb] bg-white transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#a8d843] ${isFavorite ? 'text-[#a8d843]' : 'text-[#9a9a9a]'}`} aria-label={`${isFavorite ? 'Remove' : 'Save'} ${product.name} from favorites`}><HugeiconsIcon icon={HeartIcon} size={20} strokeWidth={1.7} /></button>
          </div>

          <button type="button" onClick={onVendorClick} className="mt-4 flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-left focus:outline-none focus:ring-2 focus:ring-[#a8d843] focus:ring-offset-2"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d8f0cf] text-xs font-black text-[#171717]">{product.vendor.name.slice(0, 2).toUpperCase()}</span><span className="min-w-0"><strong className="block truncate text-sm font-black text-[#171717]">{product.vendor.name}</strong><span className="block text-[11px] font-bold text-[#999]">View store</span></span></button>

          <div className="mt-5 flex justify-end"><div><p className="m-0 text-right text-xs font-bold text-[#999]">QTY</p><div className="mt-2 flex items-center gap-2 rounded-lg bg-[#f1f1ef] p-1"><button type="button" onClick={() => setSelectedQuantity((current) => Math.max(1, current - 1))} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border-0 bg-white text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#a8d843]" aria-label="Decrease quantity"><HugeiconsIcon icon={MinusIcon} size={14} strokeWidth={2} /></button><span className="min-w-5 text-center text-sm font-black">{selectedQuantity}</span><button type="button" onClick={() => setSelectedQuantity((current) => current + 1)} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border-0 bg-white text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#a8d843]" aria-label="Increase quantity"><HugeiconsIcon icon={PlusIcon} size={14} strokeWidth={2} /></button></div></div></div>

          <div className="mt-5 border-t border-[#f0f0ee] pt-4"><p className="m-0 text-xs font-bold text-[#999]">Description</p><p className="mb-0 mt-2 text-sm font-semibold leading-6 text-[#666]">{product.description || 'Product details from vendor catalog.'}</p></div>
        </div>
      </div>

      <div className="sticky bottom-3 mt-3 flex items-center justify-between gap-4 rounded-[24px] bg-white px-4 py-3 shadow-[0_18px_45px_rgb(24_24_24_/_0.14)] sm:px-5"><div><p className="m-0 text-xs font-bold text-[#999]">Total price</p><strong className="mt-1 block text-xl font-black text-[#171717]">{money(Number(product.price) * selectedQuantity)}</strong></div><button type="button" onClick={() => onAddToCart(selectedQuantity)} className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-full border-0 bg-[#a8d843] px-5 text-sm font-black text-[#121212] transition duration-200 hover:bg-[#101010] hover:text-white active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#a8d843]"><HugeiconsIcon icon={BagIcon} size={19} strokeWidth={1.8} />Add {selectedQuantity} to Cart</button></div>
    </section>
  );
}
