import { ArrowRight, BrainCircuit, GitBranch, LineChart, Target } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const metrics = [
  { label: "Theta", value: "0.42", detail: "EAP estimate", icon: BrainCircuit },
  { label: "Mastery", value: "78%", detail: "Current subtopic", icon: Target },
  { label: "Info", value: "0.24", detail: "Fisher score", icon: LineChart },
  { label: "Graph", value: "Ready", detail: "Prerequisites met", icon: GitBranch },
];

export default function Home() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 border-b pb-5 md:flex-row md:items-end">
        <div>
          <Badge className="mb-3 bg-secondary text-secondary-foreground">Adaptive session</Badge>
          <h1 className="text-2xl font-semibold tracking-normal">Learning operations dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Monitor mastery, item difficulty, ability estimates, and graph-driven movement through the active learning path.
          </p>
        </div>
        <Button asChild>
          <Link href="/assessments">
            Start session <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>{metric.label}</CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{metric.value}</div>
                <p className="text-sm text-muted-foreground">{metric.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Current path</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {["Fractions", "Equivalent fractions", "Comparing fractions", "Mixed numbers"].map((step, index) => (
                <div key={step} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-muted text-sm">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{step}</span>
                  </div>
                  <Badge className={index < 2 ? "bg-secondary" : ""}>
                    {index < 2 ? "Ready" : "Locked"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Question selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Difficulty b</span>
              <span className="font-medium">0.38</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Rasch P(correct)</span>
              <span className="font-medium">0.51</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Exposure control</span>
              <span className="font-medium">Unused</span>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
