"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmt, type WeeklyData } from "@/lib/nutrition-types";

type Props = {
  data: WeeklyData;
};

function formatDay(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" });
}

export function WeeklyChart({ data }: Props) {
  const chartData = Object.entries(data.days).map(([date, stats]) => ({
    date: formatDay(date),
    Proteína: Math.round(stats.protein_g),
    Carboidratos: Math.round(stats.carbohydrates_g),
    Gordura: Math.round(stats.fat_g),
    kcal: Math.round(stats.energy_kcal),
  }));

  const { summary } = data;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <SummaryCard label="Dias registrados" value={String(summary.days_tracked)} unit="dias" />
        <SummaryCard label="Média calorias" value={String(Math.round(summary.avg_energy_kcal))} unit="kcal/dia" />
        <SummaryCard label="Média proteína" value={fmt(summary.avg_protein_g, 0)} unit="g/dia" />
        <SummaryCard label="Média carbo" value={fmt(summary.avg_carbohydrates_g, 0)} unit="g/dia" />
        <SummaryCard label="Média gordura" value={fmt(summary.avg_fat_g, 0)} unit="g/dia" />
        <SummaryCard label="Total calorias" value={String(Math.round(summary.total_energy_kcal))} unit="kcal" />
      </div>

      <div className="bg-card border rounded-xl p-4">
        <p className="text-sm font-medium mb-4">Macros por dia (g)</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              className="fill-muted-foreground"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              className="fill-muted-foreground"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid hsl(var(--border))",
                backgroundColor: "hsl(var(--card))",
                color: "hsl(var(--card-foreground))",
                fontSize: 12,
              }}
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Proteína" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Carboidratos" stackId="a" fill="#eab308" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Gordura" stackId="a" fill="#ec4899" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="bg-card border rounded-xl p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{unit}</p>
    </div>
  );
}
