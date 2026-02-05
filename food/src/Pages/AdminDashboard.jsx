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
      icon: <UsersIcon className="w-8 h-8 text-blue-500" />,
      gradient: "bg-white",
      textColor: "text-blue-500"
    },
    {
      name: "Restaurants",
      count: totals.shops,
      icon: <BuildingStorefrontIcon className="w-8 h-8 text-orange-500" />,
      gradient: "bg-white",
      textColor: "text-orange-500"
    },
    {
      name: "Companies",
      count: totals.companies,
      icon: <BuildingOffice2Icon className="w-8 h-8 text-indigo-500" />,
      gradient: "bg-white",
      textColor: "text-indigo-500"
    },
    {
      name: "Categories",
      count: totals.categories,
      icon: <Squares2X2Icon className="w-8 h-8 text-purple-500" />,
      gradient: "bg-white",
      textColor: "text-purple-500"
    },
  ];

  return (
    <div className="min-h-screen bg-[#ECEFF1] p-8">
      <h1 className="text-3xl font-bold text-[#111827] mb-8">
        Dashboard Overview
      </h1>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card) => (
          <div
            key={card.name}
            onClick={() => navigate("#")}
            className={`cursor-pointer relative p-6 rounded-3xl shadow-lg transform transition hover:-translate-y-2 hover:shadow-2xl ${card.gradient}`}
          >
            {/* Icon */}
            <div className="absolute -top-6 right-6 p-4 bg-white rounded-full shadow-md">
              {card.icon}
            </div>

            {/* Content */}
           <div className="mt-8">
  <p className={`${card.textColor} font-semibold text-lg`}>{card.name}</p>
  <h2 className={`${card.textColor} text-3xl font-bold mt-2`}>{card.count}</h2>
</div>

            {/* Decorative bar */}
            <div className="mt-4 h-1 w-16 bg-white rounded-full opacity-70"></div>
          </div>
        ))}
      </div>


    </div>
  );
}
