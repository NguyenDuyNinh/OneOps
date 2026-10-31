-- Employees are identified by their employee code (a string), not by an account id.
ALTER TABLE "work_timesheets"."time_entries" ALTER COLUMN "employeeId" TYPE VARCHAR(100) USING "employeeId"::text;
ALTER TABLE "work_timesheets"."timesheet_periods" ALTER COLUMN "employeeId" TYPE VARCHAR(100) USING "employeeId"::text;

-- Entry creation is the only repeatable write; retrying with the same key is harmless.
ALTER TABLE "work_timesheets"."time_entries" ADD COLUMN "requestKey" VARCHAR(120);
CREATE UNIQUE INDEX "time_entries_requestKey_key" ON "work_timesheets"."time_entries"("requestKey");
