import { Database, KeyRound, Server, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const cards = [
  ["Database", "PostgreSQL", Database],
  ["Auth", "JWT + bcrypt", KeyRound],
  ["API", "FastAPI", Server],
  ["Policy", "RBAC", ShieldCheck],
];

export default function AdminPage() {
  return (
    <div className="space-y-5">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-semibold">Admin portal</h1>
        <p className="text-sm text-muted-foreground">System status, access control, and platform analytics</p>
      </div>
      <section className="grid gap-4 md:grid-cols-4">
        {cards.map(([label, value, Icon]) => (
          <Card key={label as string}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>{label as string}</CardTitle>
              <Icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="text-sm font-medium">{value as string}</CardContent>
          </Card>
        ))}
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Operational checklist</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          {[
            "Alembic head applied",
            "CORS origins configured",
            "JWT secret rotated",
            "Question exposure audit enabled",
          ].map((item) => (
            <div key={item} className="rounded-md border px-3 py-2">
              {item}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
