import { useState, useEffect } from "react";
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

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  const menu = [
    { name: "Shop", icon: ShoppingCartIcon, path: "shop" },
    { name: "Category", icon: ClipboardDocumentListIcon, path: "category" },
    { name: "Delivery", icon: TruckIcon, path: "delivery" },
    { name: "Users", icon: UsersIcon, path: "users" },
    { name: "Reviews", icon: HomeIcon, path: "review" },
  ];

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        if (!token || !userId) return;

        const res = await fetch(`http://localhost:3000/api/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch user");

        const data = await res.json();
        setCurrentUser(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCurrentUser();
  }, []);

  // Live time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format date and time
  const formattedDate = currentTime.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formattedTime = currentTime.toLocaleTimeString();

  // Logout function
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`relative ${
          sidebarOpen ? "w-64" : "w-20"
        } transition-all duration-300 bg-slate-950 border-r border-slate-800`}
      >
        <div className="absolute top-0 right-0 h-full w-[2px] bg-gradient-to-b from-emerald-400 via-cyan-400 to-indigo-400 opacity-70" />

        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800">
          {sidebarOpen && (
            <span className="text-lg font-bold tracking-wide bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              MNS
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-800 transition"
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
                `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all
                ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)]"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`
              }
            >
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

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 flex flex-col p-6">
        {/* TOP HEADER */}
        <header className="flex items-center justify-between mb-6">
          {/* Page title */}
          <h1 className="text-2xl font-bold tracking-wide bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">MNS</h1>

          {/* Right side: Date, time, profile, logout */}
          <div className="flex items-center gap-4">
            {/* Date & time */}
            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-xl px-4 py-2 text-right shadow-md">
              <div className="text-xs text-slate-400">Today</div>
              <div className="text-sm font-medium text-emerald-400">{formattedDate}</div>
              <div className="text-sm font-semibold text-emerald-400">{formattedTime}</div>
            </div>

            {/* Admin profile */}
            <div className="flex items-center gap-3 bg-slate-800/50 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700 shadow-md hover:shadow-lg transition cursor-pointer">
              <img
                src={`https://ui-avatars.com/api/?name=${currentUser?.name || "Admin"}&background=0f172a&color=22c55e`}
                alt="Admin"
                className="w-9 h-9 rounded-full border-2 border-emerald-400"
              />
              <span className="text-sm font-medium text-white">{currentUser?.name || "Admin"}</span>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              Logout
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="rounded-2xl bg-slate-900/70 backdrop-blur border border-slate-800 p-6 flex-1 shadow-xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
