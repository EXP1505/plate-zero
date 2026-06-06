import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';

// Import mock data as fallbacks
import {
  dailyWaste as mockDailyWaste,
  categoryDistribution as mockCategoryDist,
  topWastedDishes as mockTopDishes,
  averageWasteByDay as mockHeatmap,
} from '../mockData';

const PIE_COLORS = ['#10b981', '#8b5cf6', '#3b82f6', '#f43f5e'];

const DashboardCharts = ({
  dailyWaste,
  categoryDistribution,
  topWastedDishes,
  averageWasteByDay,
}) => {
  // Use props if provided, otherwise fall back to mock data
  const chartDailyWaste = dailyWaste?.length ? dailyWaste : mockDailyWaste;
  const chartCategoryDist = categoryDistribution?.length ? categoryDistribution : mockCategoryDist;
  const chartTopDishes = topWastedDishes?.length ? topWastedDishes : mockTopDishes;
  const chartHeatmap = averageWasteByDay?.length ? averageWasteByDay : mockHeatmap;

  // Custom tooltip styling for dark mode
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/90 backdrop-blur-md p-4 border border-slate-700 shadow-xl rounded-xl">
          <p className="text-sm font-medium text-slate-300 mb-1">{label}</p>
          <p className="text-lg text-emerald-400 font-bold drop-shadow-sm">
            {`${payload[0].value} kg`}
          </p>
        </div>
      );
    }
    return null;
  };

  const BarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/90 backdrop-blur-md p-3 border border-slate-700 shadow-xl rounded-xl">
          <p className="text-sm font-medium text-slate-300">{label}</p>
          <p className="text-sm text-indigo-400 font-bold mt-1">
            {`${payload[0].value} kg`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Helper for Heatmap Intensity (Dark mode compatible)
  const maxAvgWaste = Math.max(...chartHeatmap.map(d => d.avgWasteKg));
  const getIntensityClass = (value) => {
    const ratio = value / maxAvgWaste;
    if (ratio > 0.9) return 'bg-rose-500/90 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)] border border-rose-400/50';
    if (ratio > 0.75) return 'bg-rose-500/60 text-white border border-rose-400/30';
    if (ratio > 0.6) return 'bg-rose-500/30 text-rose-200 border border-rose-400/20';
    return 'bg-slate-800/50 text-slate-400 border border-slate-700/50';
  };

  return (
    <div className="space-y-6">

      {/* Top Row: Line Chart & Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Line Chart */}
        <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg lg:col-span-2 hover:bg-slate-800/50 transition-colors duration-300">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white tracking-tight">Daily Waste Trends</h3>
            <p className="text-sm text-slate-400 mt-1">Total food waste volume over the last 7 days</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartDailyWaste} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                  tickFormatter={(val) => {
                    const date = new Date(val);
                    return `${date.getMonth()+1}/${date.getDate()}`;
                  }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area
                  type="monotone"
                  dataKey="wasteKg"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorWaste)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981', filter: 'drop-shadow(0px 0px 4px rgba(16, 185, 129, 0.8))' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg flex flex-col hover:bg-slate-800/50 transition-colors duration-300">
          <div className="mb-2">
            <h3 className="text-lg font-bold text-white tracking-tight">Waste by Category</h3>
            <p className="text-sm text-slate-400 mt-1">Distribution of food types</p>
          </div>
          <div className="flex-1 h-64 relative mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartCategoryDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="wasteKg"
                  stroke="none"
                >
                  {chartCategoryDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value} kg`}
                  contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', backdropFilter: 'blur(8px)', borderRadius: '12px', border: '1px solid #334155', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc', fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label for Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none drop-shadow-md">
              <span className="text-3xl font-bold text-white">
                {chartCategoryDist.reduce((sum, item) => sum + item.wasteKg, 0).toFixed(1)}
              </span>
              <span className="text-xs text-slate-400 uppercase font-bold tracking-widest mt-1">Total kg</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-6">
            {chartCategoryDist.map((item, idx) => (
              <div key={item.category} className="flex items-center gap-3 bg-slate-800/50 p-2 rounded-lg border border-slate-700/30">
                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: PIE_COLORS[idx], boxShadow: `0 0 8px ${PIE_COLORS[idx]}80` }} />
                <span className="text-xs text-slate-300 font-semibold tracking-wide">{item.category}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Row: Bar Chart & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Bar Chart */}
        <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg hover:bg-slate-800/50 transition-colors duration-300">
          <div className="mb-8">
            <h3 className="text-lg font-bold text-white tracking-tight">Top Wasted Dishes</h3>
            <p className="text-sm text-slate-400 mt-1">Highest volume items discarded</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartTopDishes}
                layout="vertical"
                margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorBar" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" opacity={0.5} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#cbd5e1', fontSize: 13, fontWeight: 500 }}
                  width={130}
                  dx={-10}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(51, 65, 85, 0.4)' }} />
                <Bar
                  dataKey="wasteKg"
                  fill="url(#colorBar)"
                  radius={[0, 6, 6, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Heatmap (Custom Grid) */}
        <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg hover:bg-slate-800/50 transition-colors duration-300">
          <div className="mb-8">
            <h3 className="text-lg font-bold text-white tracking-tight">Waste Intensity by Day</h3>
            <p className="text-sm text-slate-400 mt-1">Average historical volume mapped by weekday</p>
          </div>

          <div className="grid grid-cols-7 gap-3 sm:gap-4 h-56 content-center px-2">
            {chartHeatmap.map((item) => (
              <div key={item.day} className="flex flex-col items-center gap-3">
                {/* Heatmap Block */}
                <div
                  className={`
                    w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer
                    ${getIntensityClass(item.avgWasteKg)}
                  `}
                  title={`${item.day}: ${item.avgWasteKg}kg`}
                >
                  <span className="font-bold text-sm lg:text-base tracking-tighter">
                    {Math.round(item.avgWasteKg)}
                  </span>
                </div>
                {/* Day Label */}
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  {item.day.slice(0, 3)}
                </span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-700/50 text-xs font-medium text-slate-400">
            <span>Low</span>
            <div className="flex gap-1.5">
              <div className="w-4 h-4 rounded-[4px] bg-slate-800/50 border border-slate-700/50" />
              <div className="w-4 h-4 rounded-[4px] bg-rose-500/30 border border-rose-400/20" />
              <div className="w-4 h-4 rounded-[4px] bg-rose-500/60 border border-rose-400/30" />
              <div className="w-4 h-4 rounded-[4px] bg-rose-500/90 border border-rose-400/50" />
            </div>
            <span>High</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardCharts;
