import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';

const PredictionCard = () => {
  const [prediction, setPrediction] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const response = await api.get('/stats/prediction');
        if (response.data.predictions && response.data.predictions.length > 0) {
          setPrediction(response.data.predictions[0]);
          setModelInfo(response.data.modelInfo);
        } else if (response.data.error) {
          setError(response.data.error);
        }
      } catch (err) {
        setError('Prediction service unavailable');
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg h-full flex flex-col justify-center items-center">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-400">Loading AI prediction...</p>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg h-full flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-3">
          <AlertTriangle className="text-slate-500" />
        </div>
        <h3 className="text-sm font-bold text-white mb-1">Prediction Unavailable</h3>
        <p className="text-xs text-slate-400 max-w-[200px]">{error || 'Could not connect to AI service'}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg h-full relative overflow-hidden group hover:border-emerald-500/30 transition-colors"
    >
      {/* Background glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors" />

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Sparkles className="text-white" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">AI Forecast</h3>
          <p className="text-xs text-slate-400">For {prediction.dayName}, {prediction.date}</p>
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        <div>
          <p className="text-sm text-slate-400 mb-1">Predicted Total Waste</p>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              {prediction.predictedWasteKg}
            </span>
            <span className="text-lg font-bold text-slate-500 mb-1">kg</span>
          </div>
        </div>

        {prediction.topPredictedDish && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50"
          >
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs text-rose-400 font-semibold uppercase tracking-wider">Most At Risk</p>
              <TrendingUp size={14} className="text-rose-400" />
            </div>
            <p className="text-lg font-bold text-white leading-tight mb-1">{prediction.topPredictedDish.name}</p>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-500 capitalize">{prediction.topPredictedDish.category}</span>
              <span className="text-sm font-bold text-rose-400">~{prediction.topPredictedDish.predictedWasteKg} kg</span>
            </div>
          </motion.div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
          <div className="flex items-center gap-1.5 group/tooltip relative cursor-help">
            <Info size={14} className="text-slate-500" />
            <span className="text-xs font-medium text-slate-500">Model Confidence</span>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-900 border border-slate-700 rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-20">
              <p className="text-xs text-slate-400">Trained on {modelInfo?.trainedOn} days of data using Linear Regression & Weighted Averages.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${prediction.confidence}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className={`h-full rounded-full ${
                  prediction.confidence > 75 ? 'bg-emerald-500' : 
                  prediction.confidence > 50 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
              />
            </div>
            <span className="text-xs font-bold text-slate-300">{prediction.confidence}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PredictionCard;
