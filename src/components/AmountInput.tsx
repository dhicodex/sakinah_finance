"use client";

import { normalizeAmountInput } from "@/lib/currency";

type AmountInputProps = {
  value: string; // numeric string without separators, e.g. "10000"
  onValue: (numeric: string) => void;
  placeholder?: string;
  className?: string;
};

const AmountInput = ({ value, onValue, placeholder, className }: AmountInputProps) => {
  const display = value === "" ? "" : normalizeAmountInput(value).display;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { display, numeric } = normalizeAmountInput(e.target.value);
    // update DOM value to formatted representation while returning numeric to parent
    e.target.value = display;
    onValue(numeric);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      placeholder={placeholder}
      defaultValue={display}
      onChange={onChange}
      className={className}
    />
  );
};

export default AmountInput;
