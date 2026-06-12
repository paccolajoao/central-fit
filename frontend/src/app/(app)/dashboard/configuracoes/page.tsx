import { requireUser, serverFetch } from "@/lib/dal";
import { SettingsForm } from "@/components/settings/settings-form";
import type { NutritionGoals } from "@/lib/nutrition-types";

type SettingsResponse = {
  nutrition_goals: NutritionGoals | null;
  cronometer_email: string | null;
  cronometer_configured: boolean;
};

const DEFAULT_GOALS: NutritionGoals = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
};

export default async function ConfiguracoesPage() {
  await requireUser();

  const settings = await serverFetch<SettingsResponse>("/api/settings");

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Configurações
        </h1>
        <p className="text-muted-foreground text-sm">
          Gerencie suas preferências e integrações.
        </p>
      </div>

      <SettingsForm
        initialGoals={settings?.nutrition_goals ?? DEFAULT_GOALS}
        initialEmail={settings?.cronometer_email ?? null}
        initialConfigured={settings?.cronometer_configured ?? false}
      />
    </>
  );
}
