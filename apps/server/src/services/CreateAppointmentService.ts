import type { CreateAppointmentInput } from "@sync_v2/contracts";
import { AppointmentRepository } from "../repositories/AppointmentRepository";
import { AppError } from "../utils/AppError";
import { resolveAppointmentBounds } from "./appointmentHelpers";

export class CreateAppointmentService {
	constructor(
		private readonly appointmentRepository = new AppointmentRepository(),
	) {}

	async execute(
		input: CreateAppointmentInput,
		params: { companyId: string; userId: string },
	) {
		if (input.slotKind === "timed" && !input.startsAt) {
			throw new AppError(400, "Horário de início obrigatório.");
		}

		const bounds = resolveAppointmentBounds({
			slotKind: input.slotKind,
			date: input.date,
			startsAt: input.startsAt,
			endsAt: input.endsAt,
		});

		const row = await this.appointmentRepository.create({
			...input,
			startsAt: bounds.startsAt,
			endsAt: bounds.endsAt,
			companyId: params.companyId,
			userId: params.userId,
			createdBy: params.userId,
			updatedBy: params.userId,
		});
		if (!row) throw new AppError(500, "Falha ao criar agendamento.");
		return row;
	}
}
