import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const STATUS_STEPS = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "assigned",
  "picked-up",
  "delivered",
  "complete",
];

const formatMoney = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "MMK",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function CustomerHome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menus, setMenus] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [shopSearchTerm, setShopSearchTerm] = useState("");
  const [shopCategory, setShopCategory] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentReference, setPaymentReference] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [paymentModalOrder, setPaymentModalOrder] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [menuNote, setMenuNote] = useState("");
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [staffLocation, setStaffLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [loading, setLoading] = useState({
    shops: false,
    menus: false,
    orders: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  const NOTI_STORAGE_KEY = "foodorder.notifications.customer";
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
  const activeMenuShopIdRef = useRef(null);

  const normalizeShopId = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    return value?._id || null;
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
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

  const showMessage = (type, text) => {
    setMessage({ type, text });
    if (text) {
      setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    }
  };

  const fetchShops = async () => {
    setLoading((prev) => ({ ...prev, shops: true }));
    try {
      const res = await api.get("/shop");
      setShops(res.data?.data || res.data || []);
    } catch (err) {
      showMessage(
        "error",
        err?.response?.data?.message || "Failed to load shops."
      );
    } finally {
      setLoading((prev) => ({ ...prev, shops: false }));
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/category/all");
      setCategories(res.data?.data || []);
    } catch (err) {
      showMessage(
        "error",
        err?.response?.data?.message || "Failed to load categories."
      );
    }
  };

  const fetchOrders = async () => {
    setLoading((prev) => ({ ...prev, orders: true }));
    try {
      const res = await api.get("/order/myorders");
      setOrders(res.data?.data || res.data || []);
    } catch (err) {
      showMessage(
        "error",
        err?.response?.data?.message || "Failed to load orders."
      );
    } finally {
      setLoading((prev) => ({ ...prev, orders: false }));
    }
  };

  const fetchWallet = async () => {
    setWalletLoading(true);
    try {
      const res = await api.get("/user/me");
      const balance = Number(res.data?.user?.walletBalance || 0);
      setWalletBalance(balance);
    } catch (err) {
      setWalletBalance(0);
    } finally {
      setWalletLoading(false);
    }
  };

  const fetchMenus = async (shopId) => {
    if (!shopId) return;
    const requestedShopId = String(shopId);
    setLoading((prev) => ({ ...prev, menus: true }));
    try {
      const res = await api.get(`/menu/shop/${shopId}`);
      // Ignore stale responses if user already switched to another shop.
      if (activeMenuShopIdRef.current !== requestedShopId) return;
      const items = res.data?.data || [];
      const safeMenus = items.filter(
        (menu) => normalizeShopId(menu.shopId) === requestedShopId
      );
      setMenus(safeMenus);
    } catch (err) {
      showMessage(
        "error",
        err?.response?.data?.message || "Failed to load menu items."
      );
    } finally {
      setLoading((prev) => ({ ...prev, menus: false }));
    }
  };

  const fetchStaffLocation = async (orderId) => {
    if (!orderId) return;
    setLocationLoading(true);
    try {
      const res = await api.get(`/order/myorders/${orderId}/staff-location`);
      setStaffLocation(res.data?.data || null);
    } catch (err) {
      setStaffLocation(null);
    } finally {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
    fetchCategories();
    fetchOrders();
    fetchWallet();
  }, []);

  useEffect(() => {
    const enableSound = () => {
      soundEnabledRef.current = true;
    };
    window.addEventListener("pointerdown", enableSound, { once: true });
    return () => window.removeEventListener("pointerdown", enableSound);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchOrders();
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(NOTI_STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      // ignore storage errors
    }
  }, [notifications]);

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

  const toastNotifications = useMemo(() => toasts, [toasts]);

  useEffect(() => {
    if (selectedShop?._id) {
      activeMenuShopIdRef.current = String(selectedShop._id);
      setMenus([]);
      fetchMenus(selectedShop._id);
    } else {
      activeMenuShopIdRef.current = null;
      setMenus([]);
    }
    setSelectedCategory("all");
    setSearchTerm("");
  }, [selectedShop?._id]);

  useEffect(() => {
    setMenuNote("");
    setSelectedAddOns([]);
  }, [selectedMenu?._id]);

  const filteredShops = useMemo(() => {
    return shops.filter((shop) => {
      const matchesSearch = `${shop.name || ""} ${shop.description || ""} ${
        shop.address || ""
      }`
        .toLowerCase()
        .includes(shopSearchTerm.toLowerCase());

      const shopCategories = Array.isArray(shop.category) ? shop.category : [];
      const matchesCategory =
        shopCategory === "all" ||
        shopCategories.some((cat) => {
          const catId = typeof cat === "object" ? cat?._id : cat;
          return catId === shopCategory;
        });

      return matchesSearch && matchesCategory;
    });
  }, [shops, shopSearchTerm, shopCategory]);

  const filteredMenus = useMemo(() => {
    return menus.filter((menu) => {
      const matchesSearch = menu.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const menuCategoryId =
        typeof menu.category === "object" ? menu.category?._id : menu.category;
      const matchesCategory =
        selectedCategory === "all" || menuCategoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menus, searchTerm, selectedCategory]);

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const handleAddToCart = (menu, { addOns = [], note = "" } = {}) => {
    const menuShopId = normalizeShopId(menu.shopId);
    const selectedShopId = normalizeShopId(selectedShop);
    if (!selectedShopId || menuShopId !== selectedShopId) {
      showMessage("error", "Please select the correct shop menu before adding.");
      return;
    }
    const basePrice = Number(menu.price || 0);
    const normalizedAddOns = Array.isArray(addOns)
      ? addOns.map((addOn) => ({
          name: addOn.name,
          price: Number(addOn.price || 0),
        }))
      : [];
    const addOnsTotal = normalizedAddOns.reduce(
      (sum, addOn) => sum + addOn.price,
      0
    );
    const unitPrice = basePrice + addOnsTotal;
    const cleanNote = typeof note === "string" ? note.trim() : "";
    const addOnKey = normalizedAddOns
      .map((addOn) => addOn.name)
      .sort()
      .join("|");
    const cartKey = `${menu._id}::${addOnKey}::${cleanNote}`;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.cartKey === cartKey);
      if (existing) {
        return prev.map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          cartKey,
          _id: menu._id,
          shopId: menuShopId,
          name: menu.name,
          basePrice,
          unitPrice,
          addOns: normalizedAddOns,
          note: cleanNote,
          quantity: 1,
        },
      ];
    });
  };

  const handleQtyChange = (cartKey, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleSelectShop = (shop) => {
    setSelectedShop(shop);
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    if (cartItems.length === 0) {
      showMessage("error", "Please add items to your cart first.");
      return;
    }
    if (!deliveryAddress.trim()) {
      showMessage("error", "Delivery address is required.");
      return;
    }
    if (paymentMethod === "wallet") {
      const minRemaining = 100;
      if (walletBalance - cartTotal < minRemaining) {
        showMessage(
          "error",
          "Insufficient wallet balance. Minimum remaining balance is 100 MMK."
        );
        return;
      }
    }

    try {
      const res = await api.post("/order/create", {
        items: cartItems.map((item) => ({
          menuId: item._id,
          quantity: item.quantity,
          addOns: item.addOns,
          note: item.note,
        })),
        deliveryAddress: deliveryAddress.trim(),
        paymentMethod,
        paymentReference: paymentReference.trim(),
      });
      const createdData = res.data?.data;
      const createdOrders = Array.isArray(createdData)
        ? createdData
        : createdData
        ? [createdData]
        : [];

      showMessage(
        "success",
        createdOrders.length > 1
          ? `Orders placed successfully across ${createdOrders.length} shops.`
          : "Order placed successfully."
      );
      handleClearCart();
      setDeliveryAddress("");
      setPaymentReference("");
      fetchOrders();
      fetchWallet();
      if (paymentMethod === "kpay" && createdOrders.length === 1 && createdOrders[0]?._id) {
        setPaymentModalOrder(createdOrders[0]);
      }
    } catch (err) {
      showMessage(
        "error",
        err?.response?.data?.message || "Failed to place order."
      );
    }
  };

  const handleMockPayment = async (orderId) => {
    if (!orderId) return;
    setPaymentLoading(true);
    try {
      await api.post(`/order/${orderId}/pay-mock`);
      showMessage("success", "Payment received. Thank you!");
      setPaymentModalOrder(null);
      fetchOrders();
      fetchWallet();
    } catch (err) {
      showMessage(
        "error",
        err?.response?.data?.message || "Payment failed. Please try again."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const paymentLabel = (method) => {
    switch (method) {
      case "kpay":
        return "KPay";
      case "wallet":
        return "Wallet";
      case "card":
        return "Card";
      default:
        return "Cash"; 
    }
  };

  const handleTopUp = async () => {
    const amount = Number(topUpAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      showMessage("error", "Please enter a valid top-up amount.");
      return;
    }
    setTopUpLoading(true);
    try {
      const res = await api.post("/user/wallet/topup-mock", { amount });
      const balance = Number(res.data?.data?.walletBalance || 0);
      setWalletBalance(balance);
      setTopUpAmount("");
      setTopUpOpen(false);
      showMessage("success", "Wallet top-up successful.");
    } catch (err) {
      showMessage(
        "error",
        err?.response?.data?.message || "Top-up failed."
      );
    } finally {
      setTopUpLoading(false);
    }
  };

  const sortedOrders = useMemo(() => {
    return [...orders].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [orders]);
  const recentOrders = useMemo(() => sortedOrders.slice(0, 5), [sortedOrders]);

  const latestOrder = sortedOrders[0];
  const latestStatusIndex = latestOrder
    ? STATUS_STEPS.indexOf(latestOrder.status)
    : -1;

  useEffect(() => {
    if (!latestOrder?._id) {
      setStaffLocation(null);
      return;
    }
    fetchStaffLocation(latestOrder._id);
    const timer = setInterval(() => {
      fetchStaffLocation(latestOrder._id);
    }, 15000);
    return () => clearInterval(timer);
  }, [latestOrder?._id]);

  return (
    <div className="min-h-screen anim-fade-in-up bg-white text-[#0f172a] px-6 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] p-6 sm:p-8 shadow-lg border border-[#cbd5e1]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#475569]">
                Customer Portal
              </p>
              <h1 className="text-3xl sm:text-4xl font-semibold">
                Welcome{user?.name ? `, ${user.name}` : ""}
              </h1>
              <p className="text-sm text-[#475569] mt-2">
                Browse shops, add items to your cart, and place delivery orders
                in one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl bg-[#f8fafc] border border-[#cbd5e1] px-4 py-3 min-w-[140px]">
                <p className="text-xs uppercase tracking-[0.2em] text-[#475569]">
                  Shops
                </p>
                <p className="text-2xl font-semibold">{shops.length}</p>
              </div>
              <div className="rounded-2xl bg-[#f8fafc] border border-[#cbd5e1] px-4 py-3 min-w-[140px]">
                <p className="text-xs uppercase tracking-[0.2em] text-[#475569]">
                  Cart Items
                </p>
                <p className="text-2xl font-semibold">{cartItems.length}</p>
              </div>
              <div className="rounded-2xl bg-[#f8fafc] border border-[#cbd5e1] px-4 py-3 min-w-[140px]">
                <p className="text-xs uppercase tracking-[0.2em] text-[#475569]">
                  Orders
                </p>
                <p className="text-2xl font-semibold">{orders.length}</p>
              </div>
              <div className="rounded-2xl bg-[#f8fafc] border border-[#cbd5e1] px-4 py-3 min-w-[160px]">
                <p className="text-xs uppercase tracking-[0.2em] text-[#475569]">
                  Wallet
                </p>
                <p className="text-2xl font-semibold">
                  {walletLoading ? "..." : formatMoney(walletBalance)}
                </p>
                <button
                  onClick={() => setTopUpOpen(true)}
                  className="mt-2 text-xs font-semibold text-[#0f172a] underline"
                >
                  Top up (KPay)
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-full bg-[#e2e8f0] text-[#0f172a] px-5 py-2 text-sm font-semibold hover:bg-[#0ea5e9]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {message.text && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              message.type === "error"
                ? "border-red-400/40 bg-red-500/10 text-red-300"
                : "border-emerald-400/40 bg-emerald-500/10 text-emerald-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {toastNotifications.length > 0 && (
          <div className="fixed right-6 top-24 z-40 w-[320px] space-y-3">
            {toastNotifications.map((note) => (
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6">
            <div className="rounded-3xl bg-[#f8fafc] border border-[#cbd5e1] p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Pick a shop</h2>
              <p className="text-sm text-[#475569] mt-1">
                Select a shop to see its menu items and start ordering.
              </p>
              <div className="mt-4 space-y-3">
                {loading.shops && (
                  <p className="text-sm text-[#475569]">Loading shops...</p>
                )}
                {!loading.shops && shops.length === 0 && (
                  <p className="text-sm text-[#475569]">
                    No shops available yet.
                  </p>
                )}
                <div className="flex flex-wrap gap-3">
                  <input
                    value={shopSearchTerm}
                    onChange={(event) => setShopSearchTerm(event.target.value)}
                    placeholder="Search shops"
                    className="w-full rounded-full border border-[#cbd5e1] bg-[#f1f5f9] px-4 py-2 text-sm text-[#0f172a] placeholder-[#64748b] outline-none focus:border-[#0ea5e9]"
                  />
                  <select
                    value={shopCategory}
                    onChange={(event) => setShopCategory(event.target.value)}
                    className="w-full rounded-full border border-[#cbd5e1] bg-[#f1f5f9] px-4 py-2 text-sm text-[#0f172a] placeholder-[#64748b] outline-none focus:border-[#0ea5e9]"
                  >
                    <option value="all">All categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                {filteredShops.length === 0 && !loading.shops && (
                  <p className="text-sm text-[#475569]">
                    No shops match your search.
                  </p>
                )}
                {filteredShops.map((shop) => (
                  <button
                    key={shop._id}
                    onClick={() => handleSelectShop(shop)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      selectedShop?._id === shop._id
                        ? "border-[#e2e8f0] bg-[#e2e8f0] text-[#0f172a]"
                        : "border-[#cbd5e1] bg-[#f1f5f9] hover:border-[#0ea5e9] hover:bg-[#e2e8f0]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-xl border border-[#cbd5e1] bg-[#f8fafc]">
                        {shop.photo ? (
                          <img
                            src={shop.photo}
                            alt={shop.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-[#475569]">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{shop.name}</p>
                        <p
                          className={`text-xs ${
                            selectedShop?._id === shop._id
                              ? "text-[#cbd5e1]"
                              : "text-[#475569]"
                          }`}
                        >
                          {shop.address}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-[#f8fafc] border border-[#cbd5e1] p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Order tracking</h2>
              {latestOrder ? (
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-[#cbd5e1] bg-[#f1f5f9] p-4">
                    <p className="text-sm text-[#475569]">
                      Latest order from{" "}
                      <span className="font-semibold text-[#0f172a]">
                        {latestOrder?.shopId?.name || "Shop"}
                      </span>
                    </p>
                    <p className="text-lg font-semibold mt-1">
                      {formatMoney(latestOrder.totalAmount)}
                    </p>
                    <p className="text-xs text-[#475569] mt-1">
                      Status: {latestOrder.status}
                    </p>
                    <p className="text-xs text-[#475569] mt-1">
                      Payment:{" "}
                      {latestOrder.isPaid
                        ? "Paid"
                        : `Unpaid (${paymentLabel(
                            latestOrder.paymentMethod
                          )})`}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {STATUS_STEPS.map((step, index) => (
                      <div
                        key={step}
                        className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${
                          index <= latestStatusIndex
                            ? "border-[#e2e8f0] bg-[#e2e8f0] text-[#0f172a]"
                            : "border-[#cbd5e1] bg-[#f1f5f9] text-[#475569]"
                        }`}
                      >
                        <span className="capitalize">{step}</span>
                        {index <= latestStatusIndex ? "Done" : "Pending"}
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-[#cbd5e1] bg-[#f8fafc] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#475569]">
                      Delivery Staff Location
                    </p>
                    {locationLoading && (
                      <p className="mt-2 text-sm text-[#475569]">
                        Loading location...
                      </p>
                    )}
                    {!locationLoading && !staffLocation && (
                      <p className="mt-2 text-sm text-[#475569]">
                        Location not available yet.
                      </p>
                    )}
                    {!locationLoading &&
                      staffLocation?.location &&
                      typeof staffLocation.location.lat === "number" &&
                      typeof staffLocation.location.lng === "number" && (
                      <div className="mt-3 space-y-3">
                        <div className="text-sm text-[#475569]">
                          <div>
                            Staff:{" "}
                            <span className="font-semibold text-[#0f172a]">
                              {staffLocation.name || "Delivery staff"}
                            </span>
                          </div>
                          <div>
                            Coordinates:{" "}
                            {staffLocation.location.lat.toFixed(5)},{" "}
                            {staffLocation.location.lng.toFixed(5)}
                          </div>
                          {staffLocation.location.updatedAt && (
                            <div>
                              Updated:{" "}
                              {new Date(
                                staffLocation.location.updatedAt
                              ).toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                        <div className="overflow-hidden rounded-2xl border border-[#cbd5e1]">
                          <iframe
                            title="Delivery staff location"
                            className="h-48 w-full"
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                              staffLocation.location.lng - 0.005
                            },${
                              staffLocation.location.lat - 0.005
                            },${
                              staffLocation.location.lng + 0.005
                            },${
                              staffLocation.location.lat + 0.005
                            }&marker=${staffLocation.location.lat},${
                              staffLocation.location.lng
                            }`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-[#475569]">
                  No recent orders yet. Place your first order to start
                  tracking.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-3xl bg-[#f8fafc] border border-[#cbd5e1] p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Menu</h2>
                  <p className="text-sm text-[#475569] mt-1">
                    {selectedShop
                      ? `Showing menu for ${selectedShop.name}`
                      : "Select a shop to see its menu."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search menu items"
                    className="rounded-full border border-[#cbd5e1] bg-[#f1f5f9] px-4 py-2 text-sm text-[#0f172a] placeholder-[#64748b] outline-none focus:border-[#0ea5e9]"
                  />
                  <select
                    value={selectedCategory}
                    onChange={(event) => setSelectedCategory(event.target.value)}
                    className="rounded-full border border-[#cbd5e1] bg-[#f1f5f9] px-4 py-2 text-sm text-[#0f172a] placeholder-[#64748b] outline-none focus:border-[#0ea5e9]"
                  >
                    <option value="all">All categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5 max-h-[640px] overflow-y-auto pr-1">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {loading.menus && (
                    <p className="text-sm text-[#475569]">Loading menu...</p>
                  )}
                  {!loading.menus &&
                    selectedShop &&
                    filteredMenus.length === 0 && (
                      <p className="text-sm text-[#475569]">
                        No menu items found for this shop.
                      </p>
                    )}
                  {!selectedShop && (
                    <p className="text-sm text-[#475569]">
                      Choose a shop to start browsing menu items.
                    </p>
                  )}
                  {filteredMenus.map((menu) => (
                    <div
                      key={menu._id}
                      className="rounded-2xl border border-[#cbd5e1] bg-[#f8fafc] p-4"
                    >
                      <div className="mb-3 overflow-hidden rounded-2xl border border-[#cbd5e1] bg-[#f8fafc]">
                        {menu.image ? (
                          <img
                            src={menu.image}
                            alt={menu.name}
                            className="h-36 w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-36 items-center justify-center text-xs text-[#475569]">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{menu.name}</p>
                          <p className="text-xs text-[#475569]">
                            {menu.category?.name || "Uncategorized"}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-[#0f172a]">
                          {formatMoney(menu.price)}
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-[#475569]">
                        {menu.description || "Freshly prepared for you."}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={() => handleAddToCart(menu)}
                          className="rounded-full bg-[#e2e8f0] text-[#0f172a] px-4 py-2 text-xs font-semibold hover:bg-[#0ea5e9]"
                        >
                          Add to cart
                        </button>
                        <button
                          onClick={() => setSelectedMenu(menu)}
                          className="rounded-full border border-[#cbd5e1] px-4 py-2 text-xs font-semibold text-[#475569] hover:border-[#e2e8f0]"
                        >
                          View details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-3xl bg-[#f8fafc] border border-[#cbd5e1] p-6 shadow-sm">
                <h2 className="text-xl font-semibold">Your cart</h2>
                <p className="text-sm text-[#475569] mt-1">
                  Add items from any shops, then place one checkout.
                </p>
                <div className="mt-4 space-y-3">
                  {cartItems.length === 0 && (
                    <p className="text-sm text-[#475569]">
                      Your cart is empty.
                    </p>
                  )}
                  {cartItems.map((item) => (
                    <div
                      key={item.cartKey}
                      className="rounded-2xl border border-[#cbd5e1] bg-[#f8fafc] px-4 py-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-xs text-[#475569]">
                            {formatMoney(item.unitPrice)} each
                          </p>
                          {item.addOns?.length > 0 && (
                            <div className="mt-1 text-xs text-[#475569]">
                              Add-ons:{" "}
                              {item.addOns.map((addOn) => addOn.name).join(", ")}
                            </div>
                          )}
                          {item.note && (
                            <div className="mt-1 text-xs text-[#475569]">
                              Note: {item.note}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQtyChange(item.cartKey, -1)}
                            className="h-8 w-8 rounded-full border border-[#cbd5e1] text-sm font-semibold"
                          >
                            -
                          </button>
                          <span className="text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQtyChange(item.cartKey, 1)}
                            className="h-8 w-8 rounded-full border border-[#cbd5e1] text-sm font-semibold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between text-sm font-semibold">
                  <span>Total</span>
                  <span>{formatMoney(cartTotal)}</span>
                </div>
                <button
                  onClick={handleClearCart}
                  className="mt-4 text-xs font-semibold text-[#475569] underline"
                >
                  Clear cart
                </button>
              </div>

              <div className="rounded-3xl bg-[#f8fafc] border border-[#cbd5e1] p-6 shadow-sm">
                <h2 className="text-xl font-semibold">Checkout</h2>
                <p className="text-sm text-[#475569] mt-1">
                  Provide a delivery address to place your order.
                </p>
                <form className="mt-4 space-y-4" onSubmit={handlePlaceOrder}>
                  <textarea
                    value={deliveryAddress}
                    onChange={(event) => setDeliveryAddress(event.target.value)}
                    placeholder="Delivery address"
                    rows={3}
                    className="w-full rounded-2xl border border-[#cbd5e1] bg-[#f1f5f9] px-4 py-3 text-sm text-[#0f172a] placeholder-[#64748b] outline-none focus:border-[#0ea5e9]"
                  />
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Payment method</p>
                    <div className="flex flex-wrap gap-2">
                      {["cash", "kpay", "wallet", "card"].map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`rounded-full border px-4 py-2 text-xs font-semibold capitalize ${
                            paymentMethod === method
                              ? "border-[#e2e8f0] bg-[#e2e8f0] text-[#0f172a]"
                              : "border-[#cbd5e1] text-[#475569] hover:border-[#e2e8f0]"
                          }`}
                        >
                          {paymentLabel(method)}
                        </button>
                      ))}
                    </div>
                  </div>
                  {paymentMethod === "wallet" && (
                    <div className="text-xs text-[#475569]">
                      Wallet balance: {formatMoney(walletBalance)} · Minimum
                      remaining balance: 100 MMK
                    </div>
                  )}
                  {paymentMethod !== "cash" && paymentMethod !== "wallet" && (
                    <input
                      value={paymentReference}
                      onChange={(event) => setPaymentReference(event.target.value)}
                      placeholder="Payment reference (optional)"
                      className="w-full rounded-2xl border border-[#cbd5e1] bg-[#f1f5f9] px-4 py-3 text-sm text-[#0f172a] placeholder-[#64748b] outline-none focus:border-[#0ea5e9]"
                    />
                  )}
                  <button
                    type="submit"
                    disabled={cartItems.length === 0}
                    className="w-full rounded-full bg-[#e2e8f0] text-[#0f172a] px-4 py-3 text-sm font-semibold hover:bg-[#0ea5e9] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Place order
                  </button>
                </form>
              </div>
            </div>

            <div className="rounded-3xl bg-[#f8fafc] border border-[#cbd5e1] p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Order history</h2>
                {loading.orders && (
                  <span className="text-xs text-[#475569]">Loading...</span>
                )}
              </div>
              <div className="mt-4 space-y-3">
                {!loading.orders && sortedOrders.length === 0 && (
                  <p className="text-sm text-[#475569]">
                    No orders placed yet.
                  </p>
                )}
                    {recentOrders.map((order) => (
                      <div
                        key={order._id}
                        className="rounded-2xl border border-[#cbd5e1] bg-[#f8fafc] px-4 py-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold">
                              {order.shopId?.name || "Shop"} ·{" "}
                              {formatMoney(order.totalAmount)}
                            </p>
                            <p className="text-xs text-[#475569]">
                              {new Date(order.createdAt).toLocaleString()}
                            </p>
                            <p className="text-xs text-[#475569]">
                              Payment:{" "}
                              {order.isPaid
                                ? "Paid"
                                : `Unpaid (${paymentLabel(order.paymentMethod)})`}
                            </p>
                          </div>
                          <span className="rounded-full border border-[#cbd5e1] px-3 py-1 text-xs font-semibold capitalize text-[#475569]">
                            {order.status}
                          </span>
                        </div>
                        {!order.isPaid && order.paymentMethod === "kpay" && (
                          <div className="mt-3">
                            <button
                              onClick={() => setPaymentModalOrder(order)}
                              className="rounded-full border border-[#e2e8f0] px-4 py-2 text-xs font-semibold text-[#0f172a] hover:bg-[#e2e8f0] hover:text-[#0f172a]"
                            >
                              Pay with KPay
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

            <div className="rounded-3xl bg-[#f8fafc] border border-[#cbd5e1] p-6 shadow-sm">
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
                  <p className="text-sm text-[#475569]">
                    No notifications yet.
                  </p>
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
          </div>
        </div>
      </div>

      {topUpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-[#f8fafc] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold">Top up wallet</h3>
                <p className="text-sm text-[#475569] mt-1">
                  Use KPay to add balance to your wallet.
                </p>
              </div>
              <button
                onClick={() => setTopUpOpen(false)}
                className="rounded-full border border-[#cbd5e1] px-3 py-1 text-xs font-semibold text-[#475569]"
              >
                Close
              </button>
            </div>

            <div className="mt-4">
              <input
                type="number"
                value={topUpAmount}
                onChange={(event) => setTopUpAmount(event.target.value)}
                placeholder="Top-up amount (MMK)"
                className="w-full rounded-2xl border border-[#cbd5e1] bg-[#f1f5f9] px-4 py-3 text-sm text-[#0f172a] placeholder-[#64748b] outline-none focus:border-[#0ea5e9]"
              />
            </div>

            <div className="mt-5 flex items-center justify-center">
              <div className="grid grid-cols-6 gap-1 rounded-2xl border border-[#cbd5e1] bg-[#f1f5f9] p-4">
                {Array.from({ length: 36 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-4 w-4 ${
                      (idx * 5) % 9 < 4 ? "bg-[#e2e8f0]" : "bg-[#f8fafc]"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 text-xs text-[#475569] text-center">
              Mock KPay top-up QR (demo only)
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-[#475569]">
                Current balance: {formatMoney(walletBalance)}
              </div>
              <button
                onClick={handleTopUp}
                disabled={topUpLoading}
                className="rounded-full bg-[#e2e8f0] text-[#0f172a] px-5 py-2 text-sm font-semibold hover:bg-[#0ea5e9] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {topUpLoading ? "Processing..." : "Confirm top-up"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-[#f8fafc] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold">{selectedMenu.name}</h3>
                <p className="text-sm text-[#475569]">
                  {selectedMenu.category?.name || "Uncategorized"}
                </p>
              </div>
              <button
                onClick={() => setSelectedMenu(null)}
                className="rounded-full border border-[#cbd5e1] px-3 py-1 text-xs font-semibold text-[#475569]"
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-[#cbd5e1] bg-[#f8fafc]">
                {selectedMenu.image ? (
                  <img
                    src={selectedMenu.image}
                    alt={selectedMenu.name}
                    className="h-56 w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-56 items-center justify-center text-xs text-[#475569]">
                    No image
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <p className="text-sm text-[#475569]">
                  {selectedMenu.description || "Freshly prepared for you."}
                </p>
                <p className="text-lg font-semibold">
                  {formatMoney(selectedMenu.price)}
                </p>
                {Array.isArray(selectedMenu.tags) &&
                  selectedMenu.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedMenu.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-[#cbd5e1] px-3 py-1 text-xs text-[#475569]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                {Array.isArray(selectedMenu.allergens) &&
                  selectedMenu.allergens.length > 0 && (
                    <div className="text-xs text-[#f87171]">
                      Allergens: {selectedMenu.allergens.join(", ")}
                    </div>
                  )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold">Add-ons</p>
                <div className="mt-2 space-y-2">
                  {Array.isArray(selectedMenu.addOns) &&
                  selectedMenu.addOns.length > 0 ? (
                    selectedMenu.addOns.map((addOn) => (
                      <label
                        key={addOn.name}
                        className="flex items-center justify-between rounded-xl border border-[#cbd5e1] px-3 py-2 text-sm"
                      >
                        <span>
                          <input
                            type="checkbox"
                            className="mr-2 accent-[#e2e8f0]"
                            checked={selectedAddOns.includes(addOn.name)}
                            onChange={(event) => {
                              setSelectedAddOns((prev) => {
                                if (event.target.checked) {
                                  return [...prev, addOn.name];
                                }
                                return prev.filter((name) => name !== addOn.name);
                              });
                            }}
                          />
                          {addOn.name}
                        </span>
                        <span className="text-xs text-[#475569]">
                          +{formatMoney(addOn.price)}
                        </span>
                      </label>
                    ))
                  ) : (
                    <p className="text-xs text-[#475569]">
                      No add-ons available.
                    </p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold">Notes for the kitchen</p>
                <textarea
                  value={menuNote}
                  onChange={(event) => setMenuNote(event.target.value)}
                  placeholder="E.g. No onions, extra spicy"
                  rows={5}
                  className="mt-2 w-full rounded-2xl border border-[#cbd5e1] bg-[#f1f5f9] px-4 py-3 text-sm text-[#0f172a] placeholder-[#64748b] outline-none focus:border-[#0ea5e9]"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-[#475569]">
                Selected add-ons total:{" "}
                {formatMoney(
                  selectedMenu.addOns
                    ?.filter((addOn) => selectedAddOns.includes(addOn.name))
                    .reduce((sum, addOn) => sum + Number(addOn.price || 0), 0)
                )}
              </div>
              <button
                onClick={() => {
                  const addOns = (selectedMenu.addOns || []).filter((addOn) =>
                    selectedAddOns.includes(addOn.name)
                  );
                  handleAddToCart(selectedMenu, {
                    addOns,
                    note: menuNote,
                  });
                  setSelectedMenu(null);
                }}
                className="rounded-full bg-[#e2e8f0] text-[#0f172a] px-5 py-2 text-sm font-semibold hover:bg-[#0ea5e9]"
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>
      )}

      {paymentModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#f8fafc] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold">Pay with KPay</h3>
                <p className="text-sm text-[#475569] mt-1">
                  Scan the QR or confirm payment to complete your order.
                </p>
              </div>
              <button
                onClick={() => setPaymentModalOrder(null)}
                className="rounded-full border border-[#cbd5e1] px-3 py-1 text-xs font-semibold text-[#475569]"
              >
                Close
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-[#cbd5e1] bg-[#f1f5f9] p-4 text-sm text-[#475569]">
              Order Total:{" "}
              <span className="font-semibold text-[#0f172a]">
                {formatMoney(paymentModalOrder.totalAmount)}
              </span>
            </div>

            <div className="mt-5 flex items-center justify-center">
              <div className="grid grid-cols-6 gap-1 rounded-2xl border border-[#cbd5e1] bg-[#f1f5f9] p-4">
                {Array.from({ length: 36 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-4 w-4 ${
                      (idx * 7) % 11 < 5 ? "bg-[#e2e8f0]" : "bg-[#f8fafc]"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 text-xs text-[#475569] text-center">
              Mock KPay QR (demo only)
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-[#475569]">
                Payment method: KPay
              </div>
              <button
                onClick={() => handleMockPayment(paymentModalOrder._id)}
                disabled={paymentLoading}
                className="rounded-full bg-[#e2e8f0] text-[#0f172a] px-5 py-2 text-sm font-semibold hover:bg-[#0ea5e9] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {paymentLoading ? "Processing..." : "Confirm Paid"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
