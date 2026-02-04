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
    { name: " Create Orders", icon: ClipboardDocumentListIcon, path: "orders" },
    { name: "Delivery", icon: TruckIcon, path: "delivery" },
    { name: "Menu", icon: ShoppingCartIcon, path: "menu" },
    { name: "Orders Lists", icon: ShoppingCartIcon, path: "orderslists" },
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
    <div className="min-h-screen bg-gray-100 text-gray-900">

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } fixed inset-y-0 left-0 z-40
        transition-all duration-300
        bg-white border-r border-gray-200 shadow-sm
        flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
          {sidebarOpen && (
            <span className="text-lg font-bold tracking-wide">
              DASHBOARD
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
        </div>

        {/* Menu */}
        <nav className="mt-4 px-2 flex-1 space-y-1">
          {menu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition
                ${
                  isActive
                    ? "bg-[#3A3330] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
              title={item.name}
            >
              {/* ACTIVE INDICATOR BAR */}
              <span
                className={`absolute left-0 top-0 h-full w-1 rounded-r
                ${"bg-[#3A3330]"} ${
                  sidebarOpen ? "" : "opacity-0"
                }`}
              />

              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* ================= MAIN ================= */}
      <main
        className={`flex flex-col
        ${sidebarOpen ? "ml-64" : "ml-20"}`}
      >
        {/* TOP BAR (FIXED) */}
        <header
          className={`fixed top-0 right-0 z-30
          ${sidebarOpen ? "left-64" : "left-20"}
          h-16 flex items-center justify-between
          px-6 bg-white border-b border-gray-200 shadow-sm`}
        >
          <h1 className="text-xl font-bold">
            {user?.role === "shop-admin" ? "Shop Admin" : "Admin"} Panel
          </h1>

          <div className="flex items-center gap-6">
            <div className="text-right text-sm">
              <div className="text-gray-500">{formattedDate}</div>
              <div className="font-semibold">{formattedTime}</div>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={`https://ui-avatars.com/api/?name=${me?.name || "Admin"}`}
                className="w-10 h-10 rounded-full border border-gray-300"
                alt="profile"
              />
              {sidebarOpen && (
                <span className="text-sm font-medium">
                  {me?.name || "Admin"}
                </span>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </header>

        {/* PAGE CONTENT (SCROLLS) */}
        <div className="pt-16 h-screen overflow-auto p-6 ">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
