"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  date: string;
  onChange: (date: string) => void;
};

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDisplay(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().slice(0, 10);
}

export function DateNavigation({ date, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="size-8"
        onClick={() => onChange(addDays(date, -1))}
      >
        <ChevronLeftIcon className="size-4" />
      </Button>

      <span className="min-w-36 text-center text-sm font-medium capitalize">
        {formatDisplay(date)}
      </span>

      <Button
        variant="outline"
        size="icon"
        className="size-8"
        onClick={() => onChange(addDays(date, 1))}
        disabled={isToday(date)}
      >
        <ChevronRightIcon className="size-4" />
      </Button>

      {!isToday(date) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(new Date().toISOString().slice(0, 10))}
        >
          Hoje
        </Button>
      )}
    </div>
  );
}
