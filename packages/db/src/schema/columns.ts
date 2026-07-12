import { boolean, timestamp, uuid } from "drizzle-orm/pg-core";

/** Primary key UUID — obrigatório. Proibido serial / autoincrement. */
export function idColumn() {
	return uuid("id").defaultRandom().primaryKey();
}

/** Soft-delete + auditoria — obrigatório em toda tabela. */
export const softDeleteColumns = {
	ativo: boolean("ativo").default(true).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
};
