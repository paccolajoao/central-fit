import { requireUser, serverFetch } from "@/lib/dal";
import { ActivityDashboard } from "@/components/activity/activity-dashboard";
import type { DailyActivityData, ActivityGoals } from "@/lib/activity-types";

const DEFAULT_GOALS: ActivityGoals = {
  weekly_duration_minutes: 150,
  daily_calories: 400,
  daily_steps: 8000,
};

const EMPTY_DAILY: DailyActivityData = {
  date: "",
  activities: [],
  totals: { duration_seconds: 0, distance_meters: 0, calories_kcal: 0 },
};

export default async function AtividadesPage() {
  await requireUser();

  const today = new Date().toISOString().slice(0, 10);

  const [daily, settings] = await Promise.all([
    serverFetch<DailyActivityData>(`/api/activities/daily?date=${today}`),
    serverFetch<{ activity_goals: ActivityGoals | null }>("/api/settings"),
  ]);

  const goals = settings?.activity_goals ?? DEFAULT_GOALS;

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Atividades
        </h1>
        <p className="text-muted-foreground text-sm">
          Registros importados do Samsung Health.
        </p>
      </div>

      <ActivityDashboard
        initialDate={today}
        initialDaily={daily ?? { ...EMPTY_DAILY, date: today }}
        goals={goals}
      />
    </>
  );
}
