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

export default function DeliveryStaffOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/order/delivery/my-orders");
      setOrders(res.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load orders.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, status) => {
    if (!status) return;
    try {
      await api.put(`/order/${orderId}/status`, { status });
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
        order.customer?.name?.toLowerCase().includes(term) ||
        order.shopId?.name?.toLowerCase().includes(term) ||
        order.deliveryAddress?.toLowerCase().includes(term);
      return matchesStatus && (term ? matchesSearch : true);
    });
  }, [orders, searchTerm, statusFilter]);

  const statusOptions = ["picked-up", "delivered", "complete"];

  return (
    <div className="min-h-screen bg-[#f6f1eb] text-[#1f1a17]">
      <div className="px-6 py-6 sm:px-10">
        <div className="rounded-3xl bg-gradient-to-br from-[#f9e9d7] via-[#f8f3ee] to-[#f2ddc7] p-6 sm:p-8 shadow-lg border border-[#ead8c7]">
          <p className="text-sm uppercase tracking-[0.2em] text-[#8b6b4f]">
            Delivery Staff
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold">
            My Assigned Orders
          </h1>
          <p className="text-sm text-[#6c5645] mt-2">
            View your orders and update delivery status.
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-[#ead8c7] bg-white/90 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#ead8c7] flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-[#1f1a17]">
              Orders ({filteredOrders.length})
            </h2>
            <div className="flex flex-wrap gap-3">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search customer, shop, address"
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
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-[#f8f3ee] text-left">
                  <tr>
                    <th className="px-4 py-3 text-sm font-semibold text-[#6c5645]">
                      #
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-[#6c5645]">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-[#6c5645]">
                      Shop
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-[#6c5645]">
                      Address
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-[#6c5645]">
                      Total
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-[#6c5645]">
                      Status
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-[#6c5645]">
                      Update
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-[#6c5645]">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => (
                    <tr
                      key={order._id}
                      className="border-t border-[#ead8c7] hover:bg-[#fbf7f2]"
                    >
                      <td className="px-4 py-3 text-sm text-[#1f1a17]">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#1f1a17]">
                        {order.customer?.name || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#1f1a17]">
                        {order.shopId?.name || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#1f1a17]">
                        {order.deliveryAddress || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#1f1a17]">
                        {formatMoney(order.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="rounded-full border border-[#ead8c7] px-3 py-1 text-xs font-semibold capitalize text-[#6c5645]">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex flex-wrap gap-2">
                          {statusOptions.map((status) => (
                            <button
                              key={status}
                              onClick={() =>
                                handleUpdateStatus(order._id, status)
                              }
                              className="rounded-full border border-[#ead8c7] px-3 py-1 text-xs font-semibold capitalize text-[#6c5645] hover:border-[#1f1a17] hover:text-[#1f1a17]"
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#6c5645]">
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
