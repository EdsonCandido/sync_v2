import { AppointmentRepository } from "../repositories/AppointmentRepository";
import { AppError } from "../utils/AppError";

export class SoftDeleteAppointmentService {
	constructor(
		private readonly appointmentRepository = new AppointmentRepository(),
	) {}

	async execute(
		id: string,
		params: { companyId: string; userId: string },
	) {
		const row = await this.appointmentRepository.softDelete(
			id,
			params.companyId,
			params.userId,
		);
		if (!row) throw new AppError(404, "Agendamento não encontrado.");
		return row;
	}
}
