import type {
	AppointmentSlotKind,
	UpdateAppointmentInput,
} from "@sync_v2/contracts";
import { AppointmentRepository } from "../repositories/AppointmentRepository";
import { AppError } from "../utils/AppError";
import { resolveAppointmentBounds } from "./appointmentHelpers";

export class UpdateAppointmentService {
	constructor(
		private readonly appointmentRepository = new AppointmentRepository(),
	) {}

	async execute(
		id: string,
		input: UpdateAppointmentInput,
		params: { companyId: string; userId: string },
	) {
		const existing = await this.appointmentRepository.findById(
			id,
			params.companyId,
		);
		if (!existing) throw new AppError(404, "Agendamento não encontrado.");

		const slotKind = (input.slotKind ??
			existing.slotKind) as AppointmentSlotKind;
		const date = input.date ?? existing.date;
		const startsAt =
			input.startsAt !== undefined ? input.startsAt : existing.startsAt;
		const endsAt = input.endsAt !== undefined ? input.endsAt : existing.endsAt;

		if (slotKind === "timed" && !startsAt) {
			throw new AppError(400, "Horário de início obrigatório.");
		}

		const bounds = resolveAppointmentBounds({
			slotKind,
			date,
			startsAt,
			endsAt,
		});

		const row = await this.appointmentRepository.update(id, params.companyId, {
			...input,
			startsAt: bounds.startsAt,
			endsAt: bounds.endsAt,
			updatedBy: params.userId,
		});
		if (!row) throw new AppError(404, "Agendamento não encontrado.");
		return row;
	}
}
