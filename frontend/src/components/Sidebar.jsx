import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Sprout,
  ScanLine,
  ThermometerSun,
  ShieldAlert,
  TrendingUp,
  Bell,
  Lightbulb,
  BarChart3,
  FileText,
  Database,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'My Farms', path: '/farms', icon: Sprout },
  { name: 'Disease Detection', path: '/diseases', icon: ScanLine, badge: 'CNN' },
  { name: 'Environmental Data', path: '/environmental', icon: ThermometerSun },
  { name: 'AI Risk Prediction', path: '/risk', icon: ShieldAlert, badge: 'ML' },
  { name: 'Crop Growth', path: '/growth', icon: TrendingUp },
  { name: 'Early Warning Alerts', path: '/alerts', icon: Bell },
  { name: 'AI Recommendations', path: '/recommendations', icon: Lightbulb },
  { name: 'Analytics & History', path: '/analytics', icon: BarChart3 },
  { name: 'PDF Audit Reports', path: '/reports', icon: FileText },
  { name: 'Dataset & AI Models', path: '/dataset-status', icon: Database },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-72 bg-[#053a2b] text-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-emerald-900/50 shadow-2xl`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 h-20 border-b border-emerald-900/60 bg-[#042f23]">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-900/40 text-white font-bold">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
              CaneGuard <span className="text-emerald-400 font-black">AI</span>
            </div>
            <div className="text-[11px] font-medium text-emerald-300/80 tracking-wide uppercase">
              Sugarcane Intelligence
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-300/60">
            Core Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-950/40'
                      : 'text-emerald-100/80 hover:bg-emerald-800/40 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/20">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-emerald-900/60 bg-[#042f23]">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-900/40 border border-emerald-800/40">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-sm text-white shrink-0">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'F'}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-white truncate">
                  {user?.full_name || 'Farmer'}
                </div>
                <div className="text-[11px] text-emerald-300/70 truncate">
                  {user?.email || 'farmer@caneguard.ai'}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-emerald-300 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
