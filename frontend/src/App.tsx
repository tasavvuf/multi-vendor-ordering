import { useEffect, useMemo, useRef, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { useLocation, useNavigate } from 'react-router-dom';
import Dock from './components/ui/Dock';
import CartPageView from './pages/CartPage';
import ProductDetailsPageView from './pages/ProductDetailsPage';
import OrderPageView from './pages/OrderPage';
import ProductsPageView from './pages/ProductsPage';
import heroImage from '../gg.png';

type Vendor = {
  id: string;
  name: string;
  description?: string;
};

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  vendor: Vendor;
};

type CartItem = {
  product: Product;
  quantity: number;
};

type OrderItem = {
  productId: string;
  vendorId: string;
  productName: string;
  vendorName: string;
  quantity: number;
  unitPrice: string;
};

type Order = {
  id: string;
  total: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

type OrderSummary = Omit<Order, 'items'> & {
  itemCount: number;
};

type VendorProductsResponse = {
  vendor: Vendor;
  products: Array<Omit<Product, 'vendor'> & { vendor?: Vendor }>;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
const PRODUCT_IMAGE_URL = 'https://placehold.co/600x400';
const api = axios.create({ baseURL: API_BASE_URL });
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const makeIcon = (paths: IconSvgElement) => paths;
const SearchIcon = makeIcon([['circle', { cx: 11, cy: 11, r: 7 }], ['path', { d: 'm16 16 4 4' }]]);
const BagIcon = makeIcon([['path', { d: 'M7 9h10l1 11H6L7 9Z' }], ['path', { d: 'M9 9V7a3 3 0 0 1 6 0v2' }]]);
const HomeIcon = makeIcon([['path', { d: 'M4 11.5 12 5l8 6.5' }], ['path', { d: 'M6.5 10v9h11v-9' }], ['path', { d: 'M10 19v-5h4v5' }]]);
const StoreIcon = makeIcon([['path', { d: 'M5 10h14l-1-5H6l-1 5Z' }], ['path', { d: 'M6 10v9h12v-9' }], ['path', { d: 'M9 19v-5h6v5' }]]);
const OrdersIcon = makeIcon([['rect', { x: 6, y: 4, width: 12, height: 16, rx: 2 }], ['path', { d: 'M9 8h6M9 12h6M9 16h4' }]]);
const HeartIcon = makeIcon([['path', { d: 'M12 20s-7-4.2-9-8.6C1.6 8.2 3.7 5 7 5c2 0 3.2 1.1 5 3 1.8-1.9 3-3 5-3 3.3 0 5.4 3.2 4 6.4C19 15.8 12 20 12 20Z' }]]);
const ArrowUpIcon = makeIcon([['path', { d: 'M7 17 17 7' }], ['path', { d: 'M9 7h8v8' }]]);
const PlusIcon = makeIcon([['path', { d: 'M12 5v14' }], ['path', { d: 'M5 12h14' }]]);
const MinusIcon = makeIcon([['path', { d: 'M5 12h14' }]]);
const CheckIcon = makeIcon([['path', { d: 'm5 12 4 4L19 6' }]]);

const categories = [
  { id: 'outfit', name: "Men's outfit", tone: 'from-stone-100 to-zinc-200', variant: 1, terms: ['jacket', 'shirt', 'outfit', 'overshirt'] },
  { id: 'women', name: "woman's outfit", tone: 'from-rose-100 to-stone-200', variant: 2, terms: ['dress', 'cream', 'woman'] },
  { id: 'footwear', name: "Men's footwears", tone: 'from-slate-100 to-zinc-200', variant: 3, terms: ['shoe', 'sneaker', 'runner', 'footwear'] },
];

function money(value: Product['price']) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)
    : `₹${value}`;
}

function formatError(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return axiosError.response?.data?.message ?? axiosError.message ?? fallback;
  }
  return fallback;
}

function isBackendProduct(product: Product) {
  return uuidPattern.test(product.id) && uuidPattern.test(product.vendor?.id ?? '');
}

function ProductVisual({ variant, small = false }: { variant: number; small?: boolean }) {
  if (variant % 3 === 0) {
    return (
      <div className="absolute inset-0" aria-hidden="true">
        <span className={`${small ? 'left-[58%] top-3 h-12 w-10' : 'left-[18%] top-[18%] h-[54%] w-[35%]'} absolute block rotate-[15deg] rounded-[44px_44px_20px_20px] bg-gradient-to-br from-[#d7d7d7] via-[#f4f4f2] to-[#bfc0bf] shadow-[inset_-8px_-4px_0_rgb(255_255_255_/_0.55)]`} />
        {!small && <span className="absolute right-[14%] top-[13%] block h-[54%] w-[35%] -rotate-[15deg] rounded-[44px_44px_20px_20px] bg-gradient-to-br from-[#d7d7d7] via-[#f4f4f2] to-[#bfc0bf] shadow-[inset_-8px_-4px_0_rgb(255_255_255_/_0.55)]" />}
      </div>
    );
  }

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <span className={`${small ? 'left-[72%] top-1 h-5 w-5' : 'left-1/2 top-[16%] h-[20%] w-[18%] -translate-x-1/2'} absolute block rounded-full bg-[#d79c75]`} />
      <span className={`${small ? 'left-[72%] top-6 h-[42px] w-7 rounded-[7px_7px_0_0]' : 'left-1/2 top-[37%] h-[46%] w-[44%] -translate-x-1/2 rounded-[17px_17px_0_0]'} absolute block ${variant % 2 === 0 ? 'bg-gradient-to-r from-[#f0efe8] from-[48%] to-[#2e3033] to-[48%]' : 'bg-[#42372f]'}`} />
      <span className={`${small ? 'bottom-[-4px] left-[68px] h-6 w-[7px]' : 'bottom-[-8%] left-[35%] h-[25%] w-[9%]'} absolute block rounded-full bg-[#2d2d2d]`} />
      <span className={`${small ? 'bottom-[-4px] right-3 h-6 w-[7px]' : 'bottom-[-8%] right-[35%] h-[25%] w-[9%]'} absolute block rounded-full bg-[#2d2d2d]`} />
    </div>
  );
}

function ProductImage({ product, className = '' }: { product: Product; className?: string }) {
  return <img src={PRODUCT_IMAGE_URL} alt={product.name} className={`h-full w-full object-cover ${className}`} />;
}

function SectionTitle({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4">
      <h2 className="m-0 text-base font-black leading-tight text-[#121212] md:text-lg">{title}</h2>
      {actionLabel && (
        <button type="button" onClick={onAction} className="min-h-11 cursor-pointer border-0 bg-transparent text-sm font-extrabold text-[#8aa72c] transition-colors duration-200 hover:text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#a8d843] focus:ring-offset-2">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div className="overflow-hidden rounded-2xl bg-white p-3 shadow-[0_12px_30px_rgb(24_24_24_/_0.06)]" key={index}>
          <div className="h-52 animate-pulse rounded-xl bg-zinc-200" />
          <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-zinc-200" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-zinc-200" />
          <div className="mt-5 h-11 animate-pulse rounded-full bg-zinc-200" />
        </div>
      ))}
    </div>
  );
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const view = location.pathname === '/cart'
    ? 'cart'
    : location.pathname === '/order' || location.pathname === '/orders' || location.pathname.startsWith('/orders/')
      ? 'orders'
      : location.pathname === '/stores'
        ? 'stores'
        : location.pathname === '/products'
          ? 'products'
        : location.pathname.startsWith('/products/')
          ? 'product'
          : 'home';
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeVendorId, setActiveVendorId] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingVendorId, setLoadingVendorId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderLookupId, setOrderLookupId] = useState('');
  const [orderLookupLoading, setOrderLookupLoading] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const productsRef = useRef<HTMLDivElement | null>(null);

  async function loadStorefront(showLoader = true) {
    if (showLoader) {
      setLoading(true);
      setNotice('');
    }
    try {
      const [productResponse, vendorResponse] = await Promise.all([
        api.get<ApiResponse<Product[]>>('/products'),
        api.get<ApiResponse<Vendor[]>>('/vendors'),
      ]);

      setProducts(productResponse.data.data);
      setVendors(vendorResponse.data.data);
    } catch {
      setProducts([]);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    loadStorefront(false);
  }, []);

  useEffect(() => {
    const productId = location.pathname.startsWith('/products/') ? location.pathname.split('/')[2] : null;
    const orderId = location.pathname.startsWith('/orders/') ? location.pathname.split('/')[2] : null;

    if (productId) {
      api.get<ApiResponse<Product>>(`/products/${productId}`)
        .then((response) => setSelectedProduct(response.data.data))
        .catch(() => {
          setSelectedProduct(null);
          setNotice('Product not found.');
        });
    }

    if (orderId && uuidPattern.test(orderId)) {
      api.get<ApiResponse<Order>>(`/orders/${orderId}`)
        .then((response) => setActiveOrder(response.data.data))
        .catch((error) => setNotice(formatError(error, 'Order not found.')));
    }

    if (location.pathname === '/orders') {
      api.get<ApiResponse<OrderSummary[]>>('/orders')
        .then((response) => setOrders(response.data.data))
        .catch((error) => setNotice(formatError(error, 'Orders could not be loaded.')));
    }
  }, [location.pathname]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const selectedCategory = categories.find((category) => category.id === activeCategory);

    return products.filter((product) => {
      const searchable = [product.name, product.description, product.vendor?.name].filter(Boolean).join(' ').toLowerCase();
      const queryMatch = !normalizedQuery || searchable.includes(normalizedQuery);
      const categoryMatch = !selectedCategory || selectedCategory.terms.some((term) => searchable.includes(term));
      return queryMatch && categoryMatch;
    });
  }, [activeCategory, products, query]);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + Number(item.product.price) * item.quantity, 0);
  }, [cart]);

  const cartQuantity = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);
  const canCheckout = cart.length > 0 && cart.every((item) => isBackendProduct(item.product));

  function addToCart(product: Product, quantity = 1) {
    setCart((current) => {
      const found = current.find((item) => item.product.id === product.id);
      if (found) {
        return current.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...current, { product, quantity }];
    });
    setNotice(`${product.name} added to cart`);
  }

  function changeQuantity(productId: string, nextQuantity: number) {
    setCart((current) => {
      if (nextQuantity <= 0) return current.filter((item) => item.product.id !== productId);
      return current.map((item) => item.product.id === productId ? { ...item, quantity: nextQuantity } : item);
    });
  }

  function toggleFavorite(productId: string) {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }

  function openProduct(product: Product) {
    setSelectedProduct(product);
    navigate(`/products/${product.id}`);
    setNotice('');
  }

  async function selectVendor(vendor: Vendor) {
    navigate('/stores');
    setQuery('');
    setActiveCategory('all');
    setActiveVendorId(vendor.id);
    setLoadingVendorId(vendor.id);
    setNotice('');

    try {
      const response = await api.get<ApiResponse<VendorProductsResponse>>(`/vendors/${vendor.id}/products`);
      const normalizedProducts = response.data.data.products.map((product) => ({
        ...product,
        description: product.description ?? `${response.data.data.vendor.name} product`,
        vendor: response.data.data.vendor,
      }));
      setProducts(normalizedProducts);
    } catch {
      setProducts([]);
    } finally {
      setLoadingVendorId(null);
    }
  }

  async function createOrder() {
    if (!cart.length) {
      setNotice('Add products before creating an order.');
      return;
    }

    if (!canCheckout) {
      setNotice('Checkout is unavailable for the items in your cart.');
      return;
    }

    setCheckoutLoading(true);
    setNotice('');

    try {
      const grouped = cart.reduce<Record<string, { vendorId: string; items: { productId: string; quantity: number }[] }>>((groups, item) => {
        const vendorId = item.product.vendor.id;
        groups[vendorId] ??= { vendorId, items: [] };
        groups[vendorId].items.push({ productId: item.product.id, quantity: item.quantity });
        return groups;
      }, {});

      const response = await api.post<ApiResponse<Order>>('/orders', { vendors: Object.values(grouped) });
      setActiveOrder(response.data.data);
      setCart([]);
      navigate('/order');
      setNotice('Order created successfully');
    } catch (error) {
      setNotice(formatError(error, 'Order could not be created.'));
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function lookupOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedId = orderLookupId.trim();

    if (!uuidPattern.test(trimmedId)) {
      setNotice('Enter a valid order UUID.');
      return;
    }

    setOrderLookupLoading(true);
    setNotice('');

    try {
      const response = await api.get<ApiResponse<Order>>(`/orders/${trimmedId}`);
      setActiveOrder(response.data.data);
      navigate(`/orders/${trimmedId}`);
    } catch (error) {
      setNotice(formatError(error, 'Order not found.'));
    } finally {
      setOrderLookupLoading(false);
    }
  }

  const dockItems = [
    { label: 'Home', onClick: () => navigate('/'), className: navItemClass(view === 'home'), icon: <HugeiconsIcon icon={HomeIcon} size={23} strokeWidth={1.8} /> },
    { label: 'Cart', onClick: () => navigate('/cart'), className: navItemClass(view === 'cart'), icon: <HugeiconsIcon icon={BagIcon} size={23} strokeWidth={1.8} /> },
    { label: 'Orders', onClick: () => navigate('/orders'), className: navItemClass(view === 'orders'), icon: <HugeiconsIcon icon={OrdersIcon} size={23} strokeWidth={1.8} /> },
    { label: 'Stores', onClick: () => navigate('/stores'), className: navItemClass(view === 'stores'), icon: <HugeiconsIcon icon={StoreIcon} size={23} strokeWidth={1.8} /> },
  ];

  return (
    <main className="min-h-screen bg-[#f2f1ed] pb-32 text-[#16130f]">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header className="mb-5 flex flex-col gap-4 rounded-[26px] bg-white/80 p-3 shadow-[0_20px_55px_rgb(42_37_30_/_0.08)] backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div>
              <p className="m-0 text-xs font-extrabold uppercase tracking-[0.08em] text-[#8aa72c]">Multi vendor ordering</p>
              <h1 className="m-0 text-xl font-black leading-tight text-[#121212] sm:text-2xl">Shop products from every store</h1>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <form onSubmit={(event) => { event.preventDefault(); navigate(`/products${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`); }} className="grid h-12 min-w-0 grid-cols-[24px_minmax(0,1fr)_40px] items-center rounded-full bg-[#f7f7f5] pl-4 text-[#8e8e8e] shadow-inner sm:w-[360px]">
              <HugeiconsIcon icon={SearchIcon} size={19} strokeWidth={1.6} />
              <input className="w-full border-0 bg-transparent text-sm font-semibold text-[#202020] outline-0 placeholder:text-[#9c9c9c]" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="what are you looking for?" aria-label="Search products" />
              <button type="submit" className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-white text-[#0d0d0d] shadow-sm transition duration-200 hover:bg-[#e9f4d8] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#a8d843]" aria-label="Search products">
                <HugeiconsIcon icon={SearchIcon} size={18} strokeWidth={1.7} />
              </button>
            </form>
            <button type="button" onClick={() => navigate('/cart')} className="relative flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-[#101010] px-5 text-sm font-extrabold text-white transition duration-200 hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#a8d843]">
              <HugeiconsIcon icon={BagIcon} size={20} strokeWidth={1.8} />
              Cart
              {cartQuantity > 0 && <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#a8d843] px-1.5 text-xs font-black text-[#121212]">{cartQuantity}</span>}
            </button>
          </div>
        </header>

        {notice && (
          <div className="mb-4 flex items-start gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-[#4d4d4d] shadow-[0_12px_30px_rgb(24_24_24_/_0.06)]">
            <HugeiconsIcon icon={CheckIcon} size={18} strokeWidth={1.8} />
            <span>{notice}</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            {view === 'home' && (
              <>
                <section className="relative grid min-h-[230px] overflow-hidden rounded-[28px] bg-[#a8d843] p-5 shadow-[0_22px_60px_rgb(73_93_21_/_0.18)] sm:min-h-[280px] sm:grid-cols-[1fr_280px] md:p-7">
                  <div className="relative z-10">
                    <span className="inline-flex h-7 items-center rounded-full bg-[#151515] px-3 text-xs font-extrabold text-white">Limited Offer</span>
                    <h2 className="mb-5 mt-4 max-w-[440px] text-3xl font-black leading-tight text-[#182009] md:text-5xl">First Purchase Enjoy a Special Offer</h2>
                    <button type="button" onClick={() => productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-full border-0 bg-[#101010] py-0 pl-5 pr-2 text-sm font-extrabold text-white transition duration-200 hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white">
                      Shop Now
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#101010]">
                        <HugeiconsIcon icon={ArrowUpIcon} size={18} strokeWidth={2} />
                      </span>
                    </button>
                  </div>
                  <img src={heroImage} alt="" className="absolute bottom-0 right-0 h-[230px] w-[205px] object-contain object-bottom sm:relative sm:right-auto sm:h-[280px] sm:w-[250px] sm:justify-self-end" aria-hidden="true" />
                </section>

                <section className="mt-7">
                  <SectionTitle title="Categories" actionLabel="See all" onAction={() => navigate('/products')} />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {categories.map((category) => (
                      <button type="button" onClick={() => setActiveCategory(category.id)} className={`relative min-h-[92px] cursor-pointer overflow-hidden rounded-2xl border-0 bg-gradient-to-br ${category.tone} p-4 text-left shadow-[0_12px_30px_rgb(24_24_24_/_0.06)] transition duration-200 hover:-translate-y-1 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#a8d843] ${activeCategory === category.id ? 'ring-2 ring-[#a8d843]' : ''}`} key={category.id}>
                        <span className="relative z-10 block max-w-[110px] text-sm font-black leading-tight text-[#171717]">{category.name}</span>
                        <ProductVisual variant={category.variant} small />
                      </button>
                    ))}
                  </div>
                </section>

                <section className="mt-7" ref={productsRef}>
                  <SectionTitle title={activeVendorId === 'all' ? 'New Arrival' : 'Store Products'} actionLabel="See all" onAction={() => navigate('/products')} />
                  {loading || loadingVendorId ? (
                    <LoadingGrid />
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {filteredProducts.map((product) => (
                        <article className="group overflow-hidden rounded-2xl bg-white p-3 shadow-[0_12px_30px_rgb(24_24_24_/_0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgb(24_24_24_/_0.1)]" key={product.id}>
                          <button type="button" onClick={() => openProduct(product)} className="relative block h-52 w-full cursor-pointer overflow-hidden rounded-xl border-0 bg-[#e7e7e7] transition duration-200 group-hover:bg-[#dededc] md:h-56" aria-label={`View ${product.name}`}>
                            <ProductImage product={product} />
                          </button>
                          <div className="pt-4">
                            <button type="button" onClick={() => openProduct(product)} className="block w-full cursor-pointer border-0 bg-transparent p-0 text-left">
                              <h3 className="m-0 truncate text-base font-black text-[#171717]">{product.name}</h3>
                              <p className="m-0 mt-1 truncate text-sm font-bold text-[#858585]">{product.vendor?.name}</p>
                            </button>
                            <div className="mt-4 flex items-center justify-between gap-3">
                              <strong className="text-lg font-black text-[#171717]">{money(product.price)}</strong>
                              <button type="button" onClick={() => addToCart(product)} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border-0 bg-[#101010] px-4 text-sm font-extrabold text-white transition duration-200 hover:bg-[#a8d843] hover:text-[#121212] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#a8d843]">
                                <HugeiconsIcon icon={PlusIcon} size={17} strokeWidth={2} />
                                Add
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                  {!loading && !loadingVendorId && filteredProducts.length === 0 && (
                    <div className="rounded-2xl bg-white p-8 text-center text-sm font-bold text-[#737373] shadow-[0_12px_30px_rgb(24_24_24_/_0.06)]">No products match this search.</div>
                  )}
                </section>
              </>
            )}

            {view === 'products' && (
              <ProductsPageView onOpenProduct={openProduct} onAddToCart={addToCart} />
            )}

            {view === 'cart' && (
              <CartPageView cart={cart} cartTotal={cartTotal} onBack={() => navigate('/')} onQuantityChange={changeQuantity} onCheckout={createOrder} onProductClick={(productId) => navigate(`/products/${productId}`)} onVendorClick={(vendor) => void selectVendor(vendor)} checkoutLoading={checkoutLoading} canCheckout={canCheckout} />
            )}

            {view === 'product' && selectedProduct?.id === location.pathname.split('/')[2] && (
              <ProductDetailsPageView key={selectedProduct.id} product={selectedProduct} onBack={() => navigate(activeVendorId === 'all' ? '/' : '/stores')} onAddToCart={(quantity) => addToCart(selectedProduct, quantity)} onVendorClick={() => selectVendor(selectedProduct.vendor)} onToggleFavorite={() => toggleFavorite(selectedProduct.id)} isFavorite={favorites.has(selectedProduct.id)} />
            )}

            {view === 'stores' && (
              <section className="rounded-[28px] bg-white p-4 shadow-[0_20px_55px_rgb(42_37_30_/_0.08)] md:p-6">
                <SectionTitle title={activeVendorId === 'all' ? 'Stores' : vendors.find((vendor) => vendor.id === activeVendorId)?.name ?? 'Store Products'} actionLabel={activeVendorId === 'all' ? undefined : 'Back to stores'} onAction={activeVendorId === 'all' ? undefined : () => { setActiveVendorId('all'); loadStorefront(); }} />
                {activeVendorId !== 'all' ? (
                  loadingVendorId ? (
                    <LoadingGrid />
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {filteredProducts.map((product) => (
                        <article className="group overflow-hidden rounded-2xl bg-[#f7f7f5] p-3 shadow-[0_12px_30px_rgb(24_24_24_/_0.06)] transition duration-200 hover:-translate-y-1" key={product.id}>
                          <button type="button" onClick={() => openProduct(product)} className="relative block h-52 w-full cursor-pointer overflow-hidden rounded-xl border-0 bg-[#e7e7e7]" aria-label={`View ${product.name}`}>
                            <ProductImage product={product} />
                          </button>
                          <div className="pt-4">
                            <button type="button" onClick={() => openProduct(product)} className="block w-full cursor-pointer border-0 bg-transparent p-0 text-left">
                              <h3 className="m-0 truncate text-base font-black text-[#171717]">{product.name}</h3>
                              <p className="m-0 mt-1 truncate text-sm font-bold text-[#858585]">{product.description}</p>
                            </button>
                            <div className="mt-4 flex items-center justify-between gap-3">
                              <strong className="text-lg font-black text-[#171717]">{money(product.price)}</strong>
                              <button type="button" onClick={() => addToCart(product)} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border-0 bg-[#101010] px-4 text-sm font-extrabold text-white transition hover:bg-[#a8d843] hover:text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#a8d843]"><HugeiconsIcon icon={PlusIcon} size={17} strokeWidth={2} />Add</button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )
                ) : loading ? (
                  <LoadingGrid />
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {vendors.map((vendor) => (
                      <button type="button" onClick={() => selectVendor(vendor)} className="grid min-h-24 w-full cursor-pointer grid-cols-[56px_1fr] items-center gap-4 rounded-2xl border-0 bg-[#f7f7f5] p-3 text-left transition duration-200 hover:-translate-y-1 hover:bg-[#eef6d8] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#a8d843]" key={vendor.id}>
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f4c8] text-sm font-black text-[#141414]">{vendor.name.slice(0, 2).toUpperCase()}</span>
                        <span>
                          <strong className="block text-base font-black text-[#141414]">{vendor.name}</strong>
                          <span className="mt-1 block text-sm font-bold text-[#777]">{vendor.description || 'Official store'}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {view === 'orders' && (
              <OrderPageView
                orders={orders}
                showOrderList={location.pathname === '/orders'}
                activeOrder={activeOrder}
                orderLookupId={orderLookupId}
                orderLookupLoading={orderLookupLoading}
                onLookup={lookupOrder}
                onOrderLookupIdChange={setOrderLookupId}
                onOrderClick={(orderId) => navigate(`/orders/${orderId}`)}
                onProductClick={(productId) => navigate(`/products/${productId}`)}
                onVendorClick={(vendor) => void selectVendor(vendor)}
              />
            )}
          </div>

          <aside className={`${view === 'cart' ? 'hidden' : 'hidden lg:block'}`}>
            <div className="sticky top-8 rounded-[28px] bg-white p-4 shadow-[0_20px_55px_rgb(42_37_30_/_0.08)]">
              <CartSummary cart={cart} cartTotal={cartTotal} checkoutLoading={checkoutLoading} canCheckout={canCheckout} onCheckout={createOrder} onQuantityChange={changeQuantity} />
            </div>
          </aside>
        </div>
      </div>

      <Dock items={dockItems} baseItemSize={46} magnification={58} panelHeight={58} dockHeight={118} distance={150} className="!rounded-full !border-0 bg-white/95 shadow-[0_12px_35px_rgb(16_16_16_/_0.13)]" />
      <footer className="mt-2 text-center text-xs font-semibold tracking-[0.02em] text-[#7b7c7d]">
        Developed with love by{' '}
        <a href="https://tasavvuf.vercel.app/" target="_blank" rel="noreferrer" className="font-extrabold text-[#666768] underline decoration-[#b4b5b6] underline-offset-2 transition-colors hover:text-[#171717]">
          Tasavvuf
        </a>
      </footer>
    </main>
  );
}

function navItemClass(active: boolean) {
  return `${active ? '!bg-[#e9f4d8] !text-[#152008]' : '!bg-white !text-[#171717]'} !border-0 hover:!bg-[#e9f4d8]`;
}

export function LegacyCartPage({ cart, cartTotal, onBack, onQuantityChange, onCheckout, checkoutLoading, canCheckout }: {
  cart: CartItem[];
  cartTotal: number;
  onBack: () => void;
  onQuantityChange: (productId: string, nextQuantity: number) => void;
  onCheckout: () => void;
  checkoutLoading: boolean;
  canCheckout: boolean;
}) {
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
                <div className="aspect-square overflow-hidden rounded-2xl bg-[#e7e7e7]">
                  <ProductImage product={item.product} />
                </div>
                <div className="flex min-w-0 flex-col justify-between py-1">
                  <div>
                    <p className="m-0 text-xs font-extrabold uppercase tracking-[0.08em] text-[#9a9a9a]">{item.product.vendor.name}</p>
                    <h3 className="mb-1 mt-2 truncate text-lg font-black text-[#171717]">{item.product.name}</h3>
                    <p className="m-0 truncate text-sm font-bold text-[#858585]">{item.product.description || 'Product details from vendor catalog.'}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <strong className="text-xl font-black text-[#171717]">{money(item.product.price)}</strong>
                    <div className="flex items-center gap-1 rounded-full bg-[#f7f7f5] p-1">
                      <button type="button" onClick={() => onQuantityChange(item.product.id, item.quantity - 1)} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-white text-[#171717] shadow-sm transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#a8d843]" aria-label={`Decrease ${item.product.name}`}>
                        <HugeiconsIcon icon={MinusIcon} size={15} strokeWidth={2} />
                      </button>
                      <span className="min-w-7 text-center text-sm font-black">{item.quantity}</span>
                      <button type="button" onClick={() => onQuantityChange(item.product.id, item.quantity + 1)} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-white text-[#171717] shadow-sm transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#a8d843]" aria-label={`Increase ${item.product.name}`}>
                        <HugeiconsIcon icon={PlusIcon} size={15} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="self-start rounded-[28px] bg-white p-5 shadow-[0_20px_55px_rgb(42_37_30_/_0.08)] lg:sticky lg:top-8">
            <p className="m-0 text-sm font-bold text-[#9a9a9a]">Total price</p>
            <strong className="mt-1 block text-3xl font-black text-[#171717]">{money(cartTotal)}</strong>
            <button type="button" onClick={onCheckout} disabled={checkoutLoading || !canCheckout} className="mt-5 inline-flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-[#a8d843] px-5 text-sm font-black text-[#121212] transition duration-200 hover:bg-[#101010] hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:bg-[#dfdfdf] disabled:text-[#888] focus:outline-none focus:ring-2 focus:ring-[#a8d843]">
              <HugeiconsIcon icon={BagIcon} size={19} strokeWidth={1.8} />
              {checkoutLoading ? 'Creating...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export function LegacyProductDetailsPage({ product, quantity, onBack, onQuantityChange, onAddToCart, onToggleFavorite, isFavorite }: {
  product: Product;
  quantity: number;
  onBack: () => void;
  onQuantityChange: (productId: string, nextQuantity: number) => void;
  onAddToCart: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
}) {
  const displayQuantity = quantity || 1;

  return (
    <section className="mx-auto max-w-3xl pb-3">
      <div className="mb-4 flex items-center justify-between px-1">
        <button type="button" onClick={onBack} className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-white text-[#171717] shadow-[0_7px_16px_rgb(18_16_14_/_0.08)] transition duration-200 hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#a8d843]" aria-label="Back to products">
          <span className="text-2xl leading-none">&#8249;</span>
        </button>
        <h2 className="m-0 text-xl font-black text-[#171717]">Details</h2>
      </div>

      <div className="rounded-[28px] bg-white p-3 shadow-[0_20px_55px_rgb(42_37_30_/_0.08)] sm:p-5">
        <div className="aspect-[1.15] overflow-hidden rounded-[22px] bg-[#e7e7e7] sm:aspect-[1.45]">
          <ProductImage product={product} />
        </div>
        <div className="flex justify-center gap-1.5 py-3" aria-label="Product image position">
          <span className="h-1.5 w-1.5 rounded-full bg-[#d1d1d1]" />
          <span className="h-1.5 w-6 rounded-full bg-[#101010]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#d1d1d1]" />
        </div>

        <div className="px-1 sm:px-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="m-0 text-xs font-bold text-[#999]">Men Footwear</p>
              <h1 className="mb-0 mt-1 text-2xl font-black leading-tight text-[#171717]">{product.name}</h1>
            </div>
            <button type="button" onClick={onToggleFavorite} className={`flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#ededeb] bg-white transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#a8d843] ${isFavorite ? 'text-[#a8d843]' : 'text-[#9a9a9a]'}`} aria-label={`${isFavorite ? 'Remove' : 'Save'} ${product.name} from favorites`}>
              <HugeiconsIcon icon={HeartIcon} size={20} strokeWidth={1.7} />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d8f0cf] text-xs font-black text-[#171717]">{product.vendor.name.slice(0, 2).toUpperCase()}</span>
              <span className="min-w-0">
                <strong className="block truncate text-sm font-black text-[#171717]">{product.vendor.name}</strong>
                <span className="block text-[11px] font-bold text-[#999]">Official store</span>
              </span>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <div>
              <p className="m-0 text-right text-xs font-bold text-[#999]">QTY</p>
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-[#f1f1ef] p-1">
                <button type="button" onClick={() => onQuantityChange(product.id, Math.max(0, displayQuantity - 1))} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border-0 bg-white text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#a8d843]" aria-label="Decrease quantity"><HugeiconsIcon icon={MinusIcon} size={14} strokeWidth={2} /></button>
                <span className="min-w-5 text-center text-sm font-black">{displayQuantity}</span>
                <button type="button" onClick={() => quantity ? onQuantityChange(product.id, displayQuantity + 1) : onAddToCart()} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border-0 bg-white text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#a8d843]" aria-label="Increase quantity"><HugeiconsIcon icon={PlusIcon} size={14} strokeWidth={2} /></button>
              </div>
            </div>
          </div>

          <div className="mt-5 border-t border-[#f0f0ee] pt-4">
            <p className="m-0 text-xs font-bold text-[#999]">Description</p>
            <p className="mb-0 mt-2 text-sm font-semibold leading-6 text-[#666]">{product.description || 'Product details from vendor catalog.'}</p>
          </div>
        </div>
      </div>

      <div className="sticky bottom-3 mt-3 flex items-center justify-between gap-4 rounded-[24px] bg-white px-4 py-3 shadow-[0_18px_45px_rgb(24_24_24_/_0.14)] sm:px-5">
        <div>
          <p className="m-0 text-xs font-bold text-[#999]">Total price</p>
          <strong className="mt-1 block text-xl font-black text-[#171717]">{money(Number(product.price) * displayQuantity)}</strong>
        </div>
        <button type="button" onClick={onAddToCart} className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-full border-0 bg-[#a8d843] px-5 text-sm font-black text-[#121212] transition duration-200 hover:bg-[#101010] hover:text-white active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#a8d843]"><HugeiconsIcon icon={BagIcon} size={19} strokeWidth={1.8} />Add to Cart</button>
      </div>
    </section>
  );
}

function CartSummary({ cart, cartTotal, checkoutLoading, canCheckout, onCheckout, onQuantityChange }: {
  cart: CartItem[];
  cartTotal: number;
  checkoutLoading: boolean;
  canCheckout: boolean;
  onCheckout: () => void;
  onQuantityChange: (productId: string, nextQuantity: number) => void;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="m-0 text-lg font-black text-[#171717]">Cart</h2>
        <span className="rounded-full bg-[#e9f4d8] px-3 py-1 text-xs font-black text-[#171717]">{cart.length} items</span>
      </div>
      <div className="space-y-3">
        {cart.length === 0 && <p className="m-0 rounded-2xl bg-[#f7f7f5] p-4 text-sm font-bold text-[#777]">Add products to create an order.</p>}
        {cart.map((item) => (
          <div className="rounded-2xl bg-[#f7f7f5] p-3" key={item.product.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="m-0 truncate text-sm font-black text-[#171717]">{item.product.name}</p>
                <p className="m-0 mt-1 truncate text-xs font-bold text-[#858585]">{item.product.vendor.name}</p>
              </div>
              <strong className="text-sm font-black text-[#171717]">{money(Number(item.product.price) * item.quantity)}</strong>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button type="button" onClick={() => onQuantityChange(item.product.id, item.quantity - 1)} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-white text-[#171717] transition duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#a8d843]" aria-label={`Decrease ${item.product.name}`}>
                <HugeiconsIcon icon={MinusIcon} size={16} strokeWidth={2} />
              </button>
              <span className="min-w-6 text-center text-sm font-black">{item.quantity}</span>
              <button type="button" onClick={() => onQuantityChange(item.product.id, item.quantity + 1)} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-white text-[#171717] transition duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#a8d843]" aria-label={`Increase ${item.product.name}`}>
                <HugeiconsIcon icon={PlusIcon} size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 border-t border-[#ececea] pt-4">
        <div className="flex items-center justify-between text-sm font-black text-[#171717]">
          <span>Total price</span>
          <strong className="text-2xl">{money(cartTotal)}</strong>
        </div>
        <button type="button" onClick={onCheckout} disabled={checkoutLoading || cart.length === 0 || !canCheckout} className="mt-4 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-[#a8d843] px-5 text-sm font-black text-[#121212] transition duration-200 hover:bg-[#101010] hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:bg-[#dfdfdf] disabled:text-[#888] focus:outline-none focus:ring-2 focus:ring-[#a8d843]">
          <HugeiconsIcon icon={BagIcon} size={18} strokeWidth={1.8} />
          {checkoutLoading ? 'Creating...' : 'Create Order'}
        </button>
      </div>
    </div>
  );
}

export function LegacyOrderPanel(props: {
  activeOrder: Order | null;
  cart: CartItem[];
  cartTotal: number;
  checkoutLoading: boolean;
  orderLookupId: string;
  orderLookupLoading: boolean;
  canCheckout: boolean;
  onCheckout: () => void;
  onLookup: (event: React.FormEvent<HTMLFormElement>) => void;
  onOrderLookupIdChange: (value: string) => void;
  onQuantityChange: (productId: string, nextQuantity: number) => void;
}) {
  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-[28px] bg-white p-4 shadow-[0_20px_55px_rgb(42_37_30_/_0.08)] md:p-6">
        <SectionTitle title="Orders" />
        <form onSubmit={props.onLookup} className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input className="h-12 rounded-full border border-[#e8e8e5] bg-[#f7f7f5] px-4 text-sm font-bold text-[#171717] outline-0 transition focus:border-[#a8d843] focus:ring-2 focus:ring-[#a8d843]/30" value={props.orderLookupId} onChange={(event) => props.onOrderLookupIdChange(event.target.value)} placeholder="Enter order UUID" aria-label="Order UUID" />
          <button type="submit" disabled={props.orderLookupLoading} className="h-12 cursor-pointer rounded-full border-0 bg-[#101010] px-6 text-sm font-black text-white transition duration-200 hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:bg-[#d6d6d6] focus:outline-none focus:ring-2 focus:ring-[#a8d843]">
            {props.orderLookupLoading ? 'Loading...' : 'Find Order'}
          </button>
        </form>

        {props.activeOrder ? (
          <div className="mt-5 rounded-2xl bg-[#f7f7f5] p-4">
            <p className="m-0 break-all text-sm font-black text-[#171717]">Order ID: {props.activeOrder.id}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
              <span className="rounded-full bg-[#e9f4d8] px-3 py-1 text-[#171717]">{props.activeOrder.status}</span>
              <span className="rounded-full bg-white px-3 py-1 text-[#171717]">Total {money(props.activeOrder.total)}</span>
            </div>
            <div className="mt-4 space-y-2">
              {props.activeOrder.items.map((item) => (
                <div className="rounded-xl bg-white p-3 text-sm font-bold text-[#555]" key={`${item.productId}-${item.vendorId}`}>
                  {item.quantity} x {money(item.unitPrice)}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl bg-[#f7f7f5] p-8 text-center text-sm font-bold text-[#777]">Create a new order from the cart or search an existing order by UUID.</div>
        )}
      </div>

      <div className="rounded-[28px] bg-white p-4 shadow-[0_20px_55px_rgb(42_37_30_/_0.08)] lg:hidden">
        <CartSummary cart={props.cart} cartTotal={props.cartTotal} checkoutLoading={props.checkoutLoading} canCheckout={props.canCheckout} onCheckout={props.onCheckout} onQuantityChange={props.onQuantityChange} />
      </div>
    </section>
  );
}

export default App;
