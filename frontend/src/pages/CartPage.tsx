import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { ProductImage } from '../components/catalog/ProductImage';
import { money } from '../lib/api';
import type { CartItem } from '../types/catalog';

const BagIcon: IconSvgElement = [['path', { d: 'M7 9h10l1 11H6L7 9Z' }], ['path', { d: 'M9 9V7a3 3 0 0 1 6 0v2' }]];
const PlusIcon: IconSvgElement = [['path', { d: 'M12 5v14' }], ['path', { d: 'M5 12h14' }]];
const MinusIcon: IconSvgElement = [['path', { d: 'M5 12h14' }]];

type CartPageProps = {
  cart: CartItem[];
  cartTotal: number;
  onBack: () => void;
  onQuantityChange: (productId: string, nextQuantity: number) => void;
  onCheckout: () => void;
  onProductClick: (productId: string) => void;
  onVendorClick: (vendor: CartItem['product']['vendor']) => void;
  checkoutLoading: boolean;
  canCheckout: boolean;
};

export default function CartPage({ cart, cartTotal, onBack, onQuantityChange, onCheckout, onProductClick, onVendorClick, checkoutLoading, canCheckout }: CartPageProps) {
  return (
    <section className="mx-auto max-w-5xl pb-4">
      <div className="mb-5 flex items-center justify-between">
        <button type="button" onClick={onBack} className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-white text-[#171717] shadow-[0_7px_16px_rgb(18_16_14_/_0.08)] transition duration-200 hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#a8d843]" aria-label="Back to products">
          <span className="text-2xl leading-none">&#8249;</span>
        </button>
        <h2 className="m-0 text-xl font-black text-[#171717]">Cart</h2>
        <span className="flex h-11 min-w-11 items-center justify-center rounded-full bg-white px-3 text-sm font-black text-[#171717] shadow-[0_7px_16px_rgb(18_16_14_/_0.08)]">{cart.length}</span>
      </div>

      {cart.length === 0 ? (
        <div className="rounded-[28px] bg-white px-6 py-20 text-center shadow-[0_20px_55px_rgb(42_37_30_/_0.08)]">
          <HugeiconsIcon icon={BagIcon} size={42} strokeWidth={1.5} className="mx-auto text-[#a8d843]" />
          <h3 className="mb-2 mt-5 text-xl font-black text-[#171717]">Your cart is empty</h3>
          <p className="m-0 text-sm font-bold text-[#777]">Add a product to see it here.</p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="space-y-3">
            {cart.map((item) => (
              <article className="grid grid-cols-[112px_minmax(0,1fr)] gap-4 rounded-[24px] bg-white p-3 shadow-[0_12px_30px_rgb(24_24_24_/_0.06)] sm:grid-cols-[160px_minmax(0,1fr)] sm:p-4" key={item.product.id}>
                <button type="button" onClick={() => onProductClick(item.product.id)} className="aspect-square cursor-pointer overflow-hidden rounded-2xl border-0 bg-[#e7e7e7] p-0 text-left focus:outline-none focus:ring-2 focus:ring-[#a8d843]" aria-label={`View ${item.product.name}`}><ProductImage product={item.product} /></button>
                <div className="flex min-w-0 flex-col justify-between py-1">
                  <div>
                    <button type="button" onClick={() => onVendorClick(item.product.vendor)} className="cursor-pointer border-0 bg-transparent p-0 text-left text-xs font-extrabold uppercase tracking-[0.08em] text-[#9a9a9a] hover:text-[#8aa72c] focus:outline-none focus:ring-2 focus:ring-[#a8d843]">{item.product.vendor.name}</button>
                    <button type="button" onClick={() => onProductClick(item.product.id)} className="mb-1 mt-2 block w-full cursor-pointer truncate border-0 bg-transparent p-0 text-left text-lg font-black text-[#171717] hover:text-[#8aa72c] focus:outline-none focus:ring-2 focus:ring-[#a8d843]">{item.product.name}</button>
                    <p className="m-0 truncate text-sm font-bold text-[#858585]">{item.product.description || 'Product details from vendor catalog.'}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <strong className="text-xl font-black text-[#171717]">{money(item.product.price)}</strong>
                    <div className="flex items-center gap-1 rounded-full bg-[#f7f7f5] p-1">
                      <button type="button" onClick={() => onQuantityChange(item.product.id, item.quantity - 1)} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-white text-[#171717] shadow-sm transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#a8d843]" aria-label={`Decrease ${item.product.name}`}><HugeiconsIcon icon={MinusIcon} size={15} strokeWidth={2} /></button>
                      <span className="min-w-7 text-center text-sm font-black">{item.quantity}</span>
                      <button type="button" onClick={() => onQuantityChange(item.product.id, item.quantity + 1)} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-white text-[#171717] shadow-sm transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#a8d843]" aria-label={`Increase ${item.product.name}`}><HugeiconsIcon icon={PlusIcon} size={15} strokeWidth={2} /></button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="self-start rounded-[28px] bg-white p-5 shadow-[0_20px_55px_rgb(42_37_30_/_0.08)] lg:sticky lg:top-8">
            <p className="m-0 text-sm font-bold text-[#9a9a9a]">Total price</p>
            <strong className="mt-1 block text-3xl font-black text-[#171717]">{money(cartTotal)}</strong>
            <button type="button" onClick={onCheckout} disabled={checkoutLoading || !canCheckout} className="mt-5 inline-flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-[#a8d843] px-5 text-sm font-black text-[#121212] transition duration-200 hover:bg-[#101010] hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:bg-[#dfdfdf] disabled:text-[#888] focus:outline-none focus:ring-2 focus:ring-[#a8d843]"><HugeiconsIcon icon={BagIcon} size={19} strokeWidth={1.8} />{checkoutLoading ? 'Creating...' : 'Order Now'}</button>
          </div>
        </div>
      )}
    </section>
  );
}
