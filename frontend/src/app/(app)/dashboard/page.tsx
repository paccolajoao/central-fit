import Link from "next/link";
import {
  ActivityIcon,
  ArrowUpRightIcon,
  CalendarIcon,
  DumbbellIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";

import { requireUser } from "@/lib/dal";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const stats = [
  { label: "Alunos ativos", value: "128", delta: "+12%", icon: UsersIcon },
  { label: "Treinos hoje", value: "24", delta: "+4", icon: DumbbellIcon },
  { label: "Check-ins na semana", value: "312", delta: "+8%", icon: ActivityIcon },
  { label: "Receita do mês", value: "R$ 18,4k", delta: "+5%", icon: TrendingUpIcon },
];

const quickActions = [
  { label: "Gerenciar alunos", href: "/dashboard/alunos", icon: UsersIcon },
  { label: "Montar treino", href: "/dashboard/treinos", icon: DumbbellIcon },
  { label: "Ver agenda", href: "/dashboard/agenda", icon: CalendarIcon },
];

export default async function DashboardPage() {
  const user = await requireUser();
  const firstName = user.name.split(" ")[0];

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Olá, {firstName} 👋
        </h1>
        <p className="text-muted-foreground">
          Aqui está um resumo da sua academia hoje.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <stat.icon className="size-5" />
                </span>
                <span className="text-xs font-medium text-primary">
                  {stat.delta}
                </span>
              </div>
              <CardTitle className="mt-2 text-2xl tabular-nums">
                {stat.value}
              </CardTitle>
              <CardDescription>{stat.label}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Atividade recente</CardTitle>
            <CardDescription>
              Os eventos da sua academia aparecerão aqui.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              Sem dados ainda
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações rápidas</CardTitle>
            <CardDescription>Atalhos para os módulos principais.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full justify-start",
                )}
              >
                <action.icon />
                {action.label}
                <ArrowUpRightIcon className="ml-auto text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
