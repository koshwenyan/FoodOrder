import { useEffect, useState } from "react";
import axios from "axios";

const API_Order = "http://localhost:3000";

/* fake auth */
const user = JSON.parse(localStorage.getItem("user"));
const role = user?.role;

/* delivery staff list */
const deliveryStaffs = ["Aung Aung", "Kyaw Kyaw", "Mg Mg"];

export default function OrdersTable() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });

  const authHeader = {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  };

  /* ========== FETCH ORDERS ========== */
  const fetchOrders = async () => {
    const res = await axios.get(
      `${API_Order}/api/order/shop/6978676b0c2e6814ceba8670`,
      authHeader
    );
    if (res.data.success) setOrders(res.data.data);
  };

  /* ========== UPDATE STATUS / DELIVERY ========== */
  const markCompleted = async (id) => {
    await axios.patch(`${API_Order}/orders/${id}/status`, { status: "completed" }, authHeader);
    fetchOrders();
  };

  const assignDelivery = async (id, delivery) => {
    await axios.patch(`${API_Order}/orders/${id}/assign-delivery`, { delivery }, authHeader);
    fetchOrders();
  };

  const markPaid = async (id) => {
    await axios.patch(`${API_Order}/orders/${id}/status`, { isPaid: true }, authHeader);
    fetchOrders();
    setSelectedOrder({ ...selectedOrder, isPaid: true });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* ========== FILTER & SORT ========== */
  useEffect(() => {
    let tempOrders = [...orders];

    // Filter
    if (statusFilter !== "all") {
      tempOrders = tempOrders.filter((o) => o.status === statusFilter);
    }

    // Sort
    if (sortConfig.key) {
      tempOrders.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // For nested objects
        if (sortConfig.key === "totalAmount") {
          aVal = a.totalAmount;
          bVal = b.totalAmount;
        } else if (sortConfig.key === "createdAt") {
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    setFilteredOrders(tempOrders);
  }, [orders, statusFilter, sortConfig]);

  /* ========== SORT HEADER HANDLER ========== */
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const timeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6 text-slate-100">
      <h1 className="text-3xl font-bold mb-4 text-emerald-400">Orders Dashboard</h1>

      {/* STATUS FILTER */}
      <div className="mb-4">
        <select
          className="bg-slate-700 border border-slate-600 text-slate-100 px-3 py-1 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="picked-up">Picked-up</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* ORDERS TABLE */}
      <div className="overflow-x-auto bg-slate-800 rounded-lg border border-slate-700">
        <table className="w-full text-sm text-left text-slate-200">
          <thead className="bg-slate-700 text-slate-200">
            <tr>
              <th
                className="px-3 py-2 cursor-pointer"
                onClick={() => requestSort("createdAt")}
              >
                #ID / Date
              </th>
              <th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2">Phone</th>
              <th
                className="px-3 py-2 cursor-pointer"
                onClick={() => requestSort("totalAmount")}
              >
                Total
              </th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Delivery Staff</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((o) => (
              <tr
                key={o._id}
                className="border-b border-slate-700 hover:bg-slate-700/30"
              >
                <td className="px-3 py-2 text-emerald-400">
                  #{o._id.slice(-6)} <br />
                  <span className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleString()}</span>
                </td>
                <td className="px-3 py-2">{o.customer.name}</td>
                <td className="px-3 py-2">{o.customer.phone}</td>
                <td className="px-3 py-2">{o.totalAmount.toLocaleString()} Ks</td>
                <td className="px-3 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      o.status === "pending"
                        ? "bg-yellow-700/20 text-yellow-400"
                        : o.status === "picked-up"
                        ? "bg-orange-700/20 text-orange-400"
                        : "bg-green-700/20 text-green-400"
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {(role === "admin" || role === "shop-admin") && o.status !== "completed" ? (
                    <select
                      className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-slate-100 text-sm"
                      value={o.deliveryStaff?.name || ""}
                      onChange={(e) => assignDelivery(o._id, e.target.value)}
                    >
                      <option value="">Assign</option>
                      {deliveryStaffs.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  ) : (
                    o.deliveryStaff?.name || "-"
                  )}
                </td>
                <td className="px-3 py-2 flex gap-2">
                  {o.status === "pending" && (role === "admin" || role === "shop-admin") && (
                    <button
                      onClick={() => markCompleted(o._id)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded px-2 py-1 text-xs font-semibold"
                    >
                      Complete
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedOrder(o)}
                    className="bg-slate-600 hover:bg-slate-500 text-slate-200 rounded px-2 py-1 text-xs font-semibold"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ORDER DETAIL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 max-w-lg w-full rounded-xl p-6 relative border border-slate-700 overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-100"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4 text-emerald-400">
              Order #{selectedOrder._id.slice(-6)}
            </h2>

            <p className="text-slate-200"><b>Customer:</b> {selectedOrder.customer.name} ({selectedOrder.customer.phone})</p>
            <p className="text-slate-200"><b>Status:</b> {selectedOrder.status}</p>
            <p className="text-slate-200"><b>Address:</b> {selectedOrder.deliveryAddress}</p>
            <p className="text-slate-200"><b>Created:</b> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
            <p className="text-slate-200"><b>Delivery Company:</b> {selectedOrder.deliveryCompany?.name || "N/A"}</p>
            <p className="text-slate-200"><b>Delivery Staff:</b> {selectedOrder.deliveryStaff?.name || "N/A"}</p>

            {/* ACCOUNTING TABLE */}
            <hr className="my-4 border-slate-700" />
            <h3 className="font-semibold mb-2 text-slate-200">Accounting</h3>
            <table className="w-full text-sm text-slate-200 border border-slate-700 rounded">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-2 py-1 border-b border-slate-600 text-left">Item</th>
                  <th className="px-2 py-1 border-b border-slate-600 text-right">Qty</th>
                  <th className="px-2 py-1 border-b border-slate-600 text-right">Unit Price</th>
                  <th className="px-2 py-1 border-b border-slate-600 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((i, idx) => (
                  <tr key={idx} className="border-b border-slate-700">
                    <td className="px-2 py-1">{i.menuId.name}</td>
                    <td className="px-2 py-1 text-right">{i.quantity}</td>
                    <td className="px-2 py-1 text-right">{i.menuId.price.toLocaleString()} Ks</td>
                    <td className="px-2 py-1 text-right">{(i.menuId.price * i.quantity).toLocaleString()} Ks</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="font-semibold text-slate-100">
                <tr>
                  <td className="px-2 py-1" colSpan={3}>Total</td>
                  <td className="px-2 py-1 text-right">{selectedOrder.totalAmount.toLocaleString()} Ks</td>
                </tr>
                <tr>
                  <td className="px-2 py-1" colSpan={3}>Paid</td>
                  <td className="px-2 py-1 text-right">{selectedOrder.isPaid ? "Yes" : "No"}</td>
                </tr>
              </tfoot>
            </table>

            {!selectedOrder.isPaid && role === "shop-admin" && (
              <button
                onClick={() => markPaid(selectedOrder._id)}
                className="mt-3 w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded py-1 px-3 text-sm font-semibold"
              >
                Mark Paid
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
