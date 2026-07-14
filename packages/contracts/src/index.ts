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
	"attachment",
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
	boardId: z.string().uuid(),
	name: z.string().min(1).max(80),
});

export type CreateKanbanColumnInput = z.infer<typeof createKanbanColumnSchema>;

export const createKanbanBoardSchema = z.object({
	name: z.string().min(1).max(120),
	priority: z.number().int().min(0).default(0),
	memberUserIds: z.array(z.string().uuid()).default([]),
});

export type CreateKanbanBoardInput = z.infer<typeof createKanbanBoardSchema>;

export const updateKanbanBoardSchema = z.object({
	name: z.string().min(1).max(120).optional(),
	priority: z.number().int().min(0).optional(),
	memberUserIds: z.array(z.string().uuid()).optional(),
});

export type UpdateKanbanBoardInput = z.infer<typeof updateKanbanBoardSchema>;

export const kanbanBoardSummarySchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	isDefault: z.boolean(),
	priority: z.number().int(),
	createdBy: z.string().uuid().nullable(),
	canManage: z.boolean(),
	memberUserIds: z.array(z.string().uuid()),
});

export type KanbanBoardSummary = z.infer<typeof kanbanBoardSummarySchema>;

export const listKanbanBoardsResponseSchema = z.object({
	boards: z.array(kanbanBoardSummarySchema),
});

export type ListKanbanBoardsResponse = z.infer<
	typeof listKanbanBoardsResponseSchema
>;

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
	boardId: z.string().uuid(),
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

export const kanbanAttachmentSchema = z.object({
	id: z.string().uuid(),
	originalName: z.string(),
	mimeType: z.string(),
	sizeBytes: z.number().int(),
	uploadedBy: z.string().uuid().nullable(),
	createdAt: z.coerce.date(),
});

export type KanbanAttachment = z.infer<typeof kanbanAttachmentSchema>;

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
	boardId: z.string().uuid(),
	columns: z.array(kanbanColumnSchema),
});

export type KanbanBoardResponse = z.infer<typeof kanbanBoardResponseSchema>;

export const kanbanCardDetailSchema = kanbanCardSchema.extend({
	history: z.array(kanbanHistoryItemSchema),
	attachments: z.array(kanbanAttachmentSchema),
});

export type KanbanCardDetail = z.infer<typeof kanbanCardDetailSchema>;

const financialCategoryTipoSchema = z.enum(["receita", "despesa"]);
const bankAccountTipoSchema = z.enum([
	"corrente",
	"poupanca",
	"investimento",
	"outro",
]);
const financialEntryKindSchema = z.enum(["receber", "pagar"]);
const financialOriginTypeSchema = z.enum(["avulsa", "kanban", "manual"]);
const financialEntryStatusSchema = z.enum([
	"em_aberto",
	"parcial",
	"pago",
	"cancelado",
	"vencido",
]);

export const createFinancialCategorySchema = z.object({
	name: z.string().min(1),
	tipo: financialCategoryTipoSchema,
	cor: z.string().min(1).default("gray"),
	icone: z.string().min(1).default("tag"),
});

export type CreateFinancialCategoryInput = z.infer<
	typeof createFinancialCategorySchema
>;

export const updateFinancialCategorySchema = z.object({
	name: z.string().min(1).optional(),
	tipo: financialCategoryTipoSchema.optional(),
	cor: z.string().min(1).optional(),
	icone: z.string().min(1).optional(),
});

export type UpdateFinancialCategoryInput = z.infer<
	typeof updateFinancialCategorySchema
>;

export const listFinancialCategoriesQuerySchema = z.object({
	q: z.string().optional(),
	tipo: financialCategoryTipoSchema.optional(),
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

export type ListFinancialCategoriesQuery = z.infer<
	typeof listFinancialCategoriesQuerySchema
>;

export const financialCategoryResponseSchema = z.object({
	id: z.string().uuid(),
	companyId: z.string().uuid(),
	name: z.string(),
	tipo: financialCategoryTipoSchema,
	cor: z.string(),
	icone: z.string(),
	ativo: z.boolean(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export type FinancialCategoryResponse = z.infer<
	typeof financialCategoryResponseSchema
>;

export const createCostCenterSchema = z.object({
	name: z.string().min(1),
	codigo: z.string().min(1),
});

export type CreateCostCenterInput = z.infer<typeof createCostCenterSchema>;

export const updateCostCenterSchema = z.object({
	name: z.string().min(1).optional(),
	codigo: z.string().min(1).optional(),
});

export type UpdateCostCenterInput = z.infer<typeof updateCostCenterSchema>;

export const listCostCentersQuerySchema = z.object({
	q: z.string().optional(),
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

export type ListCostCentersQuery = z.infer<typeof listCostCentersQuerySchema>;

export const costCenterResponseSchema = z.object({
	id: z.string().uuid(),
	companyId: z.string().uuid(),
	name: z.string(),
	codigo: z.string(),
	ativo: z.boolean(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export type CostCenterResponse = z.infer<typeof costCenterResponseSchema>;

export const createBankAccountSchema = z.object({
	banco: z.string().min(1),
	agencia: z.string().min(1),
	conta: z.string().min(1),
	tipo: bankAccountTipoSchema,
	saldoInicial: z.number().default(0),
	dataSaldoInicial: z.coerce.date(),
	cor: z.string().min(1).default("blue"),
});

export type CreateBankAccountInput = z.infer<typeof createBankAccountSchema>;

export const updateBankAccountSchema = z.object({
	banco: z.string().min(1).optional(),
	agencia: z.string().min(1).optional(),
	conta: z.string().min(1).optional(),
	tipo: bankAccountTipoSchema.optional(),
	saldoInicial: z.number().optional(),
	dataSaldoInicial: z.coerce.date().optional(),
	cor: z.string().min(1).optional(),
});

export type UpdateBankAccountInput = z.infer<typeof updateBankAccountSchema>;

export const listBankAccountsQuerySchema = z.object({
	q: z.string().optional(),
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

export type ListBankAccountsQuery = z.infer<typeof listBankAccountsQuerySchema>;

export const bankAccountResponseSchema = z.object({
	id: z.string().uuid(),
	companyId: z.string().uuid(),
	banco: z.string(),
	agencia: z.string(),
	conta: z.string(),
	tipo: bankAccountTipoSchema,
	saldoInicial: z.number(),
	saldoAtual: z.number(),
	dataSaldoInicial: z.coerce.date(),
	cor: z.string(),
	ativo: z.boolean(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export type BankAccountResponse = z.infer<typeof bankAccountResponseSchema>;

export const createSupplierSchema = z.object({
	name: z.string().min(1),
	document: z.string().optional().nullable(),
	email: z.string().email().optional().nullable().or(z.literal("")),
	phone: z.string().optional().nullable(),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;

export const updateSupplierSchema = z.object({
	name: z.string().min(1).optional(),
	document: z.string().optional().nullable(),
	email: z.string().email().optional().nullable().or(z.literal("")),
	phone: z.string().optional().nullable(),
});

export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;

export const listSuppliersQuerySchema = z.object({
	q: z.string().optional(),
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

export type ListSuppliersQuery = z.infer<typeof listSuppliersQuerySchema>;

export const supplierResponseSchema = z.object({
	id: z.string().uuid(),
	companyId: z.string().uuid(),
	name: z.string(),
	document: z.string().nullable(),
	email: z.string().nullable(),
	phone: z.string().nullable(),
	ativo: z.boolean(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export type SupplierResponse = z.infer<typeof supplierResponseSchema>;

export const createFinancialEntrySchema = z.object({
	kind: financialEntryKindSchema,
	originType: financialOriginTypeSchema.default("avulsa"),
	originLabel: z.string().optional().nullable(),
	kanbanCardId: z.string().uuid().optional().nullable(),
	clientId: z.string().uuid().optional().nullable(),
	supplierId: z.string().uuid().optional().nullable(),
	categoryId: z.string().uuid().optional().nullable(),
	costCenterId: z.string().uuid().optional().nullable(),
	bankAccountId: z.string().uuid().optional().nullable(),
	documento: z.string().optional().nullable(),
	numero: z.string().optional().nullable(),
	valorOriginal: z.number().positive(),
	desconto: z.number().min(0).default(0),
	acrescimo: z.number().min(0).default(0),
	juros: z.number().min(0).default(0),
	multa: z.number().min(0).default(0),
	dataEmissao: z.coerce.date(),
	dataVencimento: z.coerce.date(),
	observacoes: z.string().optional().nullable(),
	parcelas: z.number().int().min(1).max(120).optional(),
});

export type CreateFinancialEntryInput = z.infer<
	typeof createFinancialEntrySchema
>;

export const updateFinancialEntrySchema = z.object({
	originLabel: z.string().optional().nullable(),
	clientId: z.string().uuid().optional().nullable(),
	supplierId: z.string().uuid().optional().nullable(),
	categoryId: z.string().uuid().optional().nullable(),
	costCenterId: z.string().uuid().optional().nullable(),
	bankAccountId: z.string().uuid().optional().nullable(),
	documento: z.string().optional().nullable(),
	numero: z.string().optional().nullable(),
	desconto: z.number().min(0).optional(),
	acrescimo: z.number().min(0).optional(),
	juros: z.number().min(0).optional(),
	multa: z.number().min(0).optional(),
	dataEmissao: z.coerce.date().optional(),
	dataVencimento: z.coerce.date().optional(),
	observacoes: z.string().optional().nullable(),
});

export type UpdateFinancialEntryInput = z.infer<
	typeof updateFinancialEntrySchema
>;

export const listFinancialEntriesQuerySchema = z.object({
	q: z.string().optional(),
	kind: financialEntryKindSchema.optional(),
	status: financialEntryStatusSchema.optional(),
	categoryId: z.string().uuid().optional(),
	costCenterId: z.string().uuid().optional(),
	bankAccountId: z.string().uuid().optional(),
	clientId: z.string().uuid().optional(),
	supplierId: z.string().uuid().optional(),
	from: z.coerce.date().optional(),
	to: z.coerce.date().optional(),
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListFinancialEntriesQuery = z.infer<
	typeof listFinancialEntriesQuerySchema
>;

export const settleFinancialEntrySchema = z.object({
	valor: z.number().positive(),
	bankAccountId: z.string().uuid(),
	dataPagamento: z.coerce.date(),
	juros: z.number().min(0).default(0),
	multa: z.number().min(0).default(0),
	desconto: z.number().min(0).default(0),
	observacoes: z.string().optional().nullable(),
});

export type SettleFinancialEntryInput = z.infer<
	typeof settleFinancialEntrySchema
>;

export const renegotiateFinancialEntrySchema = z.object({
	valorTotal: z.number().positive(),
	parcelas: z.number().int().min(1).max(120),
	primeiraDataVencimento: z.coerce.date(),
	categoryId: z.string().uuid().optional().nullable(),
	costCenterId: z.string().uuid().optional().nullable(),
	bankAccountId: z.string().uuid().optional().nullable(),
	observacoes: z.string().optional().nullable(),
});

export type RenegotiateFinancialEntryInput = z.infer<
	typeof renegotiateFinancialEntrySchema
>;

export const financialEntryPaymentSchema = z.object({
	id: z.string().uuid(),
	valor: z.number(),
	juros: z.number(),
	multa: z.number(),
	desconto: z.number(),
	dataPagamento: z.coerce.date(),
	bankAccountId: z.string().uuid().nullable(),
	observacoes: z.string().nullable(),
	estornado: z.boolean(),
	createdAt: z.coerce.date(),
});

export type FinancialEntryPayment = z.infer<typeof financialEntryPaymentSchema>;

export const financialEntryHistoryItemSchema = z.object({
	id: z.string().uuid(),
	action: z.string(),
	userId: z.string().uuid().nullable(),
	ip: z.string().nullable(),
	payload: z.unknown().nullable(),
	createdAt: z.coerce.date(),
});

export type FinancialEntryHistoryItem = z.infer<
	typeof financialEntryHistoryItemSchema
>;

export const financialEntryAttachmentSchema = z.object({
	id: z.string().uuid(),
	originalName: z.string(),
	mimeType: z.string(),
	sizeBytes: z.number().int(),
	uploadedBy: z.string().uuid().nullable(),
	createdAt: z.coerce.date(),
});

export type FinancialEntryAttachment = z.infer<
	typeof financialEntryAttachmentSchema
>;

export const financialEntryResponseSchema = z.object({
	id: z.string().uuid(),
	companyId: z.string().uuid(),
	kind: financialEntryKindSchema,
	originType: financialOriginTypeSchema,
	originLabel: z.string().nullable(),
	kanbanCardId: z.string().uuid().nullable(),
	clientId: z.string().uuid().nullable(),
	clientName: z.string().nullable().optional(),
	supplierId: z.string().uuid().nullable(),
	supplierName: z.string().nullable().optional(),
	categoryId: z.string().uuid().nullable(),
	categoryName: z.string().nullable().optional(),
	costCenterId: z.string().uuid().nullable(),
	costCenterName: z.string().nullable().optional(),
	bankAccountId: z.string().uuid().nullable(),
	documento: z.string().nullable(),
	numero: z.string().nullable(),
	valorOriginal: z.number(),
	desconto: z.number(),
	acrescimo: z.number(),
	juros: z.number(),
	multa: z.number(),
	valorPago: z.number(),
	valorAberto: z.number(),
	dataEmissao: z.coerce.date(),
	dataVencimento: z.coerce.date(),
	dataLiquidacao: z.coerce.date().nullable(),
	status: financialEntryStatusSchema,
	observacoes: z.string().nullable(),
	installmentGroupId: z.string().uuid().nullable(),
	installmentNumber: z.number().int().nullable(),
	installmentTotal: z.number().int().nullable(),
	ativo: z.boolean(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	payments: z.array(financialEntryPaymentSchema).optional(),
	history: z.array(financialEntryHistoryItemSchema).optional(),
	attachments: z.array(financialEntryAttachmentSchema).optional(),
});

export type FinancialEntryResponse = z.infer<
	typeof financialEntryResponseSchema
>;

export const financeiroDashboardResponseSchema = z.object({
	kpis: z.object({
		saldoAtual: z.number(),
		saldoEmBancos: z.number(),
		contasReceberHoje: z.number(),
		contasPagarHoje: z.number(),
		recebimentosMes: z.number(),
		pagamentosMes: z.number(),
		lucroMes: z.number(),
		receitaBrutaMes: z.number(),
		receitaLiquidaMes: z.number(),
		despesasMes: z.number(),
		margemPercent: z.number(),
		ticketMedio: z.number(),
		inadimplencia: z.number(),
		clientesInadimplentes: z.number(),
		valorEmAberto: z.number(),
		recebimentosHoje: z.number(),
		pagamentosHoje: z.number(),
	}),
	bancos: z.array(
		z.object({
			id: z.string().uuid(),
			banco: z.string(),
			saldoAtual: z.number(),
			cor: z.string(),
		}),
	),
	receitasDespesas: z.array(
		z.object({
			month: z.string(),
			receitas: z.number(),
			despesas: z.number(),
		}),
	),
	evolucaoMensal: z.array(
		z.object({
			month: z.string(),
			receita: z.number(),
			despesa: z.number(),
			lucro: z.number(),
		}),
	),
	projecaoAnual: z.array(
		z.object({
			month: z.string(),
			receitas: z.number(),
			despesas: z.number(),
		}),
	),
	porCategoria: z.array(
		z.object({
			name: z.string(),
			cor: z.string(),
			valor: z.number(),
		}),
	),
	porCentroCusto: z.array(
		z.object({
			name: z.string(),
			valor: z.number(),
		}),
	),
	planoContas: z.array(
		z.object({
			name: z.string(),
			tipo: financialCategoryTipoSchema,
			valor: z.number(),
		}),
	),
	inadimplenciaSplit: z.object({
		emDia: z.number(),
		vencido: z.number(),
	}),
});

export type FinanceiroDashboardResponse = z.infer<
	typeof financeiroDashboardResponseSchema
>;

export const financeiroReportSlugSchema = z.enum([
	"geral",
	"fluxo-caixa",
	"receitas-periodo",
	"despesas-periodo",
	"receitas-cliente",
	"despesas-categoria",
	"centro-custo",
	"inadimplencia",
	"clientes-devedores",
	"pagamentos-banco",
	"recebimentos-banco",
	"extrato",
]);

export type FinanceiroReportSlug = z.infer<typeof financeiroReportSlugSchema>;

export const financeiroReportQuerySchema = z.object({
	from: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/)
		.optional(),
	to: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/)
		.optional(),
	bankAccountId: z.string().uuid().optional(),
});

export type FinanceiroReportQuery = z.infer<typeof financeiroReportQuerySchema>;

const reportMetaSchema = z.object({
	slug: financeiroReportSlugSchema,
	title: z.string(),
	from: z.string(),
	to: z.string(),
});

const reportKpiSchema = z.object({
	label: z.string(),
	value: z.number(),
	format: z.enum(["money", "number", "percent"]).default("money"),
});

const reportColumnSchema = z.object({
	key: z.string(),
	label: z.string(),
	align: z.enum(["left", "right"]).default("left"),
	format: z.enum(["text", "money", "date", "number"]).default("text"),
});

export const financeiroReportResponseSchema = z.object({
	meta: reportMetaSchema,
	kpis: z.array(reportKpiSchema),
	columns: z.array(reportColumnSchema),
	rows: z.array(
		z.record(z.string(), z.union([z.string(), z.number(), z.null()])),
	),
	series: z
		.array(
			z.object({
				date: z.string(),
				entradasRealizadas: z.number().optional(),
				saidasRealizadas: z.number().optional(),
				entradasPrevistas: z.number().optional(),
				saidasPrevistas: z.number().optional(),
				saldoAcumulado: z.number().optional(),
				receitas: z.number().optional(),
				despesas: z.number().optional(),
			}),
		)
		.optional(),
	aging: z
		.array(
			z.object({
				bucket: z.string(),
				quantidade: z.number(),
				valor: z.number(),
			}),
		)
		.optional(),
	bankAccountId: z.string().uuid().optional(),
	bankAccountLabel: z.string().optional(),
	saldoInicial: z.number().optional(),
	saldoFinal: z.number().optional(),
});

export type FinanceiroReportResponse = z.infer<
	typeof financeiroReportResponseSchema
>;

export const financeiroSaudeScoreLabelSchema = z.enum([
	"Excelente",
	"Bom",
	"Atenção",
	"Crítico",
]);

export const financeiroSaudeScoreDimensionSchema = z.object({
	key: z.enum([
		"liquidez",
		"rentabilidade",
		"fluxo",
		"inadimplencia",
		"cobertura",
	]),
	label: z.string(),
	score: z.number(),
	weight: z.number(),
});

export const financeiroSaudeScoreSchema = z.object({
	score: z.number(),
	label: financeiroSaudeScoreLabelSchema,
	dimensions: z.array(financeiroSaudeScoreDimensionSchema),
});

export type FinanceiroSaudeScore = z.infer<typeof financeiroSaudeScoreSchema>;

export const financeiroSaudeInsightToneSchema = z.enum([
	"positive",
	"warning",
	"critical",
	"neutral",
	"info",
]);

export const financeiroSaudeInsightSchema = z.object({
	id: z.string(),
	title: z.string(),
	message: z.string(),
	tone: financeiroSaudeInsightToneSchema,
});

export type FinanceiroSaudeInsight = z.infer<
	typeof financeiroSaudeInsightSchema
>;

export const financeiroSaudeAnalysisSchema = z.object({
	pontosFortes: z.array(financeiroSaudeInsightSchema),
	oportunidades: z.array(financeiroSaudeInsightSchema),
	riscos: z.array(financeiroSaudeInsightSchema),
	sugestoes: z.array(financeiroSaudeInsightSchema),
	checklist: z.array(z.string()),
	proximasAcoes: z.array(z.string()),
});

export type FinanceiroSaudeAnalysis = z.infer<
	typeof financeiroSaudeAnalysisSchema
>;
