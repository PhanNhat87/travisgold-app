import type { LucideIcon } from 'lucide-react';

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  className?: string;
  valueClassName?: string;
  tone?: 'default' | 'gold';
};

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  className = '',
  valueClassName = '',
  tone = 'default',
}: StatCardProps) {
  const toneClass =
    tone === 'gold'
      ? 'border-[#E8D39A] bg-gradient-to-br from-[#FFF9E8] to-[#F8E7AF]'
      : 'border-[#EEE8DA] bg-white';

  return (
    <div
      className={`rounded-[28px] border p-4 shadow-soft sm:p-5 ${toneClass} ${className}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#FFF3CC] text-[#A66A00]">
          <Icon size={22} />
        </span>
      </div>

      <p className="text-sm font-semibold leading-snug text-slate-500 sm:text-base">
        {label}
      </p>

      <p
        className={`mt-2 leading-tight tracking-tight text-navy font-bold whitespace-nowrap text-[clamp(1.7rem,5vw,2.5rem)] ${valueClassName}`}
      >
        {value}
      </p>

      {hint && (
        <p className="mt-2 text-xs leading-5 text-slate-400">
          {hint}
        </p>
      )}
    </div>
  );
}
