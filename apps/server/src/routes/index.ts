import type { Express } from "express";
import { agendamentosRoutes } from "./agendamentos.routes";
import { cepRoutes } from "./cep.routes";
import { clientRoutes } from "./client.routes";
import { companyRoutes } from "./company.routes";
import { companyDashboardRoutes } from "./company-dashboard.routes";
import { financeiroRoutes } from "./financeiro.routes";
import { geocodeRoutes } from "./geocode.routes";
import { itrRoutes } from "./itr.routes";
import { kanbanRoutes } from "./kanban.routes";
import { modulePermissionRoutes } from "./module-permission.routes";
import { notificationsRoutes } from "./notifications.routes";
import { planRoutes } from "./plan.routes";
import { publicItrRoutes } from "./public-itr.routes";
import { userRoutes } from "./user.routes";

export function registerRoutes(app: Express) {
	app.get("/", (_req, res) => {
		res.status(200).send("OK");
	});

	app.use("/api/companies", companyRoutes);
	app.use("/api/company-dashboard", companyDashboardRoutes);
	app.use("/api/clients", clientRoutes);
	app.use("/api/financeiro", financeiroRoutes);
	app.use("/api/itr", itrRoutes);
	app.use("/api/public/itr", publicItrRoutes);
	app.use("/api/kanban", kanbanRoutes);
	app.use("/api/agendamentos", agendamentosRoutes);
	app.use("/api/notifications", notificationsRoutes);
	app.use("/api/module-permissions", modulePermissionRoutes);
	app.use("/api/plans", planRoutes);
	app.use("/api/users", userRoutes);
	app.use("/api/cep", cepRoutes);
	app.use("/api/geocode", geocodeRoutes);
}
