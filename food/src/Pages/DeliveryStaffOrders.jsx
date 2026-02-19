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
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sharing, setSharing] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [lastSent, setLastSent] = useState(null);
  const [watchId, setWatchId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const [appOrdersRes, phoneOrdersRes] = await Promise.all([
        api.get("/order/delivery/my-orders"),
        api.get("/phoneCalledOrder/delivery/my-orders"),
      ]);
      const appOrders = (appOrdersRes.data?.data || []).map((order) => ({
        ...order,
        orderType: "app",
      }));
      const phoneOrders = (phoneOrdersRes.data?.data || []).map((order) => ({
        ...order,
        orderType: "phone",
      }));
      const merged = [...appOrders, ...phoneOrders].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(merged);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load orders.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchMe();
  }, []);

  const sendLocation = async (position) => {
    const { latitude, longitude } = position.coords;
    try {
      await api.put("/user/location", {
        lat: latitude,
        lng: longitude,
      });
      setLastSent(new Date());
    } catch (err) {
      setGeoError(err?.response?.data?.message || "Failed to send location.");
    }
  };

  const startSharing = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported on this device.");
      return;
    }
    setGeoError("");
    const id = navigator.geolocation.watchPosition(
      (pos) => sendLocation(pos),
      (err) => {
        setGeoError(err.message || "Location permission denied.");
        setSharing(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    );
    setWatchId(id);
    setSharing(true);
  };

  const stopSharing = () => {
    if (watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
    setWatchId(null);
    setSharing(false);
  };

  useEffect(() => {
    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  const fetchMe = async () => {
    try {
      const res = await api.get("/user/me");
      setMe(res.data?.user || null);
    } catch (err) {
      setMe(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleUpdateStatus = async (order, status) => {
    if (!status) return;
    try {
      if (order.orderType === "phone") {
        await api.put(`/phoneCalledOrder/${order._id}/status`, { status });
      } else {
        await api.put(`/order/${order._id}/status`, { status });
      }
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
        order.customerName?.toLowerCase().includes(term) ||
        order.shopId?.name?.toLowerCase().includes(term) ||
        order.deliveryAddress?.toLowerCase().includes(term) ||
        order.address?.toLowerCase().includes(term) ||
        order.phone?.toLowerCase().includes(term);
      return matchesStatus && (term ? matchesSearch : true);
    });
  }, [orders, searchTerm, statusFilter]);

  const statusOptions = ["picked-up", "delivered", "complete"];
  const filterOptions = [
    "confirmed",
    "assigned",
    "picked-up",
    "delivered",
    "complete",
    "cancelled",
  ];

  return (
    <div className="min-h-screen bg-[#f6f1eb] text-[#1f1a17]">
      <header className="sticky top-0 z-30 border-b border-[#ead8c7] bg-white/90 px-6 py-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#8b6b4f]">
              Delivery Staff
            </p>
            <h1 className="text-lg font-semibold leading-tight">
              My Orders
            </h1>
          </div>
          <div className="flex items-center gap-6">
            {me?.companyId?.name && (
              <div className="text-right text-sm">
                <div className="text-[#8b6b4f]">Company</div>
                <div className="font-semibold text-[#1f1a17]">
                  {me.companyId.name}
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="rounded-full border border-[#ead8c7] px-4 py-2 text-xs font-semibold text-[#b53b2e] hover:border-[#1f1a17]"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <div className="px-6 py-6 sm:px-10">
        <div className="rounded-3xl bg-gradient-to-br from-[#f9e9d7] via-[#f8f3ee] to-[#f2ddc7] p-6 sm:p-8 shadow-lg border border-[#ead8c7]">
          <p className="text-sm uppercase tracking-[0.2em] text-[#8b6b4f]">
            Delivery Staff
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold leading-tight">
            My Assigned Orders
          </h1>
          <p className="text-sm text-[#6c5645] mt-2 max-w-2xl">
            View your orders and update delivery status.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={sharing ? stopSharing : startSharing}
              className={`rounded-full px-4 py-2 text-xs font-semibold ${
                sharing
                  ? "bg-[#1f1a17] text-[#f8f3ee]"
                  : "border border-[#ead8c7] text-[#6c5645]"
              }`}
            >
              {sharing ? "Stop sharing location" : "Share live location"}
            </button>
            {lastSent && (
              <span className="text-xs text-[#8b6b4f]">
                Last update: {lastSent.toLocaleTimeString()}
              </span>
            )}
            {geoError && (
              <span className="text-xs text-[#c97a5a]">{geoError}</span>
            )}
          </div>
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
                placeholder="Search customer, shop, address"
                className="rounded-full border border-[#ead8c7] bg-white px-4 py-2 text-xs outline-none focus:border-[#1f1a17]"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-full border border-[#ead8c7] bg-white px-3 py-2 text-xs outline-none focus:border-[#1f1a17]"
              >
                <option value="all">All status</option>
                {filterOptions.map((status) => (
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
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredOrders.map((order, index) => {
                const displayName =
                  order.customer?.name || order.customerName || "N/A";
                const displayShop = order.shopId?.name || "N/A";
                const displayAddress =
                  order.deliveryAddress || order.address || "N/A";
                const isComplete = order.status === "complete";
                return (
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
                        {displayName}
                      </h3>
                      <p className="text-sm text-[#6c5645] mt-1">
                        {displayShop}
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
                        {displayAddress}
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
                        Created
                      </span>
                      <p className="mt-1 text-xs text-[#6c5645]">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#8b6b4f]">
                      Update Status
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {isComplete ? (
                        <span className="text-xs text-[#6c5645]">
                          Status complete
                        </span>
                      ) : (
                        statusOptions.map((status) => (
                          <button
                            key={status}
                            onClick={() => handleUpdateStatus(order, status)}
                            className="rounded-full border border-[#ead8c7] px-3 py-1 text-xs font-semibold capitalize text-[#6c5645] hover:border-[#1f1a17] hover:text-[#1f1a17]"
                          >
                            {status}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
