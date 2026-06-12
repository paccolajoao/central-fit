import { ConstructionIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const titles: Record<string, string> = {
  alunos: "Alunos",
  treinos: "Treinos",
  agenda: "Agenda",
  configuracoes: "Configurações",
};

export default async function SectionPlaceholderPage({
  params,
}: {
  params: Promise<{ rest: string[] }>;
}) {
  const { rest } = await params;
  const section = rest[0] ?? "";
  const title = titles[section] ?? "Seção";

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="text-muted-foreground">Módulo em construção.</p>
      </div>

      <Card>
        <CardHeader className="items-center text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <ConstructionIcon className="size-6" />
          </div>
          <CardTitle>Em construção</CardTitle>
          <CardDescription>
            A seção &quot;{title}&quot; ainda não foi implementada.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </>
  );
}
