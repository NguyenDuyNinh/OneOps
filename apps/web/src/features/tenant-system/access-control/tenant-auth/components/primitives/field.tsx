"use client";
import { cloneElement, isValidElement, useId } from "react";
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
  // The label stays a sibling of the control: wrapping the whole field would
  // fold hints and option texts into the control's accessible name.
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
