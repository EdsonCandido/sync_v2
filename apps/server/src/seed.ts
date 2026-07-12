import { auth } from "./auth";
import { db } from "@sync_v2/db";
import { user } from "@sync_v2/db/schema/auth";
import { clients } from "@sync_v2/db/schema/clients";
import { companies } from "@sync_v2/db/schema/companies";
import {
	accessEvents,
	companyActivities,
	companyContracts,
	companyPayments,
	companyRequests,
} from "@sync_v2/db/schema/company-dashboard";
import { userModulePermissions } from "@sync_v2/db/schema/module-permissions";
import { plans } from "@sync_v2/db/schema/plans";
import { env } from "@sync_v2/env/server";
import { USER_DEPARTMENTS } from "@sync_v2/types";
import { and, eq } from "drizzle-orm";

async function ensureUser(params: {
	name: string;
	email: string;
	password: string;
	perfil: string;
	companyId?: string | null;
	department?: string | null;
	blocked?: boolean;
	lastAccessAt?: Date | null;
}) {
	const [existing] = await db
		.select()
		.from(user)
		.where(eq(user.email, params.email))
		.limit(1);

	const extra = {
		perfil: params.perfil,
		ativo: true,
		name: params.name,
		companyId: params.companyId ?? null,
		department: params.department ?? null,
		blocked: params.blocked ?? false,
		lastAccessAt: params.lastAccessAt ?? null,
		emailVerified: true,
		updatedAt: new Date(),
	};

	if (existing) {
		await db.update(user).set(extra).where(eq(user.id, existing.id));
		console.log(`Seed: usuário atualizado (${params.email}).`);
		return existing.id;
	}

	await auth.api.signUpEmail({
		body: {
			name: params.name,
			email: params.email,
			password: params.password,
		},
	});

	await db.update(user).set(extra).where(eq(user.email, params.email));
	console.log(`Seed: usuário criado (${params.email}).`);

	const [created] = await db
		.select({ id: user.id })
		.from(user)
		.where(eq(user.email, params.email))
		.limit(1);

	return created?.id;
}

async function ensurePlanBasico() {
	const name = "Plano Básico";
	const [existing] = await db
		.select()
		.from(plans)
		.where(eq(plans.name, name))
		.limit(1);

	if (existing) {
		const endDate = new Date(existing.startDate);
		endDate.setDate(endDate.getDate() + 365);
		await db
			.update(plans)
			.set({
				ativo: true,
				description: "Plano básico com validade de 365 dias",
				endDate: existing.endDate < new Date() ? endDate : existing.endDate,
				updatedAt: new Date(),
			})
			.where(eq(plans.id, existing.id));
		console.log("Seed: Plano Básico já existia.");
		return existing.id;
	}

	const startDate = new Date();
	const endDate = new Date(startDate);
	endDate.setDate(endDate.getDate() + 365);

	const [created] = await db
		.insert(plans)
		.values({
			name,
			description: "Plano básico com validade de 365 dias",
			startDate,
			endDate,
			ativo: true,
		})
		.returning();

	if (!created) {
		throw new Error("Falha ao criar Plano Básico.");
	}

	console.log("Seed: Plano Básico criado.");
	return created.id;
}

async function ensureEmpresaDemo(planId: string) {
	const document = "11222333000181";
	const [existing] = await db
		.select()
		.from(companies)
		.where(eq(companies.document, document))
		.limit(1);

	const planExpiresAt = new Date();
	planExpiresAt.setDate(planExpiresAt.getDate() + 8);

	const payload = {
		corporateName: "Empresa Demo LTDA",
		tradeName: "Empresa Demo",
		document,
		email: "contato@empresademo.com",
		phone: "11999990000",
		website: "https://empresademo.com",
		logo: null as string | null,
		zipCode: "01310100",
		street: "Avenida Paulista",
		number: "1000",
		complement: "Sala 101",
		district: "Bela Vista",
		city: "São Paulo",
		state: "SP",
		latitude: -23.561414,
		longitude: -46.655881,
		planId,
		planExpiresAt,
		ativo: true,
		updatedAt: new Date(),
	};

	if (existing) {
		await db
			.update(companies)
			.set(payload)
			.where(eq(companies.id, existing.id));
		console.log("Seed: Empresa Demo já existia.");
		return existing.id;
	}

	const [created] = await db.insert(companies).values(payload).returning();
	if (!created) {
		throw new Error("Falha ao criar Empresa Demo.");
	}
	console.log("Seed: Empresa Demo criada.");
	return created.id;
}

async function ensureEnvSuperUser() {
	const name = env.SEED_SUPER_NAME;
	const email = env.SEED_SUPER_EMAIL;
	const password = env.SEED_SUPER_PASSWORD;

	if (!name || !email || !password) {
		console.log(
			"Seed: SEED_SUPER_* não definido — pulando super do .env.",
		);
		return;
	}

	await ensureUser({
		name,
		email,
		password,
		perfil: "super",
		companyId: null,
	});
}

async function daysAgo(days: number) {
	const d = new Date();
	d.setDate(d.getDate() - days);
	return d;
}

async function seedCompanyDashboardData(
	companyId: string,
	adminUserId: string,
	memberIds: string[],
) {
	await db
		.update(accessEvents)
		.set({ ativo: false, updatedAt: new Date() })
		.where(
			and(eq(accessEvents.companyId, companyId), eq(accessEvents.ativo, true)),
		);
	await db
		.update(companyActivities)
		.set({ ativo: false, updatedAt: new Date() })
		.where(
			and(
				eq(companyActivities.companyId, companyId),
				eq(companyActivities.ativo, true),
			),
		);
	await db
		.update(companyRequests)
		.set({ ativo: false, updatedAt: new Date() })
		.where(
			and(
				eq(companyRequests.companyId, companyId),
				eq(companyRequests.ativo, true),
			),
		);
	await db
		.update(companyContracts)
		.set({ ativo: false, updatedAt: new Date() })
		.where(
			and(
				eq(companyContracts.companyId, companyId),
				eq(companyContracts.ativo, true),
			),
		);
	await db
		.update(companyPayments)
		.set({ ativo: false, updatedAt: new Date() })
		.where(
			and(
				eq(companyPayments.companyId, companyId),
				eq(companyPayments.ativo, true),
			),
		);

	await db.insert(companyRequests).values([
		{
			companyId,
			title: "Acesso ao módulo Financeiro",
			status: "pending",
			requestedByUserId: memberIds[0] ?? adminUserId,
		},
		{
			companyId,
			title: "Reset de senha — Ana Costa",
			status: "pending",
			requestedByUserId: memberIds[1] ?? adminUserId,
		},
		{
			companyId,
			title: "Novo usuário Comercial",
			status: "pending",
			requestedByUserId: adminUserId,
		},
		{
			companyId,
			title: "Upgrade de permissões RH",
			status: "approved",
			requestedByUserId: memberIds[2] ?? adminUserId,
		},
	]);

	await db.insert(companyContracts).values([
		{
			companyId,
			title: "Contrato de suporte premium",
			expiresAt: await daysAgo(-12),
		},
		{
			companyId,
			title: "Licença integração ERP",
			expiresAt: await daysAgo(-5),
		},
		{
			companyId,
			title: "Contrato anual SaaS",
			expiresAt: await daysAgo(-90),
		},
	]);

	await db.insert(companyPayments).values([
		{
			companyId,
			description: "Mensalidade Julho",
			amount: 899.9,
			status: "pending",
			dueDate: await daysAgo(-3),
		},
		{
			companyId,
			description: "Taxa de onboarding",
			amount: 250,
			status: "pending",
			dueDate: await daysAgo(-10),
		},
		{
			companyId,
			description: "Mensalidade Junho",
			amount: 899.9,
			status: "paid",
			dueDate: await daysAgo(20),
		},
	]);

	const activityUsers = [adminUserId, ...memberIds];
	const actions = [
		"Entrou no sistema",
		"Atualizou perfil",
		"Criou solicitação",
		"Visualizou relatório",
		"Editou cliente",
		"Aprovou acesso",
		"Exportou dados",
	];

	await db.insert(companyActivities).values(
		Array.from({ length: 12 }, (_, i) => ({
			companyId,
			userId: activityUsers[i % activityUsers.length]!,
			action: actions[i % actions.length]!,
			createdAt: new Date(Date.now() - i * 3_600_000 * 5),
			updatedAt: new Date(Date.now() - i * 3_600_000 * 5),
		})),
	);

	const accessRows: {
		companyId: string;
		userId: string;
		accessedAt: Date;
	}[] = [];

	for (let day = 0; day < 30; day++) {
		const base = await daysAgo(29 - day);
		const count = 4 + ((day * 3) % 9) + (day > 20 ? 6 : 0);
		for (let i = 0; i < count; i++) {
			const accessedAt = new Date(base);
			accessedAt.setHours(8 + (i % 10), (i * 7) % 60, 0, 0);
			accessRows.push({
				companyId,
				userId: activityUsers[i % activityUsers.length]!,
				accessedAt,
			});
		}
	}

	await db.insert(accessEvents).values(accessRows);
	console.log("Seed: dados do dashboard da empresa demo.");
}

async function ensureModulePermission(params: {
	userId: string;
	moduleKey: string;
	canRead: boolean;
	canEdit: boolean;
}) {
	const [existing] = await db
		.select()
		.from(userModulePermissions)
		.where(
			and(
				eq(userModulePermissions.userId, params.userId),
				eq(userModulePermissions.moduleKey, params.moduleKey),
			),
		)
		.limit(1);

	if (existing) {
		await db
			.update(userModulePermissions)
			.set({
				canRead: params.canRead,
				canEdit: params.canEdit,
				ativo: true,
				updatedAt: new Date(),
			})
			.where(eq(userModulePermissions.id, existing.id));
		return;
	}

	await db.insert(userModulePermissions).values({
		userId: params.userId,
		moduleKey: params.moduleKey,
		canRead: params.canRead,
		canEdit: params.canEdit,
	});
}

async function seedModulePermissions(memberIds: string[]) {
	const anaId = memberIds[0];
	const brunoId = memberIds[1];
	const carlaId = memberIds[2];

	if (anaId) {
		await ensureModulePermission({
			userId: anaId,
			moduleKey: "clientes",
			canRead: true,
			canEdit: false,
		});
		await ensureModulePermission({
			userId: anaId,
			moduleKey: "financeiro",
			canRead: true,
			canEdit: true,
		});
		await ensureModulePermission({
			userId: anaId,
			moduleKey: "usuarios",
			canRead: true,
			canEdit: false,
		});
	}

	if (brunoId) {
		await ensureModulePermission({
			userId: brunoId,
			moduleKey: "clientes",
			canRead: true,
			canEdit: true,
		});
		await ensureModulePermission({
			userId: brunoId,
			moduleKey: "kanban",
			canRead: true,
			canEdit: true,
		});
		await ensureModulePermission({
			userId: brunoId,
			moduleKey: "usuarios",
			canRead: true,
			canEdit: true,
		});
	}

	if (carlaId) {
		await ensureModulePermission({
			userId: carlaId,
			moduleKey: "kanban",
			canRead: true,
			canEdit: false,
		});
	}

	console.log("Seed: permissões de módulo demo.");
}

async function seedDemoClients(companyId: string, userId: string) {
	const demos = [
		{
			personType: "PF",
			document: "12345678901",
			name: "João da Silva",
			tradeName: null as string | null,
			email: "joao.silva@email.com",
			phone: "11988887777",
			zipCode: "01310100",
			street: "Avenida Paulista",
			number: "500",
			complement: "Apto 12",
			district: "Bela Vista",
			city: "São Paulo",
			state: "SP",
			latitude: -23.561414,
			longitude: -46.655881,
		},
		{
			personType: "PJ",
			document: "AB12CD345678901",
			name: "Comércio Beta LTDA",
			tradeName: "Beta Store",
			email: "contato@betastore.com",
			phone: "1133334444",
			zipCode: "22041080",
			street: "Avenida Atlântica",
			number: "1702",
			complement: null as string | null,
			district: "Copacabana",
			city: "Rio de Janeiro",
			state: "RJ",
			latitude: -22.971964,
			longitude: -43.182543,
		},
		{
			personType: "PF",
			document: "98765432100",
			name: "Maria Oliveira",
			tradeName: null as string | null,
			email: "maria.oliveira@email.com",
			phone: "21977776666",
			zipCode: "30130100",
			street: "Avenida Afonso Pena",
			number: "1500",
			complement: null as string | null,
			district: "Centro",
			city: "Belo Horizonte",
			state: "MG",
			latitude: -19.924501,
			longitude: -43.935238,
		},
	];

	for (const demo of demos) {
		const [existing] = await db
			.select()
			.from(clients)
			.where(
				and(
					eq(clients.companyId, companyId),
					eq(clients.document, demo.document),
				),
			)
			.limit(1);

		if (existing) {
			await db
				.update(clients)
				.set({
					...demo,
					ativo: true,
					updatedAt: new Date(),
					updatedBy: userId,
				})
				.where(eq(clients.id, existing.id));
			continue;
		}

		await db.insert(clients).values({
			companyId,
			...demo,
			createdBy: userId,
			updatedBy: userId,
		});
	}

	console.log("Seed: clientes demo (PF/PJ).");
}

async function main() {
	console.log("Seed: configurações iniciais…");

	await ensureEnvSuperUser();

	await ensureUser({
		name: "Super",
		email: "super@admin.com",
		password: "123456",
		perfil: "super",
		companyId: null,
	});

	const planId = await ensurePlanBasico();
	const companyId = await ensureEmpresaDemo(planId);

	const adminUserId = await ensureUser({
		name: "Administrador",
		email: "admin@empresa.com",
		password: "123456",
		perfil: "admin_empresa",
		companyId,
		department: "Administração",
		lastAccessAt: new Date(),
	});

	if (!adminUserId) {
		throw new Error("Falha ao criar admin da empresa.");
	}

	await ensureUser({
		name: "Administrador 2",
		email: "admin2@empresa.com",
		password: "123456",
		perfil: "admin_empresa",
		companyId,
		department: "Administração",
		lastAccessAt: new Date(),
	});

	const demoMembers = [
		{
			name: "Ana Costa",
			email: "ana.costa@empresademo.com",
			department: USER_DEPARTMENTS[0],
			lastAccessAt: await daysAgo(2),
		},
		{
			name: "Bruno Lima",
			email: "bruno.lima@empresademo.com",
			department: USER_DEPARTMENTS[1],
			lastAccessAt: await daysAgo(1),
		},
		{
			name: "Carla Souza",
			email: "carla.souza@empresademo.com",
			department: USER_DEPARTMENTS[2],
			lastAccessAt: await daysAgo(5),
		},
		{
			name: "Diego Alves",
			email: "diego.alves@empresademo.com",
			department: USER_DEPARTMENTS[3],
			lastAccessAt: await daysAgo(3),
		},
		{
			name: "Elena Martins",
			email: "elena.martins@empresademo.com",
			department: USER_DEPARTMENTS[4],
			lastAccessAt: await daysAgo(40),
		},
		{
			name: "Felipe Rocha",
			email: "felipe.rocha@empresademo.com",
			department: USER_DEPARTMENTS[0],
			lastAccessAt: await daysAgo(20),
			blocked: true,
		},
		{
			name: "Gina Pereira",
			email: "gina.pereira@empresademo.com",
			department: USER_DEPARTMENTS[5],
			lastAccessAt: await daysAgo(18),
		},
		{
			name: "Hugo Nunes",
			email: "hugo.nunes@empresademo.com",
			department: USER_DEPARTMENTS[3],
			lastAccessAt: await daysAgo(45),
		},
	];

	const memberIds: string[] = [];
	for (const member of demoMembers) {
		const id = await ensureUser({
			name: member.name,
			email: member.email,
			password: "123456",
			perfil: "cliente",
			companyId,
			department: member.department,
			blocked: member.blocked ?? false,
			lastAccessAt: member.lastAccessAt,
		});
		if (id) memberIds.push(id);
	}

	// crescimento: alguns usuários criados no mês passado
	const lastMonth = await daysAgo(35);
	await db
		.update(user)
		.set({ createdAt: lastMonth, updatedAt: lastMonth })
		.where(
			and(eq(user.companyId, companyId), eq(user.email, "hugo.nunes@empresademo.com")),
		);

	await seedCompanyDashboardData(companyId, adminUserId, memberIds);
	await seedModulePermissions(memberIds);
	await seedDemoClients(companyId, adminUserId);

	console.log("Seed: concluído.");
	process.exit(0);
}

main().catch((error) => {
	console.error("Seed falhou:", error);
	process.exit(1);
});
