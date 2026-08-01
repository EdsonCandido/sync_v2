import { AppointmentRepository } from "../repositories/AppointmentRepository";
import { AppError } from "../utils/AppError";

export class FindAppointmentService {
	constructor(
		private readonly appointmentRepository = new AppointmentRepository(),
	) {}

	async execute(id: string, companyId: string) {
		const row = await this.appointmentRepository.findById(id, companyId);
		if (!row) throw new AppError(404, "Agendamento não encontrado.");
		return row;
	}
}
