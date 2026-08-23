const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function planRemainingDays(
	planExpiresAt: Date,
	now = new Date(),
): number {
	return Math.ceil((planExpiresAt.getTime() - now.getTime()) / MS_PER_DAY);
}

export function withRemainingDays<T extends { planExpiresAt: Date }>(
	company: T,
	now = new Date(),
) {
	return {
		...company,
		remainingDays: planRemainingDays(company.planExpiresAt, now),
	};
}
