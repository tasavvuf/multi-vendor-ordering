import { PRODUCT_IMAGE_URL } from '../../lib/api';
import type { Product } from '../../types/catalog';

export function ProductImage({ product, className = '' }: { product: Product; className?: string }) {
  return <img src={PRODUCT_IMAGE_URL} alt={product.name} className={`h-full w-full object-cover ${className}`} />;
}

export function ProductVisual({ variant, small = false }: { variant: number; small?: boolean }) {
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
