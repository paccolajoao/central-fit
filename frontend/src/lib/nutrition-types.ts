export type NutritionEntry = {
  id: number;
  entry_date: string;
  meal_name: string;
  food_name: string;
  amount: number | null;
  unit: string | null;
  energy_kcal: number | null;
  protein_g: number | null;
  carbohydrates_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  sugar_g: number | null;
  net_carbs_g: number | null;
  sodium_mg: number | null;
};

export type MealTotals = {
  energy_kcal: number;
  protein_g: number;
  carbohydrates_g: number;
  fat_g: number;
};

export type MealGroup = {
  entries: NutritionEntry[];
  totals: MealTotals;
};

export type DailyData = {
  date: string;
  totals: MealTotals & {
    fiber_g: number;
    sugar_g: number;
    net_carbs_g: number;
    sodium_mg: number;
  };
  by_meal: Record<string, MealGroup>;
};

export type DayStats = {
  energy_kcal: number;
  protein_g: number;
  carbohydrates_g: number;
  fat_g: number;
  fiber_g: number;
};

export type WeeklyData = {
  from: string;
  to: string;
  days: Record<string, DayStats>;
  summary: {
    avg_energy_kcal: number;
    avg_protein_g: number;
    avg_carbohydrates_g: number;
    avg_fat_g: number;
    total_energy_kcal: number;
    days_tracked: number;
  };
};

export type NutritionGoals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export const MEAL_ORDER = ["Breakfast", "Lunch", "Dinner", "Snacks", "Outros"];

export const MEAL_LABELS: Record<string, string> = {
  Breakfast: "Café da manhã",
  Lunch: "Almoço",
  Dinner: "Jantar",
  Snacks: "Lanches",
  Outros: "Outros",
};

export function getMealLabel(meal: string): string {
  return MEAL_LABELS[meal] ?? meal;
}

export function fmt(value: number | null | undefined, decimals = 1): string {
  if (value == null) return "0";
  return value.toFixed(decimals);
}
