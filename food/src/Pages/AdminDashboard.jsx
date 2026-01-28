import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UsersIcon,
  BuildingStorefrontIcon,
  BuildingOffice2Icon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

export const AdminDashboard = () => {
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
      const [usersRes, shopsRes, companiesRes, categoriesRes] = await Promise.all([
        fetch(`${API_BASE}/user/all`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/shop`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/company`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/category/all`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const usersData = usersRes.ok ? await usersRes.json() : { totalUsers: 0 };
      const shopsData = shopsRes.ok ? await shopsRes.json() : { data: [] };
      const companiesData = companiesRes.ok ? await companiesRes.json() : { data: [] };
      const categoriesData = categoriesRes.ok ? await categoriesRes.json() : { data: [] };

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
      icon: <UsersIcon className="w-10 h-10 text-red-500" />,
      bg: "bg-red-50",
    },
    {
      name: "Restaurants",
      count: totals.shops,
      icon: <BuildingStorefrontIcon className="w-10 h-10 text-yellow-500" />,
      bg: "bg-yellow-50",
    },
    {
      name: "Companies",
      count: totals.companies,
      icon: <BuildingOffice2Icon className="w-10 h-10 text-green-500" />,
      bg: "bg-green-50",
    },
    {
      name: "Categories",
      count: totals.categories,
      icon: <Squares2X2Icon className="w-10 h-10 text-orange-500" />,
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="p-8 min-h-screen bg-slate-900">
      <h1 className="text-4xl font-bold text-gray-800 mb-10 text-center">
        🍴 Food Order Admin
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.name}
            onClick={() => navigate("#")}
            className={`cursor-pointer flex flex-col justify-between p-6 rounded-2xl shadow hover:shadow-lg transition bg-white ${card.bg}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-white shadow-sm">
                {card.icon}
              </div>
              <span className="text-gray-700 font-semibold">{card.name}</span>
            </div>

            <p className="text-3xl font-bold text-gray-800">{card.count}</p>

            <div className="h-1 w-16 bg-gray-200 rounded mt-2"></div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center text-gray-500">
        <p className="text-sm tracking-wide">
          Classic and clean food-order admin dashboard
        </p>
      </div>
    </div>
  );
};
