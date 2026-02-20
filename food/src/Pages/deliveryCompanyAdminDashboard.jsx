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
      icon: <ClipboardDocumentListIcon className="w-10 h-10 text-[#c9a96a]" />,
      link: "/company-admin/orders",
    },
    {
      name: "Picked-Up Orders",
      count: totals.pickedupOrders,
      icon: <ClockIcon className="w-10 h-10 text-[#c9a96a]" />,
      link: "/company-admin/pending-orders",
    },
    {
      name: "Delivered Orders",
      count: totals.deliveredOrders,
      icon: <TruckIcon className="w-10 h-10 text-[#c9a96a]" />,
      link: "/company-admin/completed-orders",
    },
    {
      name: "Completed Orders",
      count: totals.completedOrders,
      icon: <CheckBadgeIcon className="w-10 h-10 text-[#c9a96a]" />,
      link: "/company-admin/AssignedOrder?status=complete",
    },
    {
      name: "Phone Orders",
      count: totals.phoneOrders,
      icon: <PhoneIcon className="w-10 h-10 text-[#c9a96a]" />,
      link: "/company-admin/phone-orders",
    },
    {
      name: "Delivery Staff",
      count: totals.deliveryStaff,
      icon: <UserGroupIcon className="w-10 h-10 text-[#c9a96a]" />,
      link: "/company-admin/delivery-staff",
    },
  ];

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#0f1115] text-[#f6f1e8]">
      <div className="px-6 py-6 sm:px-10">
        <div className="rounded-3xl bg-gradient-to-br from-[#1d222c] via-[#171a20] to-[#2a2f3a] p-6 sm:p-8 shadow-lg border border-[#2a2f3a]">
          <p className="text-sm uppercase tracking-[0.2em] text-[#c9a96a]">
            Delivery Company Admin
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold">Dashboard Overview</h1>
          <p className="text-sm text-[#a8905d] mt-2">
            Track orders, delivery progress, staff activity, and phone orders.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.name}
              onClick={() => navigate(card.link)}
              className="cursor-pointer relative p-6 rounded-3xl shadow-sm border border-[#2a2f3a] bg-[#171a20] transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="absolute -top-6 right-6 p-4 bg-[#171a20] rounded-full shadow-md border border-[#2a2f3a]">
                {card.icon}
              </div>
              <div className="mt-8">
                <p className="text-[#c9a96a] font-semibold text-lg">{card.name}</p>
                <h2 className="text-[#f6f1e8] text-3xl font-bold mt-2">
                  {loading ? "..." : card.count}
                </h2>
              </div>
              <div className="mt-4 h-1 w-16 bg-[#2a2f3a] rounded-full opacity-80"></div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-[#2a2f3a] bg-[#171a20] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2f3a] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#f6f1e8]">Recent Orders</h2>
            <button
              onClick={() => navigate("/company-admin/AssignedOrder")}
              className="rounded-full border border-[#2a2f3a] px-4 py-2 text-xs font-semibold text-[#a8905d] hover:border-[#f6f1e8] hover:text-[#f6f1e8]"
            >
              View all orders
            </button>
          </div>

          {loading && <div className="px-6 py-8 text-[#a8905d]">Loading recent orders...</div>}

          {!loading && recentOrders.length === 0 && (
            <div className="px-6 py-8 text-[#a8905d]">No orders found yet.</div>
          )}

          {!loading && recentOrders.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-[#171a20] text-left">
                  <tr>
                    <th className="px-4 py-3 text-sm font-semibold text-[#a8905d]">Customer</th>
                    <th className="px-4 py-3 text-sm font-semibold text-[#a8905d]">Shop</th>
                    <th className="px-4 py-3 text-sm font-semibold text-[#a8905d]">Status</th>
                    <th className="px-4 py-3 text-sm font-semibold text-[#a8905d]">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-t border-[#2a2f3a] hover:bg-[#232833]"
                    >
                      <td className="px-4 py-3 text-sm text-[#f6f1e8]">
                        {order.customer?.name || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#f6f1e8]">
                        {order.shopId?.name || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#f6f1e8] capitalize">
                        {order.status || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#f6f1e8]">
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
