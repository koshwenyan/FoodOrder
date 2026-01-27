import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  TruckIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menu = [
    { name: "Shop", icon: ShoppingCartIcon, path: "shop" },
    { name: "Category", icon: ClipboardDocumentListIcon, path: "category" },
    { name: "Delivery", icon: TruckIcon, path: "delivery" },
    { name: "Users", icon: UsersIcon, path: "users" },
    { name: "Reviews", icon: HomeIcon, path: "review" },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100">
      
      {/* SIDEBAR */}
      <aside
        className={`relative ${
          sidebarOpen ? "w-64" : "w-20"
        } transition-all duration-300 bg-slate-950 border-r border-slate-800`}
      >
        {/* Accent Line */}
        <div className="absolute top-0 right-0 h-full w-[2px] bg-gradient-to-b from-emerald-400 via-cyan-400 to-indigo-400 opacity-70" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800">
          {sidebarOpen && (
            <span className="text-lg font-bold tracking-wide bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Admin DashBoard
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-800 transition"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
        </div>

        {/* MENU */}
        <nav className="mt-6 space-y-1 px-3">
          {menu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all
                ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)]"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`
              }
            >
              {/* Active Indicator */}
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-emerald-400 opacity-0 group-[.active]:opacity-100" />

              <item.icon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />

              {sidebarOpen && <span>{item.name}</span>}

              {/* Tooltip when collapsed */}
              {!sidebarOpen && (
                <span className="absolute left-16 z-50 scale-0 group-hover:scale-100 origin-left rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow-lg transition">
                  {item.name}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-6">
        <div className="rounded-2xl bg-slate-900/70 backdrop-blur border border-slate-800 p-6 min-h-full shadow-xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
