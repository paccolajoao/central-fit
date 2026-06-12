"use client";

import { useState, useCallback } from "react";
import { UploadCloudIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateNavigation } from "./date-navigation";
import { MacroSummaryCards } from "./macro-summary-cards";
import { MealSection } from "./meal-section";
import { WeeklyChart } from "./weekly-chart";
import { ImportDialog } from "./import-dialog";
import { api } from "@/lib/api";
import {
  MEAL_ORDER,
  type DailyData,
  type WeeklyData,
  type NutritionGoals,
} from "@/lib/nutrition-types";

type Tab = "hoje" | "semana";

type Props = {
  initialDate: string;
  initialDaily: DailyData;
  goals: NutritionGoals;
};

const EMPTY_TOTALS = {
  energy_kcal: 0,
  protein_g: 0,
  carbohydrates_g: 0,
  fat_g: 0,
  fiber_g: 0,
  sugar_g: 0,
  net_carbs_g: 0,
  sodium_mg: 0,
};

function getWeekRange(dateStr: string): { from: string; to: string } {
  const to = dateStr;
  const from = new Date(dateStr + "T12:00:00");
  from.setDate(from.getDate() - 6);
  return { from: from.toISOString().slice(0, 10), to };
}

export function NutritionDashboard({ initialDate, initialDaily, goals }: Props) {
  const [tab, setTab] = useState<Tab>("hoje");
  const [date, setDate] = useState(initialDate);
  const [daily, setDaily] = useState<DailyData>(initialDaily);
  const [weekly, setWeekly] = useState<WeeklyData | null>(null);
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [loadingWeekly, setLoadingWeekly] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const fetchDaily = useCallback(async (d: string) => {
    setLoadingDaily(true);
    try {
      const res = await api.get<DailyData>("/api/nutrition/daily", { params: { date: d } });
      setDaily(res.data);
    } finally {
      setLoadingDaily(false);
    }
  }, []);

  const fetchWeekly = useCallback(async (d: string) => {
    setLoadingWeekly(true);
    try {
      const { from, to } = getWeekRange(d);
      const res = await api.get<WeeklyData>("/api/nutrition/weekly", { params: { from, to } });
      setWeekly(res.data);
    } finally {
      setLoadingWeekly(false);
    }
  }, []);

  function handleDateChange(newDate: string) {
    setDate(newDate);
    fetchDaily(newDate);
    if (tab === "semana") fetchWeekly(newDate);
  }

  function handleTabChange(newTab: Tab) {
    setTab(newTab);
    if (newTab === "semana" && !weekly) {
      fetchWeekly(date);
    }
  }

  function handleEntryDeleted(id: number) {
    setDaily((prev) => {
      const newByMeal = { ...prev.by_meal };
      for (const meal in newByMeal) {
        const entries = newByMeal[meal].entries.filter((e) => e.id !== id);
        if (entries.length === 0) {
          delete newByMeal[meal];
        } else {
          const totals = {
            energy_kcal: entries.reduce((s, e) => s + (e.energy_kcal ?? 0), 0),
            protein_g: entries.reduce((s, e) => s + (e.protein_g ?? 0), 0),
            carbohydrates_g: entries.reduce((s, e) => s + (e.carbohydrates_g ?? 0), 0),
            fat_g: entries.reduce((s, e) => s + (e.fat_g ?? 0), 0),
          };
          newByMeal[meal] = { entries, totals };
        }
      }
      const totals = Object.values(newByMeal).reduce(
        (acc, m) => ({
          energy_kcal: acc.energy_kcal + m.totals.energy_kcal,
          protein_g: acc.protein_g + m.totals.protein_g,
          carbohydrates_g: acc.carbohydrates_g + m.totals.carbohydrates_g,
          fat_g: acc.fat_g + m.totals.fat_g,
          fiber_g: acc.fiber_g,
          sugar_g: acc.sugar_g,
          net_carbs_g: acc.net_carbs_g,
          sodium_mg: acc.sodium_mg,
        }),
        { ...prev.totals },
      );
      return { ...prev, by_meal: newByMeal, totals };
    });
  }

  function handleImported() {
    fetchDaily(date);
    if (tab === "semana" || weekly) fetchWeekly(date);
  }

  const totals = daily?.totals ?? EMPTY_TOTALS;
  const meals = daily?.by_meal ?? {};
  const sortedMeals = MEAL_ORDER.filter((m) => m in meals).concat(
    Object.keys(meals).filter((m) => !MEAL_ORDER.includes(m)),
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: "hoje", label: "Hoje" },
    { id: "semana", label: "Semana" },
  ];

  return (
    <>
      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={handleImported}
      />

      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <DateNavigation date={date} onChange={handleDateChange} />
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 self-start sm:self-auto"
            onClick={() => setImportOpen(true)}
          >
            <UploadCloudIcon className="size-4" />
            Importar CSV
          </Button>
        </div>

        {/* Macro cards */}
        <MacroSummaryCards totals={totals} goals={goals} />

        {/* Tabs */}
        <div className="flex gap-1 border-b">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "hoje" && (
          <div className="space-y-3">
            {loadingDaily ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
                Carregando...
              </div>
            ) : sortedMeals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                <p className="text-sm">Nenhum registro para este dia.</p>
                <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                  <UploadCloudIcon className="size-4 mr-1.5" />
                  Importar do Cronometer
                </Button>
              </div>
            ) : (
              sortedMeals.map((meal) => (
                <MealSection
                  key={meal}
                  mealName={meal}
                  data={meals[meal]}
                  onEntryDeleted={handleEntryDeleted}
                />
              ))
            )}
          </div>
        )}

        {tab === "semana" && (
          <div>
            {loadingWeekly ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
                Carregando...
              </div>
            ) : weekly ? (
              <WeeklyChart data={weekly} />
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}
