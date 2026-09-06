export default function LoadingGrid() {
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
