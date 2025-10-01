import { LuCircleDollarSign, LuBanknote } from "react-icons/lu";
import { Transaction } from "@/lib/storage";

type CardTransactionProps = {
    dateLabel: string; // e.g. Mon
    dateISO: string;   // yyyy-mm-dd
    items: Transaction[];
}

const CardTransaction = ({ dateLabel, dateISO, items }: CardTransactionProps) => {
    const incomeTotal = items.filter(i => i.type==='income').reduce((a,b)=>a+b.amount,0);
    const expenseTotal = items.filter(i => i.type==='expense').reduce((a,b)=>a+b.amount,0);
    return (
        <div className="card-transaction w-full">
            <div className="card-transaction__header border-b border-gray-300 pb-2 mb-4 flex">
                <div className="transaction__header-date flex flex-col flex-1">
                    <span className="text-[8px] text-white bg-black w-fit px-2 py-0.5">{dateLabel}</span>
                    <span className="text-[10px] mt-1 text-gray-500">{new Date(dateISO).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="transaction__header-income text-green-500 relatie flex-1 items-end justify-end flex text-[11px] font-bold">Rp. {incomeTotal.toLocaleString('id-ID')}</div>
                <div className="transaction__header-expense text-red-500 relative flex-1 items-end justify-end flex text-[11px] font-bold">Rp. {expenseTotal.toLocaleString('id-ID')}</div>
            </div>

            <div className="card-transaction__body grid gap-4">
                {items.map((it, idx) => (
                    <div className="item-info flex items-center" key={idx}>
                        <div className="flex flex-col flex-1 gap-1">
                            <div className="flex items-center gap-1">
                                {it.account === 'bank' && <LuCircleDollarSign className="text-blue-500 h-3 w-3" />}
                                {it.account === 'cash' && <LuBanknote className="text-green-500 h-3 w-3" />} 
                                <span className={`text-[10px] font-bold ${it.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>{it.type === 'income' ? 'Income' : 'Expense'}</span>
                            </div>
                            <div className="text-[8px] w-fit font-bold">{it.category} {it.description ? (<span className="text-gray-400">- {it.description}</span>) : null}</div>
                        </div>
                        <div className="item-amount__income flex flex-1 justify-end">
                            <span className={`text-[10px] font-semibold text-green-500`}>
                                {it.type == 'income' && `Rp. ${it.amount.toLocaleString('id-ID')}`}
                            </span>
                        </div>
                        <div className="item-amount__income flex flex-1 justify-end">
                            <span className={`text-[10px] font-semibold text-red-500`}>
                                {it.type == 'expense' && `Rp. ${it.amount.toLocaleString('id-ID')}`}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
};

export default CardTransaction;