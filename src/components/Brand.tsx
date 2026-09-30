export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3" aria-label="TravisGold">
      <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-navy shadow-soft">
        <span className="text-lg font-extrabold text-champagne">T</span>
        <span className="absolute bottom-2 right-1.5 h-2.5 w-4 skew-x-[-24deg] rounded-sm bg-champagne-light" />
        <span className="absolute right-1 top-1 text-[9px] text-cream">✦</span>
      </div>
      {!compact && <span className="hidden text-lg font-bold tracking-tight text-navy sm:block">TravisGold</span>}
    </div>
  );
}
