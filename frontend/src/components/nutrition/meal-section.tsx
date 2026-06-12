"use client";

import { useState } from "react";
import { ChevronDownIcon, Trash2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmt, getMealLabel, type MealGroup, type NutritionEntry } from "@/lib/nutrition-types";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";

type Props = {
  mealName: string;
  data: MealGroup;
  onEntryDeleted: (id: number) => void;
};

function MacroBadge({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium rounded px-1.5 py-0.5", color)}>
      <span className="opacity-70">{label}</span>
      <span>{fmt(value, 0)}{unit}</span>
    </span>
  );
}

function EntryRow({ entry, onDelete }: { entry: NutritionEntry; onDelete: (id: number) => void }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/api/nutrition/entries/${entry.id}`);
      onDelete(entry.id);
      toast.success("Entrada removida.");
    } catch {
      toast.error("Não foi possível remover.");
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-2 py-2 border-b last:border-b-0 group">
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium truncate block">{entry.food_name}</span>
        {entry.amount != null && (
          <span className="text-xs text-muted-foreground">
            {fmt(entry.amount, 1)}{entry.unit ? ` ${entry.unit}` : ""}
          </span>
        )}
      </div>

      <div className="hidden sm:flex items-center gap-1 flex-wrap justify-end">
        {entry.energy_kcal != null && (
          <MacroBadge label="" value={entry.energy_kcal} unit="kcal" color="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" />
        )}
        {entry.protein_g != null && (
          <MacroBadge label="P:" value={entry.protein_g} unit="g" color="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" />
        )}
        {entry.carbohydrates_g != null && (
          <MacroBadge label="C:" value={entry.carbohydrates_g} unit="g" color="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" />
        )}
        {entry.fat_g != null && (
          <MacroBadge label="G:" value={entry.fat_g} unit="g" color="bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" />
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="size-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        onClick={handleDelete}
        disabled={deleting}
      >
        <Trash2Icon className="size-3.5" />
      </Button>
    </div>
  );
}

export function MealSection({ mealName, data, onEntryDeleted }: Props) {
  const [open, setOpen] = useState(true);
  const { entries, totals } = data;

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{getMealLabel(mealName)}</span>
          <span className="text-xs text-muted-foreground">
            {entries.length} item{entries.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {Math.round(totals.energy_kcal)} kcal
          </span>
          <ChevronDownIcon className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        </div>
      </button>

      {open && (
        <div className="px-4 pb-3">
          {entries.map((entry) => (
            <EntryRow key={entry.id} entry={entry} onDelete={onEntryDeleted} />
          ))}

          <div className="flex items-center justify-end gap-1.5 pt-2 mt-1 border-t">
            <span className="text-xs text-muted-foreground">Total:</span>
            <MacroBadge label="P:" value={totals.protein_g} unit="g" color="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" />
            <MacroBadge label="C:" value={totals.carbohydrates_g} unit="g" color="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" />
            <MacroBadge label="G:" value={totals.fat_g} unit="g" color="bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" />
          </div>
        </div>
      )}
    </div>
  );
}
