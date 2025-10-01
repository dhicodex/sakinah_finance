import EmptyState from "@/components/EmptyState";
import CardTranscation from "@/components/CardTransaction";
import { LuCircleDollarSign, LuBanknote } from "react-icons/lu";
import { computeTotals, groupByDate } from "@/lib/storage";

const HomeLayout = () => {
    const totals = computeTotals();
    const grouped = groupByDate();
    const dates = Object.keys(grouped).sort((a,b) => a > b ? -1 : 1); // desc

    return (
        <div className="home-layout w-full">
            <div className="home-saldo p-2 pt-5">
                <div className="home-saldo flex gap-10">
                    <div className="flex items-start gap-1">
                        <LuCircleDollarSign className="text-blue-400 h-4 w-4" />
                        <div className="grid">
                            <span className="text-[8px] text-gray-400">Saldo Rekening</span>
                            <span className="text-[14px] font-bold">Rp. {(totals.bank).toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <div className="flex items-start gap-1">
                        <LuBanknote className="text-green-400 h-4 w-4" />
                        <div className="grid">
                            <span className="text-[8px] text-gray-400">Cash</span>
                            <span className="text-[14px] font-bold">Rp. {(totals.cash).toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="home-history bg-white mt-1">
                <div className="home-history__wrapper px-2 py-5">
                    <span className="font-bold text-[11px] text-gray-400 mb-4 block">Riwayat Transaksi</span>

                    {dates.length > 0 ? (
                        <div className="grid gap-8">
                            {dates.map(d => (
                                <CardTranscation 
                                    key={d}
                                    dateISO={d}
                                    dateLabel={new Date(d).toLocaleDateString('en-US', { weekday: 'short' })}
                                    items={grouped[d]}
                                />
                            ))}
                        </div>
                    ) : <EmptyState />}
                </div>
            </div>
        </div>
    )
};

export default HomeLayout;