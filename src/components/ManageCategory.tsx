"use client";

import { useState } from "react";

export type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
};

const initial: Category[] = [
  { id: "1", name: "Gaji", type: "income" },
  { id: "2", name: "Bonus", type: "income" },
  { id: "3", name: "Makanan", type: "expense" },
  { id: "4", name: "Transport", type: "expense" },
];

const ManageCategory = () => {
  const [items, setItems] = useState<Category[]>(initial);
  const [form, setForm] = useState<{ name: string; type: "income" | "expense" }>({ name: "", type: "expense" });

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value as any }));
  };

  const add = () => {
    if (!form.name.trim()) return;
    setItems((prev) => [{ id: crypto.randomUUID(), name: form.name.trim(), type: form.type }, ...prev]);
    setForm({ name: "", type: form.type });
  };

  const remove = (id: string) => setItems((prev) => prev.filter((x) => x.id !== id));

  const income = items.filter((x) => x.type === "income");
  const expense = items.filter((x) => x.type === "expense");

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <div className="grid gap-1">
          <label className="text-[9px] text-gray-500">Category Name</label>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            type="text"
            placeholder="e.g. Investasi"
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-[10px]"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-[9px] text-gray-500">Type</label>
          <select
            name="type"
            value={form.type}
            onChange={onChange}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-[10px]"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <button type="button" onClick={add} className="w-full text-white bg-green-600 py-2 font-semibold rounded-lg mt-1 text-[10px]">Add Category</button>
      </div>

      <div className="grid gap-3">
        <div>
          <div className="font-bold text-[11px] text-gray-500 mb-1">Income</div>
          <div className="grid gap-2">
            {income.map((c) => (
              <div key={c.id} className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2">
                <span className="text-[10px]">{c.name}</span>
                <button className="text-[9px] text-red-500" onClick={() => remove(c.id)}>Remove</button>
              </div>
            ))}
            {income.length === 0 && <div className="text-[9px] text-gray-400">No income categories</div>}
          </div>
        </div>

        <div>
          <div className="font-bold text-[11px] text-gray-500 mb-1">Expense</div>
          <div className="grid gap-2">
            {expense.map((c) => (
              <div key={c.id} className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2">
                <span className="text-[10px]">{c.name}</span>
                <button className="text-[9px] text-red-500" onClick={() => remove(c.id)}>Remove</button>
              </div>
            ))}
            {expense.length === 0 && <div className="text-[9px] text-gray-400">No expense categories</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCategory;
