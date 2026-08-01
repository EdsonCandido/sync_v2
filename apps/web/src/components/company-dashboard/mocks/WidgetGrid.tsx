import { Badge, Box, Text } from "@chakra-ui/react";
import { Reorder } from "framer-motion";
import { type ReactNode, useState } from "react";

import {
	MockAlertsWidget,
	MockCalendarWidget,
	MockFavoritesWidget,
	MockFinanceSummary,
	MockGoalsWidget,
	MockTimelineWidget,
} from "./MockWidgets";
import { DEFAULT_WIDGET_ORDER, type MockWidgetId } from "./mock-data";

const WIDGET_MAP: Record<MockWidgetId, () => ReactNode> = {
	calendar: () => <MockCalendarWidget />,
	timeline: () => <MockTimelineWidget />,
	favorites: () => <MockFavoritesWidget />,
	goals: () => <MockGoalsWidget />,
	finance: () => <MockFinanceSummary />,
	alerts: () => <MockAlertsWidget />,
};

export function WidgetGrid() {
	const [order, setOrder] = useState<MockWidgetId[]>(DEFAULT_WIDGET_ORDER);

	return (
		<Box>
			<Box mb={4} display="flex" alignItems="center" gap={2} flexWrap="wrap">
				<Text fontFamily="heading" fontWeight="700" fontSize="md">
					Widgets inteligentes
				</Text>
				<Badge
					bg="helios.subtle"
					color="helios.fg"
					fontSize="2xs"
					textTransform="uppercase"
					letterSpacing="0.06em"
					fontWeight="700"
					borderWidth="1px"
					borderColor="helios.border"
				>
					demo · arraste para reordenar
				</Badge>
			</Box>
			<Reorder.Group
				axis="y"
				values={order}
				onReorder={setOrder}
				as="div"
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
					gap: "1rem",
					listStyle: "none",
					padding: 0,
					margin: 0,
				}}
			>
				{order.map((id) => {
					const Render = WIDGET_MAP[id];
					return (
						<Reorder.Item
							key={id}
							value={id}
							as="div"
							style={{ cursor: "grab" }}
							whileDrag={{
								scale: 1.02,
								cursor: "grabbing",
								zIndex: 10,
								boxShadow: "0 16px 48px rgba(15, 17, 23, 0.2)",
							}}
						>
							{Render()}
						</Reorder.Item>
					);
				})}
			</Reorder.Group>
		</Box>
	);
}
