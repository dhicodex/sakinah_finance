"use client";

import { useState } from "react";

const LogIncomeForm = () => {
  const [form, setForm] = useState({
    amount: "",
    date: "",
    account: "cash",
    category: "salary",
    description: "",
    from: "",
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  return (
    <div className="grid gap-3">
      <div className="grid gap-1">
        <label className="text-[9px] text-gray-500">Amount</label>
        <input
          name="amount"
          value={form.amount}
          onChange={onChange}
          type="number"
          placeholder="e.g. 1000000"
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-[10px]"
        />
      </div>

      <div className="grid gap-1 grid-cols-2">
        <div className="grid gap-1">
          <label className="text-[9px] text-gray-500">Date</label>
          <input
            name="date"
            value={form.date}
            onChange={onChange}
            type="date"
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-[10px]"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-[9px] text-gray-500">Account</label>
          <select
            name="account"
            value={form.account}
            onChange={onChange}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-[10px]"
          >
            <option value="cash">Cash</option>
            <option value="bank">Bank</option>
          </select>
        </div>
      </div>

      <div className="grid gap-1">
        <label className="text-[9px] text-gray-500">Category</label>
        <select
          name="category"
          value={form.category}
          onChange={onChange}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-[10px]"
        >
          <option value="salary">Gaji</option>
          <option value="bonus">Bonus</option>
          <option value="gift">Hadiah</option>
          <option value="other">Lainnya</option>
        </select>
      </div>

      <div className="grid gap-1">
        <label className="text-[9px] text-gray-500">From (Source)</label>
        <input
          name="from"
          value={form.from}
          onChange={onChange}
          type="text"
          placeholder="e.g. PT. XYZ"
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-[10px]"
        />
      </div>

      <div className="grid gap-1">
        <label className="text-[9px] text-gray-500">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          placeholder="Optional notes"
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-[10px] min-h-16"
        />
      </div>
    </div>
  );
};

export default LogIncomeForm;
