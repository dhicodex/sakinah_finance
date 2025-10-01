export type TxType = 'income' | 'expense';
export type AccountType = 'cash' | 'bank';

export type Category = {
  id: string;
  name: string;
  type: TxType;
};

export type Transaction = {
  id: string;
  type: TxType;
  amount: number;
  date: string; // ISO string yyyy-mm-dd
  account: AccountType;
  category: string; // category name or id
  description?: string;
  counterparty?: string; // from/to
  createdAt: number; // epoch
};

const KEYS = {
  categories: 'sf_categories',
  transactions: 'sf_transactions',
};

// Helpers
function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, val: T) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(val));
}

// UUID fallback for older browsers (some mobile WebViews)
function generateId(): string {
  const g: any = (typeof globalThis !== 'undefined') ? (globalThis as any) : {};
  try {
    if (g.crypto && typeof g.crypto.randomUUID === 'function') {
      return g.crypto.randomUUID();
    }
  } catch {}
  try {
    if (g.crypto && g.crypto.getRandomValues) {
      const buf = new Uint8Array(16);
      g.crypto.getRandomValues(buf);
      // Set version and variant bits for RFC4122 v4
      buf[6] = (buf[6] & 0x0f) | 0x40;
      buf[8] = (buf[8] & 0x3f) | 0x80;
      const toHex = (n: number) => n.toString(16).padStart(2, '0');
      const hex = Array.from(buf, toHex).join('');
      return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
    }
  } catch {}
  // Weak fallback
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Categories
export function getCategories(): Category[] {
  return readJSON<Category[]>(KEYS.categories, []);
}

export function saveCategories(items: Category[]) {
  writeJSON(KEYS.categories, items);
}

export function addCategory(item: Omit<Category, 'id'> & { id?: string }): Category {
  const list = getCategories();
  const id = item.id ?? generateId();
  const newItem: Category = { id, name: item.name, type: item.type };
  writeJSON(KEYS.categories, [newItem, ...list]);
  return newItem;
}

export function removeCategory(id: string) {
  const list = getCategories();
  writeJSON(KEYS.categories, list.filter(c => c.id !== id));
}

export function getCategoriesByType(type: TxType): Category[] {
  return getCategories().filter(c => c.type === type);
}

// Transactions
export function getTransactions(): Transaction[] {
  return readJSON<Transaction[]>(KEYS.transactions, []);
}

export function addTransaction(tx: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }): Transaction {
  const list = getTransactions();
  const id = tx.id ?? generateId();
  const newTx: Transaction = { ...tx, id, createdAt: Date.now() };
  writeJSON(KEYS.transactions, [newTx, ...list]);
  return newTx;
}

// Transfer helpers
export function withdrawCash(amount: number, dateISO?: string) {
  const date = dateISO ?? new Date().toISOString().slice(0,10);
  if (!amount || amount <= 0) return;
  // Expense from bank
  addTransaction({
    type: 'expense',
    amount,
    date,
    account: 'bank',
    category: 'Tarik Tunai',
    description: 'Transfer bank ke cash',
    counterparty: 'ATM',
  });
  // Income to cash
  addTransaction({
    type: 'income',
    amount,
    date,
    account: 'cash',
    category: 'Tarik Tunai',
    description: 'Transfer bank ke cash',
    counterparty: 'ATM',
  });
}

// Aggregations
export function computeTotals() {
  const txs = getTransactions();
  const sum = (f: (t: Transaction) => boolean) => txs.filter(f).reduce((a, b) => a + b.amount, 0);
  const income = sum(t => t.type === 'income');
  const expense = sum(t => t.type === 'expense');
  const cash = sum(t => t.account === 'cash' && t.type === 'income') - sum(t => t.account === 'cash' && t.type === 'expense');
  const bank = sum(t => t.account === 'bank' && t.type === 'income') - sum(t => t.account === 'bank' && t.type === 'expense');
  return { income, expense, cash, bank };
}

export function groupByDate(): Record<string, Transaction[]> {
  const txs = getTransactions();
  return txs.reduce((acc, t) => {
    const key = t.date;
    (acc[key] ||= []).push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);
}

export function getWeeklySeries(reference = new Date()) {
  const txs = getTransactions();
  const start = new Date(reference);
  // set to Monday
  const day = start.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // if Sunday, go back 6
  start.setDate(start.getDate() + diff);
  start.setHours(0,0,0,0);

  const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const series = labels.map((label, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = d.toISOString().slice(0,10);
    const dayTx = txs.filter(t => t.date === iso);
    const income = dayTx.filter(t => t.type==='income').reduce((a,b)=>a+b.amount,0);
    const expense = dayTx.filter(t => t.type==='expense').reduce((a,b)=>a+b.amount,0);
    return { label, income, expense };
  });
  return series;
}

export function getSlices(type: TxType) {
  const txs = getTransactions().filter(t => t.type === type);
  const map = new Map<string, number>();
  for (const t of txs) {
    map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
  }
  const palette = type === 'expense' ? ['#ef4444','#f97316','#f59e0b','#a855f7','#06b6d4','#94a3b8'] : ['#22c55e','#10b981','#34d399','#84cc16','#14b8a6','#60a5fa'];
  return Array.from(map.entries()).map(([label, value], i) => ({ label, value, color: palette[i % palette.length] }));
}
