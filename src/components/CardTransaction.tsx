import { LuCircleDollarSign, LuBanknote } from "react-icons/lu";
import { Transaction, deleteTransaction, updateTransaction, getCategoriesByType } from "@/lib/storage";
import { useState } from "react";
import AmountInput from "@/components/AmountInput";

type CardTransactionProps = {
    dateLabel: string; // e.g. Mon
    dateISO: string;   // yyyy-mm-dd
    items: Transaction[];
}

const CardTransaction = ({ dateLabel, dateISO, items }: CardTransactionProps) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draft, setDraft] = useState<{ amount: string; account: 'cash'|'bank'; category: string; description?: string }>({ amount: '', account: 'cash', category: '', description: '' });

    const startEdit = (it: Transaction) => {
        setEditingId(it.id);
        setDraft({ amount: String(it.amount), account: it.account, category: it.category, description: it.description });
    };
    const cancelEdit = () => { setEditingId(null); };
    const saveEdit = (id: string, type: 'income'|'expense') => {
        const amount = Number(draft.amount || 0);
        if (!amount || !draft.category) return;
        updateTransaction(id, { amount, account: draft.account, category: draft.category, description: draft.description });
        setEditingId(null);
    };
    const removeTx = (id: string) => { deleteTransaction(id); };

    const incomeTotal = items.filter(i => i.type==='income' && i.category !== 'Tarik Tunai').reduce((a,b)=>a+b.amount,0);
    const expenseTotal = items.filter(i => i.type==='expense' && i.category !== 'Tarik Tunai').reduce((a,b)=>a+b.amount,0);
    return (
        <div className="card-transaction w-full">
            <div className="card-transaction__header border-b border-gray-300 pb-2 mb-4 flex">
                <div className="transaction__header-date flex flex-col flex-1">
                    <span className="text-[9px] text-white bg-black w-fit px-2 py-0.5">{dateLabel}</span>
                    <span className="text-[11px] mt-1 text-gray-500">{new Date(dateISO).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="transaction__header-income text-green-500 relatie flex-1 items-end justify-end flex text-[12px] font-bold">Rp. {incomeTotal.toLocaleString('id-ID')}</div>
                <div className="transaction__header-expense text-red-500 relative flex-1 items-end justify-end flex text-[12px] font-bold">Rp. {expenseTotal.toLocaleString('id-ID')}</div>
            </div>

            <div className="card-transaction__body grid gap-4">
                {items.map((it, idx) => (
                    <div className="item-info" key={idx}>
                        {editingId === it.id ? (
                            <div className="grid gap-2 border border-gray-200 rounded-md p-2">
                                <div className="flex items-center gap-1">
                                    {it.account === 'bank' && <LuCircleDollarSign className="text-blue-500 h-3 w-3" />}
                                    {it.account === 'cash' && <LuBanknote className="text-green-500 h-3 w-3" />}
                                        <span className={`text-[11px] font-bold ${it.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>{it.type === 'income' ? 'Income' : 'Expense'}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="col-span-1">
                                        <label className="text-[10px] text-gray-500">Amount</label>
                                        <AmountInput value={draft.amount} onValue={(v)=>setDraft(p=>({...p, amount: v}))} className="w-full border border-gray-200 rounded-md px-2 py-1 text-[11px]" />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-[10px] text-gray-500">Account</label>
                                        <select value={draft.account} onChange={e=>setDraft(p=>({...p, account: e.target.value as any}))} className="w-full border border-gray-200 rounded-md px-2 py-1 text-[11px]">
                                            <option value="cash">Cash</option>
                                            <option value="bank">Bank</option>
                                        </select>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-[10px] text-gray-500">Category</label>
                                        <select value={draft.category} onChange={e=>setDraft(p=>({...p, category: e.target.value}))} className="w-full border border-gray-200 rounded-md px-2 py-1 text-[11px]">
                                            <option value="">Pilih</option>
                                            {getCategoriesByType(it.type).map(c => (
                                                <option key={c.id} value={c.name}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500">Description</label>
                                    <textarea value={draft.description || ''} onChange={(e)=>setDraft(p=>({...p, description: e.target.value}))} className="w-full border border-gray-200 rounded-md px-2 py-1 text-[11px] min-h-14" />
                                </div>
                                <div className="flex items-center justify-end gap-3">
                                    <button className="text-[10px] text-green-600" onClick={()=>saveEdit(it.id, it.type)}>Save</button>
                                    <button className="text-[10px] text-gray-500" onClick={cancelEdit}>Cancel</button>
                                    <button className="text-[10px] text-red-500" onClick={()=>removeTx(it.id)}>Delete</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <div className="flex flex-col flex-1 gap-1">
                                    <div className="flex items-center gap-1">
                                        {it.account === 'bank' && <LuCircleDollarSign className="text-blue-500 h-3 w-3" />}
                                        {it.account === 'cash' && <LuBanknote className="text-green-500 h-3 w-3" />}
                                        <span className={`text-[11px] font-bold ${it.type === 'income' ? 'text-green-500' : it.category === 'Tarik Tunai' ? 'text-black' : 'text-red-500'}`}>
                                            {it.type === 'income' ? 'Income' : it.category === 'Tarik Tunai' ? 'Change' : 'Expense'}
                                        </span>
                                    </div>
                                    <div className="text-[9px] w-fit font-bold">{it.category} {it.description ? (<span className="text-gray-400">- {it.description}</span>) : null}</div>
                                    
                                    <div className="flex items-center">
                                        <button className="text-[10px] text-blue-500" onClick={()=>startEdit(it)}>Edit</button>
                                        <button className="text-[10px] text-red-500 ml-3" onClick={()=>removeTx(it.id)}>Delete</button>
                                    </div>
                                </div>
                                <div className="item-amount__income flex flex-1 justify-end">
                                    <span className={`text-[11px] font-semibold text-green-500`}>
                                        {it.type == 'income' && `Rp. ${it.amount.toLocaleString('id-ID')}`}
                                    </span>
                                </div>
                                <div className="item-amount__income flex flex-1 justify-end">
                                    <span className={`text-[11px] font-semibold ${it.category === 'Tarik Tunai' ? 'text-black' : 'text-red-500'}`}>
                                        {it.type == 'expense' && `Rp. ${it.amount.toLocaleString('id-ID')}`}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
};

export default CardTransaction;