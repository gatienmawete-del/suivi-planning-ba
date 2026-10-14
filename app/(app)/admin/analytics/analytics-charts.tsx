"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AnalyticsCharts({
  weeklyData,
  projectData,
  topBas,
}: {
  weeklyData: Array<{ week: string; Total: number; Terminés: number; Bloqués: number; Bench: number }>;
  projectData: Array<{ name: string; count: number; color: string }>;
  topBas: Array<{ name: string; count: number; color: string }>;
}) {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Évolution hebdomadaire des livrables</CardTitle>
          <CardDescription>Volume total, terminés et bloqués par semaine</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
              <XAxis dataKey="week" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--popover))",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="Total" stroke="#64748b" strokeWidth={2} />
              <Line type="monotone" dataKey="Terminés" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="Bloqués" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top projets par activité</CardTitle>
            <CardDescription>Nombre de livrables par projet</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
                <XAxis type="number" fontSize={12} />
                <YAxis dataKey="name" type="category" fontSize={11} width={110} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--popover))",
                  }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {projectData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top BAs — livrables terminés</CardTitle>
            <CardDescription>Classement par volume de livrables bouclés</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topBas} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
                <XAxis type="number" fontSize={12} />
                <YAxis dataKey="name" type="category" fontSize={11} width={120} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--popover))",
                  }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {topBas.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Taux de bench moyen par semaine</CardTitle>
          <CardDescription>Entre 0 (plein) et 1 (inoccupé)</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
              <XAxis dataKey="week" fontSize={12} />
              <YAxis fontSize={12} domain={[0, 1]} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--popover))",
                }}
              />
              <Line type="monotone" dataKey="Bench" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
