"use client";
import {
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import {
  Checkbox as CheckboxPrimitive,
  Switch as SwitchPrimitive,
  RadioGroup as RadioPrimitive,
  Slider as SliderPrimitive,
} from "radix-ui";
import {
  Check,
  Minus,
  Search,
  X,
  UploadCloud,
  FileText,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/core/ui/design-system/lib/utils";
import { Button } from "@/core/ui/design-system/ui/primitives/button";

export const inputStyles =
  "flex h-[var(--input-height)] w-full min-w-0 rounded-control border border-input bg-surface px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-colors placeholder:text-subtle-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/20";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(inputStyles, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        inputStyles,
        "h-auto min-h-24 resize-y leading-6",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: ComponentProps<"select">) {
  return (
    <select
      className={cn(inputStyles, "cursor-pointer pr-8", className)}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label
      className={cn("text-sm leading-5 font-medium text-foreground", className)}
      {...props}
    />
  );
}

export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (props: {
    id: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
  }) => ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="ml-1 text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      {children({
        id,
        "aria-describedby": hint || error ? `${id}-message` : undefined,
        "aria-invalid": !!error,
      })}
      {(error || hint) && (
        <p
          id={`${id}-message`}
          role={error ? "alert" : undefined}
          className={cn(
            "flex items-start gap-1.5 text-xs leading-5",
            error ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {error && (
            <AlertCircle
              className="mt-0.5 size-3.5 shrink-0"
              aria-hidden="true"
            />
          )}
          {error || hint}
        </p>
      )}
    </div>
  );
}

export function SearchInput({
  value,
  onValueChange,
  placeholder = "Tìm kiếm…",
  className,
  label = "Tìm kiếm",
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle-foreground"
        aria-hidden="true"
      />
      <Input
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="pr-10 pl-9"
      />
      {value && (
        <button
          type="button"
          aria-label={`Xóa ${label.toLowerCase()}`}
          className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-muted"
          onClick={() => onValueChange("")}
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

export function Checkbox({
  className,
  ...props
}: ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded border border-input bg-surface text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-45 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator>
        {props.checked === "indeterminate" ? (
          <Minus className="size-3" />
        ) : (
          <Check className="size-3" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export function Switch({
  className,
  ...props
}: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-input outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-45 data-[state=checked]:bg-primary",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block size-4 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0 motion-reduce:transition-none" />
    </SwitchPrimitive.Root>
  );
}

export function RadioGroup({
  className,
  ...props
}: ComponentProps<typeof RadioPrimitive.Root>) {
  return (
    <RadioPrimitive.Root className={cn("grid gap-3", className)} {...props} />
  );
}

export function RadioItem({
  className,
  ...props
}: ComponentProps<typeof RadioPrimitive.Item>) {
  return (
    <RadioPrimitive.Item
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-full border border-input bg-surface outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-45 data-[state=checked]:border-primary",
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator className="size-2 rounded-full bg-primary" />
    </RadioPrimitive.Item>
  );
}

export function Slider({
  className,
  ...props
}: ComponentProps<typeof SliderPrimitive.Root>) {
  const count = props.value?.length || props.defaultValue?.length || 1;
  return (
    <SliderPrimitive.Root
      className={cn(
        "relative flex w-full touch-none items-center py-2 select-none data-[disabled]:opacity-45",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 grow rounded-full bg-muted">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-primary" />
      </SliderPrimitive.Track>
      {Array.from({ length: count }, (_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className="block size-4 rounded-full border-2 border-primary bg-surface shadow-sm outline-none focus-visible:ring-4 focus-visible:ring-ring/20"
          aria-label={
            count > 1
              ? `${props["aria-label"] || "Giá trị"} ${i + 1}`
              : props["aria-label"]
          }
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export type UploadFile = { id: string; file: File };

export function FileUpload({
  accept = ".pdf,.doc,.docx,.jpg,.png",
  maxSizeMB = 10,
  onFilesChange,
}: {
  accept?: string;
  maxSizeMB?: number;
  onFilesChange?: (files: File[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const id = useId();
  function add(incoming: FileList | null) {
    if (!incoming) return;
    const candidates = Array.from(incoming);
    const extensions = accept.split(",").map((v) => v.trim().toLowerCase());
    const invalid = candidates.find(
      (file) =>
        file.size > maxSizeMB * 1024 * 1024 ||
        !extensions.some((ext) =>
          ext.startsWith(".")
            ? file.name.toLowerCase().endsWith(ext)
            : ext.endsWith("/*")
              ? file.type.startsWith(ext.slice(0, -1))
              : file.type === ext,
        ),
    );
    if (invalid) {
      setError(
        `Tệp “${invalid.name}” không đúng định dạng hoặc vượt quá ${maxSizeMB} MB.`,
      );
      return;
    }
    setError("");
    const next = [
      ...files,
      ...candidates.map((file) => ({ id: crypto.randomUUID(), file })),
    ];
    setFiles(next);
    onFilesChange?.(next.map((f) => f.file));
  }
  return (
    <div className="space-y-3">
      <div
        className={cn(
          "rounded-panel border-2 border-dashed p-7 text-center transition-colors",
          dragging ? "border-primary bg-accent" : "border-input bg-background",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          add(e.dataTransfer.files);
        }}
      >
        <UploadCloud
          className="mx-auto mb-3 size-7 text-subtle-foreground"
          aria-hidden="true"
        />
        <label
          htmlFor={id}
          className="cursor-pointer text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Chọn tệp đính kèm
        </label>
        <span className="ml-1 text-sm text-muted-foreground">
          hoặc kéo thả vào đây
        </span>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {accept.replaceAll(",", " · ")} · Tối đa {maxSizeMB} MB mỗi tệp
        </p>
        <input
          ref={input}
          id={id}
          type="file"
          accept={accept}
          multiple
          className="sr-only"
          aria-describedby={`${id}-info`}
          onChange={(e) => {
            add(e.target.files);
            e.target.value = "";
          }}
        />
        <span id={`${id}-info`} className="sr-only">
          Tệp chỉ được chọn cục bộ, chưa tải lên máy chủ.
        </span>
      </div>
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
      {files.map((f) => (
        <div
          key={f.id}
          className="flex items-center gap-3 rounded-control border border-border bg-surface px-3 py-2"
        >
          <FileText className="size-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{f.file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(f.file.size / 1024).toFixed(1)} KB · Đã chọn cục bộ
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Gỡ ${f.file.name}`}
            onClick={() => {
              const next = files.filter((file) => file.id !== f.id);
              setFiles(next);
              onFilesChange?.(next.map((v) => v.file));
            }}
          >
            <X />
          </Button>
        </div>
      ))}
    </div>
  );
}
