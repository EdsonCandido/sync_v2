import type { Request, Response } from "express";
import { AppError } from "../utils/AppError";

export function requireCompanyId(req: Request) {
	const companyId = req.authSession?.user?.companyId;
	if (!companyId) {
		throw new AppError(403, "Empresa não vinculada.");
	}
	return companyId;
}

export function clientIp(req: Request) {
	const forwarded = req.headers["x-forwarded-for"];
	if (typeof forwarded === "string" && forwarded.length > 0) {
		return forwarded.split(",")[0]?.trim() ?? null;
	}
	return req.socket.remoteAddress ?? null;
}

export function handleFinanceiroError(res: Response, error: unknown) {
	if (error instanceof AppError) {
		res.status(error.status).json({ message: error.message });
		return;
	}
	if (
		error &&
		typeof error === "object" &&
		"name" in error &&
		(error as { name: string }).name === "ZodError"
	) {
		res.status(400).json({ message: "Dados inválidos.", issues: error });
		return;
	}
	console.error(error);
	res.status(500).json({ message: "Erro interno." });
}
