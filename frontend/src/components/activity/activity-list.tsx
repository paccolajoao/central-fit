"use client";

import { useState } from "react";
import {
  PersonStandingIcon,
  BikeIcon,
  WavesIcon,
  DumbbellIcon,
  HeartIcon,
  ZapIcon,
  Trash2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  ActivityIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  ACTIVITY_LABELS,
  formatDuration,
  formatDistance,
  formatPace,
  formatSpeed,
  type Activity,
} from "@/lib/activity-types";
import { cn } from "@/lib/utils";

function getActivityIcon(type: string | null) {
  switch (type) {
    case "run":
      return <PersonStandingIcon className="size-4" />;
    case "walk":
      return <PersonStandingIcon className="size-4" />;
    case "cycle":
      return <BikeIcon className="size-4" />;
    case "swim":
      return <WavesIcon className="size-4" />;
    case "workout":
    case "elliptical":
    case "aerobics":
    case "pilates":
    case "yoga":
      return <DumbbellIcon className="size-4" />;
    default:
      return <ActivityIcon className="size-4" />;
  }
}

function getActivityBgColor(type: string | null) {
  switch (type) {
    case "run":    return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    case "walk":   return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "cycle":  return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "swim":   return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400";
    case "workout": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    case "yoga":   return "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400";
    default:       return "bg-muted text-muted-foreground";
  }
}

type ActivityRowProps = {
  activity: Activity;
  onDelete: (id: number) => void;
};

function ActivityRow({ activity, onDelete }: ActivityRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const label = activity.activity_name
    || ACTIVITY_LABELS[activity.activity_type ?? ""]
    || "Atividade";

  const time = new Date(activity.start_time).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/api/activities/${activity.id}`);
      toast.success("Atividade removida.");
      onDelete(activity.id);
    } catch {
      toast.error("Erro ao remover atividade.");
    } finally {
      setDeleting(false);
    }
  }

  const hasDetails =
    activity.heart_rate_avg ||
    activity.elevation_gain_meters ||
    activity.cadence_avg ||
    activity.step_count ||
    activity.notes;

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        {/* Icon */}
        <div className={cn("size-9 rounded-lg flex items-center justify-center shrink-0", getActivityBgColor(activity.activity_type))}>
          {getActivityIcon(activity.activity_type)}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">{label}</p>
            <span className="text-xs text-muted-foreground">{time}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
            {activity.duration_seconds ? (
              <span className="text-xs text-muted-foreground">
                {formatDuration(activity.duration_seconds)}
              </span>
            ) : null}
            {activity.distance_meters ? (
              <span className="text-xs text-muted-foreground">
                {formatDistance(activity.distance_meters)}
              </span>
            ) : null}
            {activity.calories_kcal ? (
              <span className="text-xs text-muted-foreground">
                {Math.round(activity.calories_kcal)} kcal
              </span>
            ) : null}
            {activity.heart_rate_avg ? (
              <span className="text-xs text-rose-500 dark:text-rose-400 flex items-center gap-0.5">
                <HeartIcon className="size-3" />
                {activity.heart_rate_avg} bpm
              </span>
            ) : null}
            {activity.speed_avg_ms && (activity.activity_type === "run" || activity.activity_type === "walk") ? (
              <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                <ZapIcon className="size-3" />
                {formatPace(activity.speed_avg_ms)}
              </span>
            ) : null}
            {activity.speed_avg_ms && activity.activity_type === "cycle" ? (
              <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                <ZapIcon className="size-3" />
                {formatSpeed(activity.speed_avg_ms)}
              </span>
            ) : null}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {hasDetails && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? <ChevronUpIcon className="size-4" /> : <ChevronDownIcon className="size-4" />}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2Icon className="size-4" />
          </Button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t px-4 py-3 grid grid-cols-2 gap-2 sm:grid-cols-4 bg-muted/20">
          {activity.heart_rate_avg && (
            <Detail label="FC média" value={`${activity.heart_rate_avg} bpm`} />
          )}
          {activity.heart_rate_max && (
            <Detail label="FC máxima" value={`${activity.heart_rate_max} bpm`} />
          )}
          {activity.elevation_gain_meters && (
            <Detail label="Ganho altitude" value={`${Math.round(activity.elevation_gain_meters)} m`} />
          )}
          {activity.cadence_avg && (
            <Detail label="Cadência" value={`${activity.cadence_avg} rpm`} />
          )}
          {activity.step_count && (
            <Detail label="Passos" value={activity.step_count.toLocaleString("pt-BR")} />
          )}
          {activity.notes && (
            <div className="col-span-2 sm:col-span-4">
              <Detail label="Notas" value={activity.notes} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

type Props = {
  activities: Activity[];
  onDeleted: (id: number) => void;
};

export function ActivityList({ activities, onDeleted }: Props) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground text-sm">
        Nenhuma atividade registrada neste dia.
        <p className="mt-1 text-xs">Importe seus dados do Samsung Health para visualizar suas atividades.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((a) => (
        <ActivityRow key={a.id} activity={a} onDelete={onDeleted} />
      ))}
    </div>
  );
}
