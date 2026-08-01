import {
	Box,
	Button,
	Flex,
	Grid,
	HStack,
	Text,
	VStack,
} from "@chakra-ui/react";
import { useMemo } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

import { HeliosCard } from "@/components/ui/HeliosCard";
import type { Appointment } from "@/lib/agendamentos-api";

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"] as const;

const SLOT_SHORT: Record<Appointment["slotKind"], string> = {
	timed: "",
	all_day: "Dia",
	morning: "Manhã",
	afternoon: "Tarde",
};

function startOfMonth(d: Date) {
	return new Date(d.getFullYear(), d.getMonth(), 1);
}

function sameDay(a: Date, b: Date) {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

function appointmentDay(a: Appointment) {
	return new Date(a.date);
}

function labelFor(a: Appointment) {
	if (a.slotKind === "timed" && a.startsAt) {
		const t = new Date(a.startsAt).toLocaleTimeString("pt-BR", {
			hour: "2-digit",
			minute: "2-digit",
		});
		return `${t} ${a.title}`;
	}
	const prefix = SLOT_SHORT[a.slotKind];
	return prefix ? `${prefix} · ${a.title}` : a.title;
}

type AppointmentCalendarViewProps = {
	items: Appointment[];
	month: Date;
	onMonthChange: (month: Date) => void;
	onSelectAppointment: (a: Appointment) => void;
	onSelectDay: (day: Date) => void;
	allowEdit: boolean;
};

export function AppointmentCalendarView({
	items,
	month,
	onMonthChange,
	onSelectAppointment,
	onSelectDay,
	allowEdit,
}: AppointmentCalendarViewProps) {
	const today = useMemo(() => {
		const t = new Date();
		t.setHours(0, 0, 0, 0);
		return t;
	}, []);

	const cells = useMemo(() => {
		const first = startOfMonth(month);
		const mondayOffset = (first.getDay() + 6) % 7;
		const gridStart = new Date(first);
		gridStart.setDate(first.getDate() - mondayOffset);

		return Array.from({ length: 42 }, (_, i) => {
			const day = new Date(gridStart);
			day.setDate(gridStart.getDate() + i);
			day.setHours(0, 0, 0, 0);
			return day;
		});
	}, [month]);

	const byDay = useMemo(() => {
		const map = new Map<string, Appointment[]>();
		for (const a of items) {
			const d = appointmentDay(a);
			const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
			const list = map.get(key) ?? [];
			list.push(a);
			map.set(key, list);
		}
		for (const list of map.values()) {
			list.sort((x, y) => {
				const ax = x.startsAt ? new Date(x.startsAt).getTime() : 0;
				const ay = y.startsAt ? new Date(y.startsAt).getTime() : 0;
				return ax - ay;
			});
		}
		return map;
	}, [items]);

	const title = month.toLocaleDateString("pt-BR", {
		month: "long",
		year: "numeric",
	});

	return (
		<HeliosCard>
			<HStack justify="space-between" mb={4} flexWrap="wrap" gap={2}>
				<Text
					fontFamily="heading"
					fontWeight="800"
					fontSize="lg"
					textTransform="capitalize"
				>
					{title}
				</Text>
				<HStack gap={1}>
					<Button
						size="sm"
						variant="ghost"
						aria-label="Mês anterior"
						onClick={() =>
							onMonthChange(
								new Date(month.getFullYear(), month.getMonth() - 1, 1),
							)
						}
					>
						<LuChevronLeft />
					</Button>
					<Button
						size="sm"
						variant="outline"
						onClick={() =>
							onMonthChange(new Date(today.getFullYear(), today.getMonth(), 1))
						}
					>
						Hoje
					</Button>
					<Button
						size="sm"
						variant="ghost"
						aria-label="Próximo mês"
						onClick={() =>
							onMonthChange(
								new Date(month.getFullYear(), month.getMonth() + 1, 1),
							)
						}
					>
						<LuChevronRight />
					</Button>
				</HStack>
			</HStack>

			<Grid
				templateColumns="repeat(7, 1fr)"
				gap={1}
				mb={2}
				display={{ base: "none", md: "grid" }}
			>
				{WEEKDAYS.map((d) => (
					<Text
						key={d}
						fontSize="xs"
						fontWeight="700"
						color="fg.muted"
						textAlign="center"
						py={1}
					>
						{d}
					</Text>
				))}
			</Grid>

			<Grid templateColumns={{ base: "1fr", md: "repeat(7, 1fr)" }} gap={1}>
				{cells.map((day) => {
					const inMonth = day.getMonth() === month.getMonth();
					const isToday = sameDay(day, today);
					const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
					const dayItems = byDay.get(key) ?? [];

					return (
						<Box
							key={key}
							minH={{
								base: dayItems.length || isToday ? "auto" : undefined,
								md: "28",
							}}
							display={{
								base: inMonth || dayItems.length > 0 ? "block" : "none",
								md: "block",
							}}
							p={2}
							rounded="lg"
							borderWidth="1px"
							borderColor={isToday ? "helios.border" : "border"}
							bg={
								isToday
									? "helios.subtle"
									: inMonth
										? "bg.subtle"
										: "transparent"
							}
							opacity={inMonth ? 1 : 0.45}
							cursor={allowEdit ? "pointer" : "default"}
							onClick={() => {
								if (allowEdit) onSelectDay(day);
							}}
							_hover={
								allowEdit
									? { borderColor: "helios.border", bg: "helios.subtle" }
									: undefined
							}
						>
							<Flex justify="space-between" align="center" mb={1}>
								<Text
									fontSize="sm"
									fontWeight={isToday ? "800" : "600"}
									color={isToday ? "helios.fg" : "fg"}
								>
									{day.getDate()}
								</Text>
								<Text
									fontSize="2xs"
									color="fg.muted"
									display={{ base: "inline", md: "none" }}
								>
									{WEEKDAYS[(day.getDay() + 6) % 7]}
								</Text>
							</Flex>
							<VStack align="stretch" gap={1}>
								{dayItems.slice(0, 3).map((a) => (
									<Box
										key={a.id}
										px={1.5}
										py={0.5}
										rounded="md"
										bg="helios.solid"
										color="helios.contrast"
										fontSize="2xs"
										fontWeight="600"
										truncate
										title={labelFor(a)}
										onClick={(e) => {
											e.stopPropagation();
											onSelectAppointment(a);
										}}
										cursor="pointer"
										_hover={{ opacity: 0.9 }}
									>
										{labelFor(a)}
									</Box>
								))}
								{dayItems.length > 3 ? (
									<Text fontSize="2xs" color="fg.muted" fontWeight="600">
										+{dayItems.length - 3} mais
									</Text>
								) : null}
							</VStack>
						</Box>
					);
				})}
			</Grid>
		</HeliosCard>
	);
}
