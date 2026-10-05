import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Plus,
  Search,
  MapPin,
  Calendar,
  Layers,
  Droplets,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  CheckCircle,
  FileDown
} from 'lucide-react';
import api from '../services/api';
import { useFarms } from '../context/FarmContext';

export default function FarmsPage() {
  const { farms, refreshFarms, selectedFarmId, setSelectedFarmId } = useFarms();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentFarmId, setCurrentFarmId] = useState(null);

  const [formData, setFormData] = useState({
    farm_name: '',
    village: '',
    district: '',
    farm_area: '',
    soil_type: 'Alluvial Loam',
    sugarcane_variety: 'Co 86032 (Nayana)',
    planting_date: new Date().toISOString().split('T')[0],
    irrigation_type: 'Drip Irrigation',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const soilOptions = ['Alluvial Loam', 'Black Clay', 'Red Sandy', 'Clay Loam', 'Laterite'];
  const varietyOptions = [
    'Co 86032 (Nayana)',
    'Co 0238 (Karan 4)',
    'Co 0118 (Karan 2)',
    'CoM 0265 (Phule 265)',
    'CoLK 94184 (Birendra)',
    'Co 15023'
  ];
  const irrigationOptions = ['Drip Irrigation', 'Furrow Irrigation', 'Sprinkler Irrigation', 'Flood Irrigation'];

  const filteredFarms = farms.filter(f =>
    f.farm_name.toLowerCase().includes(search.toLowerCase()) ||
    f.village.toLowerCase().includes(search.toLowerCase()) ||
    f.district.toLowerCase().includes(search.toLowerCase()) ||
    f.sugarcane_variety.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentFarmId(null);
    setFormData({
      farm_name: '',
      village: '',
      district: '',
      farm_area: '',
      soil_type: 'Alluvial Loam',
      sugarcane_variety: 'Co 86032 (Nayana)',
      planting_date: new Date().toISOString().split('T')[0],
      irrigation_type: 'Drip Irrigation',
    });
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (farm) => {
    setIsEditing(true);
    setCurrentFarmId(farm.id);
    setFormData({
      farm_name: farm.farm_name,
      village: farm.village,
      district: farm.district,
      farm_area: farm.farm_area.toString(),
      soil_type: farm.soil_type,
      sugarcane_variety: farm.sugarcane_variety,
      planting_date: farm.planting_date,
      irrigation_type: farm.irrigation_type,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        farm_area: parseFloat(formData.farm_area),
      };

      if (isEditing) {
        await api.put(`/farms/${currentFarmId}`, payload);
      } else {
        await api.post('/farms/', payload);
      }
      await refreshFarms();
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to save farm record');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete '${name}'? This will remove all associated observations and readings.`)) {
      return;
    }
    try {
      await api.delete(`/farms/${id}`);
      await refreshFarms();
    } catch (err) {
      alert("Failed to delete farm record");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b]">
            Farm Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Register and monitor sugarcane cultivation plots, cultivars, and soil types
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.02] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Farm
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs max-w-md">
        <Search className="w-5 h-5 text-slate-400 pl-1" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by farm name, village, variety..."
          className="w-full text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-hidden"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Farm Cards Grid */}
      {filteredFarms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFarms.map((farm) => {
            const isSelected = farm.id === selectedFarmId;
            return (
              <div
                key={farm.id}
                className={`relative rounded-3xl bg-white p-6 border transition-all ${
                  isSelected
                    ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 flex items-center justify-center text-emerald-800 font-bold">
                      <Sprout className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                        {farm.farm_name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{farm.village}, {farm.district}</span>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Active
                    </span>
                  )}
                </div>

                {/* Specs List */}
                <div className="mt-5 space-y-2 text-xs border-t border-slate-100 pt-4 text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Area:</span>
                    <span className="font-bold text-slate-800">{farm.farm_area} Acres</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Sugarcane Variety:</span>
                    <span className="font-bold text-emerald-700">{farm.sugarcane_variety}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Soil Type:</span>
                    <span className="font-medium text-slate-700">{farm.soil_type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Planting Date:</span>
                    <span className="font-medium text-slate-700">{farm.planting_date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Irrigation Method:</span>
                    <span className="font-medium text-slate-700">{farm.irrigation_type}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedFarmId(farm.id)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800'
                    }`}
                  >
                    {isSelected ? 'Currently Monitored' : 'Select Farm'}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(farm)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                    title="Edit Farm"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(farm.id, farm.farm_name)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete Farm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
          <Sprout className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-lg">No farm records found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search ? 'Try adjusting your search query.' : 'Add your first sugarcane farm to begin recording crop health, sensor logs, and disease detection.'}
          </p>
          {!search && (
            <button
              onClick={handleOpenAdd}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4" /> Add Farm Now
            </button>
          )}
        </div>
      )}

      {/* Add / Edit Farm Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-xl font-extrabold text-[#064e3b]">
                {isEditing ? 'Edit Farm Specifications' : 'Register New Sugarcane Farm'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
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
                  Farm Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.farm_name}
                  onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                  placeholder="e.g., Kaveri Green Estate"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Village
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    placeholder="e.g., Mandya Rural"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="e.g., Mandya"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Farm Area (Acres)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={formData.farm_area}
                    onChange={(e) => setFormData({ ...formData, farm_area: e.target.value })}
                    placeholder="e.g., 10.5"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Planting Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.planting_date}
                    onChange={(e) => setFormData({ ...formData, planting_date: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Sugarcane Variety
                  </label>
                  <select
                    value={formData.sugarcane_variety}
                    onChange={(e) => setFormData({ ...formData, sugarcane_variety: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    {varietyOptions.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Soil Type
                  </label>
                  <select
                    value={formData.soil_type}
                    onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    {soilOptions.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Irrigation System
                </label>
                <select
                  value={formData.irrigation_type}
                  onChange={(e) => setFormData({ ...formData, irrigation_type: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {irrigationOptions.map(i => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-700/20 transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : isEditing ? 'Update Farm' : 'Save Farm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
