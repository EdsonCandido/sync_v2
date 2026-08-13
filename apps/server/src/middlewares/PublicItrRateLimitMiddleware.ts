import type { NextFunction, Request, Response } from "express";
import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 60,
	standardHeaders: true,
	legacyHeaders: false,
	handler: (_req, res) => {
		res.status(429).json({
			message: "Muitas requisições. Tente novamente mais tarde.",
		});
	},
});

export class PublicItrRateLimitMiddleware {
	handle(req: Request, res: Response, next: NextFunction) {
		limiter(req, res, next);
	}
}

export const publicItrRateLimit = new PublicItrRateLimitMiddleware();
