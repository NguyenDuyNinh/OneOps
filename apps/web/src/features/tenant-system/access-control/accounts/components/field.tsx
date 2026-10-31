"use client";
import { cloneElement, isValidElement, useId } from "react";
import type { z } from "zod";

export type FieldErrors = Record<string, string>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  const result: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    result[key] ??= issue.message;
  }
  return result;
}

type ControlProps = { id?: string; "aria-describedby"?: string };

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const generatedId = useId();
  const note = hint ?? error;
  const noteId = note ? `${generatedId}-note` : undefined;
  const id =
    isValidElement<ControlProps>(children) && children.props.id
      ? children.props.id
      : generatedId;
  const control = isValidElement<ControlProps>(children)
    ? cloneElement(children, {
        id,
        "aria-describedby":
          [children.props["aria-describedby"], noteId]
            .filter(Boolean)
            .join(" ") || undefined,
      })
    : children;

  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <label className="font-medium" htmlFor={id}>
        {label}
      </label>
      {control}
      {note && (
        <span
          id={noteId}
          className={
            error ? "text-xs text-destructive" : "text-xs text-muted-foreground"
          }
          role={error ? "alert" : undefined}
        >
          {note}
        </span>
      )}
    </div>
  );
}
