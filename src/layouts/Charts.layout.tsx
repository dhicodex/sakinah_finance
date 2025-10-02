"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart as ReBarChart,
  Bar,
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
      <div className="text-[11px] font-bold text-gray-500 mb-2">Income vs Expense (Weekly)</div>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <ReBarChart data={data} onClick={(e: any) => handleClick(e?.activePayload?.[0]?.payload)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip formatter={(value: any) => formatRupiah(Number(value))} />
            <Bar dataKey="income" fill="#22c55e" />
            <Bar dataKey="expense" fill="#ef4444" />
          </ReBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const Donut: React.FC<{ slices: Slice[]; title?: string; onSelect?: (label: string) => void }> = ({ slices, title = 'Breakdown', onSelect }) => {
  const total = Math.max(1, slices.reduce((a, b) => a + b.value, 0));
  return (
    <div className="w-full bg-white rounded-xl p-3 border border-gray-100">
      <div className="text-[11px] font-bold text-gray-500 mb-2">{title}</div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ width: 140, height: 140 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={slices} dataKey="value" nameKey="label" innerRadius={40} outerRadius={60} onClick={(e: any) => onSelect?.(e.label)}>
                {slices.map((s, i) => (
                  <Cell key={i} fill={s.color ?? colorFallback[i % colorFallback.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => formatRupiah(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1 }}>
          {slices.map((s, i) => (
            <div key={i} className="flex items-center justify-between text-[10px] mb-2">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="inline-block h-2 w-3 rounded" style={{ background: s.color ?? colorFallback[i % colorFallback.length] }} />
                <button onClick={() => { onSelect?.(s.label); try { window.dispatchEvent(new CustomEvent('sf-analytics-select', { detail: { kind: 'category', value: s.label } })); } catch {} }} className="text-left">{s.label}</button>
              </div>
              <div className="font-semibold">{s.value.toLocaleString('id-ID')} <span className="text-gray-500 font-normal">({Math.round((s.value/total)*100)}%)</span></div>
            </div>
          ))}
          {slices.length === 0 && <div className="text-[9px] text-gray-400">No data</div>}
        </div>
      </div>
    </div>
  );
};

const ChartsLayout: React.FC = () => {
  const [txs, setTxs] = useState(() => getTransactions());
  const [selectedDetail, setSelectedDetail] = useState<{ kind: 'date'|'category'|null; value?: string }>(() => ({ kind: null }));

  useEffect(() => {
    const refresh = () => setTxs(getTransactions());
    window.addEventListener('sf-storage-updated', refresh);
    return () => window.removeEventListener('sf-storage-updated', refresh);
  }, []);

  const weekly = useMemo(() => {
    // reuse helper to compute weekly from current date but based on txs
    const start = new Date();
    const day = start.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    start.setDate(start.getDate() + diff);
    start.setHours(0,0,0,0);
    const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    return labels.map((label, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const iso = d.toISOString().slice(0,10);
      const dayTx = txs.filter(t => t.date === iso);
      const income = dayTx.filter(t => t.type==='income').reduce((a,b)=>a+b.amount,0);
      const expense = dayTx.filter(t => t.type==='expense').reduce((a,b)=>a+b.amount,0);
      return { label, income, expense, iso } as SeriesPoint;
    });
  }, [txs]);

  const expenseSlices = useMemo(() => {
    const map = new Map<string, number>();
    txs.filter(t => t.type === 'expense').forEach(t => map.set(t.category, (map.get(t.category)||0)+t.amount));
    return Array.from(map.entries()).map(([label,value], i) => ({ label, value, color: colorFallback[i % colorFallback.length] } as Slice));
  }, [txs]);

  const incomeSlices = useMemo(() => {
    const map = new Map<string, number>();
    txs.filter(t => t.type === 'income').forEach(t => map.set(t.category, (map.get(t.category)||0)+t.amount));
    return Array.from(map.entries()).map(([label,value], i) => ({ label, value, color: colorFallback[i % colorFallback.length] } as Slice));
  }, [txs]);

  const details = useMemo(() => {
    if (!selectedDetail.kind) return [] as any[];
    if (selectedDetail.kind === 'date') {
      return txs.filter(t => t.date === selectedDetail.value);
    }
    return txs.filter(t => t.category === selectedDetail.value);
  }, [selectedDetail, txs]);

  return (
    <div className="w-full">
      <div className="p-2 pt-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white border border-gray-100 rounded-xl p-3">
            <div className="text-[9px] text-gray-500">Total Income</div>
            <div className="text-[14px] font-bold text-green-600">{formatRupiah(txs.filter(t=>t.type==='income').reduce((a,b)=>a+b.amount,0))}</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-3">
            <div className="text-[9px] text-gray-500">Total Expense</div>
            <div className="text-[14px] font-bold text-red-600">{formatRupiah(txs.filter(t=>t.type==='expense').reduce((a,b)=>a+b.amount,0))}</div>
          </div>
        </div>
      </div>

      <div className="p-2 grid gap-2">
        <WeeklyBarChart data={weekly} onSelect={(iso) => setSelectedDetail({ kind: 'date', value: iso })} />
        <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
          <Donut slices={expenseSlices} title="Expense Breakdown" onSelect={(label) => setSelectedDetail({ kind: 'category', value: label })} />
          <Donut slices={incomeSlices} title="Income Breakdown" onSelect={(label) => setSelectedDetail({ kind: 'category', value: label })} />
        </div>

        <div className="mt-2">
          {selectedDetail.kind && (
            <div className="bg-white border border-gray-100 rounded-xl p-3">
              <div className="text-[11px] font-bold text-gray-500 mb-2">Details: {selectedDetail.kind} {selectedDetail.value}</div>
              {details.length === 0 ? (
                <div className="text-[10px] text-gray-400">No transactions found</div>
              ) : (
                <div className="grid gap-2">
                  {details.map((t, i) => (
                    <div key={i} className="flex justify-between text-[10px]">
                      <div className="text-gray-600">{t.category} • {t.description || ''}</div>
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
