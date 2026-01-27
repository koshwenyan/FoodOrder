import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon
,
  TruckIcon,
} from "@heroicons/react/24/outline";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menu = [
    { name: "Shop Management", icon: ShoppingCartIcon, path: "shop" },
    { name: "Category", icon: ClipboardDocumentListIcon, path: "category" },
    { name: "Delivery Services", icon: TruckIcon, path: "delivery" },
    { name: "Users", icon: UsersIcon, path: "users" },
    { name: "Reviews", icon: HomeIcon, path: "review" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } bg-slate-950 transition-all duration-300`}
      >
        <div className="flex items-center justify-between p-4">
          {sidebarOpen && <h1 className="font-bold text-xl text-emerald-400">Admin</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 bg-slate-800 rounded"
          >
            {sidebarOpen ? "<" : ">"}
          </button>
        </div>
        <nav className="mt-6">
          {menu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 hover:bg-slate-800 transition-colors ${
                  isActive ? "bg-emerald-500/30 text-emerald-400" : ""
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}
