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
    PhoneIcon,
    ListBulletIcon,
} from "@heroicons/react/24/outline";

export default function AdminShell() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [me, setMe] = useState(null);
    const [shopName, setShopName] = useState("");

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
        { name: "Phone-Orders Lists", icon:ListBulletIcon, path: "orderslists" },
    ];

    const companyAdminMenu = [
        { name: "Dashboard", icon: HomeIcon, path: "companyadmindashboard" }, // ✅ fixed path
        { name: "Assigned Orders", icon: ClipboardDocumentListIcon, path: "AssignedOrder" },
        { name: "Phone Orders", icon:PhoneIcon, path: "phone-orders" },
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
    const API_SHOP = "http://localhost:3000/api/shop";

    const fetchMe = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(API_ME, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();

            if (data.success) {
                setMe(data.user);

                const shopId =
                    typeof data.user?.shopId === "object"
                        ? data.user?.shopId?._id
                        : data.user?.shopId;

                if (data.user?.role === "shop-admin" && shopId) {
                    try {
                        const shopRes = await fetch(`${API_SHOP}/${shopId}`);
                        const shopData = await shopRes.json();
                        setShopName(shopData?.data?.name || "");
                    } catch {
                        setShopName("");
                    }
                } else {
                    setShopName("");
                }
            }
        } catch {
            setMe(null);
            setShopName("");
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

    const shopAdminLabel =
        user?.role === "shop-admin" && shopName ? `• ${shopName}` : "";

    return (
        <div className="orders-theme min-h-screen bg-[#0f1115] text-[#f6f1e8]">

            {/* ================= SIDEBAR ================= */}
            <aside
                className={`${sidebarOpen ? "w-64" : "w-20"
                    } fixed inset-y-0 left-0 z-40
        transition-all duration-300
        bg-[#171a20] border-r border-[#2a2f3a] shadow-sm
        flex flex-col`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 h-16 border-b border-[#2a2f3a] bg-gradient-to-r from-[#1d222c] via-[#171a20] to-[#2a2f3a]">
                    {sidebarOpen && (
                        <span className="orders-title text-lg font-semibold tracking-wide">
                            DASHBOARD
                        </span>
                    )}

                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-[#232833]"
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
                                    ? "bg-[#2a2f3a] text-[#f6f1e8]"
                                    : "text-[#a8905d] hover:bg-[#232833]"
                                }`
                            }
                            title={item.name}
                        >
                            {({ isActive }) => (
                                <>
                                    {/* ACTIVE INDICATOR BAR */}
                                    <span
                                        className={`absolute left-0 top-0 h-full w-1 rounded-r
                    ${"bg-[#c9a96a]"} ${sidebarOpen ? "" : "opacity-0"
                                            }`}
                                    />

                                    <item.icon
                                        className={`w-5 h-5 flex-shrink-0 ${isActive
                                            ? "text-[#f6f1e8]"
                                            : "text-[#c9a96a]"
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
          px-6 bg-[#171a20] border-b border-[#2a2f3a] shadow-sm`}
                >
                    <div className="relative">
                        <div className="absolute -top-4 left-0 h-1 w-40 rounded-full bg-gradient-to-r from-[#2a2f3a] via-[#171a20] to-[#1d222c]" />
                        <div className="flex items-center gap-2 text-sm text-[#c9a96a]">
                            <span className="uppercase tracking-[0.2em]">Dashboard</span>
                            <span>•</span>
                            <span className="text-[#f6f1e8] font-medium">{activeLabel}</span>
                            {shopAdminLabel && (
                                <span className="text-[#c9a96a]">{shopAdminLabel}</span>
                            )}
                        </div>
                        <h1 className="orders-title text-xl font-semibold">
                            {user?.role === "shop-admin" ? "Shop Admin" : "Admin"} Panel
                            {shopName && (
                                <span className="ml-2 text-sm font-medium text-[#c9a96a]">
                                    · {shopName}
                                </span>
                            )}
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Clock */}
                        <div className="text-right text-sm">
                            <div className="text-[#c9a96a]">{formattedDate}</div>
                            <div className="font-semibold">{formattedTime}</div>
                        </div>

                        {/* Company */}
                        {me?.companyId?.name && (
                            <div className="text-right text-sm">
                                <div className="text-[#c9a96a]">Company</div>
                                <div className="font-semibold text-[#f6f1e8]">
                                    {me.companyId.name}
                                </div>
                            </div>
                        )}

                        {/* Profile */}
                        <div className="flex items-center gap-3">
                            <img
                                src={`https://ui-avatars.com/api/?name=${me?.name || "Admin"}`}
                                className="w-10 h-10 rounded-full border border-[#2a2f3a]"
                                alt="profile"
                            />

                            {sidebarOpen && (
                                <span className="text-sm font-medium text-[#f6f1e8]">
                                    {me?.name || "Admin"}
                                </span>
                            )}
                        </div>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-[#e06c5f] hover:text-[#b65349]"
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
