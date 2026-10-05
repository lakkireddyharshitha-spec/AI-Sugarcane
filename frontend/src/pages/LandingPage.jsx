import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sprout,
  ScanLine,
  ThermometerSun,
  ShieldAlert,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Activity,
  Layers,
  Sparkles,
  FileCheck,
  ChevronRight,
  ShieldCheck,
  Award,
  Droplet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Mini interactive demo state
  const [selectedDemoDisease, setSelectedDemoDisease] = useState(0);

  const demoDiseases = [
    {
      name: "Healthy Sugarcane",
      tag: "Normal",
      color: "emerald",
      conf: "97.4%",
      symptoms: "Lush green blades, sturdy midrib, uniform cellular density.",
      advice: "Maintain scheduled fertigation and bi-weekly scouting."
    },
    {
      name: "Red Rot (Colletotrichum)",
      tag: "High Hazard",
      color: "red",
      conf: "94.8%",
      symptoms: "Discolored midrib lesion with white transverse center.",
      advice: "Isolate infected clump immediately; refrain from ratoon cropping."
    },
    {
      name: "Sugarcane Mosaic Virus",
      tag: "Moderate",
      color: "amber",
      conf: "91.2%",
      symptoms: "Chlorotic blotches and longitudinal green streaks.",
      advice: "Manage aphid vectors and rogue severely stunted nursery stools."
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8faf7] text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/30 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-[#064e3b]">
                CaneGuard <span className="text-emerald-500">AI</span>
              </span>
              <span className="block text-[10px] font-semibold text-emerald-700 tracking-wider uppercase">
                Smart Sugarcane Farming
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
            <a href="#features" className="hover:text-emerald-700 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-emerald-700 transition-colors">How It Works</a>
            <a href="#interactive-preview" className="hover:text-emerald-700 transition-colors">AI Preview</a>
            <a href="#benefits" className="hover:text-emerald-700 transition-colors">Benefits</a>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 shadow-md shadow-emerald-900/20 transition-all hover:scale-[1.02]"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.02]"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_35%_at_50%_20%,#d1fae5_0%,transparent_100%)] opacity-70"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-bold tracking-wide uppercase shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Next-Gen Precision Agronomy
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#064e3b] tracking-tight leading-[1.12]">
                Smart Sugarcane Farming with <span className="text-emerald-600 underline decoration-emerald-300 decoration-wavy underline-offset-8">Artificial Intelligence</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed">
                Monitor crop health, detect possible diseases early, and make smarter farming decisions with AI. Built specifically for sugarcane cultivators, agronomists, and sugar mill cooperatives.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 justify-center lg:justify-start">
                <Link
                  to={isAuthenticated ? "/dashboard" : "/login"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-[#064e3b] to-emerald-700 hover:from-[#043d2e] hover:to-emerald-800 shadow-xl shadow-emerald-950/20 transition-all hover:scale-[1.02]"
                >
                  Launch Dashboard
                  <ArrowRight className="w-5 h-5 text-emerald-300" />
                </Link>

                <Link
                  to="/diseases"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-slate-800 bg-white border border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 shadow-sm transition-all"
                >
                  <ScanLine className="w-5 h-5 text-emerald-600" />
                  Try Leaf Scanner
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80 max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="text-2xl font-extrabold text-[#064e3b]">2,521+</div>
                  <div className="text-xs text-slate-500 font-medium">Dataset Records</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-emerald-600">5 Classes</div>
                  <div className="text-xs text-slate-500 font-medium">Configurable Labels</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-[#064e3b]">360-Day</div>
                  <div className="text-xs text-slate-500 font-medium">Growth Tracking</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Graphic / Illustration */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500 to-forest-700 opacity-20 blur-xl"></div>
                <div className="relative rounded-3xl bg-white p-6 shadow-2xl border border-slate-200/80">
                  {/* Mock Phone / Tablet Dashboard Card */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                    </div>
                    <span className="text-xs font-bold text-slate-400">CaneGuard Live Telemetry</span>
                  </div>

                  {/* Leaf Scan Simulation */}
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-900 to-[#042f23] text-white space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                        CNN FOLIAR SCAN
                      </span>
                      <span className="text-emerald-200/70">Co 86032 Field</span>
                    </div>

                    <div className="h-32 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#10b981_0%,transparent_70%)] opacity-20 animate-pulse"></div>
                      <div className="flex flex-col items-center gap-2 z-10">
                        <ScanLine className="w-10 h-10 text-emerald-400 animate-bounce" />
                        <span className="text-xs font-semibold text-emerald-200">
                          Optical Venation Analysis
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <div className="text-sm font-bold text-white">Healthy Sugarcane</div>
                        <div className="text-[11px] text-emerald-300/80">Vigorous chlorophyll baseline</div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-extrabold text-emerald-400">96.4%</div>
                        <div className="text-[10px] text-emerald-200/70">Confidence</div>
                      </div>
                    </div>
                  </div>

                  {/* Mini Stats Grid */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                        <ThermometerSun className="w-4 h-4 text-emerald-600" />
                        Soil Moisture
                      </div>
                      <div className="text-lg font-extrabold text-slate-800 mt-1">56% <span className="text-xs font-medium text-emerald-600">Optimal</span></div>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                        <ShieldAlert className="w-4 h-4 text-amber-600" />
                        Disease Risk
                      </div>
                      <div className="text-lg font-extrabold text-slate-800 mt-1">Low <span className="text-xs font-medium text-emerald-600">Normal</span></div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-emerald-700">
                      <CheckCircle className="w-3.5 h-3.5" /> SQLite & FastAPI Live
                    </span>
                    <span>Ready for Harvest 2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section id="features" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#064e3b]">
              Complete Sugarcane Intelligence Ecosystem
            </h2>
            <p className="text-slate-600 text-base">
              From microscopic leaf pathology to macroscopic rainfall trends, CaneGuard AI unifies every vital facet of your sugarcane farm.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#f8faf7] border border-slate-200/80 hover:border-emerald-400 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <ScanLine className="w-6 h-6" />
              </div>
              <h3 className="mt-4 font-bold text-lg text-slate-900">
                Leaf Disease CNN
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Optical pathology analysis for Red Rot, Mosaic Virus, Leaf Scald, and Yellow Leaf with transparent AI confidence scoring.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#f8faf7] border border-slate-200/80 hover:border-emerald-400 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <ThermometerSun className="w-6 h-6" />
              </div>
              <h3 className="mt-4 font-bold text-lg text-slate-900">
                Weather & Sensor Logs
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Track temperature, humidity, rainfall, and soil moisture with interactive charts to prevent waterlogging and thermal stress.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#f8faf7] border border-slate-200/80 hover:border-emerald-400 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="mt-4 font-bold text-lg text-slate-900">
                Random Forest Risk
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Scikit-learn powered predictive model assessing compounding microclimatic factors before fungal spores proliferate.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-[#f8faf7] border border-slate-200/80 hover:border-emerald-400 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="mt-4 font-bold text-lg text-slate-900">
                Growth Curve & LSTM
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Benchmark weekly cane elongation against the verified sigmoidal model with bidirectional LSTM sequence capability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Disease Preview */}
      <section id="interactive-preview" className="py-20 bg-[#f4f7f4]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-10">
            <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-300">
              Interactive Leaf Scanner Demonstration
            </span>
            <h2 className="text-3xl font-extrabold text-[#064e3b]">
              See How CaneGuard AI Diagnoses Sugarcane Health
            </h2>
            <p className="text-sm text-slate-600">
              Select a sample profile below to preview our diagnostic breakdown, confidence metrics, and agronomic guidance.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80">
            {/* Disease Selector Tabs */}
            <div className="flex flex-wrap gap-2 pb-6 border-b border-slate-200">
              {demoDiseases.map((d, idx) => (
                <button
                  key={d.name}
                  onClick={() => setSelectedDemoDisease(idx)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    selectedDemoDisease === idx
                      ? 'bg-[#064e3b] text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>

            {/* Display selected disease details */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedDemoDisease === 0 ? 'bg-emerald-100 text-emerald-800' :
                    selectedDemoDisease === 1 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {demoDiseases[selectedDemoDisease].tag}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    Confidence: <b className="text-emerald-700">{demoDiseases[selectedDemoDisease].conf}</b>
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-slate-900">
                  {demoDiseases[selectedDemoDisease].name}
                </h3>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Observed Symptoms
                  </div>
                  <p className="text-sm text-slate-700">
                    {demoDiseases[selectedDemoDisease].symptoms}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Recommended Action Plan
                  </div>
                  <p className="text-sm text-emerald-950 font-medium">
                    {demoDiseases[selectedDemoDisease].advice}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl p-6 bg-gradient-to-tr from-[#064e3b] to-emerald-800 text-white space-y-4 shadow-inner">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                  <span>AI DIAGNOSTIC REPORT</span>
                  <span>PREVIEW MODE</span>
                </div>

                <div className="space-y-2 text-sm text-emerald-100/90 leading-relaxed">
                  <p>
                    Every leaf image uploaded to CaneGuard AI undergoes foliar color extraction, lesion contour bounding, and probability scoring against verified agronomic benchmarks.
                  </p>
                  <p className="text-xs text-emerald-300/80">
                    Configurable class mappings support user-defined disease profiles for regional cultivars (Co 0238, Co 86032, Co 0118).
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    to="/diseases"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#064e3b] hover:bg-emerald-50 transition-colors"
                  >
                    Test with Your Leaf Photo
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-[#064e3b]">
              Three Simple Steps to Smarter Cane Harvests
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#f8faf7] border border-slate-200/80 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-md shadow-emerald-700/30">
                1
              </div>
              <h3 className="font-bold text-lg text-slate-900">Register & Setup Farm</h3>
              <p className="text-sm text-slate-600">
                Enter your farm location, soil type, planting date, and sugarcane cultivar (e.g., Co 86032, Co 0238).
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#f8faf7] border border-slate-200/80 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-md shadow-emerald-700/30">
                2
              </div>
              <h3 className="font-bold text-lg text-slate-900">Log Observations & Scans</h3>
              <p className="text-sm text-slate-600">
                Snap photos of suspicious leaf midribs or enter current ambient temperature, humidity, and soil moisture.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#f8faf7] border border-slate-200/80 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-md shadow-emerald-700/30">
                3
              </div>
              <h3 className="font-bold text-lg text-slate-900">Receive Action Guidance</h3>
              <p className="text-sm text-slate-600">
                Get precise irrigation hours, early disease containment steps, and downloadable PDF audit reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20 bg-[#064e3b] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold text-emerald-300 tracking-wider uppercase bg-emerald-800/80 px-3 py-1 rounded-full border border-emerald-700">
                Farmer Advantages
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Designed to Protect Yield, Lower Input Costs, and Preserve Cane Sucrose
              </h2>
              <p className="text-emerald-100/80 text-base leading-relaxed">
                Sugarcane is a long-duration cash crop spanning 10-14 months. Late discovery of fungal pathogens like Red Rot can wipe out entire stool populations. CaneGuard AI acts as your vigilant 24/7 digital agronomist.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  "Early Warning Alerts before fungal epidemics spread across ratoon crops",
                  "Prevents excessive irrigation by matching soil moisture to growth stage",
                  "Verified Sigmoid Growth curve tracking against standard ICAR benchmarks",
                  "Direct downloadable PDF audit reports for agricultural credit and insurance"
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-sm font-medium text-emerald-50">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-[#043d2e] p-8 border border-emerald-700/50 shadow-2xl space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Award className="w-6 h-6 text-emerald-400" />
                Proven Agronomic Principles
              </h3>
              <p className="text-sm text-emerald-200/80 leading-relaxed">
                CaneGuard AI strictly adheres to verified agricultural science: no fabricated treatment claims, no reckless chemical dosage figures, and full transparency on machine learning model weights versus heuristic demo modes.
              </p>
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-emerald-300">Ready to test?</div>
                  <div className="text-sm font-bold text-white">Pre-configured Demo Account Available</div>
                </div>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-[#064e3b] transition-colors"
                >
                  Quick Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#042f23] text-emerald-100/70 border-t border-emerald-950/60 py-12 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              <Sprout className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-white text-base">CaneGuard AI</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-emerald-300/80">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#how-it-works" className="hover:text-white">How It Works</a>
            <Link to="/login" className="hover:text-white">Farmer Login</Link>
            <Link to="/register" className="hover:text-white">Register</Link>
            <Link to="/dataset-status" className="hover:text-white">Dataset Inspection</Link>
          </div>

          <div className="text-xs text-emerald-400/60">
            © {new Date().getFullYear()} CaneGuard AI. Built with FastAPI, SQLite, and React.
          </div>
        </div>
      </footer>
    </div>
  );
}
