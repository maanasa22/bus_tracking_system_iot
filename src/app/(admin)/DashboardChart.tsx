"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DayData {
  day: string;
  trips: number;
  onTime: number;
}

export function DashboardChart({ data }: { data: DayData[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="tripGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3} />
          </linearGradient>
          <linearGradient id="onTimeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0.3} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis 
          dataKey="day" 
          stroke="#64748b" 
          tick={{ fill: "#94a3b8", fontSize: 12 }} 
          tickLine={false} 
          axisLine={false} 
        />
        <YAxis 
          stroke="#64748b" 
          tick={{ fill: "#94a3b8", fontSize: 12 }} 
          tickLine={false} 
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#f8fafc", borderRadius: "8px" }}
          itemStyle={{ color: "#e2e8f0" }}
          cursor={{ fill: "#1e293b", opacity: 0.4 }}
        />
        <Bar dataKey="trips" name="Total Trips" fill="url(#tripGrad)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="onTime" name="On-Time" fill="url(#onTimeGrad)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
