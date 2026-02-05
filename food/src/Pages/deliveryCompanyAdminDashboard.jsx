import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    TruckIcon,
    UserGroupIcon,
    ClipboardDocumentListIcon,
    ClockIcon,
} from "@heroicons/react/24/outline";

export default function DeliveryCompanyAdminDashboard() {
    const navigate = useNavigate();

    const [totals, setTotals] = useState({
        orders: 0,
        pickedupOrders: 0,
        deliveredOrders: 0,
        deliveryStaff: 0,
    });

    const user = JSON.parse(localStorage.getItem("user"));
    const companyId = user?.companyId;

    const API_BASE = "http://localhost:3000/api";

    /* ================= FETCH TOTALS ================= */
    const fetchTotals = async () => {
        if (!companyId) return;

        const token = localStorage.getItem("token");

        try {
            const [ordersRes, staffRes] = await Promise.all([
                fetch(`${API_BASE}/order/company/orders`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${API_BASE}/company/${companyId}/staffs`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            const ordersData = ordersRes.ok ? await ordersRes.json() : { data: [] };
            const staffData = staffRes.ok ? await staffRes.json() : { data: [] };

            console.log("orderData", ordersData)

            const orders = ordersData.data || [];
            const staffArray = staffData.data?.staffs || staffData.data || [];

            const picked = orders.filter((o) => o.status === "picked-up").length;
            const delivered = orders.filter((o) => o.status === "delivered").length;

            setTotals({
                orders: orders.length,
                pickedupOrders: picked,
                deliveredOrders: delivered,
                deliveryStaff: staffData.data?.staffCount || staffArray.length,
            });
        } catch (err) {
            console.error("Error fetching company totals:", err);
        }
    };

    useEffect(() => {
        fetchTotals();
    }, [companyId]);

    /* ================= CARDS ================= */
    const cards = [
        {
            name: "Total Orders",
            count: totals.orders,
            icon: <ClipboardDocumentListIcon className="w-10 h-10 text-red-500" />,
            gradient: "bg-gradient-to-r from-red-400 to-pink-500",
            link: "/company-admin/orders",
        },
        {
            name: "PickedUp Orders",
            count: totals.pickedupOrders,
            icon: <ClockIcon className="w-10 h-10 text-orange-500" />,
            gradient: "bg-gradient-to-r from-yellow-400 to-orange-500",
            link: "/company-admin/pending-orders",
        },
        {
            name: "Delivered Orders",
            count: totals.deliveredOrders,
            icon: <TruckIcon className="w-10 h-10 text-emerald-500" />,
            gradient: "bg-gradient-to-r from-green-400 to-teal-500",
            link: "/company-admin/completed-orders",
        },
        {
            name: "Delivery Staff",
            count: totals.deliveryStaff,
            icon: <UserGroupIcon className="w-10 h-10 text-purple-500" />,
            gradient: "bg-gradient-to-r from-purple-400 to-indigo-500",
            link: "/company-admin/delivery-staff",
        },
    ];

    /* ================= UI ================= */
    return (
        <div className="p-8 min-h-screen bg-slate-900">
            <h1 className="text-4xl font-bold text-gray-300 mb-12 text-center">
                Delivery Company Admin
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {cards.map((card) => (
                    <div
                        key={card.name}
                        onClick={() => navigate(card.link)}
                        className={`cursor-pointer relative p-6 rounded-3xl shadow-lg transform transition hover:-translate-y-2 hover:shadow-2xl ${card.gradient}`}
                    >
                        {/* Icon */}
                        <div className="absolute -top-6 right-6 p-4 bg-white rounded-full shadow-md">
                            {card.icon}
                        </div>

                        {/* Content */}
                        <div className="mt-8">
                            <p className="text-gray-100 font-semibold text-lg">
                                {card.name}
                            </p>
                            <h2 className="text-3xl font-bold text-white mt-2">
                                {card.count}
                            </h2>
                        </div>

                        {/* Decorative bar */}
                        <div className="mt-4 h-1 w-16 bg-white rounded-full opacity-70"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
