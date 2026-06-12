"use client";

import { useState } from "react";
import {
  EyeIcon,
  EyeOffIcon,
  SaveIcon,
  CheckCircle2Icon,
  UtensilsCrossedIcon,
  ActivityIcon,
  SmartphoneIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { NutritionGoals } from "@/lib/nutrition-types";
import type { ActivityGoals } from "@/lib/activity-types";

type Props = {
  initialGoals: NutritionGoals;
  initialEmail: string | null;
  initialConfigured: boolean;
  initialActivityGoals: ActivityGoals;
};

export function SettingsForm({
  initialGoals,
  initialEmail,
  initialConfigured,
  initialActivityGoals,
}: Props) {
  // Nutrition state
  const [goals, setGoals] = useState(initialGoals);
  const [savingNutrition, setSavingNutrition] = useState(false);

  // Cronometer state
  const [email, setEmail] = useState(initialEmail ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [configured, setConfigured] = useState(initialConfigured);
  const [savingCronometer, setSavingCronometer] = useState(false);

  // Activity goals state
  const [activityGoals, setActivityGoals] = useState(initialActivityGoals);
  const [savingActivity, setSavingActivity] = useState(false);

  async function handleSaveNutrition() {
    setSavingNutrition(true);
    try {
      await api.put("/api/settings", { nutrition_goals: goals });
      toast.success("Metas nutricionais salvas!");
    } catch {
      toast.error("Erro ao salvar metas.");
    } finally {
      setSavingNutrition(false);
    }
  }

  async function handleSaveCronometer() {
    setSavingCronometer(true);
    try {
      const payload: Record<string, string> = { cronometer_email: email };
      if (password) payload.cronometer_password = password;
      const res = await api.put<{ cronometer_configured: boolean }>("/api/settings", payload);
      setConfigured(res.data.cronometer_configured);
      setPassword("");
      toast.success("Credenciais do Cronometer salvas!");
    } catch {
      toast.error("Erro ao salvar credenciais.");
    } finally {
      setSavingCronometer(false);
    }
  }

  async function handleSaveActivityGoals() {
    setSavingActivity(true);
    try {
      await api.put("/api/settings", { activity_goals: activityGoals });
      toast.success("Metas de atividade salvas!");
    } catch {
      toast.error("Erro ao salvar metas.");
    } finally {
      setSavingActivity(false);
    }
  }

  function setGoal(key: keyof NutritionGoals, value: string) {
    const n = parseFloat(value);
    if (!isNaN(n)) setGoals((prev) => ({ ...prev, [key]: n }));
  }

  function setActivityGoal(key: keyof ActivityGoals, value: string) {
    const n = parseInt(value, 10);
    if (!isNaN(n)) setActivityGoals((prev) => ({ ...prev, [key]: n }));
  }

  return (
    <Tabs defaultValue="nutricao" className="max-w-2xl">
      <TabsList className="mb-2">
        <TabsTrigger value="nutricao" className="flex items-center gap-1.5">
          <UtensilsCrossedIcon className="size-3.5" />
          Nutrição
        </TabsTrigger>
        <TabsTrigger value="atividades" className="flex items-center gap-1.5">
          <ActivityIcon className="size-3.5" />
          Atividades
        </TabsTrigger>
      </TabsList>

      {/* ── Aba Nutrição ── */}
      <TabsContent value="nutricao" className="space-y-8">

        {/* Metas nutricionais */}
        <section className="space-y-4">
          <div>
            <h2 className="text-base font-semibold">Metas nutricionais diárias</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Usadas como referência nos cards de progresso da página Alimentação.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="goal-calories">Calorias (kcal)</Label>
              <Input
                id="goal-calories"
                type="number"
                min={0}
                value={goals.calories}
                onChange={(e) => setGoal("calories", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal-protein">Proteína (g)</Label>
              <Input
                id="goal-protein"
                type="number"
                min={0}
                value={goals.protein}
                onChange={(e) => setGoal("protein", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal-carbs">Carboidratos (g)</Label>
              <Input
                id="goal-carbs"
                type="number"
                min={0}
                value={goals.carbs}
                onChange={(e) => setGoal("carbs", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal-fat">Gordura (g)</Label>
              <Input
                id="goal-fat"
                type="number"
                min={0}
                value={goals.fat}
                onChange={(e) => setGoal("fat", e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleSaveNutrition} disabled={savingNutrition} size="sm">
            <SaveIcon className="size-4 mr-1.5" />
            {savingNutrition ? "Salvando..." : "Salvar metas"}
          </Button>
        </section>

        <div className="border-t" />

        {/* Cronometer */}
        <section className="space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold">Integração Cronometer</h2>
              {configured && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                  <CheckCircle2Icon className="size-3" />
                  Configurado
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Credenciais armazenadas de forma criptografada. Usadas apenas para identificação.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-xs text-muted-foreground">
            <p className="font-medium text-foreground text-xs uppercase tracking-wide">Como exportar dados do Cronometer</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>No Cronometer, vá em <strong>Settings → Account → Export Data</strong></li>
              <li>Selecione o período desejado</li>
              <li>Escolha <strong>Serving Summary</strong> e faça o download</li>
              <li>Na página <strong>Alimentação</strong>, clique em &ldquo;Importar CSV&rdquo; e faça o upload</li>
            </ol>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cronometer-email">Email do Cronometer</Label>
              <Input
                id="cronometer-email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cronometer-password">
                Senha do Cronometer
                {configured && !password && (
                  <span className="ml-2 text-xs text-muted-foreground font-normal">
                    (deixe em branco para manter)
                  </span>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="cronometer-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={configured ? "••••••••" : "Senha"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSaveCronometer}
            disabled={savingCronometer || !email}
            size="sm"
          >
            <SaveIcon className="size-4 mr-1.5" />
            {savingCronometer ? "Salvando..." : "Salvar credenciais"}
          </Button>
        </section>
      </TabsContent>

      {/* ── Aba Atividades ── */}
      <TabsContent value="atividades" className="space-y-8">

        {/* Metas de atividade */}
        <section className="space-y-4">
          <div>
            <h2 className="text-base font-semibold">Metas de atividade</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Usadas como referência nos cards de progresso da página Atividades.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="goal-weekly-duration">Duração semanal (min)</Label>
              <Input
                id="goal-weekly-duration"
                type="number"
                min={0}
                value={activityGoals.weekly_duration_minutes}
                onChange={(e) => setActivityGoal("weekly_duration_minutes", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Recomendação OMS: 150 min/sem</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal-daily-calories">Calorias diárias (kcal)</Label>
              <Input
                id="goal-daily-calories"
                type="number"
                min={0}
                value={activityGoals.daily_calories}
                onChange={(e) => setActivityGoal("daily_calories", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal-daily-steps">Passos diários</Label>
              <Input
                id="goal-daily-steps"
                type="number"
                min={0}
                value={activityGoals.daily_steps}
                onChange={(e) => setActivityGoal("daily_steps", e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleSaveActivityGoals} disabled={savingActivity} size="sm">
            <SaveIcon className="size-4 mr-1.5" />
            {savingActivity ? "Salvando..." : "Salvar metas"}
          </Button>
        </section>

        <div className="border-t" />

        {/* Samsung Health */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <SmartphoneIcon className="size-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Integração Samsung Health</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Importe seus treinos e atividades exportados do Samsung Health.
            Não é necessário cadastro ou assinatura — a importação funciona com
            o arquivo de exportação do próprio app.
          </p>

          <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-xs text-muted-foreground">
            <p className="font-medium text-foreground text-xs uppercase tracking-wide">Como exportar dados do Samsung Health</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Abra o <strong>Samsung Health</strong> no celular</li>
              <li>Toque no perfil → <strong>Configurações</strong></li>
              <li>Vá em <strong>Gerenciar dados</strong> → <strong>Baixar dados pessoais</strong></li>
              <li>Selecione <strong>Health data</strong> e faça o download do ZIP</li>
              <li>Na página <strong>Atividades</strong>, clique em &ldquo;Importar Samsung Health&rdquo;</li>
            </ol>
          </div>

          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard/atividades" />}
          >
            <ActivityIcon className="size-4 mr-1.5" />
            Ir para Atividades e importar
          </Button>
        </section>
      </TabsContent>
    </Tabs>
  );
}
