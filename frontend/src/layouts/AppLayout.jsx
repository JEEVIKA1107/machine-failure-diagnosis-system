import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Activity,
  Zap,
  BookOpen,
  History,
  BarChart3,
  Info,
  Server,
  AlertTriangle,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { api } from '../services/api';

export default function AppLayout({ activeTab, setActiveTab, children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [serverOnline, setServerOnline] = useState(false);
  const [checkingHealth, setCheckingHealth] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const checkServer = async () => {
      try {
        await api.getHealth();
        if (isMounted) {
          setServerOnline(true);
          setCheckingHealth(false);
        }
      } catch (err) {
        if (isMounted) {
          setServerOnline(false);
          setCheckingHealth(false);
        }
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'monitoring', label: 'Machine Monitoring', icon: Activity },
    { id: 'diagnose', label: 'Diagnose Machine', icon: Zap, badge: 'CORE KBS', highlight: true },
    { id: 'knowledge-base', label: 'Knowledge Base', icon: BookOpen },
    { id: 'history', label: 'Diagnosis History', icon: History },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'about', label: 'About Project', icon: Info },
  ];

  return (
    <div className="flex h-screen bg-[#070b14] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-72 bg-[#0b1120] border-r border-slate-800/80 flex-shrink-0 z-30">
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800/80 justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-glow-cyan text-white">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-wider text-base text-white">AEROPULSE</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 uppercase">
                  v1.0 KBS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-tight font-mono">Failure Diagnosis System</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
            System Console
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? item.highlight
                      ? 'bg-gradient-to-r from-blue-600/90 to-cyan-600/90 text-white shadow-glow-blue border border-cyan-400/30'
                      : 'bg-slate-800 text-cyan-400 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isActive
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'bg-cyan-950/80 text-cyan-400 border border-cyan-700/50'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Telemetry Status Box */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 m-3 rounded-2xl border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-400" /> KBS Inference Engine
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  serverOnline ? 'bg-emerald-400 shadow-glow-emerald radar-dot' : 'bg-rose-500'
                }`}
              />
              <span
                className={`text-[11px] font-mono font-semibold ${
                  serverOnline ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {checkingHealth ? 'CHECKING...' : serverOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Forward-Chaining Rulebase: <span className="text-slate-300 font-mono">7 Active Rules</span>
          </p>
          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>SQLite Persisted</span>
            <span className="text-cyan-400">REST API 200</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 lg:h-20 bg-[#0b1120]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 flex items-center justify-between z-20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="hidden sm:inline text-slate-400">AEROPULSE KBS</span>
              <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-slate-600" />
              <span className="text-cyan-400 uppercase font-semibold">
                {navItems.find((n) => n.id === activeTab)?.label}
              </span>
            </div>
          </div>

          {/* Top Right Controls */}
          <div className="flex items-center gap-3">
            {activeTab !== 'diagnose' && (
              <button
                onClick={() => setActiveTab('diagnose')}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold tracking-wide shadow-glow-cyan transition-all transform hover:-translate-y-0.5"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>DIAGNOSE SENSORS</span>
              </button>
            )}

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-850 border border-slate-800 text-xs font-mono text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Production Safety Shield Active</span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-16 bg-[#070b14]/95 z-50 p-6 overflow-y-auto border-t border-slate-800">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-glow-blue'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-cyan-400" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
