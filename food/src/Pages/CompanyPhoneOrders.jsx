import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const formatMoney = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "MMK",
    maximumFractionDigits: 0,
  }).format(amount);
};

const statusOptions = [
  "confirmed",
  "assigned",
  "picked-up",
  "delivered",
  "complete",
  "cancelled",
];

export default function CompanyPhoneOrders() {
  const [orders, setOrders] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assigningId, setAssigningId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const user = useMemo(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/phoneCalledOrder/company/orders");
      setOrders(res.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load phone orders.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffs = async () => {
    const companyId = user?.companyId;
    if (!companyId) return;

    try {
      const res = await api.get(`/company/${companyId}/staffs`);
      setStaffs(res.data?.data?.staffs || []);
    } catch (err) {
      setStaffs([]);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStaffs();
  }, []);

  const handleAssignStaff = async (orderId, staffId) => {
    if (!staffId) return;
    setAssigningId(orderId);
    try {
      await api.put(`/phoneCalledOrder/${orderId}/assign-staff`, { staffId });
      fetchOrders();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to assign staff.");
    } finally {
      setAssigningId(null);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    if (!status) return;
    try {
      await api.put(`/phoneCalledOrder/${orderId}/status`, { status });
      fetchOrders();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update status.");
    }
  };

  const filteredOrders = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      const matchesSearch =
        order.customerName?.toLowerCase().includes(term) ||
        order.phone?.toLowerCase().includes(term) ||
        order.address?.toLowerCase().includes(term);
      return matchesStatus && (term ? matchesSearch : true);
    });
  }, [orders, searchTerm, statusFilter]);

  return (
    <div className="min-h-screen bg-[#f6f1eb] text-[#1f1a17]">
      <div className="px-6 py-6 sm:px-10">
        <div className="rounded-3xl bg-gradient-to-br from-[#f9e9d7] via-[#f8f3ee] to-[#f2ddc7] p-6 sm:p-8 shadow-lg border border-[#ead8c7]">
          <p className="text-sm uppercase tracking-[0.2em] text-[#8b6b4f]">
            Company Admin
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold leading-tight">
            Phone Called Orders
          </h1>
          <p className="text-sm text-[#6c5645] mt-2 max-w-2xl">
            Assign staff and manage delivery progress for phone orders.
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-[#ead8c7] bg-white/90 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#ead8c7] flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-[#1f1a17] tracking-tight">
              Orders ({filteredOrders.length})
            </h2>
            <div className="flex flex-wrap gap-3">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search name, phone, address"
                className="rounded-full border border-[#ead8c7] bg-white px-4 py-2 text-xs outline-none focus:border-[#1f1a17]"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-full border border-[#ead8c7] bg-white px-3 py-2 text-xs outline-none focus:border-[#1f1a17]"
              >
                <option value="all">All status</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <button
                onClick={fetchOrders}
                className="rounded-full border border-[#ead8c7] px-4 py-2 text-xs font-semibold text-[#6c5645] hover:border-[#1f1a17] hover:text-[#1f1a17]"
              >
                Refresh
              </button>
            </div>
          </div>

          {loading && (
            <div className="px-6 py-8 text-[#6c5645]">Loading orders...</div>
          )}

          {!loading && error && (
            <div className="px-6 py-8 text-[#c97a5a]">{error}</div>
          )}

          {!loading && !error && filteredOrders.length === 0 && (
            <div className="px-6 py-8 text-[#6c5645]">
              No orders to show yet.
            </div>
          )}

          {!loading && !error && filteredOrders.length > 0 && (
            <div className="grid gap-4 p-6 lg:grid-cols-2">
              {filteredOrders.map((order, index) => (
                <div
                  key={order._id}
                  className="rounded-3xl border border-[#ead8c7] bg-white/95 p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#8b6b4f]">
                        Order #{index + 1}
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold leading-tight">
                        {order.customerName || "Customer"}
                      </h3>
                      <p className="text-sm text-[#6c5645] mt-1">
                        {order.phone || "N/A"}
                      </p>
                    </div>
                    <span className="rounded-full border border-[#ead8c7] px-3 py-1 text-xs font-semibold capitalize text-[#6c5645]">
                      {order.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
                    <div className="rounded-2xl border border-[#ead8c7] bg-[#fdf9f4] p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-[#8b6b4f]">
                        Address
                      </p>
                      <p className="mt-2 text-[#1f1a17]">
                        {order.address || "N/A"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[#ead8c7] bg-[#fdf9f4] p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-[#8b6b4f]">
                        Total
                      </p>
                      <p className="mt-2 text-lg font-semibold text-[#1f1a17]">
                        {formatMoney(order.totalAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#6c5645]">
                    <div>
                      <span className="text-xs uppercase tracking-[0.2em] text-[#8b6b4f]">
                        Staff
                      </span>
                      <p className="mt-1 text-sm text-[#1f1a17]">
                        {order.deliveryStaff?.name || "Unassigned"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs uppercase tracking-[0.2em] text-[#8b6b4f]">
                        Created
                      </span>
                      <p className="mt-1 text-xs text-[#6c5645]">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="rounded-full border border-[#ead8c7] px-3 py-1 text-xs font-semibold text-[#6c5645] hover:border-[#1f1a17] hover:text-[#1f1a17]"
                    >
                      Details
                    </button>
                    <select
                      value={order.deliveryStaff?._id || ""}
                      onChange={(event) =>
                        handleAssignStaff(order._id, event.target.value)
                      }
                      disabled={
                        assigningId === order._id ||
                        Boolean(order.deliveryStaff?._id)
                      }
                      className="rounded-full border border-[#ead8c7] bg-white px-3 py-1 text-xs outline-none focus:border-[#1f1a17]"
                    >
                      <option value="">Assign staff</option>
                      {staffs.map((staff) => (
                        <option key={staff._id} value={staff._id}>
                          {staff.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={order.status || ""}
                      onChange={(event) =>
                        handleUpdateStatus(order._id, event.target.value)
                      }
                      className="rounded-full border border-[#ead8c7] bg-white px-3 py-1 text-xs outline-none focus:border-[#1f1a17]"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 text-[#1f1a17] shadow-xl border border-[#ead8c7]">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4 top-4 rounded-full border border-[#ead8c7] px-3 py-1 text-xs font-semibold text-[#6c5645]"
            >
              Close
            </button>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#8b6b4f]">
                  Order details
                </p>
                <h3 className="text-2xl font-semibold">
                  {selectedOrder.customerName || "Customer"}
                </h3>
                <p className="text-sm text-[#6c5645] mt-1">
                  {selectedOrder.phone || "N/A"} ·{" "}
                  {formatMoney(selectedOrder.totalAmount)}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#ead8c7] bg-[#fdf9f4] p-4 text-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#8b6b4f]">
                    Address
                  </p>
                  <p className="mt-2">{selectedOrder.address}</p>
                </div>
                <div className="rounded-2xl border border-[#ead8c7] bg-[#fdf9f4] p-4 text-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#8b6b4f]">
                    Status
                  </p>
                  <p className="mt-2 capitalize">{selectedOrder.status}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#ead8c7] bg-white p-4">
                <h4 className="text-sm font-semibold">Items</h4>
                <div className="mt-3 space-y-2">
                  {selectedOrder.items?.map((item, idx) => {
                    const unitPrice =
                      Number(item.price || 0) + Number(item.addOnsTotal || 0);
                    return (
                      <div
                        key={`${item.menu?._id || idx}`}
                        className="flex items-center justify-between text-sm"
                      >
                        <div>
                          <p className="font-semibold">
                            {item.menu?.name || item.name || "Menu item"}
                          </p>
                          <p className="text-xs text-[#8b6b4f]">
                            Qty: {item.quantity}
                          </p>
                          {item.addOns?.length > 0 && (
                            <p className="text-xs text-[#6c5645]">
                              Add-ons:{" "}
                              {item.addOns.map((addOn) => addOn.name).join(", ")}
                            </p>
                          )}
                          {item.note && (
                            <p className="text-xs text-[#6c5645]">
                              Note: {item.note}
                            </p>
                          )}
                        </div>
                        <p className="text-sm font-semibold">
                          {formatMoney(unitPrice)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
