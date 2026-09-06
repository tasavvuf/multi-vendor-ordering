import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { money } from '../../lib/api';
import type { CartItem } from '../../types/catalog';

const BagIcon: IconSvgElement = [['path', { d: 'M7 9h10l1 11H6L7 9Z' }], ['path', { d: 'M9 9V7a3 3 0 0 1 6 0v2' }]];
const PlusIcon: IconSvgElement = [['path', { d: 'M12 5v14' }], ['path', { d: 'M5 12h14' }]];
const MinusIcon: IconSvgElement = [['path', { d: 'M5 12h14' }]];

type CartSummaryProps = {
  cart: CartItem[];
  cartTotal: number;
  checkoutLoading: boolean;
  canCheckout: boolean;
  onCheckout: () => void;
  onQuantityChange: (productId: string, nextQuantity: number) => void;
};

export default function CartSummary({ cart, cartTotal, checkoutLoading, canCheckout, onCheckout, onQuantityChange }: CartSummaryProps) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between"><h2 className="m-0 text-lg font-black text-[#171717]">Cart</h2><span className="rounded-full bg-[#e9f4d8] px-3 py-1 text-xs font-black text-[#171717]">{cart.length} items</span></div>
      <div className="space-y-3">
        {cart.length === 0 && <p className="m-0 rounded-2xl bg-[#f7f7f5] p-4 text-sm font-bold text-[#777]">Add products to create an order.</p>}
        {cart.map((item) => (
          <div className="rounded-2xl bg-[#f7f7f5] p-3" key={item.product.id}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="m-0 truncate text-sm font-black text-[#171717]">{item.product.name}</p><p className="m-0 mt-1 truncate text-xs font-bold text-[#858585]">{item.product.vendor.name}</p></div><strong className="text-sm font-black text-[#171717]">{money(Number(item.product.price) * item.quantity)}</strong></div><div className="mt-3 flex items-center gap-2"><button type="button" onClick={() => onQuantityChange(item.product.id, item.quantity - 1)} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-white text-[#171717] transition duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#a8d843]" aria-label={`Decrease ${item.product.name}`}><HugeiconsIcon icon={MinusIcon} size={16} strokeWidth={2} /></button><span className="min-w-6 text-center text-sm font-black">{item.quantity}</span><button type="button" onClick={() => onQuantityChange(item.product.id, item.quantity + 1)} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-white text-[#171717] transition duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#a8d843]" aria-label={`Increase ${item.product.name}`}><HugeiconsIcon icon={PlusIcon} size={16} strokeWidth={2} /></button></div></div>
        ))}
      </div>
      <div className="mt-5 border-t border-[#ececea] pt-4"><div className="flex items-center justify-between text-sm font-black text-[#171717]"><span>Total price</span><strong className="text-2xl">{money(cartTotal)}</strong></div><button type="button" onClick={onCheckout} disabled={checkoutLoading || cart.length === 0 || !canCheckout} className="mt-4 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-[#a8d843] px-5 text-sm font-black text-[#121212] transition duration-200 hover:bg-[#101010] hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:bg-[#dfdfdf] disabled:text-[#888] focus:outline-none focus:ring-2 focus:ring-[#a8d843]"><HugeiconsIcon icon={BagIcon} size={18} strokeWidth={1.8} />{checkoutLoading ? 'Creating...' : 'Create Order'}</button></div>
    </div>
  );
}
