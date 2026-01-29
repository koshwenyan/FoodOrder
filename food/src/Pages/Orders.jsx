import { useEffect, useState } from "react";
import axios from "axios";

/* ================= CONFIG ================= */
const API_Order = "http://localhost:3000";

/* fake auth (replace with context later) */
const user = JSON.parse(localStorage.getItem("user"));
const role = user?.role;

/* delivery staff list */
const deliveryStaffs = ["Aung Aung", "Kyaw Kyaw", "Mg Mg"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const authHeader = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  const fetchOrders = async () => {
    const res = await axios.get(`${API_Order}/order/shop`, authHeader);
    setOrders(res.data);
  };

  const markCompleted = async (id) => {
    await axios.patch(
      `${API}/orders/${id}/status`,
      { status: "completed" },
      authHeader
    );
    fetchOrders();
  };

  const assignDelivery = async (id, delivery) => {
    await axios.patch(
      `${API}/orders/${id}/assign-delivery`,
      { delivery },
      authHeader
    );
    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => o.status === filter);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Orders Dashboard</h1>

      {/* FILTER */}
      <div className="flex gap-3 mb-6">
        {["pending", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg capitalize font-medium ${
              filter === f ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {f} Orders
          </button>
        ))}
      </div>

      {/* CARDS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.map((o) => (
          <div
            key={o.id}
            className="bg-white shadow-md rounded-xl p-5 hover:shadow-xl transition cursor-pointer"
            onClick={() => setSelectedOrder(o)}
          >
            <div className="flex justify-between items-start mb-3">
              <h2 className="font-bold text-lg">#{o.id}</h2>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  o.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {o.status}
              </span>
            </div>

            <p className="text-sm text-gray-700 mb-2">
              <b>Customer:</b> {o.customer}
            </p>
            <p className="text-sm text-gray-700 mb-2">
              <b>Total:</b> {o.total.toLocaleString()} Ks
            </p>

            {/* DELIVERY */}
            <div className="mb-3">
              {(role === "admin" || role === "shop-admin") ? (
                <select
                  className="border rounded px-2 py-1 text-sm w-full"
                  value={o.delivery || ""}
                  disabled={o.status === "completed"}
                  onChange={(e) =>
                    assignDelivery(o.id, e.target.value)
                  }
                >
                  <option value="">Assign Delivery</option>
                  {deliveryStaffs.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-500 text-sm">
                  <b>Delivery:</b> {o.delivery || "-"}
                </p>
              )}
            </div>

            {/* ACTION BUTTON */}
            <div className="flex justify-end">
              {o.status === "pending" &&
                (role === "admin" || role === "shop-admin") && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markCompleted(o.id);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Mark Complete
                  </button>
                )}

              {role === "staff" && (
                <span className="text-gray-400 text-xs">View Only</span>
              )}
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <p className="text-center col-span-full text-gray-400">
            No orders found
          </p>
        )}
      </div>

      {/* ORDER DETAIL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white max-w-lg w-full rounded-xl p-6 relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">
              Order #{selectedOrder.id}
            </h2>
            <p><b>Customer:</b> {selectedOrder.customer}</p>
            <p><b>Status:</b> {selectedOrder.status}</p>
            <p><b>Total:</b> {selectedOrder.total.toLocaleString()} Ks</p>
            <p><b>Delivery:</b> {selectedOrder.delivery || "N/A"}</p>

            <hr className="my-4" />
            <h3 className="font-semibold mb-2">Items</h3>
            <ul className="text-sm space-y-1">
              {selectedOrder.items.map((i, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>{i.name} × {i.qty}</span>
                  <span>{i.price.toLocaleString()} Ks</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
