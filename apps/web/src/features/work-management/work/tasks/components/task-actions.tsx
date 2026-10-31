"use client";
import { useState } from "react";
import { Button } from "@/features/work-management/work/tasks/components/primitives/button";
import { ReasonDialog } from "@/features/work-management/work/tasks/components/reason-dialog";
import {
  reasonRequiredCodes,
  transitionHint,
  transitionLabel,
} from "@/features/work-management/work/tasks/constants";

export type TransitionRequest = {
  code: string;
  to: string;
  reason?: string;
  overrideReason?: string;
};

const destructive = new Set(["TR-08"]);

export function TaskActions({
  allowed,
  pending,
  allowOverride,
  onTransition,
}: {
  allowed: readonly { code: string; to: string }[];
  pending: boolean;
  /** Set when the API reported blocking acceptance criteria. */
  allowOverride?: boolean;
  /** Rejects when the API refuses the move, so the prompt can explain it. */
  onTransition: (input: TransitionRequest) => Promise<void>;
}) {
  const [move, setMove] = useState<{ code: string; to: string } | null>(null);
  const [overriding, setOverriding] = useState(false);
  const close = () => {
    setMove(null);
    setOverriding(false);
  };

  return (
    <div role="group" aria-label="Chuyển trạng thái">
      {allowed.length ? (
        <div className="flex flex-wrap gap-2">
          {allowed.map((item) => (
            <Button
              key={item.code}
              variant={destructive.has(item.code) ? "destructive" : "secondary"}
              disabled={pending}
              title={transitionHint[item.code]}
              onClick={() => {
                if (reasonRequiredCodes.includes(item.code)) {
                  setOverriding(false);
                  setMove(item);
                  return;
                }
                void onTransition(item).catch(() => {
                  /* the detail panel shows the reason */
                });
              }}
            >
              {transitionLabel[item.code] ?? `Chuyển sang ${item.to}`}
            </Button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Bạn không có thao tác nào khả dụng ở trạng thái hiện tại.
        </p>
      )}
      {allowOverride && (
        <div className="mt-2">
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() => {
              setOverriding(true);
              setMove({ code: "TR-04", to: "Hoàn thành" });
            }}
          >
            Bỏ qua kiểm tra và hoàn thành
          </Button>
        </div>
      )}
      {move && overriding && (
        <ReasonDialog
          title="Bỏ qua tiêu chí kiểm tra"
          description="Chỉ Quản lý được bỏ qua. Lý do được ghi vào lịch sử công việc."
          label="Lý do bỏ qua"
          confirmLabel="Hoàn thành"
          pending={pending}
          onCancel={close}
          onConfirm={async (reason) => {
            await onTransition({ ...move, overrideReason: reason });
            close();
          }}
        />
      )}
      {move && !overriding && (
        <ReasonDialog
          title={transitionLabel[move.code] ?? "Chuyển trạng thái"}
          description={`Công việc sẽ chuyển sang “${move.to}”. Lý do được lưu vào lịch sử.`}
          label="Lý do"
          confirmLabel="Xác nhận"
          destructive={destructive.has(move.code)}
          pending={pending}
          onCancel={close}
          onConfirm={async (reason) => {
            await onTransition({ ...move, reason });
            close();
          }}
        />
      )}
    </div>
  );
}
