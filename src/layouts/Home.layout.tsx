"use client";

import EmptyState from "@/components/EmptyState";
import CardTranscation from "@/components/CardTransaction";
import { LuCircleDollarSign, LuBanknote, LuSlidersHorizontal } from "react-icons/lu";
import { computeTotals, groupByDate, getTransactions } from "@/lib/storage";
import { useEffect, useRef, useState, useMemo } from "react";

type FilterState = {
    type: 'all' | 'income' | 'expense';
    preset: 'all' | 'week' | 'month' | 'range';
    from?: string | null; // yyyy-mm-dd
    to?: string | null; // yyyy-mm-dd
    monthIndex?: number | null;
    year?: number | null;
}

const HomeLayout = () => {
    const today = useMemo(() => new Date(), []);
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    // start with safe defaults so server and client initial render match
    const [totals, setTotals] = useState(() => ({ income: 0, expense: 0, cash: 0, bank: 0 } as any));
    const [grouped, setGrouped] = useState<Record<string, any[]>>(() => ({}));
    const [mounted, setMounted] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filter, setFilter] = useState<FilterState>({ type: 'all', preset: 'month', from: null, to: null, monthIndex: currentMonth, year: currentYear });
    const [storageTick, setStorageTick] = useState(0);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    // derive filtered transactions based on filter state
    const applyFilter = () => {
        const all = getTransactions();
        const startOfToday = (d: Date) => {
            const x = new Date(d);
            x.setHours(0,0,0,0);
            return x;
        };

        let filtered = all.slice();

        // type filter
        if (filter.type === 'income') filtered = filtered.filter(t => t.type === 'income');
        if (filter.type === 'expense') filtered = filtered.filter(t => t.type === 'expense');

        // preset date filters
    if (filter.preset === 'week') {
            const end = startOfToday(today);
            const start = startOfToday(new Date());
            start.setDate(start.getDate() - 6); // last 7 days
            filtered = filtered.filter(t => {
                const d = new Date(t.date + 'T00:00:00');
                return d >= start && d <= end;
            });
        } else if (filter.preset === 'month') {
            const y = filter.year ?? today.getFullYear();
            const m = filter.monthIndex ?? today.getMonth();
            filtered = filtered.filter(t => {
                const d = new Date(t.date + 'T00:00:00');
                return d.getFullYear() === y && d.getMonth() === m;
            });
        } else if (filter.preset === 'range' && filter.from && filter.to) {
            const from = new Date(filter.from + 'T00:00:00');
            const to = new Date(filter.to + 'T23:59:59');
            filtered = filtered.filter(t => {
                const d = new Date(t.date + 'T00:00:00');
                return d >= from && d <= to;
            });
        }

        return filtered;
    };

    const filteredTx = useMemo(() => {
        if (!mounted) return [];
        return applyFilter();
    }, [filter, mounted, storageTick]);

    const groupedFiltered = useMemo(() => {
        return filteredTx.reduce((acc: Record<string, any[]>, t) => {
            (acc[t.date] ||= []).push(t);
            return acc;
        }, {} as Record<string, any[]>);
    }, [filteredTx, storageTick]);

    const dates = useMemo(() => Object.keys(groupedFiltered).sort((a,b) => a > b ? -1 : 1), [groupedFiltered]);

    const isFilterActive = useMemo(() => {
        return filter.type !== 'all' || filter.preset !== 'all' || Boolean(filter.from) || Boolean(filter.to);
    }, [filter]);

    useEffect(() => {
        const refresh = () => {
            setTotals(computeTotals());
            setGrouped(groupByDate());
            setStorageTick(t => t + 1);
        };
        // mark mounted and refresh values on client only
        setMounted(true);
        refresh();
        window.addEventListener('sf-storage-updated', refresh);
        return () => window.removeEventListener('sf-storage-updated', refresh);
    }, []);

    // close dropdown on outside click
    useEffect(() => {
        const onDoc = (e: MouseEvent) => {
            if (!isFilterOpen) return;
            if (!dropdownRef.current) return;
            if (!(e.target instanceof Node)) return;
            if (!dropdownRef.current.contains(e.target)) {
                setIsFilterOpen(false);
            }
        };
        window.addEventListener('click', onDoc);
        return () => window.removeEventListener('click', onDoc);
    }, [isFilterOpen]);

    const resetFilter = () => setFilter({ type: 'all', preset: 'month', from: null, to: null, monthIndex: currentMonth, year: currentYear });

    const months = useMemo(() => [
        'Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'
    ], []);

    const handleSelectMonth = (index: number) => {
        setFilter(f => ({
            ...f,
            preset: 'month',
            from: null,
            to: null,
            monthIndex: index,
            year: currentYear,
        }));
    };

    return (
        <div className="home-layout w-full">
            <div className="home-saldo p-2 pt-5">
                <div className="home-saldo flex gap-10">
                    <div className="flex items-start gap-1">
                        <LuCircleDollarSign className="text-blue-400 h-4 w-4" />
                        <div className="grid">
                            <span className="text-[9px] text-gray-400">Saldo Rekening</span>
                            <span className="text-[15px] font-bold">Rp. {(totals.bank).toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <div className="flex items-start gap-1">
                        <LuBanknote className="text-green-400 h-4 w-4" />
                        <div className="grid">
                            <span className="text-[9px] text-gray-400">Cash</span>
                            <span className="text-[15px] font-bold">Rp. {(totals.cash).toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="home-history bg-white mt-1">
                <div className="home-history__wrapper px-2 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="font-bold text-[12px] text-gray-400 mb-4 block">Riwayat Transaksi</span>
                            <div className="text-[10px] text-gray-400">{filter.type !== 'all' ? `Filtered: ${filter.type}` : 'All transactions'} {filter.preset !== 'all' ? ` • ${filter.preset}` : ''}</div>
                        </div>

                        <div className="relative z-10" ref={dropdownRef}>
                            <button onClick={() => setIsFilterOpen(s => !s)} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-[10px]">
                                <LuSlidersHorizontal /> Filter
                            </button>

                            <div className={`origin-top-right absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-lg shadow-lg transition-all duration-200 ${isFilterOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`} style={{ transformOrigin: 'top right' }}>
                                <div className="p-3 grid gap-2">
                                    <div className="text-[10px] font-semibold">Type</div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setFilter(f => ({ ...f, type: 'all' }))} className={`flex-1 text-[10px] py-1 rounded ${filter.type === 'all' ? 'bg-gray-200' : 'bg-gray-50'}`}>All</button>
                                        <button onClick={() => setFilter(f => ({ ...f, type: 'income' }))} className={`flex-1 text-[10px] py-1 rounded ${filter.type === 'income' ? 'bg-green-100' : 'bg-gray-50'}`}>Income</button>
                                        <button onClick={() => setFilter(f => ({ ...f, type: 'expense' }))} className={`flex-1 text-[10px] py-1 rounded ${filter.type === 'expense' ? 'bg-red-100' : 'bg-gray-50'}`}>Expense</button>
                                    </div>

                                    <div className="text-[10px] font-semibold pt-2">Preset</div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setFilter(f => ({ ...f, preset: 'all', from: null, to: null, monthIndex: null, year: null }))} className={`flex-1 text-[10px] py-1 rounded ${filter.preset === 'all' ? 'bg-gray-200' : 'bg-gray-50'}`}>All</button>
                                        <button onClick={() => setFilter(f => ({ ...f, preset: 'week', from: null, to: null, monthIndex: null, year: null }))} className={`flex-1 text-[10px] py-1 rounded ${filter.preset === 'week' ? 'bg-gray-200' : 'bg-gray-50'}`}>Per Minggu</button>
                                        <button onClick={() => setFilter(f => ({ ...f, preset: 'month', from: null, to: null, monthIndex: currentMonth, year: currentYear }))} className={`flex-1 text-[10px] py-1 rounded ${filter.preset === 'month' ? 'bg-gray-200' : 'bg-gray-50'}`}>Per Bulan</button>
                                    </div>

                                    <div className="text-[10px] font-semibold pt-2">{`Tahun ${currentYear}`}</div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {months.map((label, index) => (
                                            <button
                                                key={label}
                                                onClick={() => handleSelectMonth(index)}
                                                className={`text-[10px] py-1 rounded ${filter.preset === 'month' && filter.monthIndex === index ? 'bg-blue-200 text-blue-800' : 'bg-gray-50'}`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="text-[10px] font-semibold pt-2">Range</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="date" value={filter.from ?? ''} onChange={e => setFilter(f => ({ ...f, preset: 'range', from: e.target.value, monthIndex: null, year: null }))} className="text-[10px] border border-gray-100 rounded px-2 py-1" />
                                        <input type="date" value={filter.to ?? ''} onChange={e => setFilter(f => ({ ...f, preset: 'range', to: e.target.value, monthIndex: null, year: null }))} className="text-[10px] border border-gray-100 rounded px-2 py-1" />
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <button onClick={resetFilter} className="text-[10px] text-red-500">Reset</button>
                                        <button onClick={() => setIsFilterOpen(false)} className="text-[10px] text-gray-600">Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {dates.length > 0 ? (
                        <div className="grid gap-8 pt-4">
                            {dates.map((d, idx) => (
                                <div key={d} className={`${idx % 2 === 1 ? 'bg-gray-50' : ''} p-2 rounded-md`}> 
                                    <CardTranscation 
                                        dateISO={d}
                                        dateLabel={new Date(d).toLocaleDateString('id-ID', { weekday: 'long' })}
                                        items={groupedFiltered[d].filter(i => i.category !== 'Tarik Tunai' || i.type !== 'income')}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : <EmptyState />}
                </div>
            </div>
        </div>
    )
};

export default HomeLayout;