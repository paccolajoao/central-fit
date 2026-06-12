import { requireUser, serverFetch } from "@/lib/dal";
import { NutritionDashboard } from "@/components/nutrition/nutrition-dashboard";
import type { DailyData, NutritionGoals } from "@/lib/nutrition-types";

const DEFAULT_GOALS: NutritionGoals = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
};

const EMPTY_DAILY: DailyData = {
  date: "",
  totals: {
    energy_kcal: 0,
    protein_g: 0,
    carbohydrates_g: 0,
    fat_g: 0,
    fiber_g: 0,
    sugar_g: 0,
    net_carbs_g: 0,
    sodium_mg: 0,
  },
  by_meal: {},
};

export default async function AlimentacaoPage() {
  await requireUser();

  const today = new Date().toISOString().slice(0, 10);

  const [daily, settings] = await Promise.all([
    serverFetch<DailyData>(`/api/nutrition/daily?date=${today}`),
    serverFetch<{ nutrition_goals: NutritionGoals | null }>("/api/settings"),
  ]);

  const goals = settings?.nutrition_goals ?? DEFAULT_GOALS;

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Alimentação
        </h1>
        <p className="text-muted-foreground text-sm">
          Registros importados do Cronometer.
        </p>
      </div>

      <NutritionDashboard
        initialDate={today}
        initialDaily={daily ?? { ...EMPTY_DAILY, date: today }}
        goals={goals}
      />
    </>
  );
}
