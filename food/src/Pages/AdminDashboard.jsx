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
      icon: <UsersIcon className="w-8 h-8 text-blue-600" />,
    },
    {
      name: "Restaurants",
      count: totals.shops,
      icon: <BuildingStorefrontIcon className="w-8 h-8 text-orange-600" />,
    },
    {
      name: "Companies",
      count: totals.companies,
      icon: <BuildingOffice2Icon className="w-8 h-8 text-indigo-600" />,
    },
    {
      name: "Categories",
      count: totals.categories,
      icon: <Squares2X2Icon className="w-8 h-8 text-purple-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#ECEFF1] p-8">
      <h1 className="text-3xl font-bold text-[#111827] mb-8">
        Dashboard Overview
      </h1>

      {/* CARDS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 place-items-start">
        {cards.map((card) => (
          <div
            key={card.name}
            onClick={() => navigate("#")}
            className="
              w-[260px]
              bg-white
              border border-gray-200
              rounded-md
              p-5
              cursor-pointer
              shadow-[0_6px_16px_rgba(0,0,0,0.1)]
              transition
              hover:-translate-y-1
            "
          >
            {/* ICON */}
            <div className="w-12 h-12 flex items-center justify-center rounded bg-gray-100">
              {card.icon}
            </div>

            {/* TEXT */}
            <p className="mt-4 text-sm text-gray-500">{card.name}</p>
            <h2 className="text-3xl font-bold text-[#111827] mt-1">
              {card.count}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}
