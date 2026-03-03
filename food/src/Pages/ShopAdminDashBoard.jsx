import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookmarkIcon,
  ClockIcon,
  TruckIcon,
  Squares2X2Icon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

const API_BASE = "http://localhost:3000/api";

const STATUS_LABELS = {
  pending: "Pending",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready",
  assigned: "Assigned",
  "picked-up": "Picked-up",
  delivered: "Delivered",
  complete: "Complete",
  cancelled: "Cancelled",
};

const STATUS_KEYS = Object.keys(STATUS_LABELS);

const PENDING_LIKE = new Set(["pending", "accepted", "preparing", "ready", "assigned"]);
const COMPLETE_LIKE = new Set(["delivered", "complete"]);
const SHOP_ADMIN_STATUS_ACTIONS = [
  "accepted",
  "preparing",
  "ready",
  "delivered",
  "complete",
  "cancelled",
];

function getRangeStart(range) {
  const now = new Date();

  if (range === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (range === "7d") {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US").format(Math.round(Number(amount || 0)));
}

function formatDateTime(value) {
  if (!value) return "-";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "-";

  return dt.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function safeParseUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function ShopAdminDashboard() {
  const navigate = useNavigate();
  const user = safeParseUser();
  const shopId = typeof user?.shopId === "object" ? user?.shopId?._id : user?.shopId;

  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [dateRange, setDateRange] = useState("7d");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState("");
  const NOTI_STORAGE_KEY = "foodorder.notifications.shopadmin";
  const [notifications, setNotifications] = useState(() => {
    try {
      const raw = localStorage.getItem(NOTI_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [toasts, setToasts] = useState([]);
  const prevOrderMapRef = useRef(new Map());
  const soundEnabledRef = useRef(false);

  const fetchDashboardData = async () => {
    if (!shopId) return;

    const token = localStorage.getItem("token");
    setIsLoading(true);

    try {
      const [orderRes, menuRes] = await Promise.all([
        fetch(`${API_BASE}/order/shop/${shopId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/menu/shop/${shopId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const orderData = orderRes.ok ? await orderRes.json() : { data: [] };
      const menuData = menuRes.ok ? await menuRes.json() : { data: [] };

      setOrders(Array.isArray(orderData.data) ? orderData.data : []);
      setMenuItems(Array.isArray(menuData.data) ? menuData.data : []);
    } catch (error) {
      console.error("Failed to load shop admin dashboard:", error);
      setOrders([]);
      setMenuItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const playNotificationSound = () => {
    if (!soundEnabledRef.current) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 660;
      gain.gain.value = 0.03;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        ctx.close();
      }, 100);
    } catch {
      // ignore autoplay restrictions
    }
  };

  const pushNotification = (title, body) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const entry = { id, title, body, createdAt: new Date() };
    setNotifications((prev) => [entry, ...prev].slice(0, 20));
    setToasts((prev) => [entry, ...prev].slice(0, 4));
    playNotificationSound();
    setTimeout(() => {
      setToasts((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [shopId]);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchDashboardData();
    }, 15000);
    return () => clearInterval(timer);
  }, [shopId]);

  useEffect(() => {
    const enableSound = () => {
      soundEnabledRef.current = true;
    };
    window.addEventListener("pointerdown", enableSound, { once: true });
    return () => window.removeEventListener("pointerdown", enableSound);
  }, []);

  useEffect(() => {
    if (!orders || orders.length === 0) return;
    const prevMap = prevOrderMapRef.current;
    orders.forEach((order) => {
      if (!order?._id) return;
      const prevStatus = prevMap.get(order._id);
      if (prevStatus && prevStatus !== order.status) {
        pushNotification(
          "Order status updated",
          `#${String(order._id).slice(-6)} is now ${order.status}`
        );
      }
      prevMap.set(order._id, order.status);
    });
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(NOTI_STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      // ignore storage errors
    }
  }, [notifications]);

  const handleStatusUpdate = async (nextStatus) => {
    if (!selectedOrder?._id || !nextStatus) return;

    const token = localStorage.getItem("token");
    setStatusUpdating(true);
    setStatusError("");

    try {
      const res = await fetch(`${API_BASE}/order/${selectedOrder._id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Failed to update order status");
      }

      const updatedOrder = data?.data || { ...selectedOrder, status: nextStatus };

      setOrders((prev) =>
        prev.map((order) => (order._id === selectedOrder._id ? { ...order, ...updatedOrder } : order))
      );
      setSelectedOrder((prev) => (prev ? { ...prev, ...updatedOrder } : prev));
      pushNotification(
        "Status updated",
        `#${String(updatedOrder._id || selectedOrder._id).slice(-6)} set to ${updatedOrder.status}`
      );
    } catch (error) {
      setStatusError(error.message || "Failed to update order status.");
    } finally {
      setStatusUpdating(false);
    }
  };

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setSelectedOrder(null);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const rangeStart = useMemo(() => getRangeStart(dateRange), [dateRange]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (!order?.createdAt) return false;
      return new Date(order.createdAt) >= rangeStart;
    });
  }, [orders, rangeStart]);

  const statusCounts = useMemo(() => {
    const base = STATUS_KEYS.reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {});

    filteredOrders.forEach((order) => {
      const status = order?.status;
      if (status && base[status] !== undefined) {
        base[status] += 1;
      }
    });

    return base;
  }, [filteredOrders]);

  const todayOrders = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return orders.filter((order) => new Date(order.createdAt) >= start).length;
  }, [orders]);

  const kpis = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const pendingOrders = filteredOrders.filter((order) => PENDING_LIKE.has(order.status)).length;
    const completedOrders = filteredOrders.filter((order) => COMPLETE_LIKE.has(order.status)).length;

    const revenue = filteredOrders
      .filter((order) => order.status !== "cancelled")
      .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

    const completedWithTimes = filteredOrders.filter(
      (order) => COMPLETE_LIKE.has(order.status) && order.createdAt && order.updatedAt
    );

    const avgPrepMinutes =
      completedWithTimes.length > 0
        ? completedWithTimes.reduce((sum, order) => {
            const start = new Date(order.createdAt).getTime();
            const end = new Date(order.updatedAt).getTime();
            return sum + Math.max(0, end - start) / 60000;
          }, 0) / completedWithTimes.length
        : 0;

    const cancelled = filteredOrders.filter((order) => order.status === "cancelled").length;
    const cancelRate = totalOrders ? (cancelled / totalOrders) * 100 : 0;

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      revenue,
      avgPrepMinutes,
      cancelRate,
    };
  }, [filteredOrders]);

  const recentOrders = useMemo(() => {
    return [...filteredOrders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);
  }, [filteredOrders]);

  const topMenus = useMemo(() => {
    const map = new Map();

    filteredOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const key = item.menuId?._id || item.menuId || item.name;
        if (!key) return;

        const qty = Number(item.quantity || 0);
        const lineTotal = Number(item.lineTotal || item.price * qty || 0);

        if (!map.has(key)) {
          map.set(key, {
            name: item.name || "Unnamed Item",
            qty: 0,
            revenue: 0,
          });
        }

        const current = map.get(key);
        current.qty += qty;
        current.revenue += lineTotal;
      });
    });

    return Array.from(map.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [filteredOrders]);

  const alerts = useMemo(() => {
    const now = Date.now();

    const overduePending = filteredOrders.filter((order) => {
      if (!PENDING_LIKE.has(order.status)) return false;
      const created = new Date(order.createdAt).getTime();
      return now - created > 45 * 60 * 1000;
    }).length;

    const readyNoCompany = filteredOrders.filter(
      (order) => order.status === "ready" && !order.deliveryCompany
    ).length;

    const cancelled = filteredOrders.filter((order) => order.status === "cancelled").length;

    return [
      overduePending > 0
        ? `${overduePending} pending orders are older than 45 minutes.`
        : null,
      readyNoCompany > 0
        ? `${readyNoCompany} ready orders have no delivery company assigned.`
        : null,
      cancelled > 0
        ? `${cancelled} orders were cancelled in this range.`
        : null,
    ].filter(Boolean);
  }, [filteredOrders]);

  const cards = [
    {
      name: "Orders",
      count: kpis.totalOrders,
      icon: <BookmarkIcon className="w-10 h-10 text-[#475569]" />,
      link: "/shop-admin/orderslists",
    },
    {
      name: "Pending Orders",
      count: kpis.pendingOrders,
      icon: <ClockIcon className="w-10 h-10 text-[#475569]" />,
      link: "/shop-admin/delivery",
    },
    {
      name: "Completed Orders",
      count: kpis.completedOrders,
      icon: <TruckIcon className="w-10 h-10 text-[#475569]" />,
      link: "/shop-admin/orderslists",
    },
    {
      name: "Total Menu Items",
      count: menuItems.length,
      icon: <Squares2X2Icon className="w-10 h-10 text-[#475569]" />,
      link: "/shop-admin/menu",
    },
  ];

  const quickActions = [
    { label: "Create Phone Order", path: "/shop-admin/orders" },
    { label: "Manage Delivery", path: "/shop-admin/delivery" },
    { label: "Edit Menu", path: "/shop-admin/menu" },
    { label: "View Order List", path: "/shop-admin/orderslists" },
  ];

  const rangeLabel =
    dateRange === "today" ? "Today" : dateRange === "7d" ? "Last 7 days" : "Last 30 days";

  return (
    <div className="min-h-screen anim-fade-in-up bg-white text-[#0f172a]">
      {toasts.length > 0 && (
        <div className="fixed right-6 top-24 z-40 w-[320px] space-y-3">
          {toasts.map((note) => (
            <div
              key={note.id}
              className="rounded-2xl border border-[#cbd5e1] bg-[#f8fafc] px-4 py-3 text-sm shadow-lg"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-[#475569]">Notification</p>
              <p className="mt-1 font-semibold">{note.title}</p>
              <p className="text-xs text-[#475569] mt-1">{note.body}</p>
            </div>
          ))}
        </div>
      )}
      <div className="px-6 py-6 sm:px-10">
        <div className="rounded-3xl bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] p-6 sm:p-8 shadow-lg border border-[#cbd5e1]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#475569]">Shop Admin</p>
              <h1 className="text-3xl sm:text-4xl font-semibold">Dashboard Overview</h1>
              <p className="text-sm text-[#475569] mt-2">
                Monitor shop operations, order flow, and menu performance.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.2em] text-[#475569]">Range</span>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="rounded-xl border border-[#cbd5e1] bg-[#f8fafc] px-3 py-2 text-sm text-[#0f172a] outline-none focus:border-[#0ea5e9]"
              >
                <option value="today">Today</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#cbd5e1] bg-[#f8fafc] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#475569]">Today Orders</p>
            <p className="text-2xl font-bold mt-2">{todayOrders}</p>
          </div>
          <div className="rounded-2xl border border-[#cbd5e1] bg-[#f8fafc] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#475569]">Revenue ({rangeLabel})</p>
            <p className="text-2xl font-bold mt-2">{formatCurrency(kpis.revenue)} Ks</p>
          </div>
          <div className="rounded-2xl border border-[#cbd5e1] bg-[#f8fafc] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#475569]">Avg Cycle Time</p>
            <p className="text-2xl font-bold mt-2">{Math.round(kpis.avgPrepMinutes)} min</p>
          </div>
          <div className="rounded-2xl border border-[#cbd5e1] bg-[#f8fafc] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#475569]">Cancel Rate</p>
            <p className="text-2xl font-bold mt-2">{kpis.cancelRate.toFixed(1)}%</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <h2 className="text-[#0f172a] text-3xl font-bold mt-2">{card.count}</h2>
              </div>
              <div className="mt-4 h-1 w-16 bg-[#cbd5e1] rounded-full opacity-80"></div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
          <section className="rounded-3xl border border-[#cbd5e1] bg-[#f8fafc] p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Order Status Breakdown</h2>
            <p className="text-sm text-[#475569] mt-1">{rangeLabel}</p>

            <div className="mt-5 space-y-4">
              {STATUS_KEYS.map((key) => {
                const count = statusCounts[key] || 0;
                const total = filteredOrders.length || 1;
                const percent = (count / total) * 100;

                return (
                  <div key={key}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-[#0f172a]">{STATUS_LABELS[key]}</span>
                      <span className="text-[#475569]">{count}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-[#cbd5e1] overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-[#0ea5e9]"
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-[#cbd5e1] bg-[#f8fafc] p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Quick Actions</h2>
              <div className="mt-4 space-y-3">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className="w-full rounded-xl border border-[#cbd5e1] bg-[#f1f5f9] px-4 py-3 text-left text-sm font-medium flex items-center justify-between hover:bg-[#e2e8f0]"
                  >
                    <span>{action.label}</span>
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 text-[#475569]" />
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#cbd5e1] bg-[#f8fafc] p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Alerts</h2>
              <div className="mt-4 space-y-3">
                {alerts.length ? (
                  alerts.map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-[#cbd5e1] bg-[#f1f5f9] px-4 py-3 flex items-start gap-3"
                    >
                      <ExclamationTriangleIcon className="w-5 h-5 text-[#bf6b3f] flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-[#0f172a]">{item}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#475569]">No major alerts in {rangeLabel.toLowerCase()}.</p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-[#cbd5e1] bg-[#f8fafc] p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Notifications</h2>
                {notifications.length > 0 && (
                  <button
                    onClick={() => {
                      setNotifications([]);
                      setToasts([]);
                    }}
                    className="text-xs font-semibold text-[#475569] underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="mt-4 space-y-3">
                {notifications.length === 0 && (
                  <p className="text-sm text-[#475569]">No notifications yet.</p>
                )}
                {notifications.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-2xl border border-[#cbd5e1] bg-[#f1f5f9] px-4 py-3 text-sm"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-[#475569]">
                      {note.title}
                    </p>
                    <p className="mt-1 text-sm text-[#0f172a]">{note.body}</p>
                    <p className="mt-1 text-xs text-[#475569]">
                      {note.createdAt
                        ? new Date(note.createdAt).toLocaleTimeString()
                        : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
          <section className="rounded-3xl border border-[#cbd5e1] bg-[#f8fafc] p-6 shadow-sm overflow-x-auto">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
            <p className="text-sm text-[#475569] mt-1">Latest 8 orders in {rangeLabel.toLowerCase()}.</p>

            <table className="w-full min-w-[680px] mt-4 text-sm">
              <thead>
                <tr className="text-left text-[#475569] border-b border-[#cbd5e1]">
                  <th className="py-2">Order ID</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length ? (
                  recentOrders.map((order) => (
                    <tr
                      key={order._id}
                      onClick={() => setSelectedOrder(order)}
                      className="cursor-pointer border-b border-[#e2e8f0] hover:bg-[#f1f5f9]"
                    >
                      <td className="py-3 font-medium">#{String(order._id || "").slice(-6)}</td>
                      <td className="py-3">{order.customer?.name || "-"}</td>
                      <td className="py-3">{formatCurrency(order.totalAmount)} Ks</td>
                      <td className="py-3 capitalize">{order.status || "-"}</td>
                      <td className="py-3">{formatDateTime(order.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#475569]">
                      No orders found for this range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          <section className="rounded-3xl border border-[#cbd5e1] bg-[#f8fafc] p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Top Selling Menu</h2>
            <p className="text-sm text-[#475569] mt-1">By quantity sold in {rangeLabel.toLowerCase()}.</p>

            <div className="mt-4 space-y-3">
              {topMenus.length ? (
                topMenus.map((item, idx) => (
                  <div
                    key={`${item.name}-${idx}`}
                    className="rounded-xl border border-[#cbd5e1] bg-[#f1f5f9] px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-[#0f172a]">{item.name}</p>
                      <p className="text-xs uppercase tracking-[0.15em] text-[#475569]">{item.qty} sold</p>
                    </div>
                    <p className="text-xs text-[#475569] mt-1">Revenue: {formatCurrency(item.revenue)} Ks</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#475569]">No sales data yet in this range.</p>
              )}
            </div>
          </section>
        </div>

        {isLoading && (
          <p className="mt-6 text-sm text-[#475569]">Loading dashboard data...</p>
        )}
      </div>

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[1px] p-4 sm:p-8"
          onClick={() => {
            setSelectedOrder(null);
            setStatusError("");
          }}
        >
          <div
            className="mx-auto max-w-2xl rounded-3xl border border-[#cbd5e1] bg-[#f8fafc] p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#475569]">Order Detail</p>
                <h3 className="text-2xl font-semibold mt-1">#{String(selectedOrder._id || "").slice(-6)}</h3>
                <p className="text-sm text-[#475569] mt-1">{formatDateTime(selectedOrder.createdAt)}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setStatusError("");
                }}
                className="rounded-xl border border-[#cbd5e1] px-3 py-1.5 text-sm hover:bg-[#f1f5f9]"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-[#cbd5e1] bg-[#f1f5f9] p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-[#475569]">Customer</p>
                <p className="font-medium mt-2">{selectedOrder.customer?.name || "-"}</p>
                <p className="text-sm text-[#475569]">{selectedOrder.customer?.phone || "-"}</p>
              </div>
              <div className="rounded-xl border border-[#cbd5e1] bg-[#f1f5f9] p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-[#475569]">Status</p>
                <p className="font-medium mt-2 capitalize">{selectedOrder.status || "-"}</p>
                <p className="text-sm text-[#475569]">
                  Total: {formatCurrency(selectedOrder.totalAmount)} Ks
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[#cbd5e1] p-4">
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-semibold">Update Status</h4>
                {statusUpdating && <p className="text-xs text-[#475569]">Updating...</p>}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {SHOP_ADMIN_STATUS_ACTIONS.map((status) => {
                  const isCurrent = selectedOrder.status === status;
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(status)}
                      disabled={statusUpdating || isCurrent}
                      className={`rounded-full border px-3 py-1.5 text-xs capitalize transition ${
                        isCurrent
                          ? "bg-[#e2e8f0] text-[#0f172a] border-[#e2e8f0]"
                          : "border-[#cbd5e1] bg-[#f8fafc] hover:bg-[#f1f5f9]"
                      } ${statusUpdating ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
              {statusError && <p className="mt-3 text-sm text-[#bf4a3a]">{statusError}</p>}
            </div>

            <div className="mt-6 rounded-2xl border border-[#cbd5e1] p-4">
              <h4 className="font-semibold">Items</h4>
              <div className="mt-3 space-y-3">
                {(selectedOrder.items || []).length ? (
                  selectedOrder.items.map((item, idx) => (
                    <div
                      key={`${item.menuId || item.name}-${idx}`}
                      className="rounded-xl border border-[#cbd5e1] bg-[#f1f5f9] p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-[#0f172a]">{item.name || "Unnamed Item"}</p>
                        <p className="text-sm text-[#475569]">x{item.quantity || 0}</p>
                      </div>
                      <p className="text-sm text-[#475569] mt-1">
                        Line total: {formatCurrency(item.lineTotal || item.price * item.quantity || 0)} Ks
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#475569]">No item details available.</p>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-[#cbd5e1] bg-[#f1f5f9] p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-[#475569]">Payment</p>
                <p className="font-medium mt-2 capitalize">{selectedOrder.paymentMethod || "cash"}</p>
                <p className="text-sm text-[#475569]">{selectedOrder.isPaid ? "Paid" : "Not paid"}</p>
              </div>
              <div className="rounded-xl border border-[#cbd5e1] bg-[#f1f5f9] p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-[#475569]">Delivery</p>
                <p className="font-medium mt-2">
                  {selectedOrder.deliveryCompany?.name || "No company assigned"}
                </p>
                <p className="text-sm text-[#475569]">
                  Staff: {selectedOrder.deliveryStaff?.name || "-"}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.15em] text-[#475569]">Address</p>
              <p className="text-sm text-[#0f172a] mt-2">{selectedOrder.deliveryAddress || "-"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
