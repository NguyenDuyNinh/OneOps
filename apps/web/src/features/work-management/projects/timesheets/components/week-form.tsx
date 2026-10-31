"use client";
import { useState } from "react";
import {
  mondayOf,
  officeToday,
} from "@/features/work-management/projects/timesheets/constants";
import { client } from "@/features/work-management/projects/timesheets/api/client";
import { recordsChanged } from "@/features/work-management/projects/timesheets/hooks/use-records";
import { useWorkspace } from "@/features/work-management/projects/timesheets/components/primitives/workspace";
import { Button } from "@/features/work-management/projects/timesheets/components/primitives/button";
import { Input } from "@/features/work-management/projects/timesheets/components/primitives/forms";
import styles from "@/features/work-management/projects/timesheets/components/styles.module.css";

/** Opens the week that contains the chosen day; reopening returns the same week. */
export function WeekForm({ onClose }: { onClose: () => void }) {
  const { notify } = useWorkspace();
  const [date, setDate] = useState(officeToday());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const weekStart = mondayOf(date);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    try {
      await client.open(weekStart);
      recordsChanged();
      notify(`Đã mở tuần ${weekStart}.`);
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Không thể mở tuần công",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="form-body" onSubmit={submit}>
      <label className="w-full">
        Chọn một ngày trong tuần
        <Input
          name="date"
          type="date"
          required
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </label>
      <p className="text-sm text-muted-foreground">
        Tuần bắt đầu {weekStart}. Nếu tuần đã tồn tại, hệ thống mở lại tuần đó.
      </p>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <footer>
        <Button variant="secondary" onClick={onClose} disabled={pending}>
          Hủy
        </Button>
        <Button type="submit" loading={pending}>
          Mở tuần
        </Button>
      </footer>
    </form>
  );
}
