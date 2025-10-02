"use client";

import { useEffect, useState } from "react";
import { addCategory, getCategories, removeCategory, updateCategory, Category as CatType } from "@/lib/storage";

const ManageCategory = () => {
  const [items, setItems] = useState<CatType[]>(getCategories());
  const [form, setForm] = useState<{ name: string; type: "income" | "expense" }>({ name: "", type: "expense" });

  useEffect(() => {
    const refresh = () => setItems(getCategories());
    refresh();
    window.addEventListener('sf-storage-updated', refresh);
    return () => window.removeEventListener('sf-storage-updated', refresh);
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value as any }));
  };

  const add = () => {
    if (!form.name.trim()) return;
    // rely on storage.addCategory which updates cache and emits 'sf-storage-updated'
    addCategory({ name: form.name.trim(), type: form.type });
    setForm({ name: "", type: form.type });
  };

  const remove = (id: string) => {
    // storage will update cache and emit event; UI will refresh from the event listener
    removeCategory(id);
  };

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
              <EditableRow key={c.id} item={c} onSave={(name, type) => { updateCategory(c.id, { name, type }); }} onRemove={() => remove(c.id)} />
            ))}
            {income.length === 0 && <div className="text-[9px] text-gray-400">No income categories</div>}
          </div>
        </div>

        <div>
          <div className="font-bold text-[11px] text-gray-500 mb-1">Expense</div>
          <div className="grid gap-2">
            {expense.map((c) => (
              <EditableRow key={c.id} item={c} onSave={(name, type) => { updateCategory(c.id, { name, type }); }} onRemove={() => remove(c.id)} />
            ))}
            {expense.length === 0 && <div className="text-[9px] text-gray-400">No expense categories</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCategory;

type RowProps = { item: CatType; onSave: (name: string, type: "income" | "expense") => void; onRemove: () => void };

const EditableRow = ({ item, onSave, onRemove }: RowProps) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [type, setType] = useState<"income" | "expense">(item.type);

  if (!editing) {
    return (
      <div className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium">{item.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-[9px] text-blue-500" onClick={() => setEditing(true)}>Edit</button>
          <button className="text-[9px] text-red-500" onClick={onRemove}>Remove</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2 gap-2">
      <input value={name} onChange={(e) => setName(e.target.value)} className="text-[10px] border border-gray-200 rounded px-2 py-1 flex-1" />
      <select value={type} onChange={(e) => setType(e.target.value as any)} className="text-[10px] border border-gray-200 rounded px-2 py-1">
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
      <div className="flex items-center gap-2">
        <button className="text-[9px] text-green-600" onClick={() => { onSave(name.trim(), type); setEditing(false); }}>Save</button>
        <button className="text-[9px] text-gray-500" onClick={() => { setName(item.name); setType(item.type); setEditing(false); }}>Cancel</button>
      </div>
    </div>
  );
};
