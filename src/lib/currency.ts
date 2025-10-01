export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

export function normalizeAmountInput(input: string): { display: string; numeric: string } {
  // Keep only digits
  const digits = (input || '').replace(/\D+/g, '');
  const n = digits.replace(/^0+(?=\d)/, '');
  const numeric = n === '' ? '' : n;
  const numVal = Number(numeric || 0);
  const display = numeric === '' ? '' : formatRupiah(numVal);
  return { display, numeric };
}
