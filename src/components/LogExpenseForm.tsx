"use client";

import { useState } from "react";
import { addTransaction, getCategoriesByType } from "@/lib/storage";
import AmountInput from "@/components/AmountInput";

type Props = { onSaved?: () => void };

const LogExpenseForm = ({ onSaved }: Props) => {
  const [form, setForm] = useState({
    amount: "",
    date: "",
    account: "cash",
    category: "",
    description: "",
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const submit = () => {
    const amount = Number(form.amount || 0);
    if (!amount || !form.date || !form.category) return;
    addTransaction({
      type: 'expense',
      amount,
      date: form.date,
      account: form.account as any,
      category: form.category,
      description: form.description,
    });
    if (onSaved) onSaved();
  };

  const categories = getCategoriesByType('expense');

  return (
    <div className="grid gap-3">
      <div className="grid gap-1">
  <label className="text-[10px] text-gray-500">Amount</label>
        <AmountInput
          value={form.amount}
          onValue={(v) => setForm((p) => ({ ...p, amount: v }))}
          placeholder="e.g. 200.000"
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-[11px]"
        />
      </div>

      <div className="grid gap-1 grid-cols-2">
        <div className="grid gap-1">
          <label className="text-[10px] text-gray-500">Date</label>
          <input
            name="date"
            value={form.date}
            onChange={onChange}
            type="date"
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-[11px]"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-[10px] text-gray-500">Account</label>
          <select
            name="account"
            value={form.account}
            onChange={onChange}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-[11px]"
          >
            <option value="cash">Cash</option>
            <option value="bank">Bank</option>
          </select>
        </div>
      </div>

      <div className="grid gap-1">
  <label className="text-[10px] text-gray-500">Category</label>
        <select
          name="category"
          value={form.category}
          onChange={onChange}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-[11px]"
        >
          <option value="">Pilih kategori</option>
          {categories.map(c => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-1">
  <label className="text-[10px] text-gray-500">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          placeholder="Optional notes"
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-[11px] min-h-16"
        />
      </div>

  <button onClick={submit} className="w-full text-white bg-green-600 py-2 font-semibold rounded-lg mt-1 text-[11px]">Save Expense</button>
    </div>
  );
};

export default LogExpenseForm;
