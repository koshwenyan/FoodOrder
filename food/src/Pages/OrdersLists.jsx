import React, { useEffect, useMemo, useState } from "react";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "delivered", label: "Delivered" },
  { key: "complete", label: "Complete" },
];

export default function OrdersLists() {
  const [phoneOrders, setPhoneOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [drawerOrder, setDrawerOrder] = useState(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const shopId = user?.shopId;
  const API_PHONE = `http://localhost:3000/api/phoneCalledOrder/shop/${shopId}`;

  // ================= FETCH ORDERS =================
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const phoneRes = await fetch(API_PHONE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const phoneData = await phoneRes.json();
      setPhoneOrders(phoneData.data || []);
    } catch (error) {
      setError(error.message || "Error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    return phoneOrders.filter((o) => {
      if (activeTab !== "all" && o.status !== activeTab) return false;
      if (!term) return true;
      return (
        o.customerName?.toLowerCase().includes(term) ||
        o.phone?.toLowerCase().includes(term) ||
        o.address?.toLowerCase().includes(term)
      );
    });
  }, [phoneOrders, activeTab, search]);

  const counts = useMemo(() => {
    const base = { all: phoneOrders.length, pending: 0, delivered: 0, complete: 0 };
    phoneOrders.forEach((o) => {
      if (base[o.status] !== undefined) base[o.status] += 1;
    });
    return base;
  }, [phoneOrders]);

  return (
    <div className="orders-theme min-h-screen bg-[#f6f1eb] text-[#1f1a17]">
      <div className="px-6 py-6 sm:px-10">
        <div className="rounded-3xl bg-gradient-to-br from-[#f9e9d7] via-[#f8f3ee] to-[#f2ddc7] p-6 sm:p-8 shadow-lg border border-[#ead8c7]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#8b6b4f]">
                Phone Orders
              </p>
              <h1 className="orders-title text-3xl sm:text-4xl font-semibold">
                Orders List
              </h1>
              <p className="text-sm text-[#6c5645] mt-2">
                Review phone-called orders and track their delivery status.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="rounded-2xl bg-white/70 border border-[#e7d5c4] px-4 py-3">
                <p className="text-xs text-[#8b6b4f]">Pending</p>
                <p className="text-xl font-semibold">{counts.pending}</p>
              </div>
              <div className="rounded-2xl bg-white/70 border border-[#e7d5c4] px-4 py-3">
                <p className="text-xs text-[#8b6b4f]">Delivered</p>
                <p className="text-xl font-semibold">{counts.delivered}</p>
              </div>
              <div className="rounded-2xl bg-white/70 border border-[#e7d5c4] px-4 py-3">
                <p className="text-xs text-[#8b6b4f]">Complete</p>
                <p className="text-xl font-semibold">{counts.complete}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-full px-4 py-2 text-sm font-medium border transition ${
                    activeTab === tab.key
                      ? "bg-[#1f1a17] text-[#f8f3ee] border-[#1f1a17]"
                      : "bg-white/70 text-[#6c5645] border-[#e7d5c4] hover:bg-white"
                  }`}
                >
                  {tab.label}{" "}
                  <span className="ml-1 text-xs">{counts[tab.key]}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/80 border border-[#e7d5c4] px-4 py-2">
              <span className="text-sm text-[#8b6b4f]">Search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Customer, phone, address"
                className="bg-transparent text-sm outline-none placeholder:text-[#b5a397] w-56"
              />
            </div>
          </div>
        </div>

        <div className="mt-8">
          {loading && <p className="text-sm text-[#6c5645]">Loading orders...</p>}
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && filteredOrders.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#d6c3b2] bg-white/70 p-10 text-center text-[#6c5645]">
              No phone orders yet.
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="rounded-3xl bg-white/90 border border-[#ead8c7] shadow-sm p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#8b6b4f]">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : "Phone Order"}
                    </p>
                    <h3 className="orders-title text-2xl font-semibold mt-2">
                      {order.customerName}
                    </h3>
                    <p className="text-sm text-[#6c5645] mt-1">
                      {order.phone} · {order.address}
                    </p>
                  </div>
                  <div className="rounded-full bg-[#f6f1eb] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8b6b4f]">
                    {order.status || "pending"}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-[#6c5645]">
                  <div className="rounded-2xl bg-[#f9f4ef] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#a38b74]">
                      Items
                    </p>
                    <p className="text-lg font-semibold text-[#1f1a17]">
                      {order.totalItems || order.items?.length || 0}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#f9f4ef] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#a38b74]">
                      Total
                    </p>
                    <p className="text-lg font-semibold text-[#1f1a17]">
                      {order.totalAmount?.toLocaleString()} Ks
                    </p>
                  </div>
                </div>

                <div className="mt-5 text-sm text-[#6c5645]">
                  <span className="text-xs uppercase tracking-[0.2em] text-[#a38b74]">
                    Delivery
                  </span>
                  <p className="mt-1 font-medium text-[#1f1a17]">
                    {order.deliveryCompany?.name || "Unassigned"}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    onClick={() => setDrawerOrder(order)}
                    className="rounded-full border border-[#e7d5c4] bg-white px-4 py-2 text-sm text-[#6c5645]"
                  >
                    View details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {drawerOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOrder(null)}
          />
          <div className="relative w-full max-w-lg h-full bg-white shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#8b6b4f]">
                  Order Details
                </p>
                <h2 className="orders-title text-2xl font-semibold mt-2">
                  {drawerOrder.customerName}
                </h2>
                <p className="text-sm text-[#6c5645] mt-1">
                  {drawerOrder.phone} · {drawerOrder.address}
                </p>
              </div>
              <button
                onClick={() => setDrawerOrder(null)}
                className="rounded-full border border-[#e7d5c4] px-3 py-1 text-sm text-[#6c5645]"
              >
                Close
              </button>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.2em] text-[#a38b74]">
                Items
              </p>
              <div className="mt-2 space-y-3">
                {(drawerOrder.items || []).map((item) => (
                  <div
                    key={item._id}
                    className="rounded-2xl border border-[#ead8c7] bg-[#f9f4ef] p-3"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-[#1f1a17]">
                        {item.menu?.name || "Item"}
                      </span>
                      <span className="text-[#6c5645]">
                        {item.price?.toLocaleString()} Ks
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-[#8b6b4f]">
                      Qty: {item.quantity} · Subtotal:{" "}
                      {(item.price * item.quantity).toLocaleString()} Ks
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.2em] text-[#a38b74]">
                Notes
              </p>
              <div className="mt-2 rounded-2xl border border-[#ead8c7] bg-[#f9f4ef] p-4 text-sm text-[#6c5645]">
                {drawerOrder.notes || "No notes provided."}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
