import { Chart, useChart } from "@chakra-ui/charts";
import { Box, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CompanyDashboard } from "@/lib/company-dashboard-api";

type DepartmentPieChartProps = {
	data: CompanyDashboard["departmentDistribution"];
};

export function DepartmentPieChart({ data }: DepartmentPieChartProps) {
	const chart = useChart({
		data: data.map((item) => ({
			department: item.department,
			count: item.count,
			color: item.color,
		})),
		series: [{ name: "count", label: "Usuários" }],
	});

	const total = data.reduce((sum, item) => sum + item.count, 0);

	return (
		<Box
			p={{ base: 5, md: 6 }}
			bg="bg.panel"
			borderWidth="1px"
			borderColor="border"
			borderRadius="2xl"
			h="full"
			minH="320px"
		>
			<Heading as="h2" size="md" fontFamily="heading" fontWeight="700" mb={1}>
				Usuários por departamento
			</Heading>
			<Text fontSize="sm" color="fg.muted" mb={6}>
				Distribuição atual
			</Text>
			{data.length === 0 || total === 0 ? (
				<Text color="fg.muted" py={16} textAlign="center">
					Nenhum usuário cadastrado.
				</Text>
			) : (
				<>
					<Box h="200px">
						<Chart.Root maxH="200px" chart={chart} h="full">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Tooltip content={<Chart.Tooltip hideLabel />} />
									<Pie
										data={chart.data}
										dataKey={chart.key("count")}
										nameKey={chart.key("department")}
										innerRadius="58%"
										outerRadius="88%"
										paddingAngle={2}
										strokeWidth={0}
									>
										{chart.data.map((item) => (
											<Cell
												key={item.department}
												fill={chart.color(item.color)}
											/>
										))}
									</Pie>
								</PieChart>
							</ResponsiveContainer>
						</Chart.Root>
					</Box>
					<VStack align="stretch" gap={2} mt={4}>
						{data.map((item) => (
							<HStack key={item.department} justify="space-between">
								<HStack gap={2}>
									<Box w="2.5" h="2.5" borderRadius="full" bg={item.color} />
									<Text fontSize="sm" color="fg.muted">
										{item.department}
									</Text>
								</HStack>
								<Text fontSize="sm" fontWeight="600">
									{item.count}
								</Text>
							</HStack>
						))}
					</VStack>
				</>
			)}
		</Box>
	);
}
