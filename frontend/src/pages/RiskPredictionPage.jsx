import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ThermometerSun,
  Droplets,
  CloudRain,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Cpu,
  History,
  Info
} from 'lucide-react';
import api from '../services/api';
import { useFarms } from '../context/FarmContext';

export default function RiskPredictionPage() {
  const { farms, selectedFarmId } = useFarms();

  const [formData, setFormData] = useState({
    farm_id: selectedFarmId || '',
    temperature: '31.5',
    humidity: '84.0',
    rainfall: '28.0',
    soil_moisture: '72.0',
    soil_ph: '6.5',
    crop_age: '160',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (selectedFarmId) {
      setFormData(prev => ({ ...prev, farm_id: selectedFarmId }));
    }
  }, [selectedFarmId]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/risk/history');
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!formData.farm_id) {
      setError('Please select a farm plot.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      farm_id: Number(formData.farm_id),
      temperature: parseFloat(formData.temperature),
      humidity: parseFloat(formData.humidity),
      rainfall: parseFloat(formData.rainfall),
      soil_moisture: parseFloat(formData.soil_moisture),
      soil_ph: parseFloat(formData.soil_ph),
      crop_age: parseInt(formData.crop_age, 10),
    };

    try {
      const res = await api.post('/risk/predict', payload);
      setPrediction(res.data);
      fetchHistory();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to execute risk model.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (level) => {
    if (level === 'High Risk') return 'bg-red-100 text-red-800 border-red-200';
    if (level === 'Medium Risk') return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b]">
          AI Disease Risk Prediction
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Random Forest model forecasting foliar pathogen outbreak probability from microclimate factors
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Parameters Form (Left 5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-600" />
              Microclimate Vectors
            </h2>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Scikit-Learn ML
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handlePredict} className="space-y-4">
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
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Humidity (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  value={formData.humidity}
                  onChange={(e) => setFormData({ ...formData, humidity: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Rainfall (mm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={formData.rainfall}
                  onChange={(e) => setFormData({ ...formData, rainfall: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Soil Moisture (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  value={formData.soil_moisture}
                  onChange={(e) => setFormData({ ...formData, soil_moisture: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Soil pH
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="3"
                  max="10"
                  required
                  value={formData.soil_ph}
                  onChange={(e) => setFormData({ ...formData, soil_ph: e.target.value })}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#064e3b] to-emerald-700 hover:from-[#043d2e] hover:to-emerald-800 shadow-md shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 text-emerald-300" />
                  <span>Execute Random Forest Prediction</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results & Explanation (Right 7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">
              Risk Evaluation Output
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">
              Persisted in Database
            </span>
          </div>

          {prediction ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Top Banner with Model Used */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className={`px-3 py-1 rounded-xl text-xs font-extrabold border ${getRiskBadge(prediction.risk_level)}`}>
                    {prediction.risk_level}
                  </span>
                  <div className="text-xs text-slate-500 font-medium mt-2">
                    Plot: <b className="text-slate-800">{prediction.farm_name}</b>
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6">
                  <div className="text-2xl font-extrabold text-[#064e3b]">
                    {prediction.risk_score}%
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Risk Probability
                  </div>
                </div>
              </div>

              {/* Active Model Transparency pill */}
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-900">
                <Cpu className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  <b>Engine:</b> {prediction.model_used}
                </span>
              </div>

              {/* Explanation */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pathology Risk Assessment
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {prediction.risk_explanation}
                </p>
              </div>

              {/* Contributing Factors */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Contributing Environmental Parameters
                </div>
                <div className="space-y-2">
                  {prediction.contributing_factors.map((factor, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-800">
                          {factor.parameter}: <span className="text-emerald-700 font-semibold">{factor.value}</span>
                        </div>
                        <div className="text-slate-500 mt-0.5">{factor.detail}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        factor.impact.includes('High') ? 'bg-red-100 text-red-700' :
                        factor.impact.includes('Moderate') ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {factor.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-emerald-600" />
                  Preventive Agronomic Recommendations
                </div>
                <ul className="space-y-1.5">
                  {prediction.suggestions.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-emerald-950 font-medium bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-200/60">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
              <ShieldAlert className="w-12 h-12 text-slate-200" />
              <div>
                <p className="text-sm font-bold text-slate-700">Awaiting Simulation</p>
                <p className="text-xs text-slate-400 max-w-xs mt-0.5">
                  Configure your weather and moisture variables on the left to compute real-time disease risk.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prediction History Table */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Risk Prediction Audit Trail
            </h2>
            <p className="text-xs text-slate-500">
              Past Random Forest outputs and parameter records
            </p>
          </div>
          <button onClick={fetchHistory} className="text-xs font-bold text-emerald-700 hover:underline">
            Refresh
          </button>
        </div>

        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Farm</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Temp / Humidity</th>
                  <th className="py-3 px-4">Soil Moisture</th>
                  <th className="py-3 px-4">Model Used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">{h.created_at?.split('T')[0]}</td>
                    <td className="py-3 px-4 text-emerald-800 font-semibold">{h.farm_name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRiskBadge(h.risk_level)}`}>
                        {h.risk_level}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">{h.risk_score}%</td>
                    <td className="py-3 px-4">{h.temperature}°C / {h.humidity}%</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{h.soil_moisture}%</td>
                    <td className="py-3 px-4 text-slate-500 truncate max-w-xs">{h.model_used}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs">
            {loadingHistory ? 'Loading history...' : 'No past risk predictions found.'}
          </div>
        )}
      </div>
    </div>
  );
}
