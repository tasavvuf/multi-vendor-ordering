import SectionTitle from '../components/ui/SectionTitle';
import { money } from '../lib/api';
import type { Order, OrderItem, OrderSummary } from '../types/catalog';

type OrderPageProps = {
  orders: OrderSummary[];
  showOrderList: boolean;
  activeOrder: Order | null;
  orderLookupId: string;
  orderLookupLoading: boolean;
  onLookup: (event: React.FormEvent<HTMLFormElement>) => void;
  onOrderLookupIdChange: (value: string) => void;
  onOrderClick: (orderId: string) => void;
  onProductClick: (productId: string) => void;
  onVendorClick: (vendor: { id: string; name: string }) => void;
};

export default function OrderPage(props: OrderPageProps) {
  const storeGroups = props.activeOrder?.items.reduce<Record<string, { name: string; items: OrderItem[] }>>((groups, item) => {
    groups[item.vendorId] ??= { name: item.vendorName, items: [] };
    groups[item.vendorId].items.push(item);
    return groups;
  }, {}) ?? {};

  if (props.showOrderList) {
    return (
      <section className="mx-auto max-w-4xl">
        <div className="rounded-[28px] bg-white p-4 shadow-[0_20px_55px_rgb(42_37_30_/_0.08)] md:p-6">
          <SectionTitle title="Orders" />
          <form onSubmit={props.onLookup} className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]">
            <input className="h-12 rounded-full border border-[#e8e8e5] bg-[#f7f7f5] px-4 text-sm font-bold text-[#171717] outline-0 transition focus:border-[#a8d843] focus:ring-2 focus:ring-[#a8d843]/30" value={props.orderLookupId} onChange={(event) => props.onOrderLookupIdChange(event.target.value)} placeholder="Enter order UUID" aria-label="Order UUID" />
            <button type="submit" disabled={props.orderLookupLoading} className="h-12 cursor-pointer rounded-full border-0 bg-[#101010] px-6 text-sm font-black text-white transition duration-200 hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:bg-[#d6d6d6] focus:outline-none focus:ring-2 focus:ring-[#a8d843]">{props.orderLookupLoading ? 'Loading...' : 'Find Order'}</button>
          </form>
          {props.orders.length > 0 ? (
            <div className="space-y-3">
              {props.orders.map((order) => (
                <button type="button" onClick={() => props.onOrderClick(order.id)} className="grid w-full cursor-pointer gap-3 rounded-2xl border-0 bg-[#f7f7f5] p-4 text-left transition hover:-translate-y-0.5 hover:bg-[#eef6d8] focus:outline-none focus:ring-2 focus:ring-[#a8d843] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center" key={order.id}>
                  <span className="min-w-0"><strong className="block truncate text-sm font-black text-[#171717]">Order {order.id}</strong><span className="mt-1 block text-xs font-bold text-[#858585]">{order.itemCount} {order.itemCount === 1 ? 'item' : 'items'} · {new Date(order.createdAt).toLocaleDateString('en-IN')}</span></span>
                  <span className="flex items-center gap-3 sm:justify-self-end"><span className="rounded-full bg-[#e9f4d8] px-3 py-1 text-xs font-black text-[#171717]">{order.status}</span><strong className="text-base font-black text-[#171717]">{money(order.total)}</strong></span>
                </button>
              ))}
            </div>
          ) : <div className="rounded-2xl bg-[#f7f7f5] p-10 text-center text-sm font-bold text-[#777]">No orders yet.</div>}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl">
      {props.activeOrder ? (
        <div className="rounded-[28px] bg-white p-4 shadow-[0_20px_55px_rgb(42_37_30_/_0.08)] md:p-6">
          <SectionTitle title="Order details" />
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ececea] pb-5"><p className="m-0 break-all text-sm font-black text-[#171717]">Order {props.activeOrder.id}</p><div className="flex gap-2 text-xs font-black"><span className="rounded-full bg-[#e9f4d8] px-3 py-1 text-[#171717]">{props.activeOrder.status}</span><span className="rounded-full bg-[#f7f7f5] px-3 py-1 text-[#171717]">{new Date(props.activeOrder.createdAt).toLocaleDateString('en-IN')}</span></div></div>
          <div className="mt-5 space-y-5">
            {Object.entries(storeGroups).map(([vendorId, store]) => {
              const subtotal = store.items.reduce((total, item) => total + Number(item.unitPrice) * item.quantity, 0);
              return <section key={vendorId}><div className="mb-3 flex items-center justify-between gap-3"><button type="button" onClick={() => props.onVendorClick({ id: vendorId, name: store.name })} className="cursor-pointer border-0 bg-transparent p-0 text-base font-black text-[#171717] hover:text-[#8aa72c] focus:outline-none focus:ring-2 focus:ring-[#a8d843]">{store.name}</button><strong className="text-sm font-black text-[#171717]">Subtotal {money(subtotal)}</strong></div><div className="space-y-2">{store.items.map((item) => <button type="button" onClick={() => props.onProductClick(item.productId)} className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border-0 bg-[#f7f7f5] p-3 text-left hover:bg-[#eef6d8] focus:outline-none focus:ring-2 focus:ring-[#a8d843]" key={`${item.productId}-${item.vendorId}`}><span className="min-w-0"><strong className="block truncate text-sm font-black text-[#171717]">{item.productName}</strong><span className="mt-1 block text-xs font-bold text-[#858585]">{item.quantity} x {money(item.unitPrice)}</span></span><strong className="shrink-0 text-sm font-black text-[#171717]">{money(Number(item.unitPrice) * item.quantity)}</strong></button>)}</div></section>;
            })}
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-[#ececea] pt-5"><span className="text-base font-black text-[#171717]">Final total</span><strong className="text-2xl font-black text-[#171717]">{money(props.activeOrder.total)}</strong></div>
        </div>
      ) : <div className="rounded-[28px] bg-white p-10 text-center text-sm font-bold text-[#777] shadow-[0_20px_55px_rgb(42_37_30_/_0.08)]">Order details are unavailable.</div>}
    </section>
  );
}
