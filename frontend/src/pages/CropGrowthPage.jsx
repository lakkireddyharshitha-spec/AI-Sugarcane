import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Plus,
  Calendar,
  Layers,
  Activity,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  Cpu,
  CheckCircle2,
  Info
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import api from '../services/api';
import { useFarms } from '../context/FarmContext';

export default function CropGrowthPage() {
  const { farms, selectedFarmId } = useFarms();

  const [activeFarmId, setActiveFarmId] = useState(selectedFarmId || '');
  const [observations, setObservations] = useState([]);
  const [trendSummary, setTrendSummary] = useState(null);
  const [lstmStatus, setLstmStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    farm_id: selectedFarmId || '',
    observation_date: new Date().toISOString().split('T')[0],
    crop_age: '120',
    plant_height: '180.0',
    growth_stage: 'Grand Growth',
    leaf_condition: 'Vibrant Green',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const stageOptions = [
    'Germination (0-45 Days)',
    'Tillering (45-120 Days)',
    'Grand Growth (120-270 Days)',
    'Ripening & Maturity (270-360 Days)'
  ];

  const conditionOptions = [
    'Vibrant Green',
    'Slight Yellowing',
    'Spotted / Discolored',
    'Wilting / Water Stressed'
  ];

  useEffect(() => {
    if (selectedFarmId) {
      setActiveFarmId(selectedFarmId);
      setFormData(prev => ({ ...prev, farm_id: selectedFarmId }));
    }
  }, [selectedFarmId]);

  const fetchGrowthData = async () => {
    setLoading(true);
    try {
      const q = activeFarmId ? `?farm_id=${activeFarmId}` : '';
      const obsRes = await api.get(`/growth/${q}`);
      setObservations(obsRes.data);

      if (activeFarmId) {
        const trendRes = await api.get(`/growth/trends/${activeFarmId}`);
        setTrendSummary(trendRes.data.trend_summary);
        setLstmStatus(trendRes.data.lstm_forecast_status);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrowthData();
  }, [activeFarmId]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      farm_id: activeFarmId || farms[0]?.id || '',
      observation_date: new Date().toISOString().split('T')[0],
      crop_age: '120',
      plant_height: '180.0',
      growth_stage: 'Grand Growth',
      leaf_condition: 'Vibrant Green',
      notes: ''
    });
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (obs) => {
    setIsEditing(true);
    setCurrentId(obs.id);
    setFormData({
      farm_id: obs.farm_id,
      observation_date: obs.observation_date,
      crop_age: obs.crop_age.toString(),
      plant_height: obs.plant_height.toString(),
      growth_stage: obs.growth_stage,
      leaf_condition: obs.leaf_condition,
      notes: obs.notes || ''
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.farm_id) {
      setError('Please select a farm plot.');
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      farm_id: Number(formData.farm_id),
      observation_date: formData.observation_date,
      crop_age: parseInt(formData.crop_age, 10),
      plant_height: parseFloat(formData.plant_height),
      growth_stage: formData.growth_stage,
      leaf_condition: formData.leaf_condition,
      notes: formData.notes
    };

    try {
      if (isEditing) {
        await api.put(`/growth/${currentId}`, payload);
      } else {
        await api.post('/growth/', payload);
      }
      setModalOpen(false);
      fetchGrowthData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to save observation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this observation?")) return;
    try {
      await api.delete(`/growth/${id}`);
      fetchGrowthData();
    } catch (err) {
      alert("Failed to delete observation.");
    }
  };

  const chartPoints = trendSummary?.historical_chart_data || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b]">
            Crop Growth & Vegetative Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Log plant elongation, observe growth stages, and track sigmoidal benchmark curves
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.02] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Record Observation
        </button>
      </div>

      {/* Farm filter */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs max-w-sm">
        <span className="text-xs font-bold text-slate-500 uppercase">Farm:</span>
        <select
          value={activeFarmId}
          onChange={(e) => setActiveFarmId(e.target.value)}
          className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-hidden"
        >
          <option value="">All Farms</option>
          {farms.map((f) => (
            <option key={f.id} value={f.id}>{f.farm_name}</option>
          ))}
        </select>
      </div>

      {/* Main Sigmoid Growth Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Sugarcane Height Trajectory vs Sigmoid Benchmark
            </h2>
            <p className="text-xs text-slate-500">
              Comparing observed height (cm) against verified ICAR tropical sugarcane growth model
            </p>
          </div>

          {trendSummary && (
            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                Velocity: {trendSummary.growth_rate_cm_per_day} cm/day
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold">
                {trendSummary.vigor_status}
              </span>
            </div>
          )}
        </div>

        <div className="h-72 w-full pt-4">
          {chartPoints.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartPoints}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="crop_age" stroke="#94a3b8" fontSize={11} label={{ value: 'Age in Days', position: 'insideBottomRight', offset: -5, fontSize: 10 }} />
                <YAxis stroke="#94a3b8" fontSize={11} label={{ value: 'Height (cm)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="actual_height" name="Observed Height (cm)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="ideal_height" name="ICAR Sigmoid Benchmark" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Select a farm with observations to visualize the comparative growth trajectory.
            </div>
          )}
        </div>
      </div>

      {/* LSTM Forecasting Architecture Card */}
      <div className="bg-gradient-to-tr from-[#064e3b] to-emerald-900 rounded-3xl p-6 sm:p-8 text-white space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-base text-white">
              LSTM Sequential Forecasting Integration
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
            Bidirectional RNN
          </span>
        </div>

        <p className="text-xs text-emerald-100/90 leading-relaxed max-w-3xl">
          The crop growth system is configured for time-series forecasting using a 2-layer Bidirectional LSTM architecture (hidden dimension 64). As required for academic and scientific integrity:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-700/50 text-xs space-y-1">
            <div className="font-bold text-emerald-300">Non-Fabrication Policy</div>
            <p className="text-emerald-100/70 text-[11px]">
              Forecasting displays verified physiological sigmoid benchmarks rather than synthetic predictions until farm-specific historical sequences are trained.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-700/50 text-xs space-y-1">
            <div className="font-bold text-emerald-300">Model File Location</div>
            <p className="text-emerald-100/70 text-[11px]">
              Pipeline module ready at <code className="text-emerald-200">ml_models/lstm_growth_model.py</code> with 5-step sequence sliding window.
            </p>
          </div>
        </div>
      </div>

      {/* Observation History Table */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Observation Log History
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            {observations.length} Entries
          </span>
        </div>

        {observations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Farm</th>
                  <th className="py-3 px-4">Crop Age</th>
                  <th className="py-3 px-4">Height</th>
                  <th className="py-3 px-4">Growth Stage</th>
                  <th className="py-3 px-4">Leaf Condition</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {observations.map((obs) => (
                  <tr key={obs.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">{obs.observation_date}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-800">{obs.farm_name}</td>
                    <td className="py-3 px-4">{obs.crop_age} Days</td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">{obs.plant_height} cm</td>
                    <td className="py-3 px-4">{obs.growth_stage}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {obs.leaf_condition}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{obs.notes || '-'}</td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(obs)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                        title="Edit observation"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(obs.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                        title="Delete observation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs">
            {loading ? 'Loading observations...' : 'No observations logged yet.'}
          </div>
        )}
      </div>

      {/* Observation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-xl font-extrabold text-[#064e3b]">
                {isEditing ? 'Edit Observation' : 'Log Crop Observation'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Farm Plot
                </label>
                <select
                  required
                  value={formData.farm_id}
                  onChange={(e) => setFormData({ ...formData, farm_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="">-- Select Farm --</option>
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>{f.farm_name} ({f.sugarcane_variety})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Observation Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.observation_date}
                    onChange={(e) => setFormData({ ...formData, observation_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Crop Age (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="720"
                    required
                    value={formData.crop_age}
                    onChange={(e) => setFormData({ ...formData, crop_age: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Plant Height (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={formData.plant_height}
                    onChange={(e) => setFormData({ ...formData, plant_height: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Growth Stage
                  </label>
                  <select
                    value={formData.growth_stage}
                    onChange={(e) => setFormData({ ...formData, growth_stage: e.target.value })}
                    className="w-full px-2 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    {stageOptions.map(s => (
                      <option key={s} value={s.split(' ')[0]}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Leaf Condition
                </label>
                <select
                  value={formData.leaf_condition}
                  onChange={(e) => setFormData({ ...formData, leaf_condition: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {conditionOptions.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Field Notes (Optional)
                </label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Internode girth expanding, healthy tiller count..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-700/20 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : isEditing ? 'Update Observation' : 'Save Observation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
