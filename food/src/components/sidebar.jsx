import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  ShoppingBagIcon,
  UsersIcon,
  TagIcon,
  BuildingOfficeIcon,
  StarIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

const menu = [
  { name: "Dashboard", path: "/", icon: HomeIcon },
  { name: "Shop", path: "/shop", icon: ShoppingBagIcon },
  { name: "Users", path: "/users", icon: UsersIcon },
  { name: "Categories", path: "/categories", icon: TagIcon },
  { name: "Company", path: "/company", icon: BuildingOfficeIcon },
  { name: "Reviews", path: "/reviews", icon: StarIcon },
];

export default function Sidebar() {
  return (
    <aside className="w-72 min-h-screen bg-slate-950 text-slate-200 border-r border-slate-800 relative">
      {/* LOGO */}
      <div className="px-6 py-6 text-2xl font-bold">
        <span className="text-emerald-400">Admin</span> Panel
      </div>

      {/* MENU */}
      <nav className="px-4 space-y-1">
        {menu.map(({ name, path, icon: Icon }) => (
          <NavLink key={name} to={path} end>
            {({ isActive }) => (
              <div
                className={`
                  group flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{name}</span>

                {/* ACTIVE INDICATOR */}
                <span
                  className={`ml-auto h-5 w-1 rounded-full bg-emerald-400 transition ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
        <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400">
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
