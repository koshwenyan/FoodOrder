import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UsersIcon,
  BuildingStorefrontIcon,
  BuildingOffice2Icon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [totals, setTotals] = useState({
    users: 0,
    shops: 0,
    companies: 0,
    categories: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  const API_BASE = "http://localhost:3000/api";

  const fetchTotals = async () => {
    const token = localStorage.getItem("token");
    try {
      const [usersRes, shopsRes, companiesRes, categoriesRes] =
        await Promise.all([
          fetch(`${API_BASE}/user/all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/shop`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/company`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/category/all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      const usersData = usersRes.ok ? await usersRes.json() : { totalUsers: 0 };
      const shopsData = shopsRes.ok ? await shopsRes.json() : { data: [] };
      const companiesData = companiesRes.ok
        ? await companiesRes.json()
        : { data: [] };
      const categoriesData = categoriesRes.ok
        ? await categoriesRes.json()
        : { data: [] };

      setTotals({
        users: usersData.totalUsers || 0,
        shops: shopsData.data?.length || 0,
        companies: companiesData.data?.length || 0,
        categories: categoriesData.data?.length || 0,
      });

      const activity = [
        ...(usersData.users || []).map((u) => ({
          id: u._id,
          label: "User",
          name: u.name || u.email || "New user",
          createdAt: u.createdAt,
        })),
        ...(shopsData.data || []).map((s) => ({
          id: s._id,
          label: "Restaurant",
          name: s.name || "New restaurant",
          createdAt: s.createdAt,
        })),
        ...(companiesData.data || []).map((c) => ({
          id: c._id,
          label: "Company",
          name: c.name || "New company",
          createdAt: c.createdAt,
        })),
        ...(categoriesData.data || []).map((c) => ({
          id: c._id,
          label: "Category",
          name: c.name || "New category",
          createdAt: c.createdAt,
        })),
      ];

      const sorted = activity
        .filter((a) => a.createdAt)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);

      setRecentActivity(sorted);
    } catch (err) {
      console.error("Error fetching totals:", err);
    }
  };

  useEffect(() => {
    fetchTotals();
  }, []);

  const cards = [
    {
      name: "Customers",
      count: totals.users,
      icon: <UsersIcon className="w-10 h-10 text-[#c9a96a]" />,
      gradient: "bg-[#171a20]",
      textColor: "text-[#f6f1e8]"
    },
    {
      name: "Restaurants",
      count: totals.shops,
      icon: <BuildingStorefrontIcon className="w-10 h-10 text-[#c9a96a]" />,
      gradient: "bg-[#171a20]",
      textColor: "text-[#f6f1e8]"
    },
    {
      name: "Companies",
      count: totals.companies,
      icon: <BuildingOffice2Icon className="w-10 h-10 text-[#c9a96a]" />,
      gradient: "bg-[#171a20]",
      textColor: "text-[#f6f1e8]"
    },
    {
      name: "Categories",
      count: totals.categories,
      icon: <Squares2X2Icon className="w-10 h-10 text-[#c9a96a]" />,
      gradient: "bg-[#171a20]",
      textColor: "text-[#f6f1e8]"
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f1115] text-[#f6f1e8]">
      <div className="px-6 py-6 sm:px-10">
        <div className="rounded-3xl bg-gradient-to-br from-[#1d222c] via-[#171a20] to-[#2a2f3a] p-6 sm:p-8 shadow-lg border border-[#2a2f3a]">
          <p className="text-sm uppercase tracking-[0.2em] text-[#c9a96a]">
            Platform Admin
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold">
            Dashboard Overview
          </h1>
          <p className="text-sm text-[#a8905d] mt-2">
            Track users, restaurants, companies, and categories at a glance.
          </p>
        </div>

        {/* CARDS */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div
              key={card.name}
              onClick={() => navigate("#")}
              className={`cursor-pointer relative p-6 rounded-3xl shadow-sm border border-[#2a2f3a] transition hover:-translate-y-1 hover:shadow-md ${card.gradient}`}
            >
              <div className="absolute -top-6 right-6 p-4 bg-[#171a20] rounded-full shadow-md border border-[#2a2f3a]">
                {card.icon}
              </div>

              <div className="mt-8">
                <p className="text-[#c9a96a] font-semibold text-lg">{card.name}</p>
                <h2 className={`${card.textColor} text-3xl font-bold mt-2`}>
                  {card.count}
                </h2>
              </div>

              <div className="mt-4 h-1 w-16 bg-[#2a2f3a] rounded-full opacity-80"></div>
            </div>
          ))}
        </div>

        {/* QUICK ACTIONS */}
        <div className="mt-8 rounded-3xl border border-[#2a2f3a] bg-[#171a20] shadow-sm p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-[#f6f1e8]">
              Quick Actions
            </h2>
            <span className="text-sm text-[#c9a96a]">
              Common admin tasks
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/admin/users")}
              className="rounded-full bg-[#f6f1e8] text-[#171a20] px-5 py-2 text-sm font-semibold border border-[#f6f1e8] hover:bg-[#c9a96a]"
            >
              Add User
            </button>
            <button
              onClick={() => navigate("/admin/categories")}
              className="rounded-full bg-[#171a20] border border-[#2a2f3a] px-5 py-2 text-sm font-semibold text-[#a8905d] hover:bg-[#232833]"
            >
              Add Category
            </button>
            <button
              onClick={() => navigate("/admin/shop")}
              className="rounded-full bg-[#171a20] border border-[#2a2f3a] px-5 py-2 text-sm font-semibold text-[#a8905d] hover:bg-[#232833]"
            >
              Add Restaurant
            </button>
            <button
              onClick={() => navigate("/admin/deliservice")}
              className="rounded-full bg-[#171a20] border border-[#2a2f3a] px-5 py-2 text-sm font-semibold text-[#a8905d] hover:bg-[#232833]"
            >
              Add Company
            </button>
          </div>
        </div>

        {/* INSIGHTS */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-[#2a2f3a] bg-[#171a20] shadow-sm p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#f6f1e8]">
                Platform Insights
              </h2>
              <span className="text-sm text-[#c9a96a]">Last 30 days</span>
            </div>
            <div className="mt-6 space-y-4">
              {[
                { label: "Users", value: totals.users },
                { label: "Restaurants", value: totals.shops },
                { label: "Companies", value: totals.companies },
                { label: "Categories", value: totals.categories },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm text-[#a8905d]">
                    <span>{item.label}</span>
                    <span className="font-semibold text-[#f6f1e8]">
                      {item.value}
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-[#2a2f3a]">
                    <div
                      className="h-2 rounded-full bg-[#c9a96a]"
                      style={{
                        width: `${Math.min(100, item.value * 5)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-xs text-[#c9a96a]">
                Bars reflect relative volume (scaled for display).
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-[#2a2f3a] bg-[#171a20] shadow-sm p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#f6f1e8]">
                Recent Activity
              </h2>
              <span className="text-sm text-[#c9a96a]">Latest</span>
            </div>
            <div className="mt-4 space-y-3">
              {recentActivity.length === 0 && (
                <div className="rounded-2xl border border-[#2a2f3a] bg-[#1d222c] p-4 text-sm text-[#a8905d]">
                  No recent activity yet. New user or shop events will appear
                  here.
                </div>
              )}
              {recentActivity.map((item) => (
                <div
                  key={`${item.label}-${item.id}`}
                  className="rounded-2xl border border-[#2a2f3a] bg-[#1d222c] p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#c9a96a]">
                        {item.label}
                      </p>
                      <p className="text-sm font-semibold text-[#f6f1e8] mt-1">
                        {item.name}
                      </p>
                    </div>
                    <span className="text-xs text-[#c9a96a]">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
