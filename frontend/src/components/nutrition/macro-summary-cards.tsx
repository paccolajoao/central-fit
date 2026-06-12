"use client";

import { cn } from "@/lib/utils";
import { fmt, type NutritionGoals } from "@/lib/nutrition-types";

type MacroCardProps = {
  label: string;
  value: number;
  goal: number;
  unit: string;
  color: string;
};

function MacroCard({ label, value, goal, unit, color }: MacroCardProps) {
  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  const over = goal > 0 && value > goal;

  return (
    <div className="bg-card border rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          {label}
        </span>
        <span className={cn("text-xs font-semibold", over ? "text-destructive" : "text-muted-foreground")}>
          {over ? `+${fmt(value - goal, 0)}${unit}` : `${fmt(goal - value, 0)}${unit} restam`}
        </span>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tabular-nums">
          {unit === "kcal" ? Math.round(value) : fmt(value, 0)}
        </span>
        <span className="text-muted-foreground text-sm">{unit}</span>
        <span className="text-muted-foreground text-sm ml-auto">/ {goal}{unit}</span>
      </div>

      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", over ? "bg-destructive" : color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

type Props = {
  totals: {
    energy_kcal: number;
    protein_g: number;
    carbohydrates_g: number;
    fat_g: number;
  };
  goals: NutritionGoals;
};

export function MacroSummaryCards({ totals, goals }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <MacroCard
        label="Calorias"
        value={totals.energy_kcal}
        goal={goals.calories}
        unit="kcal"
        color="bg-orange-500"
      />
      <MacroCard
        label="Proteína"
        value={totals.protein_g}
        goal={goals.protein}
        unit="g"
        color="bg-blue-500"
      />
      <MacroCard
        label="Carboidratos"
        value={totals.carbohydrates_g}
        goal={goals.carbs}
        unit="g"
        color="bg-yellow-500"
      />
      <MacroCard
        label="Gordura"
        value={totals.fat_g}
        goal={goals.fat}
        unit="g"
        color="bg-pink-500"
      />
    </div>
  );
}
