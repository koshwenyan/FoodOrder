import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
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
    ListBulletIcon,
} from "@heroicons/react/24/outline";

export default function AdminShell() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [me, setMe] = useState(null);

    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const adminMenu = [
        { name: "Dashboard", icon: HomeIcon, path: "dashboard" },
        { name: "Users", icon: UsersIcon, path: "users" },
        { name: "Shops", icon: BuildingOfficeIcon, path: "shop" },
        { name: "Deliservice", icon: BuildingOffice2Icon, path: "deliservice" },
        { name: "Categories", icon: Squares2X2Icon, path: "categories" },
    ];

    const shopAdminMenu = [
        { name: "Dashboard", icon: HomeIcon, path: "shopadmindashboard" },
        { name: "Create Orders", icon: ClipboardDocumentListIcon, path: "orders" },
        { name: "Delivery", icon: TruckIcon, path: "delivery" },
        { name: "Menu", icon: ShoppingCartIcon, path: "menu" },
        { name: "Phone-Orders Lists", icon: ListBulletIcon, path: "orderslists" },
    ];

    const companyAdminMenu = [
        { name: "Dashboard", icon: HomeIcon, path: "companyadmindashboard" }, // ✅ fixed path
        { name: "Assigned Orders", icon: ClipboardDocumentListIcon, path: "AssignedOrder" },
        { name: "Delivery Staff", icon: TruckIcon, path: "delivery-staff" },
    ];

    /* ================= ROLE MAP ================= */

    const roleMenus = {
        admin: adminMenu,
        "shop-admin": shopAdminMenu,
        "company-admin": companyAdminMenu,
    };

    const roleTitles = {
        admin: "Admin",
        "shop-admin": "Shop Admin",
        "company-admin": "Company Admin",
    };

    const menu = roleMenus[user?.role] || adminMenu;
    const panelTitle = roleTitles[user?.role] || "Admin";

    /* ================= FETCH ME ================= */

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

    /* ================= CLOCK ================= */

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

    const activeLabel =
        menu.find((item) => location.pathname.includes(item.path))?.name ||
        (user?.role === "shop-admin" ? "Shop Admin" : "Admin");

    return (
        <div className="orders-theme min-h-screen bg-[#f6f1eb] text-[#1f1a17]">

            {/* ================= SIDEBAR ================= */}
            <aside
                className={`${sidebarOpen ? "w-64" : "w-20"
                    } fixed inset-y-0 left-0 z-40
        transition-all duration-300
        bg-white/90 border-r border-[#ead8c7] shadow-sm
        flex flex-col`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 h-16 border-b border-[#ead8c7] bg-gradient-to-r from-[#f9e9d7] via-[#f8f3ee] to-[#f2ddc7]">
                    {sidebarOpen && (
                        <span className="orders-title text-lg font-semibold tracking-wide">
                            DASHBOARD
                        </span>
                    )}

                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-white/70"
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
                ${isActive
                                    ? "bg-[#1f1a17] text-[#f8f3ee]"
                                    : "text-[#6c5645] hover:bg-white/70"
                                }`
                            }
                            title={item.name}
                        >
                            {({ isActive }) => (
                                <>
                                    {/* ACTIVE INDICATOR BAR */}
                                    <span
                                        className={`absolute left-0 top-0 h-full w-1 rounded-r
                    ${"bg-[#1f1a17]"} ${sidebarOpen ? "" : "opacity-0"
                                            }`}
                                    />

                                    <item.icon
                                        className={`w-5 h-5 flex-shrink-0 ${isActive
                                            ? "text-[#f8f3ee]"
                                            : "text-[#8b6b4f]"
                                            }`}
                                    />
                                    {sidebarOpen && <span>{item.name}</span>}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* ============ MAIN ============ */}
            <main className={`flex flex-col ${sidebarOpen ? "ml-64" : "ml-20"}`}>
                {/* TOP BAR */}
                <header
                    className={`fixed top-0 right-0 z-30
          ${sidebarOpen ? "left-64" : "left-20"}
          h-16 flex items-center justify-between
          px-6 bg-white/90 border-b border-[#ead8c7] shadow-sm`}
                >
                    <div className="relative">
                        <div className="absolute -top-4 left-0 h-1 w-40 rounded-full bg-gradient-to-r from-[#f2ddc7] via-[#f8f3ee] to-[#f9e9d7]" />
                        <div className="flex items-center gap-2 text-sm text-[#8b6b4f]">
                            <span className="uppercase tracking-[0.2em]">Dashboard</span>
                            <span>•</span>
                            <span className="text-[#1f1a17] font-medium">{activeLabel}</span>
                        </div>
                        <h1 className="orders-title text-xl font-semibold">
                            {user?.role === "shop-admin" ? "Shop Admin" : "Admin"} Panel
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Clock */}
                        <div className="text-right text-sm">
                            <div className="text-[#8b6b4f]">{formattedDate}</div>
                            <div className="font-semibold">{formattedTime}</div>
                        </div>

                        {/* Profile */}
                        <div className="flex items-center gap-3">
                            <img
                                src={`https://ui-avatars.com/api/?name=${me?.name || "Admin"}`}
                                className="w-10 h-10 rounded-full border border-[#ead8c7]"
                                alt="profile"
                            />

                            {sidebarOpen && (
                                <span className="text-sm font-medium text-[#1f1a17]">
                                    {me?.name || "Admin"}
                                </span>
                            )}
                        </div>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-[#b53b2e] hover:text-[#922f25]"
                        >
                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                            {sidebarOpen && <span>Logout</span>}
                        </button>
                    </div>
                </header>

                {/* PAGE CONTENT (SCROLLS) */}
                <div className="pt-16 h-screen overflow-auto p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
