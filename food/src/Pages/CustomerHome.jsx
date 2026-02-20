import { useEffect, useMemo, useState } from "react";
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
  const [cartShopId, setCartShopId] = useState(null);
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

  const handleLogout = () => {
    logout();
    navigate("/customer/login");
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
    setLoading((prev) => ({ ...prev, menus: true }));
    try {
      const res = await api.get(`/menu/shop/${shopId}`);
      setMenus(res.data?.data || []);
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
    if (selectedShop?._id) {
      fetchMenus(selectedShop._id);
    } else {
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
    const menuShopId =
      typeof menu.shopId === "object" ? menu.shopId?._id : menu.shopId;
    if (cartShopId && cartShopId !== menuShopId) {
      showMessage("error", "Please clear the cart before switching shops.");
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
    setCartShopId(menuShopId);
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
    setCartShopId(null);
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    if (!cartShopId || cartItems.length === 0) {
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
        shopId: cartShopId,
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
      const createdOrder = res.data?.data;
      showMessage("success", "Order placed successfully.");
      handleClearCart();
      setDeliveryAddress("");
      setPaymentReference("");
      fetchOrders();
      fetchWallet();
      if (paymentMethod === "kpay" && createdOrder?._id) {
        setPaymentModalOrder(createdOrder);
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
    <div className="min-h-screen bg-[#0f1115] text-[#f6f1e8] px-6 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-[#1d222c] via-[#171a20] to-[#2a2f3a] p-6 sm:p-8 shadow-lg border border-[#2a2f3a]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#c9a96a]">
                Customer Portal
              </p>
              <h1 className="text-3xl sm:text-4xl font-semibold">
                Welcome{user?.name ? `, ${user.name}` : ""}
              </h1>
              <p className="text-sm text-[#a8905d] mt-2">
                Browse shops, add items to your cart, and place delivery orders
                in one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl bg-[#171a20] border border-[#2a2f3a] px-4 py-3 min-w-[140px]">
                <p className="text-xs uppercase tracking-[0.2em] text-[#c9a96a]">
                  Shops
                </p>
                <p className="text-2xl font-semibold">{shops.length}</p>
              </div>
              <div className="rounded-2xl bg-[#171a20] border border-[#2a2f3a] px-4 py-3 min-w-[140px]">
                <p className="text-xs uppercase tracking-[0.2em] text-[#c9a96a]">
                  Cart Items
                </p>
                <p className="text-2xl font-semibold">{cartItems.length}</p>
              </div>
              <div className="rounded-2xl bg-[#171a20] border border-[#2a2f3a] px-4 py-3 min-w-[140px]">
                <p className="text-xs uppercase tracking-[0.2em] text-[#c9a96a]">
                  Orders
                </p>
                <p className="text-2xl font-semibold">{orders.length}</p>
              </div>
              <div className="rounded-2xl bg-[#171a20] border border-[#2a2f3a] px-4 py-3 min-w-[160px]">
                <p className="text-xs uppercase tracking-[0.2em] text-[#c9a96a]">
                  Wallet
                </p>
                <p className="text-2xl font-semibold">
                  {walletLoading ? "..." : formatMoney(walletBalance)}
                </p>
                <button
                  onClick={() => setTopUpOpen(true)}
                  className="mt-2 text-xs font-semibold text-[#f6f1e8] underline"
                >
                  Top up (KPay)
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-full bg-[#f6f1e8] text-[#171a20] px-5 py-2 text-sm font-semibold hover:bg-[#c9a96a]"
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6">
            <div className="rounded-3xl bg-[#171a20] border border-[#2a2f3a] p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Pick a shop</h2>
              <p className="text-sm text-[#a8905d] mt-1">
                Select a shop to see its menu items and start ordering.
              </p>
              <div className="mt-4 space-y-3">
                {loading.shops && (
                  <p className="text-sm text-[#a8905d]">Loading shops...</p>
                )}
                {!loading.shops && shops.length === 0 && (
                  <p className="text-sm text-[#a8905d]">
                    No shops available yet.
                  </p>
                )}
                <div className="flex flex-wrap gap-3">
                  <input
                    value={shopSearchTerm}
                    onChange={(event) => setShopSearchTerm(event.target.value)}
                    placeholder="Search shops"
                    className="w-full rounded-full border border-[#2a2f3a] bg-[#1d222c] px-4 py-2 text-sm text-[#f6f1e8] placeholder-[#a8905d] outline-none focus:border-[#c9a96a]"
                  />
                  <select
                    value={shopCategory}
                    onChange={(event) => setShopCategory(event.target.value)}
                    className="w-full rounded-full border border-[#2a2f3a] bg-[#1d222c] px-4 py-2 text-sm text-[#f6f1e8] placeholder-[#a8905d] outline-none focus:border-[#c9a96a]"
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
                  <p className="text-sm text-[#a8905d]">
                    No shops match your search.
                  </p>
                )}
                {filteredShops.map((shop) => (
                  <button
                    key={shop._id}
                    onClick={() => setSelectedShop(shop)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      selectedShop?._id === shop._id
                        ? "border-[#f6f1e8] bg-[#f6f1e8] text-[#171a20]"
                        : "border-[#2a2f3a] bg-[#1d222c] hover:border-[#c9a96a] hover:bg-[#232833]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-xl border border-[#2a2f3a] bg-[#171a20]">
                        {shop.photo ? (
                          <img
                            src={shop.photo}
                            alt={shop.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-[#c9a96a]">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{shop.name}</p>
                        <p
                          className={`text-xs ${
                            selectedShop?._id === shop._id
                              ? "text-[#2a2f3a]"
                              : "text-[#a8905d]"
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

            <div className="rounded-3xl bg-[#171a20] border border-[#2a2f3a] p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Order tracking</h2>
              {latestOrder ? (
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-[#2a2f3a] bg-[#1d222c] p-4">
                    <p className="text-sm text-[#a8905d]">
                      Latest order from{" "}
                      <span className="font-semibold text-[#f6f1e8]">
                        {latestOrder?.shopId?.name || "Shop"}
                      </span>
                    </p>
                    <p className="text-lg font-semibold mt-1">
                      {formatMoney(latestOrder.totalAmount)}
                    </p>
                    <p className="text-xs text-[#c9a96a] mt-1">
                      Status: {latestOrder.status}
                    </p>
                    <p className="text-xs text-[#c9a96a] mt-1">
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
                            ? "border-[#f6f1e8] bg-[#f6f1e8] text-[#171a20]"
                            : "border-[#2a2f3a] bg-[#1d222c] text-[#a8905d]"
                        }`}
                      >
                        <span className="capitalize">{step}</span>
                        {index <= latestStatusIndex ? "Done" : "Pending"}
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-[#2a2f3a] bg-[#171a20] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#c9a96a]">
                      Delivery Staff Location
                    </p>
                    {locationLoading && (
                      <p className="mt-2 text-sm text-[#a8905d]">
                        Loading location...
                      </p>
                    )}
                    {!locationLoading && !staffLocation && (
                      <p className="mt-2 text-sm text-[#a8905d]">
                        Location not available yet.
                      </p>
                    )}
                    {!locationLoading &&
                      staffLocation?.location &&
                      typeof staffLocation.location.lat === "number" &&
                      typeof staffLocation.location.lng === "number" && (
                      <div className="mt-3 space-y-3">
                        <div className="text-sm text-[#a8905d]">
                          <div>
                            Staff:{" "}
                            <span className="font-semibold text-[#f6f1e8]">
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
                        <div className="overflow-hidden rounded-2xl border border-[#2a2f3a]">
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
                <p className="mt-4 text-sm text-[#a8905d]">
                  No recent orders yet. Place your first order to start
                  tracking.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-3xl bg-[#171a20] border border-[#2a2f3a] p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Menu</h2>
                  <p className="text-sm text-[#a8905d] mt-1">
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
                    className="rounded-full border border-[#2a2f3a] bg-[#1d222c] px-4 py-2 text-sm text-[#f6f1e8] placeholder-[#a8905d] outline-none focus:border-[#c9a96a]"
                  />
                  <select
                    value={selectedCategory}
                    onChange={(event) => setSelectedCategory(event.target.value)}
                    className="rounded-full border border-[#2a2f3a] bg-[#1d222c] px-4 py-2 text-sm text-[#f6f1e8] placeholder-[#a8905d] outline-none focus:border-[#c9a96a]"
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
                    <p className="text-sm text-[#a8905d]">Loading menu...</p>
                  )}
                  {!loading.menus &&
                    selectedShop &&
                    filteredMenus.length === 0 && (
                      <p className="text-sm text-[#a8905d]">
                        No menu items found for this shop.
                      </p>
                    )}
                  {!selectedShop && (
                    <p className="text-sm text-[#a8905d]">
                      Choose a shop to start browsing menu items.
                    </p>
                  )}
                  {filteredMenus.map((menu) => (
                    <div
                      key={menu._id}
                      className="rounded-2xl border border-[#2a2f3a] bg-[#171a20] p-4"
                    >
                      <div className="mb-3 overflow-hidden rounded-2xl border border-[#2a2f3a] bg-[#171a20]">
                        {menu.image ? (
                          <img
                            src={menu.image}
                            alt={menu.name}
                            className="h-36 w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-36 items-center justify-center text-xs text-[#c9a96a]">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{menu.name}</p>
                          <p className="text-xs text-[#c9a96a]">
                            {menu.category?.name || "Uncategorized"}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-[#f6f1e8]">
                          {formatMoney(menu.price)}
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-[#a8905d]">
                        {menu.description || "Freshly prepared for you."}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={() => handleAddToCart(menu)}
                          className="rounded-full bg-[#f6f1e8] text-[#171a20] px-4 py-2 text-xs font-semibold hover:bg-[#c9a96a]"
                        >
                          Add to cart
                        </button>
                        <button
                          onClick={() => setSelectedMenu(menu)}
                          className="rounded-full border border-[#2a2f3a] px-4 py-2 text-xs font-semibold text-[#a8905d] hover:border-[#f6f1e8]"
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
              <div className="rounded-3xl bg-[#171a20] border border-[#2a2f3a] p-6 shadow-sm">
                <h2 className="text-xl font-semibold">Your cart</h2>
                <p className="text-sm text-[#a8905d] mt-1">
                  Add items from a single shop, then place your order.
                </p>
                <div className="mt-4 space-y-3">
                  {cartItems.length === 0 && (
                    <p className="text-sm text-[#a8905d]">
                      Your cart is empty.
                    </p>
                  )}
                  {cartItems.map((item) => (
                    <div
                      key={item.cartKey}
                      className="rounded-2xl border border-[#2a2f3a] bg-[#171a20] px-4 py-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-xs text-[#c9a96a]">
                            {formatMoney(item.unitPrice)} each
                          </p>
                          {item.addOns?.length > 0 && (
                            <div className="mt-1 text-xs text-[#a8905d]">
                              Add-ons:{" "}
                              {item.addOns.map((addOn) => addOn.name).join(", ")}
                            </div>
                          )}
                          {item.note && (
                            <div className="mt-1 text-xs text-[#a8905d]">
                              Note: {item.note}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQtyChange(item.cartKey, -1)}
                            className="h-8 w-8 rounded-full border border-[#2a2f3a] text-sm font-semibold"
                          >
                            -
                          </button>
                          <span className="text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQtyChange(item.cartKey, 1)}
                            className="h-8 w-8 rounded-full border border-[#2a2f3a] text-sm font-semibold"
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
                  className="mt-4 text-xs font-semibold text-[#c9a96a] underline"
                >
                  Clear cart
                </button>
              </div>

              <div className="rounded-3xl bg-[#171a20] border border-[#2a2f3a] p-6 shadow-sm">
                <h2 className="text-xl font-semibold">Checkout</h2>
                <p className="text-sm text-[#a8905d] mt-1">
                  Provide a delivery address to place your order.
                </p>
                <form className="mt-4 space-y-4" onSubmit={handlePlaceOrder}>
                  <textarea
                    value={deliveryAddress}
                    onChange={(event) => setDeliveryAddress(event.target.value)}
                    placeholder="Delivery address"
                    rows={3}
                    className="w-full rounded-2xl border border-[#2a2f3a] bg-[#1d222c] px-4 py-3 text-sm text-[#f6f1e8] placeholder-[#a8905d] outline-none focus:border-[#c9a96a]"
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
                              ? "border-[#f6f1e8] bg-[#f6f1e8] text-[#171a20]"
                              : "border-[#2a2f3a] text-[#a8905d] hover:border-[#f6f1e8]"
                          }`}
                        >
                          {paymentLabel(method)}
                        </button>
                      ))}
                    </div>
                  </div>
                  {paymentMethod === "wallet" && (
                    <div className="text-xs text-[#c9a96a]">
                      Wallet balance: {formatMoney(walletBalance)} · Minimum
                      remaining balance: 100 MMK
                    </div>
                  )}
                  {paymentMethod !== "cash" && paymentMethod !== "wallet" && (
                    <input
                      value={paymentReference}
                      onChange={(event) => setPaymentReference(event.target.value)}
                      placeholder="Payment reference (optional)"
                      className="w-full rounded-2xl border border-[#2a2f3a] bg-[#1d222c] px-4 py-3 text-sm text-[#f6f1e8] placeholder-[#a8905d] outline-none focus:border-[#c9a96a]"
                    />
                  )}
                  <button
                    type="submit"
                    disabled={cartItems.length === 0}
                    className="w-full rounded-full bg-[#f6f1e8] text-[#171a20] px-4 py-3 text-sm font-semibold hover:bg-[#c9a96a] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Place order
                  </button>
                </form>
              </div>
            </div>

            <div className="rounded-3xl bg-[#171a20] border border-[#2a2f3a] p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Order history</h2>
                {loading.orders && (
                  <span className="text-xs text-[#a8905d]">Loading...</span>
                )}
              </div>
              <div className="mt-4 space-y-3">
                {!loading.orders && sortedOrders.length === 0 && (
                  <p className="text-sm text-[#a8905d]">
                    No orders placed yet.
                  </p>
                )}
                    {recentOrders.map((order) => (
                      <div
                        key={order._id}
                        className="rounded-2xl border border-[#2a2f3a] bg-[#171a20] px-4 py-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold">
                              {order.shopId?.name || "Shop"} ·{" "}
                              {formatMoney(order.totalAmount)}
                            </p>
                            <p className="text-xs text-[#c9a96a]">
                              {new Date(order.createdAt).toLocaleString()}
                            </p>
                            <p className="text-xs text-[#c9a96a]">
                              Payment:{" "}
                              {order.isPaid
                                ? "Paid"
                                : `Unpaid (${paymentLabel(order.paymentMethod)})`}
                            </p>
                          </div>
                          <span className="rounded-full border border-[#2a2f3a] px-3 py-1 text-xs font-semibold capitalize text-[#a8905d]">
                            {order.status}
                          </span>
                        </div>
                        {!order.isPaid && order.paymentMethod === "kpay" && (
                          <div className="mt-3">
                            <button
                              onClick={() => setPaymentModalOrder(order)}
                              className="rounded-full border border-[#f6f1e8] px-4 py-2 text-xs font-semibold text-[#f6f1e8] hover:bg-[#f6f1e8] hover:text-[#171a20]"
                            >
                              Pay with KPay
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
          </div>
        </div>
      </div>

      {topUpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-[#171a20] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold">Top up wallet</h3>
                <p className="text-sm text-[#a8905d] mt-1">
                  Use KPay to add balance to your wallet.
                </p>
              </div>
              <button
                onClick={() => setTopUpOpen(false)}
                className="rounded-full border border-[#2a2f3a] px-3 py-1 text-xs font-semibold text-[#a8905d]"
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
                className="w-full rounded-2xl border border-[#2a2f3a] bg-[#1d222c] px-4 py-3 text-sm text-[#f6f1e8] placeholder-[#a8905d] outline-none focus:border-[#c9a96a]"
              />
            </div>

            <div className="mt-5 flex items-center justify-center">
              <div className="grid grid-cols-6 gap-1 rounded-2xl border border-[#2a2f3a] bg-[#1d222c] p-4">
                {Array.from({ length: 36 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-4 w-4 ${
                      (idx * 5) % 9 < 4 ? "bg-[#f6f1e8]" : "bg-[#171a20]"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 text-xs text-[#c9a96a] text-center">
              Mock KPay top-up QR (demo only)
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-[#a8905d]">
                Current balance: {formatMoney(walletBalance)}
              </div>
              <button
                onClick={handleTopUp}
                disabled={topUpLoading}
                className="rounded-full bg-[#f6f1e8] text-[#171a20] px-5 py-2 text-sm font-semibold hover:bg-[#c9a96a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {topUpLoading ? "Processing..." : "Confirm top-up"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-[#171a20] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold">{selectedMenu.name}</h3>
                <p className="text-sm text-[#c9a96a]">
                  {selectedMenu.category?.name || "Uncategorized"}
                </p>
              </div>
              <button
                onClick={() => setSelectedMenu(null)}
                className="rounded-full border border-[#2a2f3a] px-3 py-1 text-xs font-semibold text-[#a8905d]"
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-[#2a2f3a] bg-[#171a20]">
                {selectedMenu.image ? (
                  <img
                    src={selectedMenu.image}
                    alt={selectedMenu.name}
                    className="h-56 w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-56 items-center justify-center text-xs text-[#c9a96a]">
                    No image
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <p className="text-sm text-[#a8905d]">
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
                          className="rounded-full border border-[#2a2f3a] px-3 py-1 text-xs text-[#a8905d]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                {Array.isArray(selectedMenu.allergens) &&
                  selectedMenu.allergens.length > 0 && (
                    <div className="text-xs text-[#e06c5f]">
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
                        className="flex items-center justify-between rounded-xl border border-[#2a2f3a] px-3 py-2 text-sm"
                      >
                        <span>
                          <input
                            type="checkbox"
                            className="mr-2 accent-[#f6f1e8]"
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
                        <span className="text-xs text-[#a8905d]">
                          +{formatMoney(addOn.price)}
                        </span>
                      </label>
                    ))
                  ) : (
                    <p className="text-xs text-[#a8905d]">
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
                  className="mt-2 w-full rounded-2xl border border-[#2a2f3a] bg-[#1d222c] px-4 py-3 text-sm text-[#f6f1e8] placeholder-[#a8905d] outline-none focus:border-[#c9a96a]"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-[#a8905d]">
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
                className="rounded-full bg-[#f6f1e8] text-[#171a20] px-5 py-2 text-sm font-semibold hover:bg-[#c9a96a]"
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>
      )}

      {paymentModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#171a20] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold">Pay with KPay</h3>
                <p className="text-sm text-[#a8905d] mt-1">
                  Scan the QR or confirm payment to complete your order.
                </p>
              </div>
              <button
                onClick={() => setPaymentModalOrder(null)}
                className="rounded-full border border-[#2a2f3a] px-3 py-1 text-xs font-semibold text-[#a8905d]"
              >
                Close
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-[#2a2f3a] bg-[#1d222c] p-4 text-sm text-[#a8905d]">
              Order Total:{" "}
              <span className="font-semibold text-[#f6f1e8]">
                {formatMoney(paymentModalOrder.totalAmount)}
              </span>
            </div>

            <div className="mt-5 flex items-center justify-center">
              <div className="grid grid-cols-6 gap-1 rounded-2xl border border-[#2a2f3a] bg-[#1d222c] p-4">
                {Array.from({ length: 36 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-4 w-4 ${
                      (idx * 7) % 11 < 5 ? "bg-[#f6f1e8]" : "bg-[#171a20]"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 text-xs text-[#c9a96a] text-center">
              Mock KPay QR (demo only)
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-[#a8905d]">
                Payment method: KPay
              </div>
              <button
                onClick={() => handleMockPayment(paymentModalOrder._id)}
                disabled={paymentLoading}
                className="rounded-full bg-[#f6f1e8] text-[#171a20] px-5 py-2 text-sm font-semibold hover:bg-[#c9a96a] disabled:cursor-not-allowed disabled:opacity-60"
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
