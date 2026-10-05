import React, { useState, useEffect, useRef } from 'react';
import {
  ScanLine,
  UploadCloud,
  X,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  Layers,
  Database,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import api from '../services/api';
import { useFarms } from '../context/FarmContext';
import { Link } from 'react-router-dom';

export default function DiseaseDetectionPage() {
  const { farms, selectedFarmId } = useFarms();
  const [selectedFarm, setSelectedFarm] = useState(selectedFarmId || '');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (selectedFarmId) setSelectedFarm(selectedFarmId);
  }, [selectedFarmId]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/diseases/history');
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

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(selected.type)) {
      setError('Invalid file format. Please upload JPG, JPEG, or PNG images.');
      return;
    }

    if (selected.size > 15 * 1024 * 1024) {
      setError('File size exceeds 15MB limit.');
      return;
    }

    setError('');
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select or drag an image first.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    if (selectedFarm) {
      formData.append('farm_id', selectedFarm);
    }

    try {
      const res = await api.post('/diseases/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
      fetchHistory(); // refresh detection history
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to complete leaf analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b]">
            Sugarcane Leaf Disease Detection
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Upload leaf photographs to identify Red Rot, Sugarcane Mosaic, Leaf Scald, or Yellow Leaf disease
          </p>
        </div>

        <Link
          to="/dataset-status"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors self-start sm:self-auto"
        >
          <Database className="w-3.5 h-3.5" />
          <span>Dataset & CNN Architecture</span>
        </Link>
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Card (Left 6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-emerald-600" />
              Upload Foliar Image
            </h2>
            <span className="text-[11px] font-semibold text-slate-400">JPG, JPEG, PNG (Max 15MB)</span>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Farm selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Associate with Farm (Optional)
            </label>
            <select
              value={selectedFarm}
              onChange={(e) => setSelectedFarm(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="">-- General Diagnostic Scan (No Farm Linked) --</option>
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.farm_name} ({f.sugarcane_variety})
                </option>
              ))}
            </select>
          </div>

          {/* Drag & Drop Area / Preview */}
          {!preview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) {
                  const dropped = e.dataTransfer.files[0];
                  fileInputRef.current.files = e.dataTransfer.files;
                  handleFileChange({ target: { files: [dropped] } });
                }
              }}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/30 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png"
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 mx-auto">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">
                  Click to browse or drag & drop leaf image
                </p>
                <p className="text-xs text-slate-500">
                  Supports high-resolution photographs of leaf lamina, midrib, and spindle
                </p>
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group">
              <img
                src={preview}
                alt="Selected Leaf Preview"
                className="w-full h-64 object-cover object-center"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-red-600 text-white transition-colors"
                title="Remove Image"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-xs font-semibold text-white">
                {file?.name} ({(file?.size / (1024 * 1024)).toFixed(2)} MB)
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#064e3b] to-emerald-700 hover:from-[#043d2e] hover:to-emerald-800 shadow-md shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing Leaf Pathology...</span>
              </>
            ) : (
              <>
                <ScanLine className="w-4 h-4 text-emerald-300" />
                <span>Run Diagnostic Analysis</span>
              </>
            )}
          </button>
        </div>

        {/* Prediction Results Card (Right 6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">
              Analysis Results
            </h2>
            {result?.is_demo && (
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                DEMO MODE
              </span>
            )}
          </div>

          {result ? (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Demo Mode Notification Banner */}
              {result.is_demo && (
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    Transparent AI Integrity Notice
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800/90">
                    Pretrained CNN model weights or source image dataset binaries were not detected in local storage. CaneGuard AI evaluated this image using foliar color histogram heuristics. To activate real neural network inference, train weights with <code className="text-emerald-900 bg-amber-100 px-1 py-0.5 rounded font-mono">python ml_models/train_cnn.py</code>.
                  </p>
                </div>
              )}

              {/* Diagnosis Badge & Name */}
              <div className="flex items-start justify-between">
                <div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    result.disease_class === 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : result.severity === 'Severe'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    Severity: {result.severity}
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                    {result.disease_name}
                  </h3>
                  <div className="text-xs text-slate-500 font-medium">
                    Class ID: {result.disease_class} • Associated Farm: {result.farm_name || 'Unassigned'}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-extrabold text-[#064e3b]">
                    {result.confidence_score}%
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Confidence
                  </div>
                </div>
              </div>

              {/* Confidence Progress Meter */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    result.disease_class === 0 ? 'bg-emerald-600' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, result.confidence_score)}%` }}
                ></div>
              </div>

              {/* Pathology Description */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pathology & Symptom Profile
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {result.description}
                </p>
              </div>

              {/* Agronomic Next Steps */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Recommended Action Plan
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  {result.recommendations}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
              <ScanLine className="w-12 h-12 text-slate-200 animate-pulse" />
              <div>
                <p className="text-sm font-bold text-slate-700">No Leaf Scanned Yet</p>
                <p className="text-xs text-slate-400 max-w-xs mt-0.5">
                  Select an image on the left and run analysis to inspect cellular venation and lesion characteristics.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detection History Table */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Recent Leaf Pathology Scans
            </h2>
            <p className="text-xs text-slate-500">
              Audit log of processed foliar images and model classifications
            </p>
          </div>
          <button
            onClick={fetchHistory}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            Refresh Logs
          </button>
        </div>

        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Image</th>
                  <th className="py-3 px-4">Diagnosis</th>
                  <th className="py-3 px-4">Farm</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Scan Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((det) => (
                  <tr key={det.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                        <img
                          src={`http://localhost:8000${det.image_path}`}
                          alt={det.disease_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {det.disease_name}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {det.farm_name || 'Unassigned'}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      {det.confidence_score}%
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        det.severity === 'Severe' ? 'bg-red-100 text-red-700' :
                        det.severity === 'Moderate' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {det.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        det.is_demo ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-50 text-emerald-800'
                      }`}>
                        {det.is_demo ? 'DEMO' : 'CNN Live'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {det.created_at?.split('T')[0]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs">
            {loadingHistory ? 'Loading history...' : 'No historical scans recorded yet.'}
          </div>
        )}
      </div>
    </div>
  );
}
