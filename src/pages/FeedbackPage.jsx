import React, { useState } from 'react';
import { MessageCircle, Star, Send, CheckCircle, Leaf } from 'lucide-react';
import api from '../api/axios';

const FeedbackPage = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    mealType: 'lunch',
    qualityRating: 0,
    portionRating: 0,
    comment: '',
    studentName: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.qualityRating === 0 || formData.portionRating === 0) {
      setError('Please provide both ratings');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      await api.post('/feedback', formData);
      setSuccess(true);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        mealType: 'lunch',
        qualityRating: 0,
        portionRating: 0,
        comment: '',
        studentName: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ label, value, onChange, color = 'text-amber-400' }) => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-2xl transition-all duration-200 hover:scale-125 ${
              star <= value ? color : 'text-slate-700 hover:text-slate-500'
            }`}
          >
            ★
          </button>
        ))}
        {value > 0 && (
          <span className="text-sm text-slate-500 ml-2 self-center">{value}/5</span>
        )}
      </div>
    </div>
  );

  if (success) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-[30%] -left-[15%] w-[60%] h-[60%] rounded-full bg-emerald-500/8 blur-[150px]" />
          <div className="absolute top-[50%] -right-[15%] w-[50%] h-[60%] rounded-full bg-blue-500/8 blur-[150px]" />
        </div>
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/15 mb-6">
            <CheckCircle size={40} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
          <p className="text-slate-400 mb-6">Your feedback helps us reduce food waste and improve meal quality.</p>
          <button
            onClick={() => setSuccess(false)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:from-emerald-400 hover:to-teal-500 transition-all duration-300 shadow-lg shadow-emerald-500/20"
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient effects */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[30%] -left-[15%] w-[60%] h-[60%] rounded-full bg-emerald-500/8 blur-[150px]" />
        <div className="absolute top-[50%] -right-[15%] w-[50%] h-[60%] rounded-full bg-blue-500/8 blur-[150px]" />
      </div>

      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white font-bold text-xl shadow-lg shadow-emerald-500/25 mb-3">
            <Leaf size={26} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">PlateZero</h1>
          <p className="text-slate-400 mt-1 text-sm">Meal Feedback Form</p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/60 p-6 sm:p-8 shadow-2xl shadow-black/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <MessageCircle size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Rate Your Meal</h2>
              <p className="text-sm text-slate-400">Help us serve you better</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Your Name (optional)</label>
              <input
                type="text"
                value={formData.studentName}
                onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                placeholder="Anonymous if left blank"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all [color-scheme:dark]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Meal</label>
                <select
                  value={formData.mealType}
                  onChange={(e) => setFormData(prev => ({ ...prev, mealType: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                >
                  <option value="breakfast">🌅 Breakfast</option>
                  <option value="lunch">☀️ Lunch</option>
                  <option value="dinner">🌙 Dinner</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 rounded-xl bg-slate-900/30 border border-slate-700/40">
              <StarRating
                label="Food Quality"
                value={formData.qualityRating}
                onChange={(val) => setFormData(prev => ({ ...prev, qualityRating: val }))}
                color="text-amber-400"
              />
              <StarRating
                label="Portion Size"
                value={formData.portionRating}
                onChange={(val) => setFormData(prev => ({ ...prev, portionRating: val }))}
                color="text-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Comments (optional)</label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/60 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none"
                rows={3}
                placeholder="Any suggestions or comments about today's meal..."
                maxLength={500}
              />
              <p className="text-xs text-slate-600 mt-1 text-right">{formData.comment.length}/500</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:from-emerald-400 hover:to-teal-500 transition-all duration-300 shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={16} />
                  Submit Feedback
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
