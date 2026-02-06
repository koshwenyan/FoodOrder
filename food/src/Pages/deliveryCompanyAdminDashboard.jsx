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
            icon: <ClipboardDocumentListIcon className="w-10 h-10 text-[#8b6b4f]" />,
            link: "/company-admin/orders",
        },
        {
            name: "PickedUp Orders",
            count: totals.pickedupOrders,
            icon: <ClockIcon className="w-10 h-10 text-[#8b6b4f]" />,
            link: "/company-admin/pending-orders",
        },
        {
            name: "Delivered Orders",
            count: totals.deliveredOrders,
            icon: <TruckIcon className="w-10 h-10 text-[#8b6b4f]" />,
            link: "/company-admin/completed-orders",
        },
        {
            name: "Delivery Staff",
            count: totals.deliveryStaff,
            icon: <UserGroupIcon className="w-10 h-10 text-[#8b6b4f]" />,
            link: "/company-admin/delivery-staff",
        },
    ];

    /* ================= UI ================= */
    return (
        <div className="min-h-screen bg-[#f6f1eb] text-[#1f1a17]">
            <div className="px-6 py-6 sm:px-10">
                <div className="rounded-3xl bg-gradient-to-br from-[#f9e9d7] via-[#f8f3ee] to-[#f2ddc7] p-6 sm:p-8 shadow-lg border border-[#ead8c7]">
                    <p className="text-sm uppercase tracking-[0.2em] text-[#8b6b4f]">
                        Delivery Company Admin
                    </p>
                    <h1 className="text-3xl sm:text-4xl font-semibold">
                        Dashboard Overview
                    </h1>
                    <p className="text-sm text-[#6c5645] mt-2">
                        Track orders, deliveries, and staff activity.
                    </p>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cards.map((card) => (
                        <div
                            key={card.name}
                            onClick={() => navigate(card.link)}
                            className="cursor-pointer relative p-6 rounded-3xl shadow-sm border border-[#ead8c7] bg-white/90 transition hover:-translate-y-1 hover:shadow-md"
                        >
                            <div className="absolute -top-6 right-6 p-4 bg-white rounded-full shadow-md border border-[#ead8c7]">
                                {card.icon}
                            </div>
                            <div className="mt-8">
                                <p className="text-[#8b6b4f] font-semibold text-lg">
                                    {card.name}
                                </p>
                                <h2 className="text-[#1f1a17] text-3xl font-bold mt-2">
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
