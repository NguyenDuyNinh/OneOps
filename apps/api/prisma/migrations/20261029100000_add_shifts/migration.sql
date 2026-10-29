-- CreateTable
CREATE TABLE "shifts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "break_minutes" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_assignments" (
    "id" TEXT NOT NULL,
    "shift_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "work_date" DATE NOT NULL,
    "assigned_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shift_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shifts_is_active_idx" ON "shifts"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "shift_assignments_employee_id_shift_id_work_date_key"
ON "shift_assignments"("employee_id", "shift_id", "work_date");

-- CreateIndex
CREATE INDEX "shift_assignments_employee_id_work_date_idx"
ON "shift_assignments"("employee_id", "work_date");

-- CreateIndex
CREATE INDEX "shift_assignments_shift_id_work_date_idx"
ON "shift_assignments"("shift_id", "work_date");

-- AddForeignKey
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_shift_id_fkey"
FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
