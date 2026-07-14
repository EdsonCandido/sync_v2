import { db } from "@sync_v2/db";
import { user } from "@sync_v2/db/schema/auth";
import { clients } from "@sync_v2/db/schema/clients";
import { companies } from "@sync_v2/db/schema/companies";
import {
	bankAccounts,
	costCenters,
	financialCategories,
	financialEntries,
	financialEntryAttachments,
	financialEntryHistory,
	financialEntryPayments,
	suppliers,
} from "@sync_v2/db/schema/financeiro";
import { plans } from "@sync_v2/db/schema/plans";
import { env } from "@sync_v2/env/server";
import { and, eq, inArray, ne, notInArray } from "drizzle-orm";
import { auth } from "./auth";

const RECEITA_CATS = [
	{ name: "Venda", tipo: "receita", cor: "green", icone: "shopping" },
	{ name: "Serviços", tipo: "receita", cor: "blue", icone: "wrench" },
	{ name: "Mensalidades", tipo: "receita", cor: "teal", icone: "calendar" },
	{
		name: "Consultorias",
		tipo: "receita",
		cor: "purple",
		icone: "briefcase",
	},
	{ name: "Comissão", tipo: "receita", cor: "cyan", icone: "percent" },
] as const;

const DESPESA_CATS = [
	{ name: "Água", tipo: "despesa", cor: "blue", icone: "droplet" },
	{ name: "Energia", tipo: "despesa", cor: "yellow", icone: "zap" },
	{ name: "Internet", tipo: "despesa", cor: "orange", icone: "wifi" },
	{ name: "Salários", tipo: "despesa", cor: "red", icone: "users" },
	{ name: "Marketing", tipo: "despesa", cor: "pink", icone: "megaphone" },
	{ name: "Impostos", tipo: "despesa", cor: "gray", icone: "landmark" },
	{ name: "Combustível", tipo: "despesa", cor: "amber", icone: "fuel" },
] as const;

const CENTROS = [
	{ name: "Administrativo", codigo: "ADM" },
	{ name: "Comercial", codigo: "COM" },
	{ name: "Marketing", codigo: "MKT" },
	{ name: "Financeiro", codigo: "FIN" },
	{ name: "TI", codigo: "TI" },
	{ name: "Operacional", codigo: "OPS" },
] as const;

function requireSeedEnv(name: string, value: string | undefined): string {
	if (!value) {
		throw new Error(`Seed: variável obrigatória ausente: ${name}`);
	}
	return value;
}

async function ensureUser(params: {
	name: string;
	email: string;
	password: string;
	perfil: string;
	companyId?: string | null;
	department?: string | null;
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
		blocked: false,
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

async function ensureHeliosCompany(planId: string) {
	const name = requireSeedEnv("SEED_COMPANY_NAME", env.SEED_COMPANY_NAME);
	const document = requireSeedEnv(
		"SEED_COMPANY_DOCUMENT",
		env.SEED_COMPANY_DOCUMENT,
	);
	const email = requireSeedEnv("SEED_COMPANY_EMAIL", env.SEED_COMPANY_EMAIL);

	const [existing] = await db
		.select()
		.from(companies)
		.where(eq(companies.document, document))
		.limit(1);

	const planExpiresAt = new Date();
	planExpiresAt.setDate(planExpiresAt.getDate() + 365);

	const payload = {
		corporateName: `${name} LTDA`,
		tradeName: name,
		document,
		email,
		phone: "11999990000",
		website: "https://helioslabs.com.br",
		logo: null as string | null,
		zipCode: "01310100",
		street: "Avenida Paulista",
		number: "1000",
		complement: null as string | null,
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
		console.log(`Seed: empresa ${name} já existia.`);
		return existing.id;
	}

	const [created] = await db.insert(companies).values(payload).returning();
	if (!created) {
		throw new Error(`Falha ao criar empresa ${name}.`);
	}
	console.log(`Seed: empresa ${name} criada.`);
	return created.id;
}

async function ensureHeliosClient(companyId: string, userId: string) {
	const name = requireSeedEnv("SEED_CLIENT_NAME", env.SEED_CLIENT_NAME);
	const document = requireSeedEnv(
		"SEED_CLIENT_DOCUMENT",
		env.SEED_CLIENT_DOCUMENT,
	);
	const companyEmail = requireSeedEnv(
		"SEED_COMPANY_EMAIL",
		env.SEED_COMPANY_EMAIL,
	);

	const payload = {
		personType: "PJ",
		document,
		name,
		tradeName: name,
		email: companyEmail,
		phone: "11999990000",
		zipCode: "01310100",
		street: "Avenida Paulista",
		number: "1000",
		complement: null as string | null,
		district: "Bela Vista",
		city: "São Paulo",
		state: "SP",
		latitude: -23.561414,
		longitude: -46.655881,
		ativo: true,
		updatedAt: new Date(),
		updatedBy: userId,
	};

	const [existing] = await db
		.select()
		.from(clients)
		.where(
			and(eq(clients.companyId, companyId), eq(clients.document, document)),
		)
		.limit(1);

	if (existing) {
		await db.update(clients).set(payload).where(eq(clients.id, existing.id));
		console.log(`Seed: cliente ${name} já existia.`);
		return existing.id;
	}

	const [created] = await db
		.insert(clients)
		.values({
			companyId,
			...payload,
			createdBy: userId,
		})
		.returning();

	if (!created) {
		throw new Error(`Falha ao criar cliente ${name}.`);
	}
	console.log(`Seed: cliente ${name} criado.`);
	return created.id;
}

async function ensureSupplierAvulso(companyId: string, userId: string) {
	const name = env.SEED_SUPPLIER_NAME ?? "Fornecedor Avulso";

	const [existing] = await db
		.select()
		.from(suppliers)
		.where(and(eq(suppliers.companyId, companyId), eq(suppliers.name, name)))
		.limit(1);

	if (existing) {
		await db
			.update(suppliers)
			.set({
				name,
				document: null,
				email: null,
				phone: null,
				ativo: true,
				updatedAt: new Date(),
				updatedBy: userId,
			})
			.where(eq(suppliers.id, existing.id));
		console.log(`Seed: fornecedor ${name} já existia.`);
		return existing.id;
	}

	const [created] = await db
		.insert(suppliers)
		.values({
			companyId,
			name,
			document: null,
			email: null,
			phone: null,
			createdBy: userId,
			updatedBy: userId,
		})
		.returning();

	if (!created) {
		throw new Error(`Falha ao criar fornecedor ${name}.`);
	}
	console.log(`Seed: fornecedor ${name} criado.`);
	return created.id;
}

async function ensureFinanceiroBase(companyId: string, userId: string) {
	for (const cat of [...RECEITA_CATS, ...DESPESA_CATS]) {
		const [existing] = await db
			.select()
			.from(financialCategories)
			.where(
				and(
					eq(financialCategories.companyId, companyId),
					eq(financialCategories.name, cat.name),
				),
			)
			.limit(1);

		if (existing) {
			await db
				.update(financialCategories)
				.set({
					tipo: cat.tipo,
					cor: cat.cor,
					icone: cat.icone,
					ativo: true,
					updatedAt: new Date(),
					updatedBy: userId,
				})
				.where(eq(financialCategories.id, existing.id));
			continue;
		}

		await db.insert(financialCategories).values({
			companyId,
			name: cat.name,
			tipo: cat.tipo,
			cor: cat.cor,
			icone: cat.icone,
			createdBy: userId,
			updatedBy: userId,
		});
	}
	console.log("Seed: categorias financeiras.");

	for (const cc of CENTROS) {
		const [existing] = await db
			.select()
			.from(costCenters)
			.where(
				and(eq(costCenters.companyId, companyId), eq(costCenters.codigo, cc.codigo)),
			)
			.limit(1);

		if (existing) {
			await db
				.update(costCenters)
				.set({
					name: cc.name,
					ativo: true,
					updatedAt: new Date(),
					updatedBy: userId,
				})
				.where(eq(costCenters.id, existing.id));
			continue;
		}

		await db.insert(costCenters).values({
			companyId,
			name: cc.name,
			codigo: cc.codigo,
			createdBy: userId,
			updatedBy: userId,
		});
	}
	console.log("Seed: centros de custo.");

	const banco = env.SEED_BANK_NAME ?? "Banco do Brasil";
	const agencia = env.SEED_BANK_AGENCIA ?? "1234-5";
	const conta = env.SEED_BANK_CONTA ?? "12345-6";

	const [existingBank] = await db
		.select()
		.from(bankAccounts)
		.where(
			and(
				eq(bankAccounts.companyId, companyId),
				eq(bankAccounts.conta, conta),
			),
		)
		.limit(1);

	if (existingBank) {
		await db
			.update(bankAccounts)
			.set({
				banco,
				agencia,
				tipo: "corrente",
				saldoInicial: 0,
				saldoAtual: 0,
				dataSaldoInicial: new Date(),
				cor: "blue",
				ativo: true,
				updatedAt: new Date(),
				updatedBy: userId,
			})
			.where(eq(bankAccounts.id, existingBank.id));
		console.log(`Seed: banco ${banco} já existia.`);
		return existingBank.id;
	}

	const [createdBank] = await db
		.insert(bankAccounts)
		.values({
			companyId,
			banco,
			agencia,
			conta,
			tipo: "corrente",
			saldoInicial: 0,
			saldoAtual: 0,
			dataSaldoInicial: new Date(),
			cor: "blue",
			createdBy: userId,
			updatedBy: userId,
		})
		.returning();

	if (!createdBank) {
		throw new Error(`Falha ao criar banco ${banco}.`);
	}
	console.log(`Seed: banco ${banco} criado.`);
	return createdBank.id;
}

async function softDeleteExtras(params: {
	keepUserEmails: string[];
	companyId: string;
	keepClientId: string;
	keepBankId: string;
	keepSupplierId: string;
}) {
	const now = new Date();
	const soft = { ativo: false, updatedAt: now };

	await db
		.update(user)
		.set(soft)
		.where(notInArray(user.email, params.keepUserEmails));
	console.log("Seed: usuários extras desativados.");

	await db
		.update(companies)
		.set(soft)
		.where(ne(companies.id, params.companyId));
	console.log("Seed: empresas extras desativadas.");

	await db
		.update(clients)
		.set({ ...soft, updatedBy: null })
		.where(ne(clients.id, params.keepClientId));

	await db
		.update(bankAccounts)
		.set({ ...soft, updatedBy: null })
		.where(ne(bankAccounts.id, params.keepBankId));

	await db
		.update(suppliers)
		.set({ ...soft, updatedBy: null })
		.where(ne(suppliers.id, params.keepSupplierId));

	const keepCatNames = [...RECEITA_CATS, ...DESPESA_CATS].map((c) => c.name);
	await db
		.update(financialCategories)
		.set({ ...soft, updatedBy: null })
		.where(
			and(
				eq(financialCategories.companyId, params.companyId),
				notInArray(financialCategories.name, keepCatNames),
			),
		);
	await db
		.update(financialCategories)
		.set({ ...soft, updatedBy: null })
		.where(ne(financialCategories.companyId, params.companyId));

	const keepCcCodigos = CENTROS.map((c) => c.codigo);
	await db
		.update(costCenters)
		.set({ ...soft, updatedBy: null })
		.where(
			and(
				eq(costCenters.companyId, params.companyId),
				notInArray(costCenters.codigo, keepCcCodigos),
			),
		);
	await db
		.update(costCenters)
		.set({ ...soft, updatedBy: null })
		.where(ne(costCenters.companyId, params.companyId));

	const activeEntries = await db
		.select({ id: financialEntries.id })
		.from(financialEntries)
		.where(eq(financialEntries.ativo, true));
	const entryIds = activeEntries.map((e) => e.id);

	if (entryIds.length > 0) {
		await db
			.update(financialEntryPayments)
			.set({ ...soft, updatedBy: null })
			.where(inArray(financialEntryPayments.entryId, entryIds));

		await db
			.update(financialEntryHistory)
			.set(soft)
			.where(inArray(financialEntryHistory.entryId, entryIds));

		await db
			.update(financialEntryAttachments)
			.set(soft)
			.where(inArray(financialEntryAttachments.entryId, entryIds));

		await db
			.update(financialEntries)
			.set({ ...soft, updatedBy: null })
			.where(inArray(financialEntries.id, entryIds));
	}

	console.log("Seed: financeiro extra desativado (só base Helios).");
}

async function main() {
	console.log("Seed: bootstrap Helios Labs (base limpa)…");

	const superName = requireSeedEnv("SEED_SUPER_NAME", env.SEED_SUPER_NAME);
	const superEmail = requireSeedEnv("SEED_SUPER_EMAIL", env.SEED_SUPER_EMAIL);
	const superPassword = requireSeedEnv(
		"SEED_SUPER_PASSWORD",
		env.SEED_SUPER_PASSWORD,
	);

	const adminName = requireSeedEnv("SEED_ADMIN_NAME", env.SEED_ADMIN_NAME);
	const adminEmail = requireSeedEnv("SEED_ADMIN_EMAIL", env.SEED_ADMIN_EMAIL);
	const adminPassword = requireSeedEnv(
		"SEED_ADMIN_PASSWORD",
		env.SEED_ADMIN_PASSWORD,
	);

	const clienteName = requireSeedEnv(
		"SEED_CLIENTE_NAME",
		env.SEED_CLIENTE_NAME,
	);
	const clienteEmail = requireSeedEnv(
		"SEED_CLIENTE_EMAIL",
		env.SEED_CLIENTE_EMAIL,
	);
	const clientePassword = requireSeedEnv(
		"SEED_CLIENTE_PASSWORD",
		env.SEED_CLIENTE_PASSWORD,
	);

	const planId = await ensurePlanBasico();
	const companyId = await ensureHeliosCompany(planId);

	await ensureUser({
		name: superName,
		email: superEmail,
		password: superPassword,
		perfil: "super",
		companyId: null,
	});

	const adminUserId = await ensureUser({
		name: adminName,
		email: adminEmail,
		password: adminPassword,
		perfil: "admin_empresa",
		companyId,
		department: "Administração",
	});

	if (!adminUserId) {
		throw new Error("Falha ao criar admin da empresa.");
	}

	await ensureUser({
		name: clienteName,
		email: clienteEmail,
		password: clientePassword,
		perfil: "cliente",
		companyId,
		department: "Operações",
	});

	const clientId = await ensureHeliosClient(companyId, adminUserId);
	const bankId = await ensureFinanceiroBase(companyId, adminUserId);
	const supplierId = await ensureSupplierAvulso(companyId, adminUserId);

	await softDeleteExtras({
		keepUserEmails: [superEmail, adminEmail, clienteEmail],
		companyId,
		keepClientId: clientId,
		keepBankId: bankId,
		keepSupplierId: supplierId,
	});

	console.log("Seed: concluído (3 usuários + financeiro mínimo).");
	process.exit(0);
}

main().catch((error) => {
	console.error("Seed falhou:", error);
	process.exit(1);
});
