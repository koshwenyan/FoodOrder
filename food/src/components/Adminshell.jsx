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
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

export default function AdminShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [me, setMe] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

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

  const menu = user?.role === "shop-admin" ? shopAdminMenu : adminMenu;

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 relative">

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } transition-all duration-300 relative z-0`}
      >
        {/* Sidebar Glass Background */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-lg border-r border-white/20 rounded-tr-2xl rounded-br-2xl shadow-lg pointer-events-none"></div>

        {/* Sidebar Content */}
        <div className="relative z-10 flex flex-col h-full">

          {/* Header */}
          <div className="flex items-center justify-between px-4 h-16">
            {sidebarOpen && (
              <span className="text-lg font-bold text-white tracking-wide select-none">
                DASHBOARD
              </span>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition"
            >
              <Bars3Icon className="w-5 h-5 text-white" />
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
                   ${isActive
                    ? "bg-white/20 text-white shadow-md"
                    : "text-gray-200 hover:bg-white/10 hover:text-white"}`
                }
              >
                <item.icon className="w-5 h-5" />
                {sidebarOpen && <span>{item.name}</span>}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="flex-1 flex flex-col p-6">

        {/* TOP BAR */}
        <header className="flex items-center justify-between mb-6 pb-4
                           bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 shadow-lg">
          <h1 className="text-xl font-bold text-white tracking-wide">
            {user?.role === "shop-admin" ? "Shop Admin" : "Admin"} Panel
          </h1>

          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <div className="text-gray-300">{formattedDate}</div>
              <div className="font-semibold text-white">{formattedTime}</div>
            </div>

            <div className="flex items-center gap-2">
              <img
                src={`https://ui-avatars.com/api/?name=${me?.name || "Admin"}`}
                className="w-9 h-9 rounded-full border-2 border-white/30"
                alt="profile"
              />
              <span className="text-sm">{me?.name || "Admin"}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-400 hover:text-red-300 transition"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              Logout
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="flex-1 rounded-2xl bg-white/10 backdrop-blur-md p-6 shadow-lg">
          <Outlet />
        </div>
      </main>

    </div>
  );
}
