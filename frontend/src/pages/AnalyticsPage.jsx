import React from "react";
import { BarChart3, Clock } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
        <BarChart3 className="w-8 h-8 text-emerald-600" />
      </div>
      <h1 className="text-2xl font-extrabold text-[#064e3b]">Analytics &amp; History</h1>
      <p className="text-sm text-slate-500 max-w-sm">
        Historical trend analysis, yield correlations, and seasonal pattern reports are coming soon.
      </p>
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl">
        <Clock className="w-3.5 h-3.5" /> Coming Soon
      </span>
    </div>
  );
}
