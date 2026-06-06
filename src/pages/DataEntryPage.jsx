import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Plus, Trash2, Save, CheckCircle, ClipboardList } from 'lucide-react';
import api from '../api/axios';

const categories = [
  { value: 'grains', label: 'Grains', emoji: '🌾' },
  { value: 'vegetables', label: 'Vegetables', emoji: '🥬' },
  { value: 'protein', label: 'Protein', emoji: '🍗' },
  { value: 'dairy', label: 'Dairy', emoji: '🥛' },
];

const emptyItem = { dishName: '', category: 'grains', preparedKg: '', wastedKg: '' };

const DataEntryPage = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    mealType: 'lunch',
    studentsServed: '',
    items: [{ ...emptyItem }],
  });
  const [recentEntries, setRecentEntries] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecent();
  }, []);

  const fetchRecent = async () => {
    try {
      const { data } = await api.get('/waste', { params: { limit: 10 } });
      setRecentEntries(data.entries || []);
    } catch (err) {
      console.error('Failed to fetch recent entries');
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({ ...prev, items: [...prev.items, { ...emptyItem }] }));
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const totalPrepared = formData.items.reduce((sum, item) => sum + (parseFloat(item.preparedKg) || 0), 0);
  const totalWasted = formData.items.reduce((sum, item) => sum + (parseFloat(item.wastedKg) || 0), 0);
  const wastePercentage = totalPrepared > 0 ? ((totalWasted / totalPrepared) * 100).toFixed(1) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const payload = {
        ...formData,
        studentsServed: parseInt(formData.studentsServed),
        items: formData.items.map(item => ({
          ...item,
          preparedKg: parseFloat(item.preparedKg),
          wastedKg: parseFloat(item.wastedKg),
        })),
      };

      await api.post('/waste', payload);
      setSuccess(true);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        mealType: 'lunch',
        studentsServed: '',
        items: [{ ...emptyItem }],
      });
      fetchRecent();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/waste/${id}`);
      fetchRecent();
    } catch (err) {
      console.error('Delete failed');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <ClipboardList size={24} className="text-emerald-400" />
            Data Entry
          </h2>
          <p className="text-slate-400 mt-1 text-sm">Log daily food waste records for the campus mess</p>
        </div>

        {/* Success Banner */}
        {success && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium flex items-center gap-2 animate-fadeIn">
            <CheckCircle size={18} />
            Entry submitted successfully!
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Entry Form */}
        <form onSubmit={handleSubmit} className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/60 p-6 shadow-lg">
          {/* Top Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Meal Type</label>
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
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Students Served</label>
              <input
                type="number"
                value={formData.studentsServed}
                onChange={(e) => setFormData(prev => ({ ...prev, studentsServed: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                placeholder="e.g. 300"
                min="0"
                required
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-300">Menu Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-500/10"
              >
                <Plus size={14} /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              {/* Header */}
              <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span className="col-span-4">Dish Name</span>
                <span className="col-span-3">Category</span>
                <span className="col-span-2">Prepared (kg)</span>
                <span className="col-span-2">Wasted (kg)</span>
                <span className="col-span-1"></span>
              </div>

              {formData.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 rounded-xl bg-slate-900/30 border border-slate-700/40">
                  <input
                    type="text"
                    value={item.dishName}
                    onChange={(e) => handleItemChange(idx, 'dishName', e.target.value)}
                    className="sm:col-span-4 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all"
                    placeholder="e.g. Rice, Dal Tadka"
                    required
                  />
                  <select
                    value={item.category}
                    onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
                    className="sm:col-span-3 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.emoji} {cat.label}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={item.preparedKg}
                    onChange={(e) => handleItemChange(idx, 'preparedKg', e.target.value)}
                    className="sm:col-span-2 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all"
                    placeholder="kg"
                    step="0.1"
                    min="0"
                    required
                  />
                  <input
                    type="number"
                    value={item.wastedKg}
                    onChange={(e) => handleItemChange(idx, 'wastedKg', e.target.value)}
                    className="sm:col-span-2 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all"
                    placeholder="kg"
                    step="0.1"
                    min="0"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="sm:col-span-1 flex items-center justify-center text-slate-500 hover:text-rose-400 transition-colors disabled:opacity-30"
                    disabled={formData.items.length <= 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-700/40 mb-6">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-xs text-slate-500">Total Prepared</span>
                <p className="text-lg font-bold text-white">{totalPrepared.toFixed(1)} kg</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Total Wasted</span>
                <p className="text-lg font-bold text-rose-400">{totalWasted.toFixed(1)} kg</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Waste %</span>
                <p className={`text-lg font-bold ${parseFloat(wastePercentage) > 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {wastePercentage}%
                </p>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:from-emerald-400 hover:to-teal-500 transition-all duration-300 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {submitting ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </form>

        {/* Recent Entries */}
        {recentEntries.length > 0 && (
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/60 p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white tracking-tight mb-4">Recent Entries</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Meal</th>
                    <th className="text-right py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Students</th>
                    <th className="text-right py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Prepared</th>
                    <th className="text-right py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Wasted</th>
                    <th className="text-right py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Waste %</th>
                    <th className="py-3 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {recentEntries.map((entry) => (
                    <tr key={entry._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 text-slate-300">{new Date(entry.date).toLocaleDateString()}</td>
                      <td className="py-3 px-3">
                        <span className="capitalize text-slate-300 px-2 py-1 rounded-lg bg-slate-800/60 text-xs font-medium">
                          {entry.mealType}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-400">{entry.studentsServed}</td>
                      <td className="py-3 px-3 text-right text-slate-300">{entry.totalPreparedKg?.toFixed(1)} kg</td>
                      <td className="py-3 px-3 text-right text-rose-400 font-medium">{entry.totalWastedKg?.toFixed(1)} kg</td>
                      <td className="py-3 px-3 text-right">
                        <span className={`font-medium ${entry.wastePercentage > 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {entry.wastePercentage?.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDelete(entry._id)}
                          className="text-slate-600 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DataEntryPage;
