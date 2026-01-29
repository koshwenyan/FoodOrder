import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  TruckIcon,
  ShoppingCartIcon,
  Bars3Icon,
  ArrowRightOnRectangleIcon,
  BuildingOffice2Icon,
  BuildingOfficeIcon,
  Squares2X2Icon
} from "@heroicons/react/24/outline";

export default function AdminShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [me, setMe] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  /* ================= ROLE-BASED MENUS ================= */

  const adminMenu = [
    { name: "Dashboard", icon: HomeIcon, path: "dashboard" },
    { name: "Users", icon: UsersIcon, path: "users" },
    { name: "Shops", icon: BuildingOfficeIcon, path: "shop" },
    { name: "Deliservice", icon: BuildingOffice2Icon, path: "deliservice" },
    { name: "Categories", icon: Squares2X2Icon, path: "categories" },

  ];

  const shopAdminMenu = [
    { name: "Dashboard", icon: HomeIcon, path: "shopadmindashboard" },
    { name: "Orders", icon: ClipboardDocumentListIcon, path: "orders" },
    { name: "Delivery", icon: TruckIcon, path: "delivery" },
    { name: "Menu", icon: ShoppingCartIcon, path: "menu" },
  ];

  const menu =
    user?.role === "shop-admin" ? shopAdminMenu : adminMenu;

  /* ================= FETCH CURRENT USER ================= */

  const API_ME = "http://localhost:3000/api/user/me";

  const fetchMe = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_ME, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMe(data.user);
    } catch {
      setMe(null);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  /* ================= LIVE TIME ================= */

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedTime = currentTime.toLocaleTimeString();

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  /* ================= UI ================= */

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } transition-all duration-300 bg-slate-950 border-r border-slate-800`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800">
          {sidebarOpen && (
            <span className="text-lg font-bold text-emerald-400">
              DASHBOARD
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-800"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
        </div>

        {/* Menu */}
        <nav className="mt-6 space-y-1 px-3">
          {menu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition
                ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="flex-1 flex flex-col p-6">

        {/* TOP BAR */}
        <header className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
          <h1 className="text-xl font-bold text-emerald-400">
            {user?.role === "shop-admin" ? "Shop Admin" : "Admin"} Panel
          </h1>

          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <div className="text-slate-400">{formattedDate}</div>
              <div className="font-semibold text-emerald-400">
                {formattedTime}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <img
                src={`https://ui-avatars.com/api/?name=${me?.name || "Admin"}`}
                className="w-9 h-9 rounded-full"
                alt="profile"
              />
              <span className="text-sm">{me?.name || "Admin"}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-400 hover:text-red-300"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              Logout
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="flex-1 rounded-2xl bg-slate-800/50 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
