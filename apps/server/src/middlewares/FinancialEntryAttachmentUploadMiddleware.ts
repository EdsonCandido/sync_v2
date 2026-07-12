import multer from "multer";

export const financialEntryAttachmentUpload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 10 * 1024 * 1024, files: 1 },
});
