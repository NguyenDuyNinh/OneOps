"use client";
import { useId, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/core/ui/design-system/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/ui/design-system/ui/primitives/overlays";
import { SearchInput } from "@/core/ui/design-system/ui/primitives/forms";

type SharedProps = {
  id?: string;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  className?: string;
};

function SelectionMenu({
  value,
  onValueChange,
  options,
  placeholder = "Chọn giá trị",
  multiple = false,
  disabled,
  id,
  className,
  ...aria
}: SharedProps & {
  value: string[];
  onValueChange: (value: string[]) => void;
  multiple?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const listId = useId();
  const list = useRef<HTMLDivElement>(null);
  const filtered = options.filter((option) =>
    option.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi")),
  );
  function choose(option: string) {
    onValueChange(
      multiple
        ? value.includes(option)
          ? value.filter((v) => v !== option)
          : [...value, option]
        : [option],
    );
    if (!multiple) setOpen(false);
  }
  return (
    <div className={cn("space-y-2", className)}>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery("");
        }}
      >
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-haspopup="listbox"
            disabled={disabled}
            className="flex min-h-[var(--control-height)] w-full items-center justify-between gap-2 rounded-control border border-input bg-surface px-3 py-2 text-left text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-45 aria-invalid:border-destructive"
            {...aria}
          >
            <span
              className={cn(
                "min-w-0 truncate",
                !value.length && "text-subtle-foreground",
              )}
            >
              {value.length
                ? value.length > 1
                  ? `${value[0]} +${value.length - 1}`
                  : value[0]
                : placeholder}
            </span>
            <ChevronDown className="size-4 shrink-0 text-subtle-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] min-w-56 p-2"
        >
          <div
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                list.current
                  ?.querySelector<HTMLElement>('[role="option"]')
                  ?.focus();
              }
            }}
          >
            <SearchInput
              label="Tìm lựa chọn"
              value={query}
              onValueChange={setQuery}
              placeholder="Tìm lựa chọn…"
            />
          </div>
          <div
            ref={list}
            id={listId}
            role="listbox"
            aria-label={placeholder}
            aria-multiselectable={multiple || undefined}
            className="mt-2 max-h-56 overflow-y-auto"
            onKeyDown={(e) => {
              const nodes = Array.from(
                list.current?.querySelectorAll<HTMLElement>(
                  '[role="option"]',
                ) || [],
              );
              const current = nodes.indexOf(
                document.activeElement as HTMLElement,
              );
              const next =
                e.key === "ArrowDown"
                  ? (current + 1) % nodes.length
                  : e.key === "ArrowUp"
                    ? (current - 1 + nodes.length) % nodes.length
                    : e.key === "Home"
                      ? 0
                      : e.key === "End"
                        ? nodes.length - 1
                        : -1;
              if (next >= 0) {
                e.preventDefault();
                nodes[next]?.focus();
              }
            }}
          >
            {filtered.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={value.includes(option)}
                className="flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm leading-5 outline-none hover:bg-muted focus:bg-muted"
                onClick={() => choose(option)}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border",
                    value.includes(option)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input",
                  )}
                >
                  {value.includes(option) && <Check className="size-3" />}
                </span>
                <span>{option}</span>
              </button>
            ))}
            {!filtered.length && (
              <p className="px-2 py-5 text-center text-xs text-muted-foreground">
                Không tìm thấy lựa chọn
              </p>
            )}
          </div>
          {multiple && value.length > 0 && (
            <button
              type="button"
              className="mt-2 w-full border-t border-border pt-2 pb-1 text-xs text-primary"
              onClick={() => onValueChange([])}
            >
              Bỏ chọn tất cả ({value.length})
            </button>
          )}
        </PopoverContent>
      </Popover>
      {multiple && value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item) => (
            <span
              key={item}
              className="inline-flex max-w-full items-center gap-1 rounded bg-accent px-2 py-1 text-xs text-accent-foreground"
            >
              <span className="truncate">{item}</span>
              <button
                type="button"
                disabled={disabled}
                className="shrink-0 rounded p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Bỏ chọn ${item}`}
                onClick={() => onValueChange(value.filter((v) => v !== item))}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function MultiSelect(
  props: SharedProps & {
    value: string[];
    onValueChange: (value: string[]) => void;
  },
) {
  return <SelectionMenu {...props} multiple />;
}

export function Combobox({
  value,
  onValueChange,
  ...props
}: SharedProps & { value: string; onValueChange: (value: string) => void }) {
  return (
    <SelectionMenu
      {...props}
      value={value ? [value] : []}
      onValueChange={(next) => onValueChange(next[0] || "")}
    />
  );
}
