'use client';

import ChartsLayout from '@/layouts/Charts.layout';
import Header from '@/components/Header';
import FloatingMenu from '@/components/FloatingMenu';
import AuthGate from '@/components/AuthGate';

const AnalyticsPage = () => {
  return (
    <AuthGate>
      <main className="flex h-[100dvh] flex-col">
        <div className="top py-1 px-2">
          <Header />
        </div>
        <div className="center flex flex-1 relative bg-gray-50 overflow-auto">
          <div className="w-full">
            <div className="p-2 pt-4">
              <h1 className="font-bold text-[12px]">Analytics</h1>
            </div>
            <ChartsLayout />
          </div>
        </div>
        <div className="bottom">
          <FloatingMenu />
        </div>
      </main>
    </AuthGate>
  );
}
;

export default AnalyticsPage;
