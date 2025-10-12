import { supabase } from '@/lib/supabaseClient';

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
  category: string; // category label
  description?: string;
  counterparty?: string; // from/to
  createdAt: number; // epoch
};

// In-memory cache to preserve current sync API
let cache = {
  categories: [] as Category[],
  transactions: [] as Transaction[],
};

// Active realtime channels for the current user session
let activeChannels: any[] = [];

function emitUpdate() {
  if (typeof window === 'undefined') return;
  try { window.dispatchEvent(new Event('sf-storage-updated')); } catch {}
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

// Return local date ISO string (yyyy-mm-dd) using local timezone to avoid UTC shift
export function formatDateISO(d?: Date) {
  const date = d ? new Date(d) : new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Auth/session helpers
async function getUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

function unsubscribeRealtime() {
  try {
    for (const ch of activeChannels) {
      try { ch.unsubscribe(); } catch (e) {}
    }
  } catch {}
  activeChannels = [];
}

function subscribeRealtimeForUser(userId: string) {
  try {
    unsubscribeRealtime();

    // categories realtime
    const catChannel = supabase
      .channel(`public:categories:user=${userId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'categories', filter: `user_id=eq.${userId}` }, (payload) => {
          const p: any = payload;
          const ev = (p.eventType || p.event || p.type) as string;
          const newRow = (p.new ?? p.record) as any;
          const oldRow = (p.old ?? p.old_record) as any;
          if (ev === 'INSERT') {
            if (newRow) {
              const item: Category = { id: String(newRow.id), name: newRow.name, type: newRow.type };
              // avoid duplicating if exists
              if (!cache.categories.find(c => c.id === item.id)) {
                cache.categories = [item, ...cache.categories];
                emitUpdate();
              }
            }
          } else if (ev === 'UPDATE') {
            if (newRow) {
              cache.categories = cache.categories.map(c => c.id === String(newRow.id) ? { id: String(newRow.id), name: newRow.name, type: newRow.type } : c);
              emitUpdate();
            }
          } else if (ev === 'DELETE') {
            if (oldRow) {
              cache.categories = cache.categories.filter(c => c.id !== String(oldRow.id));
              emitUpdate();
            }
          }
        })
      .subscribe();

    // transactions realtime
    const txChannel = supabase
      .channel(`public:transactions:user=${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` }, (payload) => {
        const p: any = payload;
        const ev = (p.eventType || p.event || p.type) as string;
        const newRow = (p.new ?? p.record) as any;
        const oldRow = (p.old ?? p.old_record) as any;
        if (ev === 'INSERT') {
          if (newRow) {
            const tx: Transaction = {
              id: String(newRow.id),
              type: newRow.type,
              amount: Number(newRow.amount),
              date: newRow.date,
              account: newRow.account,
              category: newRow.category,
              description: newRow.description ?? undefined,
              counterparty: newRow.counterparty ?? undefined,
              createdAt: newRow.created_at ? Date.parse(newRow.created_at) : Date.now(),
            };
            if (!cache.transactions.find(t => t.id === tx.id)) {
              cache.transactions = [tx, ...cache.transactions];
              emitUpdate();
            }
          }
        } else if (ev === 'UPDATE') {
          if (newRow) {
            cache.transactions = cache.transactions.map(t => t.id === String(newRow.id) ? {
              id: String(newRow.id),
              type: newRow.type,
              amount: Number(newRow.amount),
              date: newRow.date,
              account: newRow.account,
              category: newRow.category,
              description: newRow.description ?? undefined,
              counterparty: newRow.counterparty ?? undefined,
              createdAt: newRow.created_at ? Date.parse(newRow.created_at) : Date.now(),
            } : t);
            emitUpdate();
          }
        } else if (ev === 'DELETE') {
          if (oldRow) {
            cache.transactions = cache.transactions.filter(t => t.id !== String(oldRow.id));
            emitUpdate();
          }
        }
      })
      .subscribe();

    activeChannels.push(catChannel, txChannel);
  } catch (e) {
    console.error('subscribeRealtimeForUser error', e);
  }
}

// Initialization: fetch categories and transactions for current user
export async function initData() {
  const userId = await getUserId();
  if (!userId) {
    cache.categories = [];
    cache.transactions = [];
    emitUpdate();
    unsubscribeRealtime();
    return;
  }
  // fetch in parallel
  const [catRes, txRes] = await Promise.all([
    supabase.from('categories').select('id,name,type').eq('user_id', userId).order('name', { ascending: true }),
    supabase.from('transactions').select('id,type,amount,date,account,category,description,counterparty,created_at').eq('user_id', userId).order('created_at', { ascending: false }),
  ]);

  if (!catRes.error && catRes.data) {
    cache.categories = catRes.data.map((r: any) => ({ id: String(r.id), name: r.name, type: r.type }));
  } else {
    cache.categories = [];
    if (catRes.error) console.error('supabase select categories error', catRes.error);
  }

  if (!txRes.error && txRes.data) {
    cache.transactions = txRes.data.map((r: any) => ({
      id: String(r.id),
      type: r.type,
      amount: Number(r.amount),
      date: r.date,
      account: r.account,
      category: r.category,
      description: r.description ?? undefined,
      counterparty: r.counterparty ?? undefined,
      createdAt: r.created_at ? Date.parse(r.created_at) : Date.now(),
    }));
  } else {
    cache.transactions = [];
    if (txRes.error) console.error('supabase select transactions error', txRes.error);
  }
  emitUpdate();
  // subscribe to realtime changes for this user so multiple clients stay in sync
  try { subscribeRealtimeForUser(userId); } catch (e) {}
}

// Categories (reads use cache; writes are optimistic then sync to Supabase)
export function getCategories(): Category[] {
  return cache.categories;
}

export function saveCategories(items: Category[]) {
  cache.categories = items.slice();
  emitUpdate();
  // persist all (upsert by id)
  (async () => {
    const userId = await getUserId();
    if (!userId) return;
    // Upsert categories one-by-one to keep it simple
    for (const c of items) {
      const { data, error } = await supabase.from('categories').upsert({ id: c.id, user_id: userId, name: c.name, type: c.type });
      if (error) console.error('supabase upsert category error', { id: c.id, name: c.name, type: c.type, error });
      else if (!data) console.warn('supabase upsert category returned no data', { id: c.id, name: c.name, type: c.type });
    }
  })();
}

export function addCategory(item: Omit<Category, 'id'> & { id?: string }): Category {
  const list = getCategories();
  const id = item.id ?? generateId();
  const newItem: Category = { id, name: item.name, type: item.type };
  cache.categories = [newItem, ...list];
  emitUpdate();
  (async () => {
    const userId = await getUserId();
    if (!userId) return;
  const { data, error } = await supabase.from('categories').insert({ id, user_id: userId, name: item.name, type: item.type });
  if (error) console.error('supabase insert category error', { id, name: item.name, type: item.type, error });
  else if (!data) console.warn('supabase insert category returned no data', { id, name: item.name, type: item.type });
  })();
  return newItem;
}

export function removeCategory(id: string) {
  const list = getCategories();
  cache.categories = list.filter(c => c.id !== id);
  emitUpdate();
  (async () => {
    const userId = await getUserId();
    if (!userId) return;
  const { error } = await supabase.from('categories').delete().eq('user_id', userId).eq('id', id);
  if (error) console.error('supabase delete category error', { id, error });
  })();
}

export function updateCategory(id: string, patch: Partial<Omit<Category, 'id'>>) {
  const list = getCategories();
  const next = list.map(c => c.id === id ? { ...c, ...patch } : c);
  cache.categories = next;
  emitUpdate();
  (async () => {
    const userId = await getUserId();
    if (!userId) return;
  const { data, error } = await supabase.from('categories').update({ name: patch.name, type: patch.type }).eq('user_id', userId).eq('id', id);
  if (error) console.error('supabase update category error', { id, patch, error });
  else if (!data) console.warn('supabase update category returned no data', { id, patch });
  })();
}

export function getCategoriesByType(type: TxType): Category[] {
  return getCategories().filter(c => c.type === type);
}

// Transactions
export function getTransactions(): Transaction[] {
  return cache.transactions;
}

export function addTransaction(tx: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }): Transaction {
  const list = getTransactions();
  const id = tx.id ?? generateId();
  const newTx: Transaction = { ...tx, id, createdAt: Date.now() };
  cache.transactions = [newTx, ...list];
  emitUpdate();
  (async () => {
    const userId = await getUserId();
    if (!userId) return;
    await supabase.from('transactions').insert({
      id,
      user_id: userId,
      type: tx.type,
      amount: tx.amount,
      date: tx.date,
      account: tx.account,
      category: tx.category,
      description: tx.description ?? null,
      counterparty: tx.counterparty ?? null,
      created_at: new Date(newTx.createdAt).toISOString(),
    });
  })();
  return newTx;
}

export function updateTransaction(id: string, patch: Partial<Omit<Transaction, 'id'>>) {
  const list = getTransactions();
  const next = list.map(t => t.id === id ? { ...t, ...patch } : t);
  cache.transactions = next;
  emitUpdate();
  (async () => {
    const userId = await getUserId();
    if (!userId) return;
    const payload: any = {};
    if (typeof patch.amount !== 'undefined') payload.amount = patch.amount;
    if (typeof patch.account !== 'undefined') payload.account = patch.account;
    if (typeof patch.category !== 'undefined') payload.category = patch.category;
    if (typeof patch.description !== 'undefined') payload.description = patch.description ?? null;
    if (typeof patch.type !== 'undefined') payload.type = patch.type;
    if (typeof patch.date !== 'undefined') payload.date = patch.date;
    await supabase.from('transactions').update(payload).eq('user_id', userId).eq('id', id);
  })();
}

export function deleteTransaction(id: string) {
  const list = getTransactions();
  const target = list.find(t => t.id === id);
  if (!target) return;

  // If this transaction is part of a 'Tarik Tunai' transfer (withdrawal/ deposit pair),
  // also remove its counterpart to keep cash/bank balances consistent.
  // The counterpart will have same amount, same date, category 'Tarik Tunai', and the opposite account.
  const counterpart = list.find(t =>
    t.id !== id &&
    t.category === 'Tarik Tunai' &&
    t.amount === target.amount &&
    t.date === target.date &&
    t.type !== target.type &&
    t.account !== target.account
  );

  const filtered = list.filter(t => t.id !== id && (!counterpart || t.id !== counterpart.id));
  cache.transactions = filtered;
  emitUpdate();
  (async () => {
    const userId = await getUserId();
    if (!userId) return;
    await supabase.from('transactions').delete().eq('user_id', userId).in('id', [id, ...(counterpart ? [counterpart.id] : [])]);
  })();
}

// Transfer helpers
export function withdrawCash(amount: number, dateISO?: string) {
  const date = dateISO ?? formatDateISO();
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
  const iso = formatDateISO(d);
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

/**
 * Build a daily series between startISO and endISO (inclusive) from the provided
 * transactions or the global cache. Returns objects with label, income, expense and iso.
 */
export function getSeriesForRange(startISO: string, endISO: string, txsParam?: Transaction[], excludeTarikTunai = true) {
  const txs = txsParam ?? getTransactions();
  const start = new Date(startISO);
  const end = new Date(endISO);
  // normalize
  start.setHours(0,0,0,0);
  end.setHours(0,0,0,0);
  const out: { label: string; income: number; expense: number; iso: string }[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
  const iso = formatDateISO(d);
    const dayTx = txs.filter(t => t.date === iso && (!excludeTarikTunai || t.category !== 'Tarik Tunai'));
    const income = dayTx.filter(t => t.type === 'income').reduce((a,b)=>a+b.amount,0);
    const expense = dayTx.filter(t => t.type === 'expense').reduce((a,b)=>a+b.amount,0);
    const label = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    out.push({ label, income, expense, iso });
  }
  return out;
}
