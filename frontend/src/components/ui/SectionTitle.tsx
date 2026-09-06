type SectionTitleProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function SectionTitle({ title, actionLabel, onAction }: SectionTitleProps) {
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
