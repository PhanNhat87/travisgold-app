import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Gem,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Store, StoreSelection, Transaction } from '../types';
import { formatNumber, formatVND, summarize } from '../utils/calculations';
import { EmptyState } from '../components/EmptyState';
import { StoreSelector } from '../components/StoreSelector';
import { useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

const startOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

const iso = (d: Date) => d.toLocaleDateString('sv-SE');

type TileTone = 'neutral' | 'buy' | 'sale' | 'money' | 'gold';

function MetricTile({
  icon: Icon,
  label,
  value,
  tone = 'neutral',
  className = '',
  valueClassName = '',
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: TileTone;
  className?: string;
  valueClassName?: string;
}) {
  const tones: Record<TileTone, string> = {
    neutral: 'from-white to-[#fffaf0] text-[#0B1F33]',
    buy: 'from-[#fffdf7] to-[#f8f4e8] text-[#0B1F33]',
    sale: 'from-[#fffdf7] to-[#fff7f5] text-[#0B1F33]',
    money: 'from-[#fffdf7] to-[#faf7ef] text-[#0B1F33]',
    gold: 'from-[#fff8df] to-[#f3d58a]/35 text-[#0B1F33]',
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-[22px] border border-[#eadfca]/80 bg-gradient-to-br ${tones[tone]} p-4 shadow-[0_12px_32px_rgba(11,31,51,0.07)] sm:p-5 ${className}`}
    >
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-champagne/10 blur-xl" />

      <div className="relative flex h-full items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#fff3cf] text-[#9b6400] shadow-inner">
          <Icon size={21} strokeWidth={2.1} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold leading-4 text-slate-500 sm:text-sm">
            {label}
          </p>

          <p
            className={`mt-1 font-extrabold leading-tight tracking-[-0.035em] text-navy ${valueClassName || 'text-[22px] sm:text-2xl'}`}
          >
            {value}
          </p>
        </div>

        <ChevronRight
          size={18}
          className="shrink-0 text-[#b9821f] opacity-70"
        />
      </div>
    </div>
  );
}

function GoldHeroArtwork() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 w-[48%] overflow-hidden rounded-r-[28px] opacity-95">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_40%,rgba(243,213,138,0.55),transparent_34%),radial-gradient(circle_at_75%_70%,rgba(214,179,106,0.4),transparent_28%)]" />

      <svg
        viewBox="0 0 300 220"
        className="absolute bottom-[-2px] right-[-8px] h-[96%] w-[112%]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="goldA" x1="0" x2="1">
            <stop offset="0%" stopColor="#a66f0f" />
            <stop offset="45%" stopColor="#f3d58a" />
            <stop offset="100%" stopColor="#c9942f" />
          </linearGradient>

          <linearGradient id="goldB" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff1b8" />
            <stop offset="100%" stopColor="#bb7c18" />
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <ellipse
          cx="206"
          cy="155"
          rx="80"
          ry="22"
          fill="rgba(5,20,34,.22)"
        />

        <path
          d="M173 43 C195 72 228 84 250 54"
          fill="none"
          stroke="url(#goldA)"
          strokeWidth="9"
          strokeLinecap="round"
        />

        <circle
          cx="211"
          cy="76"
          r="13"
          fill="#fff"
          stroke="url(#goldA)"
          strokeWidth="5"
          filter="url(#glow)"
        />

        <circle cx="211" cy="76" r="5" fill="#dff2ff" />

        <path
          d="M122 122 C150 94 195 94 223 123 C197 150 151 151 122 122Z"
          fill="none"
          stroke="url(#goldA)"
          strokeWidth="9"
        />

        <circle
          cx="171"
          cy="111"
          r="12"
          fill="#fff"
          stroke="#d6b36a"
          strokeWidth="4"
          filter="url(#glow)"
        />

        <path
          d="M187 145 h57 l14 39 h-84z"
          fill="url(#goldB)"
          stroke="#ffd978"
          strokeWidth="2"
        />

        <path
          d="M146 154 h44 l11 30 h-66z"
          fill="url(#goldB)"
          stroke="#ffd978"
          strokeWidth="2"
        />

        <path
          d="M215 132 h42 l11 29 h-63z"
          fill="url(#goldB)"
          stroke="#ffd978"
          strokeWidth="2"
        />

        <path
          d="M225 143h24"
          stroke="#7b4f0b"
          strokeWidth="2"
          opacity=".55"
        />

        <path
          d="M155 165h26"
          stroke="#7b4f0b"
          strokeWidth="2"
          opacity=".55"
        />

        <circle cx="265" cy="55" r="3" fill="#fff7d1" />
        <circle cx="278" cy="73" r="2" fill="#fff7d1" />

        <path
          d="M267 48v14M260 55h14"
          stroke="#fff7d1"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

const quickCategories = [
  { label: 'Nhẫn', icon: Gem },
  { label: 'Dây chuyền', icon: Sparkles },
  { label: 'Vàng 24K', icon: ShieldCheck },
  { label: 'Trang sức', icon: CircleDollarSign },
];

export function DashboardPage({
  stores,
  transactions,
  selection,
  onSelection,
}: {
  stores: Store[];
  transactions: Transaction[];
  selection: StoreSelection;
  onSelection: (v: StoreSelection) => void;
}) {
  const [range, setRange] =
    useState<'7' | '30' | 'month' | 'custom' | 'all'>('30');

  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const filtered = useMemo(() => {
    const now = new Date();
    let min = new Date(0);

    if (range === '7' || range === '30') {
      min = new Date();
      min.setDate(now.getDate() - Number(range) + 1);
    }

    if (range === 'month') {
      min = startOfMonth();
    }

    return transactions.filter((t) => {
      const storeOk =
        selection === 'all' || t.storeId === selection;

      const timeOk =
        range === 'all'
          ? true
          : range === 'custom'
            ? (!customFrom || t.date >= customFrom) &&
              (!customTo || t.date <= customTo)
            : t.date >= iso(min);

      return storeOk && timeOk;
    });
  }, [
    transactions,
    selection,
    range,
    customFrom,
    customTo,
  ]);

  const summary = summarize(filtered);

  const storeSummaries = stores.map((s) => ({
    store: s,
    summary: summarize(
      filtered.filter((t) => t.storeId === s.id),
    ),
  }));

  const dailyMap = new Map<
    string,
    {
      date: string;
      store1: number;
      store2: number;
      profit1: number;
      profit2: number;
    }
  >();

  filtered.forEach((t) => {
    const row = dailyMap.get(t.date) || {
      date: t.date.slice(5),
      store1: 0,
      store2: 0,
      profit1: 0,
      profit2: 0,
    };

    if (t.storeId === 'store-1') {
      row.store1 += t.saleTotal;
      row.profit1 += t.profit;
    } else {
      row.store2 += t.saleTotal;
      row.profit2 += t.profit;
    }

    dailyMap.set(t.date, row);
  });

  const chartData = [...dailyMap.values()].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  return (
    <div className="space-y-4 sm:space-y-5">

      {/* HERO */}
      <section className="relative overflow-hidden rounded-[28px] border border-[#d9bf82]/30 bg-gradient-to-br from-[#081b2f] via-[#0c2947] to-[#163a5f] p-5 text-white shadow-[0_18px_50px_rgba(11,31,51,0.18)] sm:p-7">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(243,213,138,.18),transparent_34%),linear-gradient(120deg,transparent_0%,rgba(255,255,255,.03)_55%,transparent_100%)]" />

        <GoldHeroArtwork />

        <div className="relative z-10 max-w-[62%] sm:max-w-[58%]">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em] text-champagne-light">
            <Sparkles size={14} />
            TravisGold
          </div>

          <h2 className="text-[27px] font-extrabold leading-[1.04] tracking-[-0.035em] sm:text-4xl">
            Quản lý tiệm vàng hiệu quả
          </h2>

          <p className="mt-3 max-w-md text-xs leading-5 text-white/70 sm:text-sm">
            Mua vào, bán ra và doanh thu của hai cửa hàng
            trong một màn hình rõ ràng.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-[11px] font-semibold text-white/90 backdrop-blur-md sm:text-xs">
            <ShieldCheck
              size={14}
              className="text-champagne-light"
            />
            Dữ liệu lưu cục bộ • PWA
          </div>
        </div>
      </section>

      {/* STORE */}
      <StoreSelector
        stores={stores}
        value={selection}
        onChange={onSelection}
      />

      {/* RANGE */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {(
          [
            ['7', '7 ngày'],
            ['30', '30 ngày'],
            ['month', 'Tháng này'],
            ['custom', 'Tùy chọn'],
            ['all', 'Tất cả'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setRange(id)}
            className={`min-h-11 shrink-0 rounded-2xl border px-4 text-sm font-bold transition active:scale-[0.98] ${
              range === id
                ? 'border-[#c99b3f] bg-navy text-white shadow-[0_8px_20px_rgba(11,31,51,.15)]'
                : 'border-[#eadfca] bg-white text-slate-600'
            }`}
          >
            {id === 'custom' && (
              <CalendarDays
                size={15}
                className="mr-1 inline-block -translate-y-[1px]"
              />
            )}

            {label}
          </button>
        ))}
      </div>

      {/* CUSTOM DATE */}
      {range === 'custom' && (
        <div className="grid gap-3 rounded-3xl border border-[#eadfca] bg-white p-4 shadow-soft sm:grid-cols-2">

          <label className="text-sm font-semibold text-slate-600">
            Từ ngày

            <input
              type="date"
              className="field mt-2"
              value={customFrom}
              onChange={(e) =>
                setCustomFrom(e.target.value)
              }
            />
          </label>

          <label className="text-sm font-semibold text-slate-600">
            Đến ngày

            <input
              type="date"
              className="field mt-2"
              value={customTo}
              onChange={(e) =>
                setCustomTo(e.target.value)
              }
            />
          </label>

        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <>

          {/* THỐNG KÊ SỐ LƯỢNG */}
          <div className="grid grid-cols-2 gap-3">

            <MetricTile
              icon={ReceiptText}
              label="Giao dịch"
              value={formatNumber(
                summary.transactionCount,
              )}
            />

            <MetricTile
              icon={Boxes}
              label="Số lượng tồn"
              value={formatNumber(
                summary.remainingQuantity,
              )}
              tone="gold"
            />

            {/* LUÔN NẰM CÙNG HÀNG */}
            <MetricTile
              icon={ArrowDownToLine}
              label="SL mua vào"
              value={formatNumber(
                summary.purchaseQuantity,
              )}
              tone="buy"
            />

            <MetricTile
              icon={ArrowUpFromLine}
              label="SL bán ra"
              value={formatNumber(
                summary.saleQuantity,
              )}
              tone="sale"
            />

          </div>

          {/* TIỀN - FULL WIDTH MOBILE */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

            <MetricTile
              icon={CircleDollarSign}
              label="Tiền mua vào"
              value={formatVND(
                summary.purchaseTotal,
              )}
              tone="money"
              className="min-h-[118px]"
              valueClassName="whitespace-nowrap text-[clamp(1.65rem,7vw,2.4rem)]"
            />

            <MetricTile
              icon={CircleDollarSign}
              label="Tiền bán ra"
              value={formatVND(
                summary.saleTotal,
              )}
              tone="money"
              className="min-h-[118px]"
              valueClassName="whitespace-nowrap text-[clamp(1.65rem,7vw,2.4rem)]"
            />

          </div>

          {/* PROFIT */}
          <div className="relative overflow-hidden rounded-[24px] border border-[#dfc176] bg-gradient-to-r from-[#fff7dc] via-[#f7df9a] to-[#d6b36a] p-5 shadow-[0_14px_36px_rgba(166,111,15,.16)]">

            <div className="absolute right-[-18px] top-[-26px] h-32 w-32 rounded-full bg-white/30 blur-2xl" />

            <div className="relative flex items-center gap-4">

              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/60 text-[#8b5b0b] shadow-inner">
                <TrendingUp size={23} />
              </span>

              <div className="min-w-0 flex-1">

                <p className="text-sm font-bold text-[#6f511f]">
                  Lợi nhuận dự kiến
                </p>

                <p className="mt-1 whitespace-nowrap text-[clamp(1.8rem,7vw,2.6rem)] font-black tracking-[-0.04em] text-navy">
                  {formatVND(summary.profit)}
                </p>

                <p className="mt-1 text-[11px] font-medium text-[#795d2b]">
                  Theo giá vốn của số lượng đã bán
                </p>

              </div>

              <div className="hidden h-16 w-24 items-end justify-end gap-1 sm:flex">
                {[28, 42, 34, 55, 72].map(
                  (h, i) => (
                    <span
                      key={i}
                      className="w-3 rounded-t-md bg-[#8c641d]/40"
                      style={{
                        height: `${h}%`,
                      }}
                    />
                  ),
                )}
              </div>

            </div>
          </div>

          {/* CATEGORY */}
          <section className="rounded-[26px] border border-[#eadfca] bg-white p-4 shadow-[0_12px_32px_rgba(11,31,51,.06)] sm:p-5">

            <div className="mb-4 flex items-center justify-between">

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#b9821f]">
                  Danh mục nhanh
                </p>

                <h3 className="mt-1 text-lg font-extrabold text-navy">
                  Không gian tiệm vàng
                </h3>
              </div>

              <Gem
                className="text-[#b9821f]"
                size={22}
              />

            </div>

            <div className="grid grid-cols-4 gap-2">

              {quickCategories.map(
                ({ label, icon: Icon }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-[#eee3cf] bg-gradient-to-b from-[#fffaf0] to-white p-3 text-center"
                  >

                    <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-[#fff0c2] text-[#9f6808]">
                      <Icon size={19} />
                    </span>

                    <p className="mt-2 truncate text-[11px] font-bold text-navy sm:text-xs">
                      {label}
                    </p>

                  </div>
                ),
              )}

            </div>
          </section>

          {/* STORE SUMMARY */}
          {selection === 'all' && (
            <div className="grid gap-3 md:grid-cols-3">

              {storeSummaries.map(
                ({ store, summary: s }) => (
                  <div
                    key={store.id}
                    className="rounded-3xl border border-[#eadfca] bg-white p-5 shadow-soft"
                  >

                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor:
                            store.color,
                        }}
                      />

                      <h3 className="font-bold text-navy">
                        {store.name}
                      </h3>
                    </div>

                    <p className="mt-4 text-xs text-slate-400">
                      Doanh thu bán
                    </p>

                    <p className="mt-1 text-xl font-bold text-navy">
                      {formatVND(
                        s.saleTotal,
                      )}
                    </p>

                    <p
                      className={`mt-2 text-sm font-semibold ${
                        s.profit >= 0
                          ? 'text-success'
                          : 'text-danger'
                      }`}
                    >
                      Lợi nhuận{' '}
                      {formatVND(s.profit)}
                    </p>

                  </div>
                ),
              )}

              <div className="rounded-3xl bg-navy p-5 text-white shadow-soft">

                <h3 className="font-bold text-champagne-light">
                  Tổng 2 cửa hàng
                </h3>

                <p className="mt-4 text-xs text-white/60">
                  Doanh thu bán
                </p>

                <p className="mt-1 text-xl font-extrabold">
                  {formatVND(
                    summary.saleTotal,
                  )}
                </p>

                <p className="mt-2 text-sm font-bold text-champagne-light">
                  Lợi nhuận{' '}
                  {formatVND(
                    summary.profit,
                  )}
                </p>

              </div>

            </div>
          )}

          {/* CHART */}
          <div className="rounded-[26px] border border-[#eadfca] bg-white p-4 shadow-soft sm:p-6">

            <div className="mb-5 flex items-start justify-between gap-3">

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b9821f]">
                  Biểu đồ
                </p>

                <h3 className="mt-1 font-extrabold text-navy">
                  Doanh thu bán ra theo ngày
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  So sánh hai cửa hàng
                </p>
              </div>

              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#fff3cf] text-[#9b6400]">
                <TrendingUp size={19} />
              </span>

            </div>

            <div className="h-72 w-full">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart data={chartData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#eee7db"
                  />

                  <XAxis
                    dataKey="date"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    tickFormatter={(v) =>
                      `${Math.round(
                        v / 1000000,
                      )}tr`
                    }
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip
                    formatter={(v) =>
                      formatVND(Number(v))
                    }
                    contentStyle={{
                      borderRadius: 16,
                      borderColor:
                        '#eadfca',
                    }}
                  />

                  <Legend />

                  <Bar
                    dataKey="store1"
                    name={
                      stores[0]?.name ||
                      'Cửa hàng 1'
                    }
                    fill="#D6B36A"
                    radius={[7, 7, 0, 0]}
                  />

                  <Bar
                    dataKey="store2"
                    name={
                      stores[1]?.name ||
                      'Cửa hàng 2'
                    }
                    fill="#163A5F"
                    radius={[7, 7, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

          {/* PROFIT CHART */}
          <div className="rounded-[26px] border border-[#eadfca] bg-white p-4 shadow-soft sm:p-6">

            <h3 className="font-extrabold text-navy">
              So sánh lợi nhuận
            </h3>

            <div className="mt-5 h-64">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={storeSummaries.map(
                    ({
                      store,
                      summary: s,
                    }) => ({
                      name: store.name,
                      profit: s.profit,
                    }),
                  )}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#eee7db"
                  />

                  <XAxis
                    dataKey="name"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    tickFormatter={(v) =>
                      `${Math.round(
                        v / 1000000,
                      )}tr`
                    }
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip
                    formatter={(v) =>
                      formatVND(Number(v))
                    }
                    contentStyle={{
                      borderRadius: 16,
                      borderColor:
                        '#eadfca',
                    }}
                  />

                  <Bar
                    dataKey="profit"
                    name="Lợi nhuận"
                    fill="#C99733"
                    radius={[8, 8, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

        </>
      )}
    </div>
  );
}
