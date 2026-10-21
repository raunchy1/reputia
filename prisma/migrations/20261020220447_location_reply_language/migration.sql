-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "customInstructions" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "replyLanguage" TEXT NOT NULL DEFAULT 'it';
