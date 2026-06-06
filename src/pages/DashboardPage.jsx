import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import DashboardCharts from '../components/DashboardCharts';
import PredictionCard from '../components/PredictionCard';
import api from '../api/axios';
import { motion } from 'framer-motion';

const DashboardPage = () => {
  const [data, setData] = useState({
    summary: null,
    dailyWaste: [],
    categoryDist: [],
    topDishes: [],
    heatmap: [],
    feedbackRatings: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          summaryRes,
          trendsRes,
          categoryRes,
          topRes,
          heatmapRes,
          feedbackRes
        ] = await Promise.all([
          api.get('/stats/summary'),
          api.get('/stats/daily-trends'),
          api.get('/stats/category-distribution'),
          api.get('/stats/top-wasted'),
          api.get('/stats/weekly-heatmap'),
          api.get('/feedback/avg-ratings', { params: { days: 7 } })
        ]);

        setData({
          summary: summaryRes.data,
          dailyWaste: trendsRes.data,
          categoryDist: categoryRes.data,
          topDishes: topRes.data,
          heatmap: heatmapRes.data,
          feedbackRatings: feedbackRes.data
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <DashboardLayout summary={data.summary}>
      {loading ? (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-slate-800/40 rounded-2xl h-80 animate-pulse border border-slate-700/50" />
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <motion.div variants={itemVariants}>
            <DashboardCharts
              dailyWaste={data.dailyWaste}
              categoryDistribution={data.categoryDist}
              topWastedDishes={data.topDishes}
              averageWasteByDay={data.heatmap}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PredictionCard />
            
            {/* Feedback Summary */}
            {data.feedbackRatings && (
              <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg hover:bg-slate-800/50 transition-colors duration-300">
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-white tracking-tight">Student Feedback (7 Days)</h3>
                  <p className="text-sm text-slate-400 mt-1">Average ratings out of 5</p>
                </div>
                <div className="space-y-4">
                  {data.feedbackRatings.byMeal?.map((meal) => (
                    <div key={meal.mealType} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-700/40">
                      <div>
                        <span className="text-sm font-semibold text-white capitalize">{meal.mealType}</span>
                        <p className="text-xs text-slate-500 mt-0.5">{meal.totalResponses} responses</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="text-center">
                          <p className="text-xs text-slate-500 mb-1">Quality</p>
                          <span className="text-sm font-bold text-amber-400 flex items-center gap-1">
                            ★ {meal.avgQuality}
                          </span>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-500 mb-1">Portion</p>
                          <span className="text-sm font-bold text-blue-400 flex items-center gap-1">
                            ★ {meal.avgPortion}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </DashboardLayout>
  );
};

export default DashboardPage;
