"use client"

import { Area, Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  CardContent,
} from "@/components/ui/card"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { AreaDetails } from "@/types/types"

const chartConfig = {
  route_count: {
    label: "No of Routes",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function GradeBarChart({data}: {data: AreaDetails['grade_distribution']}) {
  return (
    <>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="grade_best_guess"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="route_count" fill="var(--color-desktop)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </>
  )
}
