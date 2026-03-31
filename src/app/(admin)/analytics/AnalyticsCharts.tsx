"use client";

import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, Calendar as CalendarIcon, Filter, TrendingUp, Users, Clock, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface MonthlyData {
  month: string;
  trips: number;
  onTime: number;
}

interface HourlyData {
  time: string;
  load: number;
}

interface KPIs {
  totalTrips: number;
  onTimePercent: number;
  avgDailyRidership: number;
  safetyIncidents: number;
}

export function AnalyticsCharts({ 
  monthlyData, 
  hourlyData, 
  kpis 
}: { 
  monthlyData: MonthlyData[]; 
  hourlyData: HourlyData[];
  kpis: KPIs;
}) {
  const [timeRange, setTimeRange] = useState("6M");

  return (
    <div className="space-y-6 animate-fade-in pl-4 pr-4 pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-primary" />
            Performance Analytics
          </h1>
          <p className="text-muted-foreground">Historical data, trend analysis, and comprehensive operational metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#111827] border border-[#1e293b] rounded-lg p-1 flex">
            {["1W", "1M", "3M", "6M", "1Y"].map(range => (
              <button 
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${timeRange === range ? "bg-primary text-white" : "text-slate-400 hover:text-white"}`}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="btn-primary">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 border-l-4 border-l-primary flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Trips (All Time)</p>
            <h3 className="text-2xl font-bold text-white mt-1">{kpis.totalTrips.toLocaleString()}</h3>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-1">
              From database records
            </p>
          </div>
        </div>
        
        <div className="glass-card p-5 border-l-4 border-l-success flex items-start gap-4">
          <div className="p-3 bg-success/10 rounded-xl text-success">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">On-Time Performance</p>
            <h3 className="text-2xl font-bold text-white mt-1">{kpis.onTimePercent}%</h3>
            <p className="text-xs text-success font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" /> Based on completed trips
            </p>
          </div>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-info flex items-start gap-4">
          <div className="p-3 bg-info/10 rounded-xl text-info">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Avg. Daily Ridership</p>
            <h3 className="text-2xl font-bold text-white mt-1">{kpis.avgDailyRidership.toLocaleString()}</h3>
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-1">
              Passengers per day
            </p>
          </div>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-warning flex items-start gap-4">
          <div className="p-3 bg-warning/10 rounded-xl text-warning">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Safety Incidents</p>
            <h3 className="text-2xl font-bold text-white mt-1">{kpis.safetyIncidents}</h3>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-1">
              Speed + SOS alerts
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trip Volume */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Monthly Trip Volume & On-Time Performance</h2>
            <button className="text-muted-foreground hover:text-white p-1 rounded-md hover:bg-[#1e293b] transition-colors">
              <Filter className="h-4 w-4" />
            </button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOnTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" tick={{fill: "#94a3b8", fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tick={{fill: "#94a3b8", fontSize: 12}} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#f8fafc", borderRadius: "8px" }}
                  itemStyle={{ color: "#e2e8f0" }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }}/>
                <Area type="monotone" dataKey="trips" name="Total Scheduled" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTrips)" />
                <Area type="monotone" dataKey="onTime" name="Completed On-Time" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorOnTime)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hourly Utilization */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Peak Hourly Fleet Utilization (%)</h2>
            <button className="text-muted-foreground hover:text-white p-1 rounded-md hover:bg-[#1e293b] transition-colors">
              <CalendarIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{fill: "#94a3b8", fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tick={{fill: "#94a3b8", fontSize: 12}} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#f8fafc", borderRadius: "8px" }}
                  cursor={{fill: "#1e293b", opacity: 0.4}}
                />
                <Bar dataKey="load" name="Fleet Load (%)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
