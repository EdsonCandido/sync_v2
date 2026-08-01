import type { ListAppointmentsQuery } from "@sync_v2/contracts";
import { AppointmentRepository } from "../repositories/AppointmentRepository";

export class ListAppointmentsService {
	constructor(
		private readonly appointmentRepository = new AppointmentRepository(),
	) {}

	async execute(query: ListAppointmentsQuery, companyId: string) {
		const items = await this.appointmentRepository.list({
			companyId,
			from: query.from,
			to: query.to,
		});
		return { items };
	}
}
