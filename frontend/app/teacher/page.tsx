import { BarChart3, FilePlus2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const rows = [
  ["Ari Chen", "Fractions", "0.67", "0.31"],
  ["Maya Rao", "Linear equations", "0.84", "0.78"],
  ["Noah Smith", "Ratios", "0.58", "-0.12"],
];

export default function TeacherPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold">Teacher portal</h1>
          <p className="text-sm text-muted-foreground">Assigned students and assessment authoring</p>
        </div>
        <Button>
          <FilePlus2 className="h-4 w-4" />
          Add question
        </Button>
      </div>
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Students", "32", Users],
          ["Active sessions", "11", BarChart3],
          ["Questions", "248", FilePlus2],
        ].map(([label, value, Icon]) => (
          <Card key={label as string}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>{label as string}</CardTitle>
              <Icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{value as string}</CardContent>
          </Card>
        ))}
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Student progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2 font-medium">Student</th>
                  <th className="py-2 font-medium">Topic</th>
                  <th className="py-2 font-medium">Mastery</th>
                  <th className="py-2 font-medium">Theta</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row[0]} className="border-b last:border-0">
                    {row.map((cell) => (
                      <td key={cell} className="py-3">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
