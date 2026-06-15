import { CheckCircle2, ChevronRight, RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const choices = [
  { key: "A", text: "1/2" },
  { key: "B", text: "2/3" },
  { key: "C", text: "3/4" },
  { key: "D", text: "4/5" },
];

export default function AssessmentsPage() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-semibold">Active assessment</h1>
            <p className="text-sm text-muted-foreground">Equivalent fractions</p>
          </div>
          <Badge className="bg-secondary text-secondary-foreground">Question 6</Badge>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Which fraction is equivalent to 6/8?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {choices.map((choice) => (
              <button
                key={choice.key}
                className="flex w-full items-center gap-3 rounded-md border px-3 py-3 text-left text-sm hover:border-primary hover:bg-muted"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-muted font-medium">
                  {choice.key}
                </span>
                {choice.text}
              </button>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline">
                <RotateCcw className="h-4 w-4" />
                Backtrack
              </Button>
              <Button>
                Submit
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>State</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">BKT mastery</span>
              <span className="font-medium">0.78</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Topic theta</span>
              <span className="font-medium">0.42</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Standard error</span>
              <span className="font-medium">0.71</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent responses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {["Correct", "Correct", "Review"].map((item, index) => (
              <div key={`${item}-${index}`} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
