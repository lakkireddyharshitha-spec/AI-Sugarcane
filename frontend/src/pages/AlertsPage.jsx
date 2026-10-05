import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Filter,
  ShieldAlert,
  ThermometerSun,
  Sprout,
  CheckCheck
} from 'lucide-react';
import api from '../services/api';
import { useFarms } from '../context/FarmContext';

export default function AlertsPage() {
  const { farms, selectedFarmId } = useFarms();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('unread'); // 'all', 'unread', 'read'
  const [filterFarm, setFilterFarm] = useState(selectedFarmId || '');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCategory) params.append('category', filterCategory);
      if (filterSeverity) params.append('severity', filterSeverity);
      if (filterFarm) params.append('farm_id', filterFarm);
      if (filterStatus === 'unread') params.append('is_read', 'false');
      else if (filterStatus === 'read') params.append('is_read', 'true');

      const res = await api.get(`/alerts/?${params.toString()}`);
      setAlerts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filterCategory, filterSeverity, filterStatus, filterFarm]);

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/alerts/${id}/read`);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
    } catch (err) {
      alert("Failed to update alert status.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/alerts/mark-all-read');
      setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
    } catch (err) {
      alert("Failed to mark all as read.");
    }
  };

  const getCategoryIcon = (category) => {
    if (category === 'Disease Risk') return ShieldAlert;
    if (category === 'Environmental Warning') return ThermometerSun;
    return Sprout;
  };

  const getSeverityBadge = (severity) => {
    if (severity === 'Critical') return 'bg-red-600 text-white';
    if (severity === 'High') return 'bg-red-100 text-red-800 border-red-200';
    if (severity === 'Medium') return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b]">
            Early Warning System
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time automated alerts for soil moisture deficit, fungal proliferation, and disease detections
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors self-start sm:self-auto"
        >
          <CheckCheck className="w-4 h-4 text-emerald-600" />
          Mark All as Read
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase mr-1">
          <Filter className="w-3.5 h-3.5 text-emerald-600" /> Filters:
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl"
        >
          <option value="all">All Alerts</option>
          <option value="unread">Unread Only</option>
          <option value="read">Read Only</option>
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl"
        >
          <option value="">All Categories</option>
          <option value="Disease Risk">Disease Risk</option>
          <option value="Environmental Warning">Environmental Warning</option>
          <option value="Crop Health">Crop Health</option>
        </select>

        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl"
        >
          <option value="">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={filterFarm}
          onChange={(e) => setFilterFarm(e.target.value)}
          className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl"
        >
          <option value="">All Farms</option>
          {farms.map((f) => (
            <option key={f.id} value={f.id}>{f.farm_name}</option>
          ))}
        </select>

        {(filterCategory || filterSeverity || filterStatus !== 'unread' || filterFarm) && (
          <button
            onClick={() => {
              setFilterCategory('');
              setFilterSeverity('');
              setFilterStatus('unread');
              setFilterFarm('');
            }}
            className="text-xs text-emerald-700 font-bold hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Alerts Stream */}
      {alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const Icon = getCategoryIcon(alert.category);
            return (
              <div
                key={alert.id}
                className={`p-5 rounded-3xl bg-white border transition-all ${
                  alert.is_read
                    ? 'border-slate-200/60 opacity-75'
                    : 'border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className={`p-3 rounded-2xl ${
                      alert.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                      alert.severity === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                          {alert.title}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          • {alert.category}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 font-medium">
                        Farm: <b className="text-slate-700">{alert.farm_name || 'General Plot'}</b> • {alert.created_at?.split('T')[0]}
                      </div>
                    </div>
                  </div>

                  {!alert.is_read && (
                    <button
                      onClick={() => handleMarkRead(alert.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 self-start sm:self-auto transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Mark Read
                    </button>
                  )}
                </div>

                {/* Reason & Action Grid */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-100">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Diagnostic Reason
                    </span>
                    <p className="text-slate-700">{alert.reason}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <span className="font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                      Recommended Action
                    </span>
                    <p className="text-emerald-950 font-medium">{alert.recommended_action}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-slate-800 text-lg">No alerts matching filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your cane crops and environmental parameters are currently within safe thresholds.
          </p>
        </div>
      )}
    </div>
  );
}
