"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TrendChart({ trends, showOpenCases = true }: { trends: any, showOpenCases?: boolean }) {
  if (!trends || !trends.byPeriod || trends.byPeriod.length === 0) {
    return <p className="text-slate-400">No resolved data yet.</p>;
  }

  // Simple custom tooltip for glassmorphism
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-4 text-sm bg-slate-900/80 backdrop-blur-md border-slate-700">
          <p className="font-semibold text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex gap-2 items-center mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="capitalize text-slate-200">
                {entry.name.replace('_', ' ')}: {entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={trends.byPeriod}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="name" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          {showOpenCases && (
            <Bar dataKey="open" stackId="a" fill="#f59e0b" radius={[0, 0, 4, 4]} />
          )}
          <Bar dataKey="won" stackId="a" fill="#10b981" />
          <Bar dataKey="lost" stackId="a" fill="#f43f5e" />
          <Bar dataKey="fraud_confirmed" stackId="a" fill="#a855f7" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
