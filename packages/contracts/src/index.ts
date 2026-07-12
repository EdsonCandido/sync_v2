import { z } from "zod";

export const createPlanSchema = z.object({
	name: z.string().min(1),
	description: z.string().optional().nullable(),
	startDate: z.coerce.date(),
	endDate: z.coerce.date(),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;

export const updatePlanSchema = createPlanSchema.partial();

export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;

export const listPlansQuerySchema = z.object({
	q: z.string().optional(),
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export type ListPlansQuery = z.infer<typeof listPlansQuerySchema>;

export const planResponseSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	description: z.string().nullable(),
	startDate: z.coerce.date(),
	endDate: z.coerce.date(),
	ativo: z.boolean(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export type PlanResponse = z.infer<typeof planResponseSchema>;

export const createCompanySchema = z.object({
	corporateName: z.string().min(1),
	tradeName: z.string().min(1),
	document: z.string().min(14).max(18),
	email: z.email(),
	phone: z.string().min(1),
	website: z.string().optional().nullable(),
	logo: z.string().optional().nullable(),
	zipCode: z.string().min(8).max(9),
	street: z.string().min(1),
	number: z.string().min(1),
	complement: z.string().optional().nullable(),
	district: z.string().min(1),
	city: z.string().min(1),
	state: z.string().min(2).max(2),
	latitude: z.number().optional().nullable(),
	longitude: z.number().optional().nullable(),
	planId: z.string().uuid(),
	planExpiresAt: z.coerce.date().optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;

export const updateCompanySchema = createCompanySchema.partial();

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

export const listCompaniesQuerySchema = z.object({
	q: z.string().optional(),
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export type ListCompaniesQuery = z.infer<typeof listCompaniesQuerySchema>;

export const companyResponseSchema = z.object({
	id: z.string().uuid(),
	corporateName: z.string(),
	tradeName: z.string(),
	document: z.string(),
	email: z.string(),
	phone: z.string(),
	website: z.string().nullable(),
	logo: z.string().nullable(),
	zipCode: z.string(),
	street: z.string(),
	number: z.string(),
	complement: z.string().nullable(),
	district: z.string(),
	city: z.string(),
	state: z.string(),
	latitude: z.number().nullable(),
	longitude: z.number().nullable(),
	planId: z.string().uuid(),
	planExpiresAt: z.coerce.date(),
	ativo: z.boolean(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	createdBy: z.string().uuid().nullable(),
	updatedBy: z.string().uuid().nullable(),
});

export type CompanyResponse = z.infer<typeof companyResponseSchema>;

export const companyDashboardKpiSchema = z.object({
	id: z.string(),
	label: z.string(),
	value: z.union([z.string(), z.number()]),
	description: z.string(),
	deltaPercent: z.number().nullable(),
	trend: z.enum(["up", "down", "neutral"]),
});

export const companyDashboardUsagePointSchema = z.object({
	date: z.string(),
	accesses: z.number().int().nonnegative(),
});

export const companyDashboardDepartmentSliceSchema = z.object({
	department: z.string(),
	count: z.number().int().nonnegative(),
	color: z.string(),
});

export const companyDashboardActivitySchema = z.object({
	id: z.string().uuid(),
	userName: z.string(),
	action: z.string(),
	occurredAt: z.coerce.date(),
});

export const companyDashboardPendencySchema = z.object({
	id: z.string(),
	kind: z.enum([
		"pending_request",
		"expiring_contract",
		"pending_payment",
		"blocked_user",
		"inactive_user",
	]),
	title: z.string(),
	description: z.string(),
	priority: z.enum(["high", "medium", "low"]),
});

export const companyDashboardInsightSchema = z.object({
	id: z.string(),
	message: z.string(),
	tone: z.enum(["positive", "warning", "neutral", "info"]),
});

export const companyDashboardResponseSchema = z.object({
	kpis: z.array(companyDashboardKpiSchema),
	usageTrend: z.array(companyDashboardUsagePointSchema),
	departmentDistribution: z.array(companyDashboardDepartmentSliceSchema),
	recentActivities: z.array(companyDashboardActivitySchema),
	pendencies: z.array(companyDashboardPendencySchema),
	insights: z.array(companyDashboardInsightSchema),
	planName: z.string(),
	planExpiresAt: z.coerce.date(),
});

export type CompanyDashboardResponse = z.infer<
	typeof companyDashboardResponseSchema
>;

export const cepResponseSchema = z.object({
	zipCode: z.string(),
	street: z.string(),
	district: z.string(),
	city: z.string(),
	state: z.string(),
});

export type CepResponse = z.infer<typeof cepResponseSchema>;

export const geocodeRequestSchema = z.object({
	zipCode: z.string().min(1),
	street: z.string().min(1),
	number: z.string().min(1),
	district: z.string().min(1),
	city: z.string().min(1),
	state: z.string().min(2).max(2),
});

export type GeocodeRequest = z.infer<typeof geocodeRequestSchema>;

export const geocodeResponseSchema = z.object({
	latitude: z.number(),
	longitude: z.number(),
});

export type GeocodeResponse = z.infer<typeof geocodeResponseSchema>;

export const APP_MODULE_KEYS = [
	"clientes",
	"financeiro",
	"kanban",
	"usuarios",
] as const;

export const userPerfilSchema = z.enum(["super", "admin_empresa", "cliente"]);

export type UserPerfilDto = z.infer<typeof userPerfilSchema>;

export const createUserSchema = z
	.object({
		name: z.string().min(1),
		email: z.email(),
		password: z.string().min(6),
		perfil: userPerfilSchema,
		companyId: z.string().uuid().optional().nullable(),
		department: z.string().optional().nullable(),
		ativo: z.boolean().optional(),
	})
	.superRefine((data, ctx) => {
		if (data.perfil === "super") {
			if (data.companyId) {
				ctx.addIssue({
					code: "custom",
					message: "Usuário super não deve ter empresa.",
					path: ["companyId"],
				});
			}
			return;
		}
		if (!data.companyId) {
			ctx.addIssue({
				code: "custom",
				message: "Empresa obrigatória para este perfil.",
				path: ["companyId"],
			});
		}
	});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z
	.object({
		name: z.string().min(1).optional(),
		email: z.email().optional(),
		password: z.string().min(6).optional(),
		perfil: userPerfilSchema.optional(),
		companyId: z.string().uuid().optional().nullable(),
		department: z.string().optional().nullable(),
		ativo: z.boolean().optional(),
	})
	.superRefine((data, ctx) => {
		if (data.perfil === "super" && data.companyId) {
			ctx.addIssue({
				code: "custom",
				message: "Usuário super não deve ter empresa.",
				path: ["companyId"],
			});
		}
		if (data.perfil && data.perfil !== "super" && data.companyId === null) {
			ctx.addIssue({
				code: "custom",
				message: "Empresa obrigatória para este perfil.",
				path: ["companyId"],
			});
		}
	});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const listUsersQuerySchema = z.object({
	q: z.string().optional(),
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(10),
	companyId: z.string().uuid().optional(),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export const userResponseSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	email: z.string(),
	perfil: userPerfilSchema,
	companyId: z.string().uuid().nullable(),
	companyName: z.string().nullable().optional(),
	department: z.string().nullable(),
	ativo: z.boolean(),
	blocked: z.boolean(),
	lastAccessAt: z.coerce.date().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	createdBy: z.string().uuid().nullable(),
	updatedBy: z.string().uuid().nullable(),
});

export type UserResponse = z.infer<typeof userResponseSchema>;

export const adminSetPasswordSchema = z.object({
	password: z.string().min(6),
});

export type AdminSetPasswordInput = z.infer<typeof adminSetPasswordSchema>;

export const changeOwnPasswordSchema = z.object({
	currentPassword: z.string().min(1),
	newPassword: z.string().min(6),
});

export type ChangeOwnPasswordInput = z.infer<typeof changeOwnPasswordSchema>;

export const personTypeSchema = z.enum(["PF", "PJ"]);

export const alphanumericDocumentSchema = z
	.string()
	.min(1)
	.regex(/^[A-Za-z0-9]+$/, "Documento deve conter apenas letras e números.");

const clientAddressSchema = {
	zipCode: z.string().min(8).max(9),
	street: z.string().min(1),
	number: z.string().min(1),
	complement: z.string().optional().nullable(),
	district: z.string().min(1),
	city: z.string().min(1),
	state: z.string().min(2).max(2),
	latitude: z.number().optional().nullable(),
	longitude: z.number().optional().nullable(),
};

export const createClientSchema = z
	.object({
		personType: personTypeSchema,
		document: alphanumericDocumentSchema,
		name: z.string().min(1),
		tradeName: z.string().optional().nullable(),
		email: z.email(),
		phone: z.string().min(1),
		...clientAddressSchema,
	})
	.superRefine((data, ctx) => {
		if (data.personType === "PJ" && !data.tradeName?.trim()) {
			ctx.addIssue({
				code: "custom",
				message: "Nome fantasia obrigatório para PJ.",
				path: ["tradeName"],
			});
		}
	});

export type CreateClientInput = z.infer<typeof createClientSchema>;

export const updateClientSchema = z
	.object({
		personType: personTypeSchema.optional(),
		document: alphanumericDocumentSchema.optional(),
		name: z.string().min(1).optional(),
		tradeName: z.string().optional().nullable(),
		email: z.email().optional(),
		phone: z.string().min(1).optional(),
		zipCode: z.string().min(8).max(9).optional(),
		street: z.string().min(1).optional(),
		number: z.string().min(1).optional(),
		complement: z.string().optional().nullable(),
		district: z.string().min(1).optional(),
		city: z.string().min(1).optional(),
		state: z.string().min(2).max(2).optional(),
		latitude: z.number().optional().nullable(),
		longitude: z.number().optional().nullable(),
	})
	.superRefine((data, ctx) => {
		if (data.personType === "PJ" && data.tradeName !== undefined) {
			if (!data.tradeName?.trim()) {
				ctx.addIssue({
					code: "custom",
					message: "Nome fantasia obrigatório para PJ.",
					path: ["tradeName"],
				});
			}
		}
	});

export type UpdateClientInput = z.infer<typeof updateClientSchema>;

export const listClientsQuerySchema = z.object({
	q: z.string().optional(),
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export type ListClientsQuery = z.infer<typeof listClientsQuerySchema>;

export const clientResponseSchema = z.object({
	id: z.string().uuid(),
	companyId: z.string().uuid(),
	personType: personTypeSchema,
	document: z.string(),
	name: z.string(),
	tradeName: z.string().nullable(),
	email: z.string(),
	phone: z.string(),
	zipCode: z.string(),
	street: z.string(),
	number: z.string(),
	complement: z.string().nullable(),
	district: z.string(),
	city: z.string(),
	state: z.string(),
	latitude: z.number().nullable(),
	longitude: z.number().nullable(),
	ativo: z.boolean(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	createdBy: z.string().uuid().nullable(),
	updatedBy: z.string().uuid().nullable(),
});

export type ClientResponse = z.infer<typeof clientResponseSchema>;

export const moduleKeySchema = z.enum(APP_MODULE_KEYS);

export type ModuleKeyDto = z.infer<typeof moduleKeySchema>;

export const modulePermissionItemSchema = z.object({
	moduleKey: moduleKeySchema,
	canRead: z.boolean(),
	canEdit: z.boolean(),
});

export type ModulePermissionItem = z.infer<typeof modulePermissionItemSchema>;

export const myModulesResponseSchema = z.object({
	modules: z.array(modulePermissionItemSchema),
});

export type MyModulesResponse = z.infer<typeof myModulesResponseSchema>;

export const upsertUserModulePermissionsSchema = z.object({
	modules: z.array(modulePermissionItemSchema),
});

export type UpsertUserModulePermissionsInput = z.infer<
	typeof upsertUserModulePermissionsSchema
>;

export const companyUserPermissionsSchema = z.object({
	userId: z.string().uuid(),
	name: z.string(),
	email: z.string(),
	modules: z.array(modulePermissionItemSchema),
});

export type CompanyUserPermissions = z.infer<
	typeof companyUserPermissionsSchema
>;

export const kanbanHistoryEventTypeSchema = z.enum([
	"created",
	"updated",
	"moved",
	"observation",
	"checklist",
	"assignees",
	"tags",
]);

export type KanbanHistoryEventTypeDto = z.infer<
	typeof kanbanHistoryEventTypeSchema
>;

export const kanbanTagColorSchema = z.enum([
	"gray",
	"blue",
	"green",
	"orange",
	"purple",
]);

export const createKanbanColumnSchema = z.object({
	name: z.string().min(1).max(80),
});

export type CreateKanbanColumnInput = z.infer<typeof createKanbanColumnSchema>;

export const createKanbanCardSchema = z.object({
	columnId: z.string().uuid(),
	title: z.string().min(1).max(200),
	description: z.string().max(5000).optional().nullable(),
	clientId: z.string().uuid().optional().nullable(),
	dueAt: z.coerce.date().optional().nullable(),
	tagNames: z.array(z.string().min(1).max(40)).max(20).optional(),
	assigneeUserIds: z.array(z.string().uuid()).min(1),
});

export type CreateKanbanCardInput = z.infer<typeof createKanbanCardSchema>;

export const updateKanbanCardSchema = z.object({
	title: z.string().min(1).max(200).optional(),
	description: z.string().max(5000).optional().nullable(),
	clientId: z.string().uuid().optional().nullable(),
	dueAt: z.coerce.date().optional().nullable(),
	tagNames: z.array(z.string().min(1).max(40)).max(20).optional(),
	assigneeUserIds: z.array(z.string().uuid()).min(1).optional(),
});

export type UpdateKanbanCardInput = z.infer<typeof updateKanbanCardSchema>;

export const moveKanbanCardSchema = z.object({
	columnId: z.string().uuid(),
	position: z.number().int().min(0),
});

export type MoveKanbanCardInput = z.infer<typeof moveKanbanCardSchema>;

export const createKanbanChecklistItemSchema = z.object({
	title: z.string().min(1).max(300),
});

export type CreateKanbanChecklistItemInput = z.infer<
	typeof createKanbanChecklistItemSchema
>;

export const updateKanbanChecklistItemSchema = z.object({
	title: z.string().min(1).max(300).optional(),
	done: z.boolean().optional(),
});

export type UpdateKanbanChecklistItemInput = z.infer<
	typeof updateKanbanChecklistItemSchema
>;

export const addKanbanObservationSchema = z.object({
	message: z.string().min(1).max(5000),
});

export type AddKanbanObservationInput = z.infer<
	typeof addKanbanObservationSchema
>;

export const listKanbanBoardQuerySchema = z.object({
	q: z.string().optional(),
	assigneeUserId: z.string().uuid().optional(),
	clientId: z.string().uuid().optional(),
	tagId: z.string().uuid().optional(),
	sort: z.enum(["createdAt", "dueAt", "title", "position"]).optional(),
});

export type ListKanbanBoardQuery = z.infer<typeof listKanbanBoardQuerySchema>;

export const kanbanAssigneeSchema = z.object({
	userId: z.string().uuid(),
	name: z.string(),
	email: z.string(),
});

export const kanbanTagSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	slug: z.string(),
	color: kanbanTagColorSchema,
});

export const kanbanChecklistItemSchema = z.object({
	id: z.string().uuid(),
	title: z.string(),
	done: z.boolean(),
	position: z.number().int(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export const kanbanHistoryItemSchema = z.object({
	id: z.string().uuid(),
	eventType: kanbanHistoryEventTypeSchema,
	message: z.string(),
	userId: z.string().uuid().nullable(),
	userName: z.string().nullable(),
	createdAt: z.coerce.date(),
});

export const kanbanCardSchema = z.object({
	id: z.string().uuid(),
	companyId: z.string().uuid(),
	columnId: z.string().uuid(),
	title: z.string(),
	description: z.string().nullable(),
	clientId: z.string().uuid().nullable(),
	clientName: z.string().nullable(),
	dueAt: z.coerce.date().nullable(),
	position: z.number().int(),
	assignees: z.array(kanbanAssigneeSchema),
	tags: z.array(kanbanTagSchema),
	checklistItems: z.array(kanbanChecklistItemSchema),
	checklistDoneCount: z.number().int(),
	checklistTotalCount: z.number().int(),
	observationCount: z.number().int(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	createdBy: z.string().uuid().nullable(),
});

export const kanbanColumnSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	slug: z.string(),
	isBase: z.boolean(),
	position: z.number().int(),
	cards: z.array(kanbanCardSchema),
});

export const kanbanBoardResponseSchema = z.object({
	columns: z.array(kanbanColumnSchema),
});

export type KanbanBoardResponse = z.infer<typeof kanbanBoardResponseSchema>;

export const kanbanCardDetailSchema = kanbanCardSchema.extend({
	history: z.array(kanbanHistoryItemSchema),
});

export type KanbanCardDetail = z.infer<typeof kanbanCardDetailSchema>;
