"use client";
import type { ComponentProps } from "react";
import {
  Tabs as TabsPrimitive,
  Accordion as AccordionPrimitive,
} from "radix-ui";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/core/ui/design-system/lib/utils";

export const Tabs = TabsPrimitive.Root;

export function TabsList({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex max-w-full gap-1 overflow-auto rounded-control border border-border bg-muted p-1",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex min-h-8 items-center justify-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium whitespace-nowrap text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 data-[state=active]:bg-surface data-[state=active]:text-foreground data-[state=active]:shadow-xs",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn(
        "mt-5 outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}

export const Accordion = AccordionPrimitive.Root;

export function AccordionItem({
  className,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      className={cn("border-b border-border last:border-0", className)}
      {...props}
    />
  );
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header>
      <AccordionPrimitive.Trigger
        className={cn(
          "group flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionContent({
  className,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className={cn("pb-4 text-sm leading-6 text-muted-foreground", className)}
      {...props}
    />
  );
}

export function Stepper({
  steps,
  current,
  onStepChange,
}: {
  steps: string[];
  current: number;
  onStepChange?: (step: number) => void;
}) {
  return (
    <ol aria-label="Các bước thực hiện" className="flex flex-wrap gap-y-4">
      {steps.map((step, i) => (
        <li key={step} className="flex min-w-0 flex-1 items-center">
          <button
            type="button"
            disabled={!onStepChange || i > current}
            aria-current={i === current ? "step" : undefined}
            onClick={() => onStepChange?.(i)}
            className="flex items-center gap-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                i < current
                  ? "border-success bg-success-soft text-success"
                  : i === current
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-muted text-muted-foreground",
              )}
            >
              {i < current ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span
              className={cn(
                "text-xs font-medium",
                i === current ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {step}
            </span>
          </button>
          {i < steps.length - 1 && (
            <span
              className={cn(
                "mx-3 h-px min-w-3 flex-1",
                i < current ? "bg-success/40" : "bg-border",
              )}
            />
          )}
        </li>
      ))}
    </ol>
  );
}

export function Timeline({
  items,
}: {
  items: {
    title: string;
    description: string;
    time: string;
    complete?: boolean;
  }[];
}) {
  return (
    <ol className="space-y-0">
      {items.map((item, i) => (
        <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
          {i < items.length - 1 && (
            <span className="absolute top-5 bottom-0 left-[9px] w-px bg-border" />
          )}
          <span
            className={cn(
              "relative mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border",
              item.complete
                ? "border-success/20 bg-success-soft text-success"
                : "border-primary bg-accent text-primary",
            )}
          >
            {item.complete ? (
              <Check className="size-3" />
            ) : (
              <span className="size-1.5 rounded-full bg-current" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-medium">{item.title}</p>
              <time className="text-xs text-subtle-foreground">
                {item.time}
              </time>
            </div>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {item.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
