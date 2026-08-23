import {
	Button,
	Checkbox,
	Dialog,
	HStack,
	Spinner,
	Stack,
	Table,
	Text,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";

import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/lib/api";
import {
	type Company,
	type CompanyModulePermissionItem,
	companiesApi,
	type ModuleKey,
} from "@/lib/companies-api";

const MODULE_LABELS: Record<ModuleKey, string> = {
	clientes: "Clientes",
	financeiro: "Financeiro",
	itr: "ITR",
	kanban: "Kanban",
	agendamentos: "Agendamentos",
	usuarios: "Usuários",
};

const MODULE_KEYS: ModuleKey[] = [
	"clientes",
	"financeiro",
	"itr",
	"kanban",
	"agendamentos",
	"usuarios",
];

type CompanyModulesDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	company: Company | null;
};

export function CompanyModulesDialog({
	open,
	onOpenChange,
	company,
}: CompanyModulesDialogProps) {
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [drafts, setDrafts] = useState<CompanyModulePermissionItem[]>([]);

	const load = useCallback(async () => {
		if (!company) return;
		setLoading(true);
		try {
			const result = await companiesApi.getModules(company.id);
			const byKey = new Map(result.modules.map((m) => [m.moduleKey, m]));
			setDrafts(
				MODULE_KEYS.map((moduleKey) => {
					const existing = byKey.get(moduleKey);
					return {
						moduleKey,
						canAccess: Boolean(existing?.canAccess),
						canLiberate: Boolean(existing?.canAccess && existing?.canLiberate),
					};
				}),
			);
		} catch (error) {
			toaster.create({
				title:
					error instanceof ApiError
						? error.message
						: "Erro ao carregar módulos",
				type: "error",
			});
		} finally {
			setLoading(false);
		}
	}, [company]);

	useEffect(() => {
		if (!open || !company) return;
		void load();
	}, [open, company, load]);

	function updateModule(
		moduleKey: ModuleKey,
		patch: Partial<
			Pick<CompanyModulePermissionItem, "canAccess" | "canLiberate">
		>,
	) {
		setDrafts((prev) =>
			prev.map((item) => {
				if (item.moduleKey !== moduleKey) return item;
				const canAccess =
					patch.canAccess !== undefined ? patch.canAccess : item.canAccess;
				let canLiberate =
					patch.canLiberate !== undefined
						? patch.canLiberate
						: item.canLiberate;
				if (!canAccess) canLiberate = false;
				return { ...item, canAccess, canLiberate };
			}),
		);
	}

	async function handleSave() {
		if (!company) return;
		setSaving(true);
		try {
			await companiesApi.upsertModules(company.id, drafts);
			toaster.create({ title: "Módulos atualizados", type: "success" });
			onOpenChange(false);
		} catch (error) {
			toaster.create({
				title: error instanceof ApiError ? error.message : "Erro ao salvar",
				type: "error",
			});
		} finally {
			setSaving(false);
		}
	}

	return (
		<Dialog.Root open={open} onOpenChange={(e) => onOpenChange(e.open)}>
			<Dialog.Backdrop />
			<Dialog.Positioner>
				<Dialog.Content bg="bg.panel" maxW="lg" w="full" mx={4}>
					<Dialog.Header>
						<Dialog.Title>Módulos — {company?.tradeName}</Dialog.Title>
						<Dialog.CloseTrigger />
					</Dialog.Header>
					<Dialog.Body>
						<Stack gap={4}>
							<Text fontSize="sm" color="fg.muted">
								Defina o que o administrador da empresa pode acessar e o que
								pode liberar para usuários cliente. Desativar acesso também
								revoga o módulo dos clientes.
							</Text>
							{loading ? (
								<HStack justify="center" py={8}>
									<Spinner />
								</HStack>
							) : (
								<Table.ScrollArea
									borderWidth="1px"
									borderColor="helios.border"
									rounded="md"
								>
									<Table.Root size="sm">
										<Table.Header>
											<Table.Row bg="bg.muted">
												<Table.ColumnHeader>Módulo</Table.ColumnHeader>
												<Table.ColumnHeader textAlign="center">
													Acessar
												</Table.ColumnHeader>
												<Table.ColumnHeader textAlign="center">
													Liberar
												</Table.ColumnHeader>
											</Table.Row>
										</Table.Header>
										<Table.Body>
											{drafts.map((item) => (
												<Table.Row key={item.moduleKey}>
													<Table.Cell fontWeight="medium">
														{MODULE_LABELS[item.moduleKey]}
													</Table.Cell>
													<Table.Cell textAlign="center">
														<Checkbox.Root
															checked={item.canAccess}
															onCheckedChange={(e) =>
																updateModule(item.moduleKey, {
																	canAccess: Boolean(e.checked),
																})
															}
														>
															<Checkbox.HiddenInput />
															<Checkbox.Control />
														</Checkbox.Root>
													</Table.Cell>
													<Table.Cell textAlign="center">
														<Checkbox.Root
															checked={item.canLiberate}
															disabled={!item.canAccess}
															onCheckedChange={(e) =>
																updateModule(item.moduleKey, {
																	canLiberate: Boolean(e.checked),
																})
															}
														>
															<Checkbox.HiddenInput />
															<Checkbox.Control />
														</Checkbox.Root>
													</Table.Cell>
												</Table.Row>
											))}
										</Table.Body>
									</Table.Root>
								</Table.ScrollArea>
							)}
						</Stack>
					</Dialog.Body>
					<Dialog.Footer>
						<Dialog.ActionTrigger asChild>
							<Button variant="outline">Cancelar</Button>
						</Dialog.ActionTrigger>
						<Button
							bg="helios.solid"
							color="helios.contrast"
							loading={saving}
							disabled={loading}
							onClick={() => void handleSave()}
						>
							Salvar
						</Button>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Positioner>
		</Dialog.Root>
	);
}
