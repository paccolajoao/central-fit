export type Activity = {
  id: number;
  source: string;
  activity_type: string | null;
  activity_name: string | null;
  start_time: string;
  end_time: string | null;
  duration_seconds: number | null;
  distance_meters: number | null;
  calories_kcal: number | null;
  elevation_gain_meters: number | null;
  elevation_loss_meters: number | null;
  heart_rate_avg: number | null;
  heart_rate_max: number | null;
  heart_rate_min: number | null;
  speed_avg_ms: number | null;
  speed_max_ms: number | null;
  cadence_avg: number | null;
  step_count: number | null;
  notes: string | null;
};

export type DailyActivityTotals = {
  duration_seconds: number;
  distance_meters: number;
  calories_kcal: number;
};

export type DailyActivityData = {
  date: string;
  activities: Activity[];
  totals: DailyActivityTotals;
};

export type DayActivityStats = {
  duration_seconds: number;
  distance_meters: number;
  calories_kcal: number;
  activity_count: number;
};

export type WeeklyActivitySummary = {
  total_duration_seconds: number;
  total_distance_meters: number;
  total_calories_kcal: number;
  days_active: number;
};

export type WeeklyActivityData = {
  from: string;
  to: string;
  days: Record<string, DayActivityStats>;
  summary: WeeklyActivitySummary;
};

export type ActivityGoals = {
  weekly_duration_minutes: number;
  daily_calories: number;
  daily_steps: number;
};

export type ImportResult = {
  imported: number;
  skipped: number;
  date_range: { from: string; to: string };
};

export const ACTIVITY_LABELS: Record<string, string> = {
  run: "Corrida",
  walk: "Caminhada",
  cycle: "Ciclismo",
  swim: "Natação",
  workout: "Musculação",
  yoga: "Yoga",
  pilates: "Pilates",
  elliptical: "Elíptico",
  aerobics: "Aeróbica",
  other: "Outro",
};

export const ACTIVITY_COLORS: Record<string, string> = {
  run: "text-orange-600 dark:text-orange-400",
  walk: "text-green-600 dark:text-green-400",
  cycle: "text-blue-600 dark:text-blue-400",
  swim: "text-cyan-600 dark:text-cyan-400",
  workout: "text-purple-600 dark:text-purple-400",
  yoga: "text-pink-600 dark:text-pink-400",
  pilates: "text-pink-500 dark:text-pink-300",
  elliptical: "text-indigo-600 dark:text-indigo-400",
  aerobics: "text-red-600 dark:text-red-400",
  other: "text-muted-foreground",
};

export function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

export function formatDistance(meters: number | null): string {
  if (!meters || meters <= 0) return "—";
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
  return `${Math.round(meters)} m`;
}

export function formatPace(speedMs: number | null): string {
  if (!speedMs || speedMs <= 0) return "—";
  const secPerKm = 1000 / speedMs;
  const min = Math.floor(secPerKm / 60);
  const sec = Math.round(secPerKm % 60);
  return `${min}:${String(sec).padStart(2, "0")} /km`;
}

export function formatSpeed(speedMs: number | null): string {
  if (!speedMs || speedMs <= 0) return "—";
  return `${(speedMs * 3.6).toFixed(1)} km/h`;
}
