"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart as ReBarChart,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import { getTransactions, getWeeklySeries, getSlices } from "@/lib/storage";

type SeriesPoint = { label: string; income: number; expense: number; iso?: string };
type Slice = { label: string; value: number; color?: string };

const colorFallback = ['#ef4444','#f97316','#f59e0b','#a855f7','#06b6d4','#94a3b8'];
const incomeColor = '#16a34a'; // green-600
// multiple green shades for income donut slices
const incomePalette = ['#16a34a','#22c55e','#4ade80','#86efac','#059669','#10b981'];

const formatRupiah = (v: number) => `Rp. ${v.toLocaleString('id-ID')}`;

const WeeklyBarChart: React.FC<{ data: SeriesPoint[]; onSelect?: (iso: string) => void }> = ({ data, onSelect }) => {
  const handleClick = (entry: any) => {
    if (!entry) return;
    const iso = entry.iso ?? entry.label;
    if (onSelect) onSelect(iso);
    try { window.dispatchEvent(new CustomEvent('sf-analytics-select', { detail: { kind: 'date', value: iso } })); } catch {}
  };

  return (
    <div className="w-full bg-white rounded-xl p-3 border border-gray-100">
  <div className="text-[12px] font-bold text-gray-500 mb-2">Income vs Expense (Weekly)</div>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={data} onClick={(e: any) => handleClick(e?.activePayload?.[0]?.payload)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
            <Tooltip formatter={(value: any) => formatRupiah(Number(value))} />
            <Line type="monotone" dataKey="income" stroke={incomeColor} strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const Donut: React.FC<{ slices: Slice[]; title?: string; onSelect?: (label: string) => void; baseTotal?: number; selected?: string | null }> = ({ slices, title = 'Breakdown', onSelect, baseTotal, selected = null }) => {
  const sliceSum = slices.reduce((a, b) => a + b.value, 0);
  const total = Math.max(1, sliceSum);
  const percentBase = typeof baseTotal === 'number' && baseTotal > 0 ? baseTotal : total;
  return (
    <div className="w-full bg-white rounded-xl p-3 border border-gray-100">
          <div className="text-[12px] font-bold text-gray-500 mb-2">{title}</div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ width: 140, height: 140 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={slices} dataKey="value" nameKey="label" innerRadius={40} outerRadius={60} onClick={(e: any) => onSelect?.(e.label)}>
                {slices.map((s, i) => (
                  <Cell
                    key={i}
                    fill={s.color ?? colorFallback[i % colorFallback.length]}
                    stroke={selected === s.label ? '#111827' : undefined}
                    strokeWidth={selected === s.label ? 3 : 1}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => formatRupiah(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1 }}>
          {slices.map((s, i) => (
            <div key={i} className={`flex items-center justify-between text-[11px] mb-2 ${selected === s.label ? 'bg-gray-50 rounded px-2 py-1' : ''}`}>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="inline-block h-2 w-3 rounded" style={{ background: s.color ?? colorFallback[i % colorFallback.length] }} />
                <button onClick={() => { onSelect?.(s.label); try { window.dispatchEvent(new CustomEvent('sf-analytics-select', { detail: { kind: 'category', value: s.label } })); } catch {} }} className={`text-left ${selected === s.label ? 'font-bold text-gray-800' : ''}`}>{s.label}{selected === s.label ? ' ←' : ''}</button>
              </div>
              <div className="font-semibold">{s.value.toLocaleString('id-ID')} <span className="text-gray-500 font-normal">({((s.value/percentBase)*100).toFixed(2)}%)</span></div>
            </div>
          ))}
          {slices.length === 0 && <div className="text-[10px] text-gray-400">No data</div>}
        </div>
      </div>
    </div>
  );
};

const ChartsLayout: React.FC = () => {
  const [txs, setTxs] = useState(() => getTransactions());
  const [selectedDetail, setSelectedDetail] = useState<{ kind: 'date'|'category'|null; value?: string }>(() => ({ kind: null }));
  const detailsRef = React.useRef<HTMLDivElement | null>(null);
  // Filters: mode can be 'cutoff' (21 prev -> 20 cur), 'month' (calendar month), or 'range'
  const now = new Date();
  const [filterMode, setFilterMode] = useState<'cutoff'|'month'|'range'>('cutoff');
  const [filterMonth, setFilterMonth] = useState<number>(now.getMonth() + 1); // 1-12
  const [filterYear, setFilterYear] = useState<number>(now.getFullYear());
  const [rangeStart, setRangeStart] = useState<string>(''); // ISO yyyy-mm-dd
  const [rangeEnd, setRangeEnd] = useState<string>('');

  useEffect(() => {
    const refresh = () => setTxs(getTransactions());
    window.addEventListener('sf-storage-updated', refresh);
    return () => window.removeEventListener('sf-storage-updated', refresh);
  }, []);

  // helpers
  const pad = (n: number) => String(n).padStart(2, '0');
  const iso = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

  const getCutoffForMonth = (year: number, month: number) => {
    // cutoff covers 21 of previous month -> 20 of given month
    const prev = new Date(year, month - 2); // JS months 0-based
    const prevYear = prev.getFullYear();
    const prevMonth = prev.getMonth() + 1;
    const start = iso(prevYear, prevMonth, 21);
    const end = iso(year, month, 20);
    return { start, end };
  };

  const getCurrentCutoff = (ref = new Date()) => {
    const d = ref.getDate();
    const y = ref.getFullYear();
    const m = ref.getMonth() + 1;
    if (d <= 20) {
      // start = 21 previous month, end = 20 current month
      return getCutoffForMonth(y, m);
    }
    // d > 20: start = 21 current month, end = 20 next month
    const next = new Date(y, m); // next month
    return { start: iso(y, m, 21), end: iso(next.getFullYear(), next.getMonth() + 1, 20) };
  };

  const computeRange = () => {
    if (filterMode === 'cutoff') return getCurrentCutoff();
    if (filterMode === 'month') return getCutoffForMonth(filterYear, filterMonth);
    if (filterMode === 'range') {
      if (!rangeStart || !rangeEnd) {
        // default to current month if not set
        const first = iso(now.getFullYear(), now.getMonth()+1, 1);
        const last = iso(now.getFullYear(), now.getMonth()+1, new Date(now.getFullYear(), now.getMonth()+1, 0).getDate());
        return { start: first, end: last };
      }
      return { start: rangeStart, end: rangeEnd };
    }
    return getCurrentCutoff();
  };

  const { start: activeStart, end: activeEnd } = computeRange();

  const txsFiltered = useMemo(() => {
    // include transactions whose date is between activeStart and activeEnd inclusive
    return txs.filter(t => t.date >= activeStart && t.date <= activeEnd);
  }, [txs, activeStart, activeEnd]);

  // Compute synthetic rollover (sisa bulan sebelumnya) when current date is past the active cutoff end.
  const ROLLOVER_LABEL = 'Sisa Bulan Sebelumnya';
  const rolloverAmount = useMemo(() => {
    try {
      const now = new Date();
      const endDate = new Date(activeEnd);
      // only apply rollover if current time is after the active cutoff end
      if (now <= endDate) return 0;
      // determine previous cutoff period (shift one month back from activeStart)
      const startDate = new Date(activeStart);
      const prev = new Date(startDate);
      prev.setMonth(startDate.getMonth() - 1);
      const prevYear = prev.getFullYear();
      const prevMonth = prev.getMonth() + 1; // 1-12
      const prevRange = getCutoffForMonth(prevYear, prevMonth);
      // previous cutoff transactions (exclude 'Tarik Tunai' transfers)
      const prevTxs = txs.filter(t => t.date >= prevRange.start && t.date <= prevRange.end && t.category !== 'Tarik Tunai');
      const net = prevTxs.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
      return Math.max(0, net);
    } catch (e) {
      return 0;
    }
  }, [txs, activeStart, activeEnd]);

  const weekly = useMemo(() => {
    // compute last 7 days (today and 6 previous days) and aggregate using filtered transactions
    const end = new Date();
    end.setHours(0,0,0,0);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    const days: SeriesPoint[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      d.setHours(0,0,0,0);
      const isoStr = d.toISOString().slice(0,10);
      const displayLabel = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      const dayTx = txsFiltered.filter(t => t.date === isoStr);
      let income = dayTx.filter(t => t.type === 'income' && t.category !== 'Tarik Tunai').reduce((a, b) => a + b.amount, 0);
      const expense = dayTx.filter(t => t.type === 'expense' && t.category !== 'Tarik Tunai').reduce((a, b) => a + b.amount, 0);
      // if rollover applies and the day equals activeStart, add the synthetic deposit
      if (rolloverAmount > 0 && isoStr === activeStart) {
        income += rolloverAmount;
      }
      days.push({ label: displayLabel, income, expense, iso: isoStr });
    }
    return days;
  }, [txsFiltered, rolloverAmount, activeStart]);

  const expenseSlices = useMemo(() => {
    const map = new Map<string, number>();
    // exclude internal transfer category 'Tarik Tunai' from expense analytics
    txsFiltered.filter(t => t.type === 'expense' && t.category !== 'Tarik Tunai').forEach(t => map.set(t.category, (map.get(t.category)||0)+t.amount));
    return Array.from(map.entries()).map(([label,value], i) => ({ label, value, color: colorFallback[i % colorFallback.length] } as Slice));
  }, [txsFiltered]);

  const incomeSlices = useMemo(() => {
    const map = new Map<string, number>();
    // exclude internal transfer category 'Tarik Tunai' from income analytics
    txsFiltered.filter(t => t.type === 'income' && t.category !== 'Tarik Tunai').forEach(t => map.set(t.category, (map.get(t.category)||0)+t.amount));
    // include rollover slice when present
    if (rolloverAmount > 0) {
      map.set(ROLLOVER_LABEL, (map.get(ROLLOVER_LABEL) || 0) + rolloverAmount);
    }
    return Array.from(map.entries()).map(([label,value], i) => ({ label, value, color: incomePalette[i % incomePalette.length] } as Slice));
  }, [txsFiltered]);

  const incomeTotal = useMemo(() => {
    const base = txsFiltered.filter(t => t.type === 'income' && t.category !== 'Tarik Tunai').reduce((a,b)=>a+b.amount,0);
    return base + (rolloverAmount || 0);
  }, [txsFiltered, rolloverAmount]);

  const details = useMemo(() => {
    if (!selectedDetail.kind) return [] as any[];
    if (selectedDetail.kind === 'date') {
      return txsFiltered.filter(t => t.date === selectedDetail.value);
    }
    // if the selected category is the synthetic rollover, return a synthetic transaction
    if (selectedDetail.value === ROLLOVER_LABEL) {
      if (rolloverAmount <= 0) return [];
      return [{ id: 'synthetic-rollover', type: 'income', amount: rolloverAmount, date: activeStart, account: 'bank' as any, category: ROLLOVER_LABEL, description: 'Deposit sisa bulan sebelumnya', createdAt: Date.now() }];
    }
    return txsFiltered.filter(t => t.category === selectedDetail.value);
  }, [selectedDetail, txsFiltered]);

  // auto-scroll to details when a category/date is selected
  useEffect(() => {
    if (!selectedDetail.kind) return;
    // small timeout to allow layout to update
    const t = setTimeout(() => {
      try {
        if (detailsRef.current) {
          detailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } catch (e) {}
    }, 60);
    return () => clearTimeout(t);
  }, [selectedDetail]);

  return (
    <div className="w-full">
      <div className="p-2 pt-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white border border-gray-100 rounded-xl p-3">
            <div className="text-[9px] text-gray-500">Total Income</div>
            <div className="text-[14px] font-bold text-green-600">{formatRupiah(txsFiltered.filter(t=>t.type==='income' && t.category !== 'Tarik Tunai').reduce((a,b)=>a+b.amount,0))}</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-3">
            <div className="text-[9px] text-gray-500">Total Expense</div>
              <div className="text-[14px] font-bold text-red-600">{formatRupiah(txsFiltered.filter(t=>t.type==='expense' && t.category !== 'Tarik Tunai').reduce((a,b)=>a+b.amount,0))}</div>
          </div>
        </div>
      </div>

      <div className="p-2 grid gap-2">
        {/* Filter controls */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col md:flex-row gap-2 items-start md:items-center">
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-gray-600 mr-1">Mode:</label>
            <select value={filterMode} onChange={(e) => setFilterMode(e.target.value as any)} className="border rounded px-2 py-1 text-[12px]">
              <option value="cutoff">Cutoff (21→20)</option>
              <option value="month">Month (21 prev → 20)</option>
              <option value="range">Range</option>
            </select>
          </div>

          {filterMode === 'month' && (
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-gray-600">Month:</label>
              <select value={String(filterMonth)} onChange={(e) => setFilterMonth(Number(e.target.value))} className="border rounded px-2 py-1 text-[12px]">
                {[...Array(12)].map((_,i) => <option key={i} value={i+1}>{String(i+1).padStart(2,'0')}</option>)}
              </select>
              <label className="text-[11px] text-gray-600">Year:</label>
              <input type="number" value={filterYear} onChange={(e) => setFilterYear(Number(e.target.value))} className="border rounded px-2 py-1 w-24 text-[12px]" />
            </div>
          )}

          {filterMode === 'range' && (
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-gray-600">From:</label>
              <input type="date" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} className="border rounded px-2 py-1 text-[12px]" />
              <label className="text-[11px] text-gray-600">To:</label>
              <input type="date" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} className="border rounded px-2 py-1 text-[12px]" />
            </div>
          )}

          <div className="ml-auto text-[11px] text-gray-500">Active: {activeStart} → {activeEnd}</div>
        </div>

        <WeeklyBarChart data={weekly} onSelect={(iso) => setSelectedDetail({ kind: 'date', value: iso })} />
        <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
          <Donut slices={expenseSlices} title="Expense Breakdown" baseTotal={incomeTotal} selected={selectedDetail.kind === 'category' ? selectedDetail.value ?? null : null} onSelect={(label) => setSelectedDetail({ kind: 'category', value: label })} />
          <Donut slices={incomeSlices} title="Income Breakdown" selected={selectedDetail.kind === 'category' ? selectedDetail.value ?? null : null} onSelect={(label) => setSelectedDetail({ kind: 'category', value: label })} />
        </div>

        <div className="mt-2" ref={detailsRef}>
          {selectedDetail.kind && (
            <div className="bg-white border border-gray-100 rounded-xl p-3">
              <div className="text-[11px] font-bold text-gray-500 mb-2">Details: {selectedDetail.kind} {selectedDetail.value}</div>
              {details.length === 0 ? (
                <div className="text-[10px] text-gray-400">No transactions found</div>
              ) : (
                <div className="grid gap-2">
                  {details.map((t, i) => (
                    <div key={i} className="flex justify-between text-[10px]">
                      <div className="text-gray-600">{t.description || ''}</div>
                      <div className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{formatRupiah(t.amount)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartsLayout;
