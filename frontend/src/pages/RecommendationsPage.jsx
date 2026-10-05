import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Droplets,
  Sprout,
  ShieldAlert,
  ThermometerSun,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar
} from 'lucide-react';
import api from '../services/api';
import { useFarms } from '../context/FarmContext';

export default function RecommendationsPage() {
  const { farms, selectedFarmId } = useFarms();

  const [activeFarmId, setActiveFarmId] = useState(selectedFarmId || '');
  const [recommendations, setRecommendations] = useState([]);
  const [farmMeta, setFarmMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedFarmId) setActiveFarmId(selectedFarmId);
  }, [selectedFarmId]);

  const fetchRecs = async () => {
    if (!activeFarmId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/recommendations/${activeFarmId}`);
      setRecommendations(res.data.recommendations);
      setFarmMeta({
        farm_name: res.data.farm_name,
        variety: res.data.sugarcane_variety
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, [activeFarmId]);

  const getCategoryIcon = (cat) => {
    if (cat.includes('Irrigation')) return Droplets;
    if (cat.includes('Crop')) return Sprout;
    if (cat.includes('Disease')) return ShieldAlert;
    return ThermometerSun;
  };

  const getPriorityBadge = (priority) => {
    if (priority === 'Urgent') return 'bg-red-600 text-white';
    if (priority === 'High') return 'bg-amber-100 text-amber-800 border-amber-300';
    if (priority === 'Medium') return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b]">
            AI Agronomic Recommendations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Precision suggestions synthesized directly from your soil moisture, rainfall, crop stage, and scan logs
          </p>
        </div>

        {/* Farm selector */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-xs self-start sm:self-auto">
          <span className="text-xs font-bold text-slate-400">Plot:</span>
          <select
            value={activeFarmId}
            onChange={(e) => setActiveFarmId(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-hidden cursor-pointer"
          >
            {farms.map((f) => (
              <option key={f.id} value={f.id}>{f.farm_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Safety Policy Notice */}
      <div className="p-4 rounded-3xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-950">
        <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Agronomic Safety Notice:</span> CaneGuard AI recommendations focus strictly on irrigation optimization, cultural field sanitation (detrashing, drainage), and certified sett treatment. Unsupported chemical dosages or unverified proprietary treatments are omitted to ensure crop safety.
        </div>
      </div>

      {/* Recommendations Cards */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          Synthesizing farm context and generating recommendations...
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec, i) => {
            const Icon = getCategoryIcon(rec.category);
            return (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100 flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5" />
                      {rec.category}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityBadge(rec.priority)}`}>
                      Priority: {rec.priority}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                    {rec.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {rec.details}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Trigger: <b className="text-slate-600">{rec.source_context || 'General'}</b></span>
                  <span>{farmMeta?.variety || 'Sugarcane'}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-slate-800 text-lg">All parameters optimal</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Log new sensor readings or leaf scans to receive updated real-time guidance.
          </p>
        </div>
      )}
    </div>
  );
}
