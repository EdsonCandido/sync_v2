import multer from "multer";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

export const kanbanAttachmentUpload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: MAX_FILE_BYTES, files: 1 },
});
