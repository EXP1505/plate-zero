import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { FileText, Download, Calendar, TrendingDown, Users, BarChart3 } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area
} from 'recharts';
import api from '../api/axios';

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [trends, setTrends] = useState([]);
  const [entries, setEntries] = useState([]);
  const [feedbackData, setFeedbackData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const days = Math.ceil((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24));

      const [trendsRes, entriesRes, fbRes] = await Promise.allSettled([
        api.get('/stats/daily-trends', { params: { days: Math.max(days, 7) } }),
        api.get('/waste', { params: { startDate: dateRange.startDate, endDate: dateRange.endDate, limit: 100 } }),
        api.get('/feedback/avg-ratings', { params: { days: Math.max(days, 7) } }),
      ]);

      if (trendsRes.status === 'fulfilled') setTrends(trendsRes.value.data);
      if (entriesRes.status === 'fulfilled') setEntries(entriesRes.value.data.entries || []);
      if (fbRes.status === 'fulfilled') setFeedbackData(fbRes.value.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // Compute summary stats
  const totalWaste = entries.reduce((sum, e) => sum + (e.totalWastedKg || 0), 0);
  const totalPrepared = entries.reduce((sum, e) => sum + (e.totalPreparedKg || 0), 0);
  const avgWastePercentage = totalPrepared > 0 ? ((totalWaste / totalPrepared) * 100).toFixed(1) : 0;
  const totalStudents = entries.reduce((sum, e) => sum + (e.studentsServed || 0), 0);
  const avgWastePerStudent = totalStudents > 0 ? (totalWaste / totalStudents * 1000).toFixed(0) : 0; // grams

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/90 backdrop-blur-md p-3 border border-slate-700 shadow-xl rounded-xl">
          <p className="text-sm font-medium text-slate-300 mb-1">{label}</p>
          {payload.map((entry, idx) => (
            <p key={idx} className="text-sm font-bold" style={{ color: entry.color }}>
              {entry.name}: {entry.value} {entry.name.includes('kg') || entry.name === 'Wasted' || entry.name === 'Prepared' ? 'kg' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              <FileText size={24} className="text-blue-400" />
              Reports & Analytics
            </h2>
            <p className="text-slate-400 mt-1 text-sm">Detailed waste analysis and trends</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-700/60 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all [color-scheme:dark]"
              />
              <span className="text-slate-500">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-700/60 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="bg-slate-800/40 rounded-2xl h-28 animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Waste', value: `${totalWaste.toFixed(1)} kg`, icon: TrendingDown, color: 'text-rose-400', bg: 'bg-rose-500/10' },
                { label: 'Avg Waste %', value: `${avgWastePercentage}%`, icon: BarChart3, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { label: 'Total Meals Served', value: totalStudents.toLocaleString(), icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: 'Waste / Student', value: `${avgWastePerStudent}g`, icon: Calendar, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/60">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} mb-3`}>
                    <stat.icon size={20} />
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Prepared vs Wasted Trend */}
            <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white tracking-tight">Prepared vs Wasted</h3>
                <p className="text-sm text-slate-400 mt-1">Daily comparison of food prepared and wasted</p>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPrepared" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorWasted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickFormatter={(val) => {
                        const d = new Date(val);
                        return `${d.getMonth()+1}/${d.getDate()}`;
                      }}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="preparedKg" name="Prepared" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPrepared)" />
                    <Area type="monotone" dataKey="wasteKg" name="Wasted" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorWasted)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Feedback Correlation */}
            {feedbackData && feedbackData.byMeal?.length > 0 && (
              <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white tracking-tight">Feedback vs Waste Correlation</h3>
                  <p className="text-sm text-slate-400 mt-1">How student ratings relate to waste levels</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {feedbackData.byMeal.map((meal) => (
                    <div key={meal.mealType} className="p-4 rounded-xl bg-slate-900/40 border border-slate-700/40">
                      <p className="text-sm font-semibold text-white capitalize mb-3">{meal.mealType}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">Quality</span>
                          <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map(s => (
                              <span key={s} className={`text-xs ${s <= Math.round(meal.avgQuality) ? 'text-amber-400' : 'text-slate-700'}`}>★</span>
                            ))}
                            <span className="text-sm font-bold text-amber-400 ml-1">{meal.avgQuality}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">Portion</span>
                          <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map(s => (
                              <span key={s} className={`text-xs ${s <= Math.round(meal.avgPortion) ? 'text-blue-400' : 'text-slate-700'}`}>★</span>
                            ))}
                            <span className="text-sm font-bold text-blue-400 ml-1">{meal.avgPortion}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-slate-700/40">
                          <span className="text-xs text-slate-500">Responses</span>
                          <span className="text-sm font-medium text-slate-300">{meal.totalResponses}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Entries Detail Table */}
            <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
              <h3 className="text-lg font-bold text-white tracking-tight mb-4">Detailed Entries</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                      <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase">Meal</th>
                      <th className="text-right py-3 px-3 text-xs font-semibold text-slate-500 uppercase">Students</th>
                      <th className="text-right py-3 px-3 text-xs font-semibold text-slate-500 uppercase">Items</th>
                      <th className="text-right py-3 px-3 text-xs font-semibold text-slate-500 uppercase">Prepared</th>
                      <th className="text-right py-3 px-3 text-xs font-semibold text-slate-500 uppercase">Wasted</th>
                      <th className="text-right py-3 px-3 text-xs font-semibold text-slate-500 uppercase">Waste %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.slice(0, 20).map((entry) => (
                      <tr key={entry._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-3 text-slate-300">{new Date(entry.date).toLocaleDateString()}</td>
                        <td className="py-3 px-3">
                          <span className="capitalize text-slate-300 px-2 py-1 rounded-lg bg-slate-800/60 text-xs font-medium">{entry.mealType}</span>
                        </td>
                        <td className="py-3 px-3 text-right text-slate-400">{entry.studentsServed}</td>
                        <td className="py-3 px-3 text-right text-slate-400">{entry.items?.length || 0}</td>
                        <td className="py-3 px-3 text-right text-slate-300">{entry.totalPreparedKg?.toFixed(1)} kg</td>
                        <td className="py-3 px-3 text-right text-rose-400 font-medium">{entry.totalWastedKg?.toFixed(1)} kg</td>
                        <td className="py-3 px-3 text-right">
                          <span className={`font-medium ${entry.wastePercentage > 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {entry.wastePercentage?.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {entries.length > 20 && (
                  <p className="text-xs text-slate-500 text-center mt-3">Showing 20 of {entries.length} entries</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
