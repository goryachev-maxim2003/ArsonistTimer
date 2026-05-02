import {
  Children,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type OptionHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { Check, ChevronDown } from "lucide-react";
import { useAppStore } from "../../store/appStore";
import { translateText } from "../../i18n/text";

export function Input({ className = "", type, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  if (type === "range") {
    return <input type={type} className={`h-2 w-full cursor-pointer accent-[var(--primary)] ${className}`} {...props} />;
  }

  return (
    <input
      type={type}
      className={`min-h-10 w-full rounded-lg border border-[var(--border)] bg-black/20 px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] ${className}`}
      {...props}
    />
  );
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`min-h-24 w-full rounded-lg border border-[var(--border)] bg-black/20 px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] ${className}`}
      {...props}
    />
  );
}

function nodeToText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join("");
  return "";
}

export function Select({ className = "", children, value, defaultValue, onChange, disabled, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  const language = useAppStore((state) => state.settings.language);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const options = useMemo(
    () =>
      Children.toArray(children)
        .filter(isValidElement)
        .map((child, index) => {
          const optionProps = child.props as OptionHTMLAttributes<HTMLOptionElement>;
          const rawLabel = nodeToText(optionProps.children);
          return {
            value: String(optionProps.value ?? rawLabel ?? index),
            label: translateText(rawLabel, language),
            disabled: Boolean(optionProps.disabled),
          };
        }),
    [children, language],
  );
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(String(defaultValue ?? value ?? options[0]?.value ?? ""));
  const selectedValue = String(value ?? internalValue);
  const selected = options.find((option) => option.value === selectedValue) ?? options[0];

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const commit = (nextValue: string) => {
    if (value === undefined) setInternalValue(nextValue);
    onChange?.({
      target: { value: nextValue },
      currentTarget: { value: nextValue },
    } as ChangeEvent<HTMLSelectElement>);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      <button
        id={props.id}
        type="button"
        className="flex min-h-10 w-full items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-black/20 px-3 py-2 text-left text-sm text-[var(--text)] transition hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={props["aria-label"]}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
          if (event.key === "ArrowDown") setOpen(true);
        }}
      >
        <span className="truncate">{selected?.label ?? ""}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--muted)] transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-2 max-h-64 w-full overflow-auto rounded-lg border border-[var(--border)] bg-[var(--raised)] p-1 shadow-2xl">
          <div role="listbox" aria-label={props["aria-label"]}>
            {options.map((option) => (
              <button
                key={`${option.value}-${option.label}`}
                type="button"
                role="option"
                aria-selected={option.value === selectedValue}
                disabled={option.disabled}
                className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition ${
                  option.value === selectedValue ? "bg-[var(--primary)] text-black" : "text-[var(--text)] hover:bg-white/10"
                } disabled:cursor-not-allowed disabled:opacity-45`}
                onClick={() => commit(option.value)}
              >
                <span className="truncate">{option.label}</span>
                {option.value === selectedValue && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
