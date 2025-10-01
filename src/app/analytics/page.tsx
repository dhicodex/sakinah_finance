'use client';

import ChartsLayout from '@/layouts/Charts.layout';
import Header from '@/components/Header';
import FloatingMenu from '@/components/FloatingMenu';

const AnalyticsPage = () => {
  const weekly = [
    { label: 'Mon', income: 1200000, expense: 300000 },
    { label: 'Tue', income: 800000, expense: 450000 },
    { label: 'Wed', income: 500000, expense: 350000 },
    { label: 'Thu', income: 700000, expense: 250000 },
    { label: 'Fri', income: 1500000, expense: 600000 },
    { label: 'Sat', income: 400000, expense: 200000 },
    { label: 'Sun', income: 300000, expense: 220000 },
  ];

  const expenseSlices = [
    { label: 'Makanan', value: 750000, color: '#ef4444' },
    { label: 'Transport', value: 300000, color: '#f97316' },
    { label: 'Tagihan', value: 500000, color: '#f59e0b' },
    { label: 'Lainnya', value: 150000, color: '#94a3b8' },
  ];

  const incomeSlices = [
    { label: 'Gaji', value: 2500000, color: '#22c55e' },
    { label: 'Bonus', value: 500000, color: '#10b981' },
    { label: 'Lainnya', value: 300000, color: '#34d399' },
  ];

  return (
    <main className="flex h-[100dvh] flex-col">
      <div className="top py-1 px-2">
        <Header />
      </div>
      <div className="center flex flex-1 relative bg-gray-50 overflow-auto">
        <div className="w-full">
          <div className="p-2 pt-4">
            <h1 className="font-bold text-[12px]">Analytics</h1>
          </div>
          <ChartsLayout weekly={weekly} expenseSlices={expenseSlices} incomeSlices={incomeSlices} />
        </div>
      </div>
      <div className="bottom">
        <FloatingMenu />
      </div>
    </main>
  );
};

export default AnalyticsPage;
