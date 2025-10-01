"use client";

import React from "react";

type SeriesPoint = { label: string; income: number; expense: number };
type Slice = { label: string; value: number; color: string };

type BarChartProps = {
  data: SeriesPoint[];
  max?: number;
};

const BarChart: React.FC<BarChartProps> = ({ data, max }) => {
  const computedMax = max ?? Math.max(1, ...data.flatMap((d) => [d.income, d.expense]));
  return (
    <div className="w-full bg-white rounded-xl p-3 border border-gray-100">
      <div className="text-[11px] font-bold text-gray-500 mb-2">Income vs Expense (Weekly)</div>
      <div className="grid grid-cols-7 gap-2 items-end h-40">
        {data.map((d, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1">
            <div className="w-full flex-1 flex items-end gap-1">
              <div
                title={`Income: ${d.income.toLocaleString('id-ID')}`}
                className="flex-1 bg-green-500/80 rounded"
                style={{ height: `${(d.income / computedMax) * 100}%` }}
              />
              <div
                title={`Expense: ${d.expense.toLocaleString('id-ID')}`}
                className="flex-1 bg-red-500/80 rounded"
                style={{ height: `${(d.expense / computedMax) * 100}%` }}
              />
            </div>
            <div className="text-[9px] text-gray-500">{d.label}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-3">
        <div className="flex items-center gap-1 text-[9px] text-gray-500">
          <span className="inline-block h-2 w-3 rounded bg-green-500/80" /> Income
        </div>
        <div className="flex items-center gap-1 text-[9px] text-gray-500">
          <span className="inline-block h-2 w-3 rounded bg-red-500/80" /> Expense
        </div>
      </div>
    </div>
  );
};

type DonutChartProps = {
  slices: Slice[];
  size?: number;
  strokeWidth?: number;
  title?: string;
};

const DonutChart: React.FC<DonutChartProps> = ({ slices, size = 160, strokeWidth = 18, title = "Expense Breakdown" }) => {
  const total = Math.max(1, slices.reduce((a, b) => a + b.value, 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const arcs = slices.map((s, i) => {
    const portion = s.value / total;
    const length = portion * circumference;
    const dashArray = `${length} ${circumference - length}`;
    const arc = (
      <circle
        key={i}
        r={radius}
        cx={size / 2}
        cy={size / 2}
        fill="transparent"
        stroke={s.color}
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
        strokeDashoffset={-offset}
        strokeLinecap="butt"
      />
    );
    offset += length;
    return arc;
  });

  return (
    <div className="w-full bg-white rounded-xl p-3 border border-gray-100">
      <div className="text-[11px] font-bold text-gray-500 mb-2">{title}</div>
      <div className="flex items-center gap-4">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            r={radius}
            cx={size / 2}
            cy={size / 2}
            fill="transparent"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {arcs}
          <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="fill-gray-600" style={{ fontSize: 12 }}>
            Rp. {total.toLocaleString('id-ID')}
          </text>
        </svg>
        <div className="flex-1 grid gap-2">
          {slices.map((s, i) => {
            const pct = Math.round((s.value / total) * 100);
            return (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] text-gray-600">
                <span className="inline-block h-2 w-3 rounded" style={{ background: s.color }} />
                <span>{s.label}</span>
              </div>
              <div className="text-[10px] font-semibold">{s.value.toLocaleString('id-ID')} <span className="text-gray-500 font-normal">({isFinite(pct) ? pct : 0}%)</span></div>
            </div>
          )})}
          {slices.length === 0 && <div className="text-[9px] text-gray-400">No data</div>}
        </div>
      </div>
    </div>
  );
};

type ChartsLayoutProps = {
  weekly: SeriesPoint[];
  expenseSlices: Slice[];
  incomeSlices?: Slice[];
};

const ChartsLayout: React.FC<ChartsLayoutProps> = ({ weekly, expenseSlices, incomeSlices = [] }) => {
  return (
    <div className="w-full">
      <div className="p-2 pt-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white border border-gray-100 rounded-xl p-3">
            <div className="text-[9px] text-gray-500">Total Income</div>
            <div className="text-[14px] font-bold text-green-600">Rp. {(weekly.reduce((a, b) => a + b.income, 0)).toLocaleString('id-ID')}</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-3">
            <div className="text-[9px] text-gray-500">Total Expense</div>
            <div className="text-[14px] font-bold text-red-600">Rp. {(weekly.reduce((a, b) => a + b.expense, 0)).toLocaleString('id-ID')}</div>
          </div>
        </div>
      </div>

      <div className="p-2 grid gap-2">
        <BarChart data={weekly} />
        <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
          <DonutChart slices={expenseSlices} title="Expense Breakdown" />
          <DonutChart slices={incomeSlices} title="Income Breakdown" />
        </div>
      </div>
    </div>
  );
};

export default ChartsLayout;
export { BarChart, DonutChart };
