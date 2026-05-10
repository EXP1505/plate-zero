import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  TrendingUp,
  AlertTriangle,
  Scale,
  Calendar,
  Bell
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, active: true },
    { name: 'Reports', icon: BarChart3, active: false },
    { name: 'Settings', icon: Settings, active: false },
  ];

  const summaryCards = [
    { title: 'Total Waste (Today)', value: '45kg', icon: Scale, color: 'text-emerald-400', bg: 'bg-emerald-400/10', trend: '+5% vs yesterday', trendUp: false },
    { title: 'Highest Category', value: 'Grains', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10', trend: '35% of total', trendUp: null },
    { title: 'Weekly Average', value: '42.5kg', icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-400/10', trend: '-2% vs last week', trendUp: true },
    { title: 'Top Wasted Dish', value: 'Rice Pilaf', icon: TrendingUp, color: 'text-rose-400', bg: 'bg-rose-400/10', trend: '12.4kg today', trendUp: false },
  ];

  return (
    <div className="flex h-screen bg-[#0B1120] text-slate-200 font-sans selection:bg-emerald-500/30">
      
      {/* Background ambient glow */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 transition-transform duration-300 ease-out
        lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/20">
              PZ
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">PlateZero</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2 mt-4">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Menu</p>
          {navItems.map((item) => (
            <a
              key={item.name}
              href="#"
              className={`
                group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                ${item.active 
                  ? 'bg-slate-800/80 text-white shadow-sm border border-slate-700/50' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}
              `}
            >
              <item.icon size={20} className={`
                transition-colors duration-300
                ${item.active ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-400'}
              `} />
              <span className="font-medium">{item.name}</span>
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-6 lg:px-10 bg-slate-900/50 backdrop-blur-md border-b border-slate-800/60 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="lg:hidden text-slate-400 hover:text-white transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="hidden lg:block text-sm font-medium text-slate-400">
              Campus Mess Food Waste Dashboard
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button className="relative text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-900"></span>
              </span>
            </button>
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md cursor-pointer hover:opacity-90 transition-opacity border border-slate-700">
              AD
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-6 lg:p-10 scrollbar-hide">
          <div className="max-w-7xl mx-auto space-y-8 pb-10">
            
            {/* Page Title */}
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
              <p className="text-slate-400 mt-2 text-sm">Track and analyze daily food waste metrics across the campus.</p>
            </div>

            {/* Summary Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {summaryCards.map((card, idx) => (
                <div key={idx} className="group bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${card.bg} ${card.color} transition-transform duration-300 group-hover:scale-110`}>
                      <card.icon size={22} strokeWidth={2.5} />
                    </div>
                    <span className="text-xs font-semibold text-slate-300 bg-slate-700/50 px-3 py-1 rounded-full border border-slate-600/50">
                      Today
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-1">{card.title}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-white tracking-tight">{card.value}</span>
                    </div>
                    <p className={`text-xs font-medium mt-3 flex items-center gap-1
                      ${card.trendUp === true ? 'text-emerald-400' : card.trendUp === false ? 'text-rose-400' : 'text-slate-400'}
                    `}>
                      {card.trend}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Component */}
            {children}

          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
