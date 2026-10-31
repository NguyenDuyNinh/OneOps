-- Reviewer becomes a first-class column of the task aggregate, and the two
-- attributes that moved to their own features are removed from the JSON bag.
ALTER TABLE "work_tasks"."records" ADD COLUMN "reviewer" VARCHAR(150) NOT NULL DEFAULT '';

UPDATE "work_tasks"."records"
SET "reviewer" = LEFT(COALESCE("fields"->>'nguoiKiemTra', ''), 150)
WHERE "fields" ? 'nguoiKiemTra';

UPDATE "work_tasks"."records"
SET "fields" = "fields" - 'nguoiKiemTra' - 'comments'
WHERE "fields" ? 'nguoiKiemTra' OR "fields" ? 'comments';
