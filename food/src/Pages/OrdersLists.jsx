import React, { useEffect, useMemo, useState } from "react";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "confirmed", label: "Confirmed" },
  { key: "assigned", label: "Assigned" },
  { key: "delivered", label: "Delivered" },
  { key: "complete", label: "Complete" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_OPTIONS = [
  "confirmed",
  "assigned",
  "picked-up",
  "delivered",
  "complete",
  "cancelled",
];

const normalizeStatus = (status) => (status ? String(status).toLowerCase() : "confirmed");

const toDateInput = (value) => {
  if (!value) return "";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toISOString().slice(0, 10);
};

export default function OrdersLists() {
  const [phoneOrders, setPhoneOrders] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [drawerOrder, setDrawerOrder] = useState(null);

  const [companyFilter, setCompanyFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkCompany, setBulkCompany] = useState("");
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const shopId = typeof user?.shopId === "object" ? user?.shopId?._id : user?.shopId;

  const API_PHONE = `http://localhost:3000/api/phoneCalledOrder/shop/${shopId}`;
  const API_COMPANY = "http://localhost:3000/api/company";
  const API_PHONE_BASE = "http://localhost:3000/api/phoneCalledOrder";

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const phoneRes = await fetch(API_PHONE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const phoneData = await phoneRes.json();
      setPhoneOrders(Array.isArray(phoneData.data) ? phoneData.data : []);
    } catch (fetchError) {
      setError(fetchError.message || "Error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await fetch(API_COMPANY, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCompanies(Array.isArray(data.data) ? data.data : []);
    } catch {
      setCompanies([]);
    }
  };

  useEffect(() => {
    if (!shopId) return;
    fetchOrders();
    fetchCompanies();
  }, [shopId]);

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    const min = minAmount ? Number(minAmount) : null;
    const max = maxAmount ? Number(maxAmount) : null;
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    const to = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null;

    return phoneOrders.filter((o) => {
      const status = normalizeStatus(o.status);
      if (activeTab !== "all" && status !== activeTab) return false;

      if (companyFilter !== "all") {
        if (companyFilter === "unassigned" && o.deliveryCompany?._id) return false;
        if (companyFilter !== "unassigned" && o.deliveryCompany?._id !== companyFilter) return false;
      }

      const amount = Number(o.totalAmount || 0);
      if (min !== null && amount < min) return false;
      if (max !== null && amount > max) return false;

      const createdAt = o.createdAt ? new Date(o.createdAt).getTime() : null;
      if (from !== null && createdAt !== null && createdAt < from) return false;
      if (to !== null && createdAt !== null && createdAt > to) return false;

      if (!term) return true;
      return (
        o.customerName?.toLowerCase().includes(term) ||
        o.phone?.toLowerCase().includes(term) ||
        o.address?.toLowerCase().includes(term) ||
        o.deliveryCompany?.name?.toLowerCase().includes(term)
      );
    });
  }, [phoneOrders, activeTab, search, companyFilter, minAmount, maxAmount, dateFrom, dateTo]);

  const counts = useMemo(() => {
    const base = {
      all: phoneOrders.length,
      confirmed: 0,
      assigned: 0,
      delivered: 0,
      complete: 0,
      cancelled: 0,
    };

    phoneOrders.forEach((o) => {
      const status = normalizeStatus(o.status);
      if (base[status] !== undefined) base[status] += 1;
    });

    return base;
  }, [phoneOrders]);

  const toggleSelect = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const toggleSelectAll = () => {
    const ids = filteredOrders.map((order) => order._id);
    if (ids.length === 0) return;

    const allSelected = ids.every((id) => selectedOrders.includes(id));
    if (allSelected) {
      setSelectedOrders((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedOrders((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  const clearBulkSelection = () => {
    setSelectedOrders([]);
    setBulkCompany("");
    setBulkStatus("");
  };

  const handleBulkApply = async () => {
    if (!selectedOrders.length || (!bulkCompany && !bulkStatus)) return;

    try {
      setBulkLoading(true);
      setError("");

      const requests = selectedOrders.flatMap((orderId) => {
        const ops = [];

        if (bulkCompany) {
          ops.push(
            fetch(`${API_PHONE_BASE}/${orderId}/assign-company`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ companyId: bulkCompany }),
            })
          );
        }

        if (bulkStatus) {
          ops.push(
            fetch(`${API_PHONE_BASE}/${orderId}/status`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ status: bulkStatus }),
            })
          );
        }

        return ops;
      });

      const results = await Promise.all(requests);
      const failed = [];

      for (const res of results) {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          failed.push(data?.message || "Bulk update failed");
        }
      }

      if (failed.length) {
        throw new Error(failed[0]);
      }

      clearBulkSelection();
      await fetchOrders();
    } catch (bulkError) {
      setError(bulkError.message || "Bulk update failed");
    } finally {
      setBulkLoading(false);
    }
  };

  const exportCsv = () => {
    if (!filteredOrders.length) return;

    const headers = [
      "OrderId",
      "Customer",
      "Phone",
      "Address",
      "Company",
      "Status",
      "TotalAmount",
      "CreatedAt",
    ];

    const rows = filteredOrders.map((order) => [
      order._id,
      order.customerName || "",
      order.phone || "",
      order.address || "",
      order.deliveryCompany?.name || "",
      normalizeStatus(order.status),
      Number(order.totalAmount || 0),
      order.createdAt || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `phone-orders-${toDateInput(new Date()) || "export"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="orders-theme min-h-screen bg-[#0f1115] text-[#f6f1e8]">
      <div className="px-6 py-6 sm:px-10">
        <div className="rounded-3xl bg-gradient-to-br from-[#1d222c] via-[#171a20] to-[#2a2f3a] p-6 sm:p-8 shadow-lg border border-[#2a2f3a]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#c9a96a]">Phone Orders</p>
              <h1 className="orders-title text-3xl sm:text-4xl font-semibold">Orders List</h1>
              <p className="text-sm text-[#a8905d] mt-2">
                Filter orders, perform bulk updates, and review delivery states.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="rounded-2xl bg-[#232833] border border-[#2a2f3a] px-4 py-3">
                <p className="text-xs text-[#c9a96a]">Confirmed</p>
                <p className="text-xl font-semibold">{counts.confirmed}</p>
              </div>
              <div className="rounded-2xl bg-[#232833] border border-[#2a2f3a] px-4 py-3">
                <p className="text-xs text-[#c9a96a]">Delivered</p>
                <p className="text-xl font-semibold">{counts.delivered}</p>
              </div>
              <div className="rounded-2xl bg-[#232833] border border-[#2a2f3a] px-4 py-3">
                <p className="text-xs text-[#c9a96a]">Complete</p>
                <p className="text-xl font-semibold">{counts.complete}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-4">
            <div className="flex flex-wrap gap-2">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-full px-4 py-2 text-sm font-medium border transition ${
                    activeTab === tab.key
                      ? "bg-[#f6f1e8] text-[#171a20] border-[#f6f1e8]"
                      : "bg-[#232833] text-[#a8905d] border-[#2a2f3a] hover:bg-[#232833]"
                  }`}
                >
                  {tab.label} <span className="ml-1 text-xs">{counts[tab.key] || 0}</span>
                </button>
              ))}
            </div>

            <button
              onClick={exportCsv}
              className="rounded-full border border-[#2a2f3a] bg-[#171a20] px-4 py-2 text-sm text-[#a8905d]"
            >
              Export CSV
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer/phone/address"
              className="rounded-xl border border-[#2a2f3a] bg-[#1d222c] px-3 py-2 text-sm xl:col-span-2"
            />
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="rounded-xl border border-[#2a2f3a] bg-[#1d222c] px-3 py-2 text-sm"
            >
              <option value="all">All companies</option>
              <option value="unassigned">Unassigned</option>
              {companies.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-xl border border-[#2a2f3a] bg-[#1d222c] px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-xl border border-[#2a2f3a] bg-[#1d222c] px-3 py-2 text-sm"
            />
            <input
              type="number"
              min="0"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="Min Ks"
              className="rounded-xl border border-[#2a2f3a] bg-[#1d222c] px-3 py-2 text-sm"
            />
            <input
              type="number"
              min="0"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              placeholder="Max Ks"
              className="rounded-xl border border-[#2a2f3a] bg-[#1d222c] px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[#2a2f3a] bg-[#171a20] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-sm text-[#a8905d]">{selectedOrders.length} selected</div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className="rounded-full border border-[#2a2f3a] bg-[#171a20] px-4 py-2 text-sm text-[#a8905d]"
              >
                Select page
              </button>
              <select
                value={bulkCompany}
                onChange={(e) => setBulkCompany(e.target.value)}
                className="rounded-full border border-[#2a2f3a] bg-[#171a20] px-4 py-2 text-sm text-[#a8905d]"
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
                className="rounded-full border border-[#2a2f3a] bg-[#171a20] px-4 py-2 text-sm text-[#a8905d]"
              >
                <option value="">Update status</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <button
                onClick={handleBulkApply}
                disabled={bulkLoading || selectedOrders.length === 0}
                className="rounded-full bg-[#f6f1e8] px-4 py-2 text-sm font-medium text-[#171a20] disabled:opacity-60"
              >
                {bulkLoading ? "Applying..." : "Apply"}
              </button>
              <button
                onClick={clearBulkSelection}
                className="rounded-full border border-[#2a2f3a] bg-[#171a20] px-4 py-2 text-sm text-[#a8905d]"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          {loading && <p className="text-sm text-[#a8905d]">Loading orders...</p>}
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && filteredOrders.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#d6c3b2] bg-[#232833] p-10 text-center text-[#a8905d]">
              No phone orders for current filters.
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {filteredOrders.map((order) => (
              <div key={order._id} className="rounded-3xl bg-[#171a20] border border-[#2a2f3a] shadow-sm p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order._id)}
                      onChange={() => toggleSelect(order._id)}
                      className="h-4 w-4 mt-1 accent-[#f6f1e8]"
                    />
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#c9a96a]">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Phone Order"}
                      </p>
                      <h3 className="orders-title text-2xl font-semibold mt-2">{order.customerName}</h3>
                      <p className="text-sm text-[#a8905d] mt-1">
                        {order.phone} · {order.address}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-full bg-[#0f1115] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a96a]">
                    {normalizeStatus(order.status)}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-[#a8905d]">
                  <div className="rounded-2xl bg-[#1d222c] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#a38b74]">Items</p>
                    <p className="text-lg font-semibold text-[#f6f1e8]">
                      {order.totalItems || order.items?.length || 0}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#1d222c] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#a38b74]">Total</p>
                    <p className="text-lg font-semibold text-[#f6f1e8]">
                      {Number(order.totalAmount || 0).toLocaleString()} Ks
                    </p>
                  </div>
                </div>

                <div className="mt-5 text-sm text-[#a8905d]">
                  <span className="text-xs uppercase tracking-[0.2em] text-[#a38b74]">Delivery</span>
                  <p className="mt-1 font-medium text-[#f6f1e8]">{order.deliveryCompany?.name || "Unassigned"}</p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    onClick={() => setDrawerOrder(order)}
                    className="rounded-full border border-[#2a2f3a] bg-[#171a20] px-4 py-2 text-sm text-[#a8905d]"
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
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOrder(null)} />
          <div className="relative w-full max-w-lg h-full bg-[#171a20] shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#c9a96a]">Order Details</p>
                <h2 className="orders-title text-2xl font-semibold mt-2">{drawerOrder.customerName}</h2>
                <p className="text-sm text-[#a8905d] mt-1">
                  {drawerOrder.phone} · {drawerOrder.address}
                </p>
              </div>
              <button
                onClick={() => setDrawerOrder(null)}
                className="rounded-full border border-[#2a2f3a] px-3 py-1 text-sm text-[#a8905d]"
              >
                Close
              </button>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.2em] text-[#a38b74]">Items</p>
              <div className="mt-2 space-y-3">
                {(drawerOrder.items || []).map((item, idx) => {
                  const unitPrice = Number(item.price || 0);
                  const lineTotal = Number(unitPrice * Number(item.quantity || 0));
                  return (
                    <div
                      key={`${item.menu || idx}`}
                      className="rounded-2xl border border-[#2a2f3a] bg-[#1d222c] p-3"
                    >
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-[#f6f1e8]">{item.menu?.name || "Item"}</span>
                        <span className="text-[#a8905d]">{unitPrice.toLocaleString()} Ks</span>
                      </div>
                      <div className="mt-1 text-xs text-[#c9a96a]">
                        Qty: {item.quantity} · Subtotal: {lineTotal.toLocaleString()} Ks
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.2em] text-[#a38b74]">Notes</p>
              <div className="mt-2 rounded-2xl border border-[#2a2f3a] bg-[#1d222c] p-4 text-sm text-[#a8905d]">
                {drawerOrder.notes || "No notes provided."}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
