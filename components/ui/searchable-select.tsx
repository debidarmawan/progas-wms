"use client";

import { Children, isValidElement, useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Input, Label } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

type SelectOption = { value: string; label: string };

type SearchableSelectProps = {
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  className?: string;
  options?: SelectOption[];
  children?: ReactNode;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: (event: { target: { value: string } }) => void;
  "aria-label"?: string;
};

function labelFromChildren(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(labelFromChildren).join("");
  return "";
}

function parseChildren(children: ReactNode) {
  const options: SelectOption[] = [];
  let placeholder: string | undefined;

  Children.toArray(children).forEach((child) => {
    if (!isValidElement<{ value?: string; children?: ReactNode; disabled?: boolean }>(child)) return;
    const value = child.props.value === undefined ? "" : String(child.props.value);
    const label = labelFromChildren(child.props.children);
    if (value === "" && child.props.disabled) {
      placeholder = label;
      return;
    }
    options.push({ value, label });
  });

  return { options, placeholder };
}

export function SearchableSelect({
  id,
  name,
  label,
  placeholder,
  className,
  options,
  children,
  value,
  defaultValue,
  disabled = false,
  required = false,
  onChange,
  "aria-label": ariaLabel,
}: SearchableSelectProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const listId = `${fieldId}-options`;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const isControlled = value !== undefined;
  // `picked` stays null until the user chooses, so a defaultValue that arrives after
  // mount (edit pages fetch their record) still shows up.
  const selected = isControlled ? value : picked ?? defaultValue ?? "";
  const { options: parsedOptions, placeholder: emptyOptionLabel } = options
    ? { options, placeholder: options.find((option) => option.value === "")?.label }
    : parseChildren(children);
  const selectedOption = parsedOptions.find((option) => option.value === selected);
  const filteredOptions = parsedOptions.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase()),
  );
  const resolvedPlaceholder = open
    ? "Ketik untuk mencari..."
    : placeholder ?? emptyOptionLabel ?? "Pilih...";

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setSearch("");
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function selectOption(next: string) {
    if (!isControlled) setPicked(next);
    onChange?.({ target: { value: next } });
    setSearch("");
    setOpen(false);
  }

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      {label ? <Label htmlFor={fieldId}>{label}</Label> : null}
      <Input
        id={fieldId}
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={listId}
        autoComplete="off"
        className="pr-10"
        disabled={disabled}
        placeholder={resolvedPlaceholder}
        required={required}
        value={open ? search : selectedOption?.label ?? ""}
        onFocus={() => !disabled && setOpen(true)}
        onChange={(event) => setSearch(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape" || event.key === "Tab") {
            setSearch("");
            setOpen(false);
            return;
          }
          if (event.key === "Enter") {
            event.preventDefault();
            if (filteredOptions.length > 0) selectOption(filteredOptions[0].value);
          }
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
      >
        ▾
      </span>
      {name ? <input name={name} type="hidden" value={selected} /> : null}
      {open && !disabled ? (
        <div
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
          id={listId}
          role="listbox"
        >
          {filteredOptions.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-500">Pilihan tidak ditemukan.</p>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                aria-selected={option.value === selected}
                className={cn(
                  "block w-full px-3 py-2 text-left text-sm hover:bg-indigo-50",
                  option.value === selected && "bg-indigo-50/60 font-medium text-indigo-700",
                )}
                role="option"
                type="button"
                onClick={() => selectOption(option.value)}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
