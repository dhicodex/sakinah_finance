"use client";

import { useState } from "react";
import AmountInput from "@/components/AmountInput";
import { withdrawCash } from "@/lib/storage";

type Props = { onSaved?: () => void };

const WithdrawForm = ({ onSaved }: Props) => {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10));

  const submit = () => {
    const n = Number(amount || 0);
    if (!n) return;
    withdrawCash(n, date);
    if (onSaved) onSaved();
  };

  return (
    <div className="grid gap-3">
      <div className="grid gap-1">
        <label className="text-[9px] text-gray-500">Jumlah</label>
        <AmountInput
          value={amount}
          onValue={setAmount}
          placeholder="e.g. 500.000"
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-[10px]"
        />
      </div>

      <div className="grid gap-1">
        <label className="text-[9px] text-gray-500">Tanggal</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-[10px]"
        />
      </div>

      <button onClick={submit} className="w-full text-white bg-green-600 py-2 font-semibold rounded-lg mt-1 text-[10px]">Tarik Tunai</button>
    </div>
  );
};

export default WithdrawForm;
