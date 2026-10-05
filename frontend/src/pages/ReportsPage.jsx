import React, { useState } from "react";
import { FileText, Download, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import api from "../services/api";
import { useFarms } from "../context/FarmContext";

export default function ReportsPage() {
  const { farms, selectedFarmId } = useFarms();
  const [activeFarmId, setActiveFarmId] = useState(selectedFarmId || "");
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    if (!activeFarmId) return;
    setGenerating(true);
    setSuccess(false);
    setError("");
    try {
      const res = await api.get(`/reports/download-pdf?farm_id=${activeFarmId}`, {
        responseType: "blob",
      });
      const farm = farms.find((f) => f.id === Number(activeFarmId));
      const farmName = farm ? farm.farm_name.replace(/\s+/g, "_") : "Farm";
      const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `CaneGuard_Report_${farmName}_${today}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setSuccess(true);
    } catch (err) {
      setError("Failed to generate PDF report. Please try again.");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b]">PDF Audit Reports</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate and download a comprehensive agronomic health report for any of your farms.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-xs self-start sm:self-auto">
          <span className="text-xs font-bold text-slate-400">Farm:</span>
          <select
            value={activeFarmId}
            onChange={(e) => setActiveFarmId(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
          >
            {farms.map((f) => (
              <option key={f.id} value={f.id}>{f.farm_name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs flex flex-col items-center gap-6 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
          <FileText className="w-8 h-8 text-emerald-600" />
        </div>
        <div>
          <h2 className="font-extrabold text-slate-900 text-lg">Farm Health &amp; Risk Audit</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Includes soil readings, crop observations, disease detections, AI risk scores, and
            agronomic recommendations - formatted for field use.
          </p>
        </div>

        {success && (
          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
            <CheckCircle2 className="w-4 h-4" /> Report downloaded successfully!
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 px-4 py-2 rounded-xl">
            <AlertTriangle className="w-4 h-4" /> {error}
          </div>
        )}

        <button
          onClick={handleDownload}
          disabled={generating || !activeFarmId}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#064e3b] text-white text-sm font-bold rounded-2xl hover:bg-emerald-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {generating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generating Report...</>
          ) : (
            <><Download className="w-4 h-4" /> Download PDF Report</>
          )}
        </button>
      </div>
    </div>
  );
}
