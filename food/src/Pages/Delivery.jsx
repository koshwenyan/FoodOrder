import React, { useEffect, useMemo, useState } from "react";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "delivered", label: "Delivered" },
  { key: "complete", label: "Complete" },
];

const normalizeStatus = (status) => {
  if (!status) return "pending";
  return status;
};

export default function Delivery() {
  const [orders, setOrders] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterCompany, setFilterCompany] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkCompany, setBulkCompany] = useState("");
  const [bulkStatus, setBulkStatus] = useState("");
  const [drawerOrder, setDrawerOrder] = useState(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const shopId = user?.shopId;

  const API_ORDERS = `http://localhost:3000/api/order/shop/${shopId}`;
  const API_COMPANIES = "http://localhost:3000/api/company/";
  const API_UPDATE = "http://localhost:3000/api/order/";

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(API_ORDERS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data.data || []);
    } catch (err) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await fetch(API_COMPANIES, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCompanies(data.data || []);
    } catch (err) {
      setError(err.message || "Failed to load delivery companies");
    }
  };

  useEffect(() => {
    if (!shopId) return;
    fetchOrders();
    fetchCompanies();
  }, [shopId]);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      const res = await fetch(`${API_UPDATE}${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Update failed");
      }
      await fetchOrders();
    } catch (err) {
      setError(err.message || "Update failed");
    }
  };

  const handleCompanyUpdate = async (orderId, companyId) => {
    try {
      const res = await fetch(`${API_UPDATE}${orderId}/assign-company`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ companyId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Update failed");
      }
      await fetchOrders();
    } catch (err) {
      setError(err.message || "Update failed");
    }
  };

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((o) => {
      const status = normalizeStatus(o.status);
      if (activeTab !== "all") {
        if (activeTab === "pending") {
          if (["delivered", "complete", "cancelled"].includes(status)) return false;
        } else if (activeTab === "complete") {
          if (status !== "complete") return false;
        } else if (status !== activeTab) {
          return false;
        }
      }
      if (filterCompany !== "all") {
        if (filterCompany === "unassigned" && o.deliveryCompany?._id) return false;
        if (filterCompany !== "unassigned" && o.deliveryCompany?._id !== filterCompany)
          return false;
      }
      if (!term) return true;
      return (
        o.customer?.name?.toLowerCase().includes(term) ||
        o.customer?.phone?.toLowerCase().includes(term) ||
        o.deliveryAddress?.toLowerCase().includes(term)
      );
    });
  }, [orders, activeTab, search, filterCompany]);

  const counts = useMemo(() => {
    const base = { all: orders.length, pending: 0, delivered: 0, complete: 0 };
    orders.forEach((o) => {
      const status = normalizeStatus(o.status);
      if (status === "delivered") {
        base.delivered += 1;
      } else if (status === "complete") {
        base.complete += 1;
      } else if (status !== "cancelled") {
        base.pending += 1;
      }
    });
    return base;
  }, [orders]);

  const toggleSelect = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const clearSelection = () => {
    setSelectedOrders([]);
    setBulkCompany("");
    setBulkStatus("");
  };

  const handleBulkUpdate = async () => {
    if (selectedOrders.length === 0) return;
    const wantsCompany = Boolean(bulkCompany);
    const wantsStatus = Boolean(bulkStatus);
    if (!wantsCompany && !wantsStatus) return;

    try {
      await Promise.all(
        selectedOrders.map((id) =>
          Promise.all([
            wantsCompany
              ? fetch(`${API_UPDATE}${id}/assign-company`, {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ companyId: bulkCompany }),
                })
              : Promise.resolve(),
            wantsStatus
              ? fetch(`${API_UPDATE}${id}/status`, {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ status: bulkStatus }),
                })
              : Promise.resolve(),
          ])
        )
      );
      clearSelection();
      await fetchOrders();
    } catch (err) {
      setError(err.message || "Bulk update failed");
    }
  };

  return (
    <div className="orders-theme min-h-screen bg-[#f6f1eb] text-[#1f1a17]">
      <div className="px-6 py-6 sm:px-10">
        <div className="rounded-3xl bg-gradient-to-br from-[#f9e9d7] via-[#f8f3ee] to-[#f2ddc7] p-6 sm:p-8 shadow-lg border border-[#ead8c7]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#8b6b4f]">
                Delivery Control
              </p>
              <h1 className="orders-title text-3xl sm:text-4xl font-semibold">
                Assign and Track Orders
              </h1>
              <p className="text-sm text-[#6c5645] mt-2">
                Manage pending orders, assign delivery partners, and close out completed runs.
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
                  <span className="ml-1 text-xs">
                    {counts[tab.key]}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-white/80 border border-[#e7d5c4] px-4 py-2">
                <span className="text-sm text-[#8b6b4f]">Search</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Customer, phone, address"
                  className="bg-transparent text-sm outline-none placeholder:text-[#b5a397] w-56"
                />
              </div>
              <select
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                className="rounded-full border border-[#e7d5c4] bg-white/80 px-4 py-2 text-sm text-[#6c5645]"
              >
                <option value="all">All companies</option>
                <option value="unassigned">Unassigned</option>
                {companies.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8">
          {loading && <p className="text-sm text-[#6c5645]">Loading delivery orders...</p>}
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && filteredOrders.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#d6c3b2] bg-white/70 p-10 text-center text-[#6c5645]">
              No orders found for this view.
            </div>
          )}

          <div className="mb-6 rounded-3xl border border-[#ead8c7] bg-white/80 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="text-sm text-[#6c5645]">
                {selectedOrders.length} selected
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={bulkCompany}
                  onChange={(e) => setBulkCompany(e.target.value)}
                  className="rounded-full border border-[#e7d5c4] bg-white px-4 py-2 text-sm text-[#6c5645]"
                >
                  <option value="">Assign company</option>
                  {companies.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  className="rounded-full border border-[#e7d5c4] bg-white px-4 py-2 text-sm text-[#6c5645]"
                >
                  <option value="">Update status</option>
                  <option value="pending">Pending</option>
                  <option value="delivered">Delivered</option>
                  <option value="complete">Complete</option>
                </select>
                <button
                  onClick={handleBulkUpdate}
                  className="rounded-full bg-[#1f1a17] px-4 py-2 text-sm font-medium text-[#f8f3ee]"
                >
                  Apply
                </button>
                <button
                  onClick={clearSelection}
                  className="rounded-full border border-[#e7d5c4] bg-white px-4 py-2 text-sm text-[#6c5645]"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {filteredOrders.map((order) => {
              const status = normalizeStatus(order.status);
              return (
                <div
                  key={order._id}
                  className="rounded-3xl bg-white/90 border border-[#ead8c7] shadow-sm p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#8b6b4f]">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString()
                          : "Order"}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order._id)}
                          onChange={() => toggleSelect(order._id)}
                          disabled={status === "complete"}
                          className="h-4 w-4 accent-[#1f1a17]"
                        />
                        <h3 className="orders-title text-2xl font-semibold">
                          {order.customer?.name || "Customer"}
                        </h3>
                      </div>
                      <p className="text-sm text-[#6c5645] mt-1">
                        {order.customer?.phone || "N/A"} ·{" "}
                        {order.deliveryAddress || "N/A"}
                      </p>
                    </div>
                    <div className="rounded-full bg-[#f6f1eb] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8b6b4f]">
                      {status}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-[#6c5645]">
                    <div className="rounded-2xl bg-[#f9f4ef] p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-[#a38b74]">
                        Items
                      </p>
                      <p className="text-lg font-semibold text-[#1f1a17]">
                        {order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) ||
                          order.items?.length ||
                          0}
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

                  <div className="mt-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#a38b74]">
                      Delivery Company
                    </p>
                    {status === "complete" ? (
                      <div className="mt-2 w-full rounded-2xl border border-[#e7d5c4] bg-[#f9f4ef] px-4 py-3 text-sm text-[#1f1a17]">
                        {order.deliveryCompany?.name || "Unassigned"}
                      </div>
                    ) : (
                      <select
                        value={order.deliveryCompany?._id || ""}
                        onChange={(e) => handleCompanyUpdate(order._id, e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-[#e7d5c4] bg-white px-4 py-3 text-sm text-[#1f1a17] focus:outline-none focus:ring-2 focus:ring-[#1f1a17]/20"
                      >
                        <option value="" disabled>
                          Choose delivery company
                        </option>
                        {companies.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {status !== "complete" &&
                      ["pending", "delivered", "complete"].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusUpdate(order._id, s)}
                          className={`rounded-full px-4 py-2 text-sm font-medium border transition ${
                            status === s
                              ? "bg-[#1f1a17] text-[#f8f3ee] border-[#1f1a17]"
                              : "bg-white text-[#6c5645] border-[#e7d5c4] hover:bg-[#f6f1eb]"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    <button
                      onClick={() => setDrawerOrder(order)}
                      className="rounded-full border border-[#e7d5c4] bg-white px-4 py-2 text-sm text-[#6c5645]"
                    >
                      View details
                    </button>
                  </div>
                </div>
              );
            })}
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
                  {drawerOrder.customer?.name || "Customer"}
                </h2>
                <p className="text-sm text-[#6c5645] mt-1">
                  {drawerOrder.customer?.phone || "N/A"} ·{" "}
                  {drawerOrder.deliveryAddress || "N/A"}
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
                {(drawerOrder.items || []).map((item) => {
                  const unitPrice =
                    Number(item.price || 0) + Number(item.addOnsTotal || 0);
                  const lineTotal =
                    Number(item.lineTotal || unitPrice * (item.quantity || 0));
                  return (
                    <div
                      key={item._id}
                      className="rounded-2xl border border-[#ead8c7] bg-[#f9f4ef] p-3"
                    >
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-[#1f1a17]">
                          {item.menuId?.name || item.name || "Item"}
                        </span>
                        <span className="text-[#6c5645]">
                          {unitPrice.toLocaleString()} Ks
                        </span>
                      </div>
                      {item.addOns?.length > 0 && (
                        <div className="mt-1 text-xs text-[#6c5645]">
                          Add-ons: {item.addOns.map((addOn) => addOn.name).join(", ")}
                        </div>
                      )}
                      {item.note && (
                        <div className="mt-1 text-xs text-[#6c5645]">
                          Note: {item.note}
                        </div>
                      )}
                      <div className="mt-1 text-xs text-[#8b6b4f]">
                        Qty: {item.quantity} · Subtotal:{" "}
                        {lineTotal.toLocaleString()} Ks
                      </div>
                    </div>
                  );
                })}
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
