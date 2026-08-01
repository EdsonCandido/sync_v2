import { Chart, useChart } from "@chakra-ui/charts";
import { Box, Heading, Text } from "@chakra-ui/react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { CompanyDashboard } from "@/lib/company-dashboard-api";

type UsageTrendChartProps = {
	data: CompanyDashboard["usageTrend"];
};

export function UsageTrendChart({ data }: UsageTrendChartProps) {
	const chart = useChart({
		data: data.map((point) => ({
			date: point.date.slice(5),
			accesses: point.accesses,
		})),
		series: [{ name: "accesses", color: "helios.solid", label: "Acessos" }],
	});

	return (
		<Box
			p={{ base: 5, md: 6 }}
			bg="helios.panel"
			borderWidth="1px"
			borderColor="border"
			borderRadius="heliosXl"
			shadow="heliosSm"
			h="full"
			minH="320px"
		>
			<Heading as="h2" size="md" fontFamily="heading" fontWeight="700" mb={1}>
				Evolução de utilização
			</Heading>
			<Text fontSize="sm" color="fg.muted" mb={6}>
				Acessos nos últimos 30 dias
			</Text>
			{data.every((d) => d.accesses === 0) ? (
				<Text color="fg.muted" py={16} textAlign="center">
					Sem acessos no período.
				</Text>
			) : (
				<Box h="240px">
					<Chart.Root maxH="240px" chart={chart} h="full">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={chart.data}>
								<defs>
									{chart.series.map((item) => (
										<Chart.Gradient
											key={item.name}
											id={`usage-${item.name}`}
											stops={[
												{ offset: "0%", color: item.color, opacity: 0.35 },
												{ offset: "100%", color: item.color, opacity: 0 },
											]}
										/>
									))}
								</defs>
								<CartesianGrid
									stroke={chart.color("border.muted")}
									vertical={false}
								/>
								<XAxis
									dataKey={chart.key("date")}
									tickLine={false}
									axisLine={false}
									tickMargin={8}
									minTickGap={24}
								/>
								<YAxis
									tickLine={false}
									axisLine={false}
									width={32}
									allowDecimals={false}
								/>
								<Tooltip cursor={false} content={<Chart.Tooltip />} />
								{chart.series.map((item) => (
									<Area
										key={item.name}
										type="monotone"
										dataKey={chart.key(item.name)}
										stroke={chart.color(item.color)}
										fill={`url(#usage-${item.name})`}
										strokeWidth={2}
									/>
								))}
							</AreaChart>
						</ResponsiveContainer>
					</Chart.Root>
				</Box>
			)}
		</Box>
	);
}
