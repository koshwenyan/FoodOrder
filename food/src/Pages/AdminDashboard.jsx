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
      icon: <UsersIcon className="w-10 h-10 text-[#8b6b4f]" />,
      gradient: "bg-white/90",
      textColor: "text-[#1f1a17]"
    },
    {
      name: "Restaurants",
      count: totals.shops,
      icon: <BuildingStorefrontIcon className="w-10 h-10 text-[#8b6b4f]" />,
      gradient: "bg-white/90",
      textColor: "text-[#1f1a17]"
    },
    {
      name: "Companies",
      count: totals.companies,
      icon: <BuildingOffice2Icon className="w-10 h-10 text-[#8b6b4f]" />,
      gradient: "bg-white/90",
      textColor: "text-[#1f1a17]"
    },
    {
      name: "Categories",
      count: totals.categories,
      icon: <Squares2X2Icon className="w-10 h-10 text-[#8b6b4f]" />,
      gradient: "bg-white/90",
      textColor: "text-[#1f1a17]"
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6f1eb] text-[#1f1a17]">
      <div className="px-6 py-6 sm:px-10">
        <div className="rounded-3xl bg-gradient-to-br from-[#f9e9d7] via-[#f8f3ee] to-[#f2ddc7] p-6 sm:p-8 shadow-lg border border-[#ead8c7]">
          <p className="text-sm uppercase tracking-[0.2em] text-[#8b6b4f]">
            Platform Admin
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold">
            Dashboard Overview
          </h1>
          <p className="text-sm text-[#6c5645] mt-2">
            Track users, restaurants, companies, and categories at a glance.
          </p>
        </div>

        {/* CARDS */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div
              key={card.name}
              onClick={() => navigate("#")}
              className={`cursor-pointer relative p-6 rounded-3xl shadow-sm border border-[#ead8c7] transition hover:-translate-y-1 hover:shadow-md ${card.gradient}`}
            >
              <div className="absolute -top-6 right-6 p-4 bg-white rounded-full shadow-md border border-[#ead8c7]">
                {card.icon}
              </div>

              <div className="mt-8">
                <p className="text-[#8b6b4f] font-semibold text-lg">{card.name}</p>
                <h2 className={`${card.textColor} text-3xl font-bold mt-2`}>
                  {card.count}
                </h2>
              </div>

              <div className="mt-4 h-1 w-16 bg-[#ead8c7] rounded-full opacity-80"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
