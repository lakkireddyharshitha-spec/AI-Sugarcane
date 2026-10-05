import React, { useState, useEffect } from 'react';
import {
  ThermometerSun,
  Plus,
  Filter,
  Calendar,
  Droplets,
  CloudRain,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  TrendingUp,
  Activity,
  CheckCircle2
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

export default function EnvironmentalPage() {
  const { farms, selectedFarmId, selectedFarm } = useFarms();

  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Filters
  const [filterFarm, setFilterFarm] = useState(selectedFarmId || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form inputs
  const [formData, setFormData] = useState({
    farm_id: selectedFarmId || '',
    temperature: '29.5',
    humidity: '75.0',
    rainfall: '10.0',
    soil_moisture: '55.0',
    soil_ph: '6.8',
    crop_age: '150',
    irrigation_status: 'Active',
    reading_date: new Date().toISOString().split('T')[0]
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedFarmId) {
      setFilterFarm(selectedFarmId);
      setFormData(prev => ({ ...prev, farm_id: selectedFarmId }));
    }
  }, [selectedFarmId]);

  const fetchReadings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterFarm) params.append('farm_id', filterFarm);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const res = await api.get(`/environmental/?${params.toString()}`);
      setReadings(res.data);
    } catch (err) {
      console.error("Error fetching readings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, [filterFarm, startDate, endDate]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      farm_id: filterFarm || farms[0]?.id || '',
      temperature: '29.5',
      humidity: '75.0',
      rainfall: '10.0',
      soil_moisture: '55.0',
      soil_ph: '6.8',
      crop_age: '150',
      irrigation_status: 'Active',
      reading_date: new Date().toISOString().split('T')[0]
    });
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (r) => {
    setIsEditing(true);
    setCurrentId(r.id);
    setFormData({
      farm_id: r.farm_id,
      temperature: r.temperature.toString(),
      humidity: r.humidity.toString(),
      rainfall: r.rainfall.toString(),
      soil_moisture: r.soil_moisture.toString(),
      soil_ph: r.soil_ph.toString(),
      crop_age: r.crop_age.toString(),
      irrigation_status: r.irrigation_status,
      reading_date: r.reading_date
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.farm_id) {
      setError('Please select a valid farm.');
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      farm_id: Number(formData.farm_id),
      temperature: parseFloat(formData.temperature),
      humidity: parseFloat(formData.humidity),
      rainfall: parseFloat(formData.rainfall),
      soil_moisture: parseFloat(formData.soil_moisture),
      soil_ph: parseFloat(formData.soil_ph),
      crop_age: parseInt(formData.crop_age, 10),
      irrigation_status: formData.irrigation_status,
      reading_date: formData.reading_date
    };

    try {
      if (isEditing) {
        await api.put(`/environmental/${currentId}`, payload);
      } else {
        await api.post('/environmental/', payload);
      }
      setModalOpen(false);
      fetchReadings();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to submit reading.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sensor reading?")) return;
    try {
      await api.delete(`/environmental/${id}`);
      fetchReadings();
    } catch (err) {
      alert("Failed to delete reading.");
    }
  };

  // Prepare chronological chart data (sorted ascending)
  const chartData = [...readings].reverse().map(r => ({
    date: r.reading_date,
    temperature: r.temperature,
    humidity: r.humidity,
    rainfall: r.rainfall,
    soil_moisture: r.soil_moisture,
    soil_ph: r.soil_ph
  }));

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b]">
            Environmental & Weather Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Log ambient microclimate, precipitation, soil moisture, and pH parameters
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.02] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Log Environmental Reading
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
          <Filter className="w-4 h-4 text-emerald-600" /> Filter:
        </div>

        <select
          value={filterFarm}
          onChange={(e) => setFilterFarm(e.target.value)}
          className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden"
        >
          <option value="">All Farms</option>
          {farms.map((f) => (
            <option key={f.id} value={f.id}>{f.farm_name}</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">From:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden text-slate-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">To:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden text-slate-700"
          />
        </div>

        {(filterFarm || startDate || endDate) && (
          <button
            onClick={() => { setFilterFarm(''); setStartDate(''); setEndDate(''); }}
            className="text-xs text-emerald-700 font-bold hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Line Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Temperature & Humidity */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Thermal & Humidity Dynamics
            </h3>
            <p className="text-xs text-slate-500">
              Temperature (°C) and Ambient Moisture (%)
            </p>
          </div>

          <div className="h-64 w-full pt-2">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No readings match filter criteria.
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Soil Moisture & Precipitation */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Soil Hydration & Precipitation
            </h3>
            <p className="text-xs text-slate-500">
              Soil Moisture (%) vs Rainfall (mm)
            </p>
          </div>

          <div className="h-64 w-full pt-2">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="soil_moisture" name="Soil Moisture (%)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="rainfall" name="Rainfall (mm)" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No readings match filter criteria.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History Data Table */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Logged Sensor & Environmental Records
            </h2>
            <p className="text-xs text-slate-500">
              Historical readings stored in SQLite database
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Total Records: {readings.length}
          </span>
        </div>

        {readings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Farm</th>
                  <th className="py-3 px-4">Temp</th>
                  <th className="py-3 px-4">Humidity</th>
                  <th className="py-3 px-4">Rainfall</th>
                  <th className="py-3 px-4">Moisture</th>
                  <th className="py-3 px-4">pH</th>
                  <th className="py-3 px-4">Crop Age</th>
                  <th className="py-3 px-4">Irrigation</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {readings.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">{r.reading_date}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-800">{r.farm_name}</td>
                    <td className="py-3 px-4">{r.temperature}°C</td>
                    <td className="py-3 px-4">{r.humidity}%</td>
                    <td className="py-3 px-4">{r.rainfall} mm</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{r.soil_moisture}%</td>
                    <td className="py-3 px-4">{r.soil_ph}</td>
                    <td className="py-3 px-4">{r.crop_age}d</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.irrigation_status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                        r.irrigation_status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {r.irrigation_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(r)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                        title="Edit reading"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                        title="Delete reading"
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
            {loading ? 'Fetching readings...' : 'No environmental readings found.'}
          </div>
        )}
      </div>

      {/* Entry Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-xl font-extrabold text-[#064e3b]">
                {isEditing ? 'Edit Environmental Log' : 'New Environmental Observation'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
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
                  <option value="">-- Choose Farm --</option>
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

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Soil pH
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="3.0"
                    max="10.0"
                    required
                    value={formData.soil_ph}
                    onChange={(e) => setFormData({ ...formData, soil_ph: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Crop Age (d)
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Irrigation
                  </label>
                  <select
                    value={formData.irrigation_status}
                    onChange={(e) => setFormData({ ...formData, irrigation_status: e.target.value })}
                    className="w-full px-2 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reading Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.reading_date}
                  onChange={(e) => setFormData({ ...formData, reading_date: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
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
                  {submitting ? 'Saving...' : isEditing ? 'Update Reading' : 'Save Reading'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
