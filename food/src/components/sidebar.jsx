import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  TruckIcon,
  Bars3Icon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

/* ================= TOP ADMIN HEADER ================= */
function AdminHeader( ) {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const API_BASE = "http://localhost:3000/api/user";

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        if (!token || !userId) return;

        const res = await fetch(`${API_BASE}/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch current user");

        const data = await res.json();
        setCurrentUser(data);
      } catch (err) {
        console.error("Failed to fetch current user", err);
      }
    };
    fetchCurrentUser();
  }, []);

  // Live time
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

  return (
    <div className="flex items-center justify-between mb-6">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-white">Food Delivery</h1>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Date & Time Card */}
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-xl px-4 py-2 text-right shadow-md transition hover:shadow-lg">
          {/* <div className="text-xs text-slate-400">Today</div> */}
          <div className="text-sm font-medium text-emerald-400">{formattedDate}</div>
          <div className="text-sm font-semibold text-emerald-400">{formattedTime}</div>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 bg-slate-800/50 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700 shadow-md hover:shadow-lg transition cursor-pointer">
          <img
            src={`https://ui-avatars.com/api/?name=${currentUser?.name || "Admin"}&background=0f172a&color=22c55e`}
            alt="Admin"
            className="w-9 h-9 rounded-full border-2 border-emerald-400"
          />
          <span className="text-sm font-medium text-white">{currentUser?.name || "Admin"}</span>
        </div>

        {/* Logout
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Logout
        </button> */}
      </div>
    </div>
  );
}

/* ================= MAIN DASHBOARD ================= */
export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const menu = [
    { name: "Shop", icon: ShoppingCartIcon, path: "shop" },
    { name: "Category", icon: ClipboardDocumentListIcon, path: "category" },
    { name: "Delivery", icon: TruckIcon, path: "delivery" },
    { name: "Users", icon: UsersIcon, path: "users" },
    { name: "Reviews", icon: HomeIcon, path: "review" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`flex flex-col ${
          sidebarOpen ? "w-64" : "w-20"
        } transition-all duration-300 bg-slate-950/70 backdrop-blur-md border-r border-slate-800 shadow-lg`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800">
          {sidebarOpen && (
            <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              MNS
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-800/50 transition"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
        </div>

        {/* Menu */}
        <nav className="mt-6 space-y-1 px-3 flex-1 overflow-y-auto">
          {menu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all
                ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>{item.name}</span>}

              {/* Tooltip for collapsed sidebar */}
              {!sidebarOpen && (
                <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 origin-left rounded-md bg-slate-900/90 px-3 py-1 text-xs text-white shadow-lg transition-all whitespace-nowrap pointer-events-none">
                  {item.name}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Logout */}
        <div className="px-3 pb-4 mt-auto">
          <button
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ================= CONTENT ================= */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* TOP HEADER */}
        <AdminHeader onLogout={handleLogout} />

        {/* PAGE CONTENT */}
        <div className="rounded-2xl bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 shadow-xl transition-all">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
