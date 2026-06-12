"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDistance, type WeeklyActivityData } from "@/lib/activity-types";

type Props = {
  data: WeeklyActivityData;
};

function formatDay(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" });
}

function formatMinutes(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m >= 60) return `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}min` : ""}`;
  return `${m}min`;
}

export function WeeklyActivityChart({ data }: Props) {
  const chartData = Object.entries(data.days).map(([date, stats]) => ({
    date: formatDay(date),
    Duração: Math.round(stats.duration_seconds / 60),       // em minutos
    Calorias: Math.round(stats.calories_kcal),
    _distance: stats.distance_meters,
    _count: stats.activity_count,
  }));

  const { summary } = data;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          label="Dias ativos"
          value={String(summary.days_active)}
          unit="dias"
        />
        <SummaryCard
          label="Duração total"
          value={formatMinutes(summary.total_duration_seconds)}
          unit=""
        />
        <SummaryCard
          label="Distância total"
          value={formatDistance(summary.total_distance_meters)}
          unit=""
        />
        <SummaryCard
          label="Calorias totais"
          value={summary.total_calories_kcal > 0 ? String(Math.round(summary.total_calories_kcal)) : "—"}
          unit={summary.total_calories_kcal > 0 ? "kcal" : ""}
        />
      </div>

      <div className="bg-card border rounded-xl p-4">
        <p className="text-sm font-medium mb-4">Duração por dia (min)</p>
        <ResponsiveContainer width="100%" height={220}>
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
              unit="min"
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid hsl(var(--border))",
                backgroundColor: "hsl(var(--card))",
                color: "hsl(var(--card-foreground))",
                fontSize: 12,
              }}
              formatter={(value, name) => {
                if (name === "Duração") {
                  return [`${value} min`, "Duração"];
                }
                return [`${value}`, String(name)];
              }}
              labelFormatter={(label, payload) => {
                const p = payload?.[0]?.payload as Record<string, number> | undefined;
                if (!p) return label;
                const parts: string[] = [String(label)];
                if (p._distance > 0) parts.push(formatDistance(p._distance));
                if (p._count > 0) parts.push(`${p._count} atividade${p._count > 1 ? "s" : ""}`);
                return parts.join(" · ");
              }}
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
            />
            <Bar dataKey="Duração" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
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
      <p className="text-xl font-bold tabular-nums">{value || "—"}</p>
      {unit && <p className="text-xs text-muted-foreground">{unit}</p>}
    </div>
  );
}
