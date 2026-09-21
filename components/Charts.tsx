"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DUMMY_TOP_COUNTRIES, DUMMY_ISP_DIST, DUMMY_HOURLY_TRAFFIC } from "@/lib/constants";

const PIE_COLORS = ["#06b6d4", "#8b5cf6", "#22d3ee", "#a78bfa", "#34d399", "#f472b6", "#64748b"];

const tooltipStyle = {
  backgroundColor: "hsl(224 40% 8%)",
  border: "1px solid hsl(223 25% 18%)",
  borderRadius: 8,
  fontSize: 12
};

export function TopCountriesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top 10 Negara Pengunjung</CardTitle>
        <CardDescription>Bar chart — data dummy untuk edukasi</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={DUMMY_TOP_COUNTRIES} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(223 25% 18%)" />
            <XAxis dataKey="code" stroke="hsl(215 20% 60%)" fontSize={12} />
            <YAxis stroke="hsl(215 20% 60%)" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(223 30% 14% / 0.5)" }} />
            <Bar dataKey="visits" fill="#06b6d4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ISPDistributionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Distribusi ISP</CardTitle>
        <CardDescription>Pie chart — data dummy untuk edukasi</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={DUMMY_ISP_DIST}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              fontSize={11}
            >
              {DUMMY_ISP_DIST.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function HourlyTrafficChart() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Traffic per Jam (24 jam)</CardTitle>
        <CardDescription>Line chart — pola traffic harian tipikal, data dummy</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={DUMMY_HOURLY_TRAFFIC} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(223 25% 18%)" />
            <XAxis dataKey="hour" stroke="hsl(215 20% 60%)" fontSize={11} interval={2} />
            <YAxis stroke="hsl(215 20% 60%)" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="requests" stroke="#8b5cf6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
