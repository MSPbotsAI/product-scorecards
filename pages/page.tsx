import { useEffect, useState } from "react";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Spinner } from "@mspbots/ui";

export const meta = {
  label: "Scorecard",
  icon: "Gauge",
  order: 1,
  menu: true,
  description: "EOS weekly scorecard for the MSPbots product team — reviewed in the Product-Platform L10.",
};

interface Health {
  app: string;
  version: string;
  time: string;
}

export default function Home() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    $fetch("/api/health")
      .then((res) => res.json())
      .then(setHealth)
      .catch((err) => setError(err instanceof Error ? err.message : "request failed"));
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Hello, Product Team 👋</CardTitle>
            <Badge variant={health ? "default" : error ? "destructive" : "secondary"}>
              {health ? "backend connected" : error ? "backend error" : "connecting…"}
            </Badge>
          </div>
          <CardDescription>
            Product Team Scorecards — deployment skeleton. The weekly red/yellow/green scorecard
            (per-owner views, product cards, L10 mode) will be built here against{" "}
            <code>scorecard/metrics.yaml</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {health ? (
            <dl className="grid grid-cols-3 gap-2 text-sm">
              <dt className="text-muted-foreground">App</dt>
              <dd className="col-span-2 font-mono">{health.app}</dd>
              <dt className="text-muted-foreground">Version</dt>
              <dd className="col-span-2 font-mono">{health.version}</dd>
              <dt className="text-muted-foreground">Server time</dt>
              <dd className="col-span-2 font-mono">{health.time}</dd>
            </dl>
          ) : error ? (
            <p className="font-mono text-xs text-destructive">{error}</p>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner /> Checking backend…
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
