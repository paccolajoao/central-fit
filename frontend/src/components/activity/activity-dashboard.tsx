"use client";

import { useState, useCallback } from "react";
import { UploadCloudIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateNavigation } from "@/components/nutrition/date-navigation";
import { ActivitySummaryCards } from "./activity-summary-cards";
import { ActivityList } from "./activity-list";
import { WeeklyActivityChart } from "./weekly-activity-chart";
import { ImportSamsungDialog } from "./import-samsung-dialog";
import { api } from "@/lib/api";
import type {
  DailyActivityData,
  WeeklyActivityData,
  ActivityGoals,
  Activity,
} from "@/lib/activity-types";

type Tab = "hoje" | "semana";

type Props = {
  initialDate: string;
  initialDaily: DailyActivityData;
  goals: ActivityGoals | null;
};

const EMPTY_DAILY: DailyActivityData = {
  date: "",
  activities: [],
  totals: { duration_seconds: 0, distance_meters: 0, calories_kcal: 0 },
};

function getWeekRange(dateStr: string): { from: string; to: string } {
  const to = dateStr;
  const from = new Date(dateStr + "T12:00:00");
  from.setDate(from.getDate() - 6);
  return { from: from.toISOString().slice(0, 10), to };
}

export function ActivityDashboard({ initialDate, initialDaily, goals }: Props) {
  const [tab, setTab] = useState<Tab>("hoje");
  const [date, setDate] = useState(initialDate);
  const [daily, setDaily] = useState<DailyActivityData>(initialDaily ?? EMPTY_DAILY);
  const [weekly, setWeekly] = useState<WeeklyActivityData | null>(null);
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [loadingWeekly, setLoadingWeekly] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const fetchDaily = useCallback(async (d: string) => {
    setLoadingDaily(true);
    try {
      const res = await api.get<DailyActivityData>("/api/activities/daily", { params: { date: d } });
      setDaily(res.data);
    } finally {
      setLoadingDaily(false);
    }
  }, []);

  const fetchWeekly = useCallback(async (d: string) => {
    setLoadingWeekly(true);
    try {
      const { from, to } = getWeekRange(d);
      const res = await api.get<WeeklyActivityData>("/api/activities/weekly", { params: { from, to } });
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

  function handleActivityDeleted(id: number) {
    setDaily((prev) => {
      const activities = prev.activities.filter((a: Activity) => a.id !== id);
      const totals = {
        duration_seconds: activities.reduce((s, a) => s + (a.duration_seconds ?? 0), 0),
        distance_meters: activities.reduce((s, a) => s + (a.distance_meters ?? 0), 0),
        calories_kcal: activities.reduce((s, a) => s + (a.calories_kcal ?? 0), 0),
      };
      return { ...prev, activities, totals };
    });
  }

  function handleImported() {
    fetchDaily(date);
    if (tab === "semana" || weekly) fetchWeekly(date);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "hoje", label: "Hoje" },
    { id: "semana", label: "Semana" },
  ];

  return (
    <>
      <ImportSamsungDialog
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
            Importar Samsung Health
          </Button>
        </div>

        {/* Summary cards */}
        <ActivitySummaryCards totals={daily.totals} goals={goals} />

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
          <div>
            {loadingDaily ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
                Carregando...
              </div>
            ) : (
              <ActivityList
                activities={daily.activities}
                onDeleted={handleActivityDeleted}
              />
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
              <WeeklyActivityChart data={weekly} />
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}
