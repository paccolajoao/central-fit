"use client";

import { cn } from "@/lib/utils";
import {
  formatDuration,
  formatDistance,
  type DailyActivityTotals,
  type ActivityGoals,
} from "@/lib/activity-types";

type CardProps = {
  label: string;
  value: string;
  unit: string;
  goal?: number;
  goalUnit?: string;
  pct?: number;
  over?: boolean;
  color: string;
};

function SummaryCard({ label, value, unit, goal, goalUnit, pct, over, color }: CardProps) {
  const showGoal = goal !== undefined && goal > 0;

  return (
    <div className="bg-card border rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          {label}
        </span>
        {showGoal && pct !== undefined && (
          <span className={cn("text-xs font-semibold", over ? "text-green-600 dark:text-green-400" : "text-muted-foreground")}>
            {over ? "Meta atingida!" : `${Math.round(pct)}%`}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tabular-nums">{value}</span>
        <span className="text-muted-foreground text-sm">{unit}</span>
        {showGoal && (
          <span className="text-muted-foreground text-sm ml-auto">
            / {goal}{goalUnit}
          </span>
        )}
      </div>

      {showGoal && pct !== undefined && (
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              over ? "bg-green-500" : color,
            )}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

type Props = {
  totals: DailyActivityTotals;
  goals: ActivityGoals | null;
};

export function ActivitySummaryCards({ totals, goals }: Props) {
  const calGoal = goals?.daily_calories ?? 0;
  const calPct = calGoal > 0 ? (totals.calories_kcal / calGoal) * 100 : undefined;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <SummaryCard
        label="Duração"
        value={formatDuration(totals.duration_seconds)}
        unit=""
        color="bg-violet-500"
      />
      <SummaryCard
        label="Distância"
        value={totals.distance_meters > 0 ? formatDistance(totals.distance_meters) : "—"}
        unit=""
        color="bg-blue-500"
      />
      <SummaryCard
        label="Calorias gastas"
        value={totals.calories_kcal > 0 ? String(Math.round(totals.calories_kcal)) : "—"}
        unit={totals.calories_kcal > 0 ? "kcal" : ""}
        goal={calGoal > 0 ? calGoal : undefined}
        goalUnit="kcal"
        pct={calPct}
        over={calGoal > 0 && totals.calories_kcal >= calGoal}
        color="bg-orange-500"
      />
    </div>
  );
}
