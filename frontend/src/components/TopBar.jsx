import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, Plus, Sprout, ChevronDown, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFarms } from '../context/FarmContext';
import api from '../services/api';

export default function TopBar({ onOpenSidebar }) {
  const { user } = useAuth();
  const { farms, selectedFarmId, setSelectedFarmId, selectedFarm } = useFarms();
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/alerts/unread-count');
        setUnreadCount(res.data.unread_count || 0);
      } catch (err) {
        // quiet error
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-4 md:px-8 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Left: Mobile Toggle & Farm Selector */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="p-2 text-slate-600 rounded-lg hover:bg-slate-100 lg:hidden focus:outline-hidden"
          aria-label="Open Navigation"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Farm Selector Dropdown */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
            <span>Farm:</span>
          </div>

          {farms.length > 0 ? (
            <div className="relative">
              <select
                value={selectedFarmId || ''}
                onChange={(e) => setSelectedFarmId(Number(e.target.value))}
                className="py-1.5 pl-3 pr-8 text-sm font-semibold text-slate-800 bg-emerald-50/70 border border-emerald-200/80 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer hover:bg-emerald-50 transition-colors"
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.farm_name} ({f.sugarcane_variety})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <Link
              to="/farms"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Your First Farm
            </Link>
          )}
        </div>
      </div>

      {/* Right: Quick actions, Alerts, Profile */}
      <div className="flex items-center gap-3">
        {/* ML Status Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100/70 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>AI Engine Active</span>
        </div>

        {/* Alerts Bell */}
        <Link
          to="/alerts"
          className="relative p-2 text-slate-600 hover:text-emerald-700 rounded-xl hover:bg-slate-100 transition-colors"
          title="Early Warning Alerts"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User Avatar & Name */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-forest-800 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight">
              {user?.full_name || 'Farmer User'}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium">
              Verified Grower
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
