"use client";
import type { BoardTask } from "../types";
import { Badge } from "./primitives/foundations";
import { Select } from "./primitives/forms";
import styles from "./styles.module.css";
export function KanbanBoard({
  records,
  filtered,
  statuses,
  pending,
  today,
  onOpen,
  onMove,
}: {
  records: BoardTask[];
  filtered: BoardTask[];
  statuses: readonly string[];
  pending: boolean;
  today: string;
  onOpen: (id: string) => void;
  onMove: (id: string, status: string) => void;
}) {
  return (
    <div className={styles.board}>
      {statuses.map((lane) => (
        <section
          key={lane}
          className={styles.column}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const record = records.find(
              (item) => item.id === event.dataTransfer.getData("text/plain"),
            );
            if (record && record.status !== lane) onMove(record.id, lane);
          }}
        >
          <h2>
            {lane}
            <span>
              {filtered.filter((record) => record.status === lane).length}
            </span>
          </h2>
          {filtered
            .filter((record) => record.status === lane)
            .map((record) => (
              <article
                key={record.id}
                className={styles.card}
                draggable={!pending}
                onDragStart={(event) =>
                  event.dataTransfer.setData("text/plain", record.id)
                }
              >
                <div className={styles.meta}>
                  <span>{record.code}</span>
                  <Badge>{record.fields.priority || "Trung bình"}</Badge>
                </div>
                <button onClick={() => onOpen(record.id)}>
                  <h3>{record.name}</h3>
                </button>
                {record.fields.project && (
                  <p className="text-xs text-muted-foreground">
                    {record.fields.project}
                  </p>
                )}
                <div className={styles.meta}>
                  <span>{record.assignee || "Chưa phân công"}</span>
                  <span
                    className={
                      record.date < today && record.status !== "Hoàn thành"
                        ? "text-destructive"
                        : ""
                    }
                  >
                    {record.date}
                  </span>
                </div>
                <div className="mt-3">
                  <Select
                    aria-label={"Trạng thái " + record.code}
                    value={record.status}
                    disabled={pending}
                    onChange={(event) => onMove(record.id, event.target.value)}
                  >
                    {statuses.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </Select>
                </div>
              </article>
            ))}
        </section>
      ))}
    </div>
  );
}
