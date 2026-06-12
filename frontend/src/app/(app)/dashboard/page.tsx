import {
  ActivityIcon,
  DumbbellIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";

import { requireUser } from "@/lib/dal";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const stats = [
  { label: "Alunos ativos", value: "128", icon: UsersIcon },
  { label: "Treinos hoje", value: "24", icon: DumbbellIcon },
  { label: "Check-ins na semana", value: "312", icon: ActivityIcon },
  { label: "Receita do mês", value: "R$ 18,4k", icon: TrendingUpIcon },
];

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Olá, {user.name} 👋
        </h1>
        <p className="text-muted-foreground">
          Aqui está um resumo da sua academia hoje.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {stat.value}
              </CardTitle>
              <CardAction>
                <stat.icon className="size-5 text-muted-foreground" />
              </CardAction>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo ao painel</CardTitle>
          <CardDescription>
            Use o menu lateral para navegar. Esta é a página inicial — os
            próximos módulos (alunos, treinos, agenda) aparecerão aqui.
          </CardDescription>
        </CardHeader>
      </Card>
    </>
  );
}
