-- CreateEnum
CREATE TYPE "CommentType" AS ENUM ('COMMENT', 'DEADLINE_PROPOSAL');

-- DropForeignKey
ALTER TABLE "task_comments" DROP CONSTRAINT "task_comments_task_id_fkey";

-- AlterTable
ALTER TABLE "task_comments" ADD COLUMN     "attachments" JSONB,
ADD COLUMN     "links" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "mentions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "proposal_status" "ProposalStatus",
ADD COLUMN     "proposed_deadline" TIMESTAMP(3),
ADD COLUMN     "type" "CommentType" NOT NULL DEFAULT 'COMMENT';

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
