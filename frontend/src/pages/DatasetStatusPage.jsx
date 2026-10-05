import React, { useState, useEffect } from "react";
import { Database, CheckCircle2, AlertTriangle, FileText, Cpu } from "lucide-react";
import api from "../services/api";

export default function DatasetStatusPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get("/dataset/status");
        setStatus(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b]">Dataset &amp; AI Models</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Live status of the CaneGuard AI training data, model registry, and inference engine.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading dataset status...</div>
      ) : status ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dataset File */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-slate-900 text-sm">Training Dataset</h2>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between"><span className="text-slate-400">File</span><span className="font-mono font-semibold">{status.dataset_file || "preprocessed_dataset.111.csv"}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Total Records</span><span className="font-semibold">{status.total_records?.toLocaleString() || "N/A"}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Classes</span><span className="font-semibold">{status.num_classes ?? "N/A"}</span></div>
            </div>
          </div>

          {/* Model Status */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-slate-900 text-sm">AI Model Registry</h2>
            </div>
            <div className="space-y-2">
              {(status.models || []).map((m, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-medium">{m.name}</span>
                  <span className={`flex items-center gap-1 font-semibold ${m.available ? "text-emerald-600" : "text-slate-400"}`}>
                    {m.available ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    {m.available ? "Ready" : "Demo Mode"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Class Mapping */}
          {status.class_mapping && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3 md:col-span-2">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-emerald-600" />
                <h2 className="font-bold text-slate-900 text-sm">Disease Class Mapping</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(status.class_mapping).map(([k, v]) => (
                  <div key={k} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0">{k}</span>
                    <div>
                      <div className="text-xs font-semibold text-slate-800">{v.name}</div>
                      <div className="text-[11px] text-slate-400 italic">{v.scientific_name}</div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-0.5 inline-block ${v.severity === "High" ? "bg-red-100 text-red-700" : v.severity === "Medium" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {v.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <p className="text-sm text-slate-600">Could not load dataset status.</p>
        </div>
      )}
    </div>
  );
}
