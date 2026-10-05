import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  ScanLine,
  ThermometerSun,
  ShieldAlert,
  TrendingUp,
  Activity,
  Plus,
  FileDown,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  Droplets
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useFarms } from '../context/FarmContext';
import api from '../services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const { farms, selectedFarmId, selectedFarm } = useFarms();

  const [summary, setSummary] = useState(null);
  const [envChartData, setEnvChartData] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const queryParam = selectedFarmId ? `?farm_id=${selectedFarmId}` : '';
        const [sumRes, alertsRes] = await Promise.all([
          api.get(`/analytics/summary${queryParam}`),
          api.get(`/alerts/${queryParam ? `${queryParam}&is_read=false` : '?is_read=false'}`)
        ]);
        setSummary(sumRes.data);
        setAlerts(alertsRes.data.slice(0, 4));

        if (selectedFarmId) {
          const [envRes, growthRes] = await Promise.all([
            api.get(`/environmental/charts/${selectedFarmId}`),
            api.get(`/growth/trends/${selectedFarmId}`)
          ]);
          setEnvChartData(envRes.data);
          setGrowthData(growthRes.data.trend_summary?.historical_chart_data || []);
        } else {
          setEnvChartData([]);
          setGrowthData([]);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedFarmId]);

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-emerald-800">Compiling Farm Telemetry...</p>
        </div>
      </div>
    );
  }

  const riskBadgeColor =
    summary?.current_disease_risk === 'High Risk'
      ? 'bg-red-100 text-red-800 border-red-200'
      : summary?.current_disease_risk === 'Medium Risk'
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : 'bg-emerald-100 text-emerald-800 border-emerald-200';

  const riskPieData = summary?.risk_distribution || [
    { name: 'Low Risk', value: 1, color: '#10b981' },
    { name: 'Medium Risk', value: 0, color: '#f59e0b' },
    { name: 'High Risk', value: 0, color: '#ef4444' }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner & Active Farm context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#064e3b] via-[#075942] to-emerald-800 text-white shadow-xl shadow-emerald-950/20">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[11px] font-bold text-emerald-200">
            <Sprout className="w-3.5 h-3.5" />
            Active Cultivation Season 2026
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.full_name || 'Farmer'}!
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80">
            {selectedFarm
              ? `Monitoring: ${selectedFarm.farm_name} (${selectedFarm.sugarcane_variety}) • ${selectedFarm.village}, ${selectedFarm.district}`
              : 'Viewing aggregated metrics across all your registered sugarcane plots.'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/diseases"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-[#064e3b] hover:bg-emerald-50 shadow-sm transition-all"
          >
            <ScanLine className="w-4 h-4 text-emerald-600" />
            New Leaf Scan
          </Link>

          <Link
            to="/environmental"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Log Sensor Data
          </Link>

          {selectedFarmId && (
            <a
              href={`http://localhost:8000/api/reports/download-pdf?farm_id=${selectedFarmId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-950/60 hover:bg-emerald-950 text-emerald-200 border border-emerald-700/60 transition-all"
            >
              <FileDown className="w-4 h-4" />
              Download PDF
            </a>
          )}
        </div>
      </div>

      {/* 5 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Farms */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Farms
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {summary?.total_farms || 0}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Active sugarcane plots
          </div>
        </div>

        {/* Card 2: Total Disease Analyses */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Leaf Analyses
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <ScanLine className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {summary?.total_disease_analyses || 0}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            CNN optical inspections
          </div>
        </div>

        {/* Card 3: Healthy Crop Status */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Healthy Status
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">
            {summary?.healthy_crop_percentage || 100}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Non-diseased ratio
          </div>
        </div>

        {/* Card 4: Disease Risk */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Disease Risk
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${riskBadgeColor}`}>
              {summary?.current_disease_risk || 'Low Risk'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Microclimate index ({summary?.current_risk_score || 0}%)
          </div>
        </div>

        {/* Card 5: Total Observations */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Growth Logs
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {summary?.total_observations || 0}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Sequential height logs
          </div>
        </div>
      </div>

      {/* Main Grid: Environmental Trends & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Environmental Trends */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Environmental & Weather Trends
              </h2>
              <p className="text-xs text-slate-500">
                Temperature (°C), Relative Humidity (%), and Soil Moisture (%)
              </p>
            </div>
            <Link
              to="/environmental"
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              View Full History <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-72 w-full pt-4">
            {envChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={envChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    name="Temp (°C)"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    name="Humidity (%)"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="soil_moisture"
                    name="Soil Moisture (%)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <ThermometerSun className="w-8 h-8 text-slate-300 mb-2" />
                <span>No sensor readings recorded for the active farm.</span>
                <Link to="/environmental" className="text-emerald-700 font-bold mt-1">
                  Log your first reading →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Cols: Disease Risk Distribution */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Risk Distribution
              </h2>
              <Link to="/risk" className="text-xs font-bold text-emerald-700 hover:underline">
                Simulate
              </Link>
            </div>
            <p className="text-xs text-slate-500">
              Random Forest classified agro-climatic states
            </p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Trained on humidity, rainfall, and thermal vectors.</span>
          </div>
        </div>
      </div>

      {/* Second Row: Crop Growth vs Benchmark & Recent Activities / Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Crop Growth vs Benchmark */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Crop Height vs Sigmoid Benchmark
              </h2>
              <p className="text-xs text-slate-500">
                Actual height (cm) vs standard ICAR sugarcane growth curve
              </p>
            </div>
            <Link to="/growth" className="text-xs font-bold text-emerald-700 hover:underline">
              Add Observation
            </Link>
          </div>

          <div className="h-64 w-full pt-2">
            {growthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="crop_age" stroke="#94a3b8" fontSize={11} label={{ value: 'Age (Days)', position: 'insideBottomRight', offset: -5, fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" fontSize={11} label={{ value: 'Height (cm)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual_height"
                    name="Actual Height"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ideal_height"
                    name="Benchmark"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <TrendingUp className="w-8 h-8 text-slate-300 mb-2" />
                <span>No growth observations logged yet.</span>
                <Link to="/growth" className="text-emerald-700 font-bold mt-1">
                  Record height now →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Cols: Recent Alerts & Activities */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Alerts */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Active Alerts
              </h2>
              <Link to="/alerts" className="text-xs font-bold text-emerald-700 hover:underline">
                View All
              </Link>
            </div>

            {alerts.length > 0 ? (
              <div className="space-y-2.5">
                {alerts.map((a) => (
                  <div
                    key={a.id}
                    className={`p-3 rounded-2xl border text-xs space-y-1 ${
                      a.severity === 'Critical'
                        ? 'bg-red-50/70 border-red-200'
                        : a.severity === 'High'
                        ? 'bg-amber-50/70 border-amber-200'
                        : 'bg-emerald-50/70 border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-900">{a.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md ${
                        a.severity === 'Critical' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {a.severity}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-snug">{a.reason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-emerald-900">All Parameters Normal</p>
                <p className="text-[11px] text-emerald-700">No active environmental or disease warnings.</p>
              </div>
            )}
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Recent Logs
            </h2>

            {summary?.recent_activities && summary.recent_activities.length > 0 ? (
              <div className="space-y-3">
                {summary.recent_activities.slice(0, 3).map((act, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] shrink-0 mt-0.5">
                      {act.badge}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 truncate">{act.title}</div>
                      <div className="text-slate-500 truncate">{act.description}</div>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{act.timestamp.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No recent activity found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
