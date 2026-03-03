import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TruckIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckBadgeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

export default function DeliveryCompanyAdminDashboard() {
  const navigate = useNavigate();

  const [totals, setTotals] = useState({
    orders: 0,
    pickedupOrders: 0,
    deliveredOrders: 0,
    completedOrders: 0,
    phoneOrders: 0,
    deliveryStaff: 0,
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = useMemo(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  }, []);
  const companyId = user?.companyId;

  const API_BASE = "http://localhost:3000/api";

  const fetchTotals = async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const [ordersRes, staffRes, phoneOrdersRes] = await Promise.all([
        fetch(`${API_BASE}/order/company/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/company/${companyId}/staffs`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/phoneCalledOrder/company/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const ordersData = ordersRes.ok ? await ordersRes.json() : { data: [] };
      const staffData = staffRes.ok ? await staffRes.json() : { data: [] };
      const phoneOrdersData = phoneOrdersRes.ok
        ? await phoneOrdersRes.json()
        : { data: [] };

      const orderList = ordersData?.data || [];
      const phoneOrderList = phoneOrdersData?.data || [];
      const staffArray = staffData?.data?.staffs || staffData?.data || [];

      const picked = orderList.filter((o) => o.status === "picked-up").length;
      const delivered = orderList.filter((o) => o.status === "delivered").length;
      const completed = orderList.filter((o) => o.status === "complete").length;

      setOrders(orderList);
      setTotals({
        orders: orderList.length,
        pickedupOrders: picked,
        deliveredOrders: delivered,
        completedOrders: completed,
        phoneOrders: phoneOrderList.length,
        deliveryStaff: staffData?.data?.staffCount || staffArray.length,
      });
    } catch (err) {
      console.error("Error fetching company totals:", err);
      setOrders([]);
      setTotals({
        orders: 0,
        pickedupOrders: 0,
        deliveredOrders: 0,
        completedOrders: 0,
        phoneOrders: 0,
        deliveryStaff: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTotals();
  }, [companyId]);

  const cards = [
    {
      name: "Total Orders",
      count: totals.orders,
      icon: <ClipboardDocumentListIcon className="w-10 h-10 text-[#475569]" />,
      link: "/company-admin/orders",
    },
    {
      name: "Picked-Up Orders",
      count: totals.pickedupOrders,
      icon: <ClockIcon className="w-10 h-10 text-[#475569]" />,
      link: "/company-admin/pending-orders",
    },
    {
      name: "Delivered Orders",
      count: totals.deliveredOrders,
      icon: <TruckIcon className="w-10 h-10 text-[#475569]" />,
      link: "/company-admin/completed-orders",
    },
    {
      name: "Completed Orders",
      count: totals.completedOrders,
      icon: <CheckBadgeIcon className="w-10 h-10 text-[#475569]" />,
      link: "/company-admin/AssignedOrder?status=complete",
    },
    {
      name: "Phone Orders",
      count: totals.phoneOrders,
      icon: <PhoneIcon className="w-10 h-10 text-[#475569]" />,
      link: "/company-admin/phone-orders",
    },
    {
      name: "Delivery Staff",
      count: totals.deliveryStaff,
      icon: <UserGroupIcon className="w-10 h-10 text-[#475569]" />,
      link: "/company-admin/delivery-staff",
    },
  ];

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-white text-[#0f172a]">
      <div className="px-6 py-6 sm:px-10">
        <div className="rounded-3xl bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] p-6 sm:p-8 shadow-lg border border-[#cbd5e1]">
          <p className="text-sm uppercase tracking-[0.2em] text-[#475569]">
            Delivery Company Admin
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold">Dashboard Overview</h1>
          <p className="text-sm text-[#475569] mt-2">
            Track orders, delivery progress, staff activity, and phone orders.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.name}
              onClick={() => navigate(card.link)}
              className="cursor-pointer relative p-6 rounded-3xl shadow-sm border border-[#cbd5e1] bg-[#f8fafc] transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="absolute -top-6 right-6 p-4 bg-[#f8fafc] rounded-full shadow-md border border-[#cbd5e1]">
                {card.icon}
              </div>
              <div className="mt-8">
                <p className="text-[#475569] font-semibold text-lg">{card.name}</p>
                <h2 className="text-[#0f172a] text-3xl font-bold mt-2">
                  {loading ? "..." : card.count}
                </h2>
              </div>
              <div className="mt-4 h-1 w-16 bg-[#cbd5e1] rounded-full opacity-80"></div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-[#cbd5e1] bg-[#f8fafc] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#cbd5e1] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#0f172a]">Recent Orders</h2>
            <button
              onClick={() => navigate("/company-admin/AssignedOrder")}
              className="rounded-full border border-[#cbd5e1] px-4 py-2 text-xs font-semibold text-[#475569] hover:border-[#e2e8f0] hover:text-[#0f172a]"
            >
              View all orders
            </button>
          </div>

          {loading && <div className="px-6 py-8 text-[#475569]">Loading recent orders...</div>}

          {!loading && recentOrders.length === 0 && (
            <div className="px-6 py-8 text-[#475569]">No orders found yet.</div>
          )}

          {!loading && recentOrders.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-[#f8fafc] text-left">
                  <tr>
                    <th className="px-4 py-3 text-sm font-semibold text-[#475569]">Customer</th>
                    <th className="px-4 py-3 text-sm font-semibold text-[#475569]">Shop</th>
                    <th className="px-4 py-3 text-sm font-semibold text-[#475569]">Status</th>
                    <th className="px-4 py-3 text-sm font-semibold text-[#475569]">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-t border-[#cbd5e1] hover:bg-[#e2e8f0]"
                    >
                      <td className="px-4 py-3 text-sm text-[#0f172a]">
                        {order.customer?.name || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#0f172a]">
                        {order.shopId?.name || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#0f172a] capitalize">
                        {order.status || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#0f172a]">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
