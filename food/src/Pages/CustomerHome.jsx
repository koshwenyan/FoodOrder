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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [cartShopId, setCartShopId] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
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

  useEffect(() => {
    fetchShops();
    fetchCategories();
    fetchOrders();
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
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleAddToCart = (menu) => {
    const menuShopId =
      typeof menu.shopId === "object" ? menu.shopId?._id : menu.shopId;
    if (cartShopId && cartShopId !== menuShopId) {
      showMessage("error", "Please clear the cart before switching shops.");
      return;
    }
    setCartShopId(menuShopId);
    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === menu._id);
      if (existing) {
        return prev.map((item) =>
          item._id === menu._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          _id: menu._id,
          name: menu.name,
          price: menu.price,
          quantity: 1,
        },
      ];
    });
  };

  const handleQtyChange = (menuId, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item._id === menuId
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

    try {
      await api.post("/order/create", {
        shopId: cartShopId,
        items: cartItems.map((item) => ({
          menuId: item._id,
          quantity: item.quantity,
        })),
        deliveryAddress: deliveryAddress.trim(),
      });
      showMessage("success", "Order placed successfully.");
      handleClearCart();
      setDeliveryAddress("");
      fetchOrders();
    } catch (err) {
      showMessage(
        "error",
        err?.response?.data?.message || "Failed to place order."
      );
    }
  };

  const sortedOrders = useMemo(() => {
    return [...orders].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [orders]);

  const latestOrder = sortedOrders[0];
  const latestStatusIndex = latestOrder
    ? STATUS_STEPS.indexOf(latestOrder.status)
    : -1;

  return (
    <div className="min-h-screen bg-[#f6f1eb] text-[#1f1a17] px-6 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-[#f9e9d7] via-[#f8f3ee] to-[#f2ddc7] p-6 sm:p-8 shadow-lg border border-[#ead8c7]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#8b6b4f]">
                Customer Portal
              </p>
              <h1 className="text-3xl sm:text-4xl font-semibold">
                Welcome{user?.name ? `, ${user.name}` : ""}
              </h1>
              <p className="text-sm text-[#6c5645] mt-2">
                Browse shops, add items to your cart, and place delivery orders
                in one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl bg-white/80 border border-[#ead8c7] px-4 py-3 min-w-[140px]">
                <p className="text-xs uppercase tracking-[0.2em] text-[#8b6b4f]">
                  Shops
                </p>
                <p className="text-2xl font-semibold">{shops.length}</p>
              </div>
              <div className="rounded-2xl bg-white/80 border border-[#ead8c7] px-4 py-3 min-w-[140px]">
                <p className="text-xs uppercase tracking-[0.2em] text-[#8b6b4f]">
                  Cart Items
                </p>
                <p className="text-2xl font-semibold">{cartItems.length}</p>
              </div>
              <div className="rounded-2xl bg-white/80 border border-[#ead8c7] px-4 py-3 min-w-[140px]">
                <p className="text-xs uppercase tracking-[0.2em] text-[#8b6b4f]">
                  Orders
                </p>
                <p className="text-2xl font-semibold">{orders.length}</p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-full bg-[#1f1a17] text-[#f8f3ee] px-5 py-2 text-sm font-semibold hover:bg-[#2b241f]"
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
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6">
            <div className="rounded-3xl bg-white/90 border border-[#ead8c7] p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Pick a shop</h2>
              <p className="text-sm text-[#6c5645] mt-1">
                Select a shop to see its menu items and start ordering.
              </p>
              <div className="mt-4 space-y-3">
                {loading.shops && (
                  <p className="text-sm text-[#6c5645]">Loading shops...</p>
                )}
                {!loading.shops && shops.length === 0 && (
                  <p className="text-sm text-[#6c5645]">
                    No shops available yet.
                  </p>
                )}
                {shops.map((shop) => (
                  <button
                    key={shop._id}
                    onClick={() => setSelectedShop(shop)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      selectedShop?._id === shop._id
                        ? "border-[#1f1a17] bg-[#1f1a17] text-[#f8f3ee]"
                        : "border-[#ead8c7] bg-white hover:border-[#1f1a17]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-xl border border-[#ead8c7] bg-[#f8f3ee]">
                        {shop.photo ? (
                          <img
                            src={shop.photo}
                            alt={shop.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-[#8b6b4f]">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{shop.name}</p>
                        <p
                          className={`text-xs ${
                            selectedShop?._id === shop._id
                              ? "text-[#f2ddc7]"
                              : "text-[#6c5645]"
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

            <div className="rounded-3xl bg-white/90 border border-[#ead8c7] p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Order tracking</h2>
              {latestOrder ? (
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-[#ead8c7] bg-[#fdf9f4] p-4">
                    <p className="text-sm text-[#6c5645]">
                      Latest order from{" "}
                      <span className="font-semibold text-[#1f1a17]">
                        {latestOrder?.shopId?.name || "Shop"}
                      </span>
                    </p>
                    <p className="text-lg font-semibold mt-1">
                      {formatMoney(latestOrder.totalAmount)}
                    </p>
                    <p className="text-xs text-[#8b6b4f] mt-1">
                      Status: {latestOrder.status}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {STATUS_STEPS.map((step, index) => (
                      <div
                        key={step}
                        className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${
                          index <= latestStatusIndex
                            ? "border-[#1f1a17] bg-[#1f1a17] text-[#f8f3ee]"
                            : "border-[#ead8c7] bg-white text-[#6c5645]"
                        }`}
                      >
                        <span className="capitalize">{step}</span>
                        {index <= latestStatusIndex ? "Done" : "Pending"}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-[#6c5645]">
                  No recent orders yet. Place your first order to start
                  tracking.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-3xl bg-white/90 border border-[#ead8c7] p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Menu</h2>
                  <p className="text-sm text-[#6c5645] mt-1">
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
                    className="rounded-full border border-[#ead8c7] bg-white px-4 py-2 text-sm outline-none focus:border-[#1f1a17]"
                  />
                  <select
                    value={selectedCategory}
                    onChange={(event) => setSelectedCategory(event.target.value)}
                    className="rounded-full border border-[#ead8c7] bg-white px-4 py-2 text-sm outline-none focus:border-[#1f1a17]"
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

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {loading.menus && (
                  <p className="text-sm text-[#6c5645]">Loading menu...</p>
                )}
                {!loading.menus && selectedShop && filteredMenus.length === 0 && (
                  <p className="text-sm text-[#6c5645]">
                    No menu items found for this shop.
                  </p>
                )}
                {!selectedShop && (
                  <p className="text-sm text-[#6c5645]">
                    Choose a shop to start browsing menu items.
                  </p>
                )}
                {filteredMenus.map((menu) => (
                  <div
                    key={menu._id}
                    className="rounded-2xl border border-[#ead8c7] bg-white p-4"
                  >
                    <div className="mb-3 overflow-hidden rounded-2xl border border-[#ead8c7] bg-[#f8f3ee]">
                      {menu.image ? (
                        <img
                          src={menu.image}
                          alt={menu.name}
                          className="h-36 w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-36 items-center justify-center text-xs text-[#8b6b4f]">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{menu.name}</p>
                        <p className="text-xs text-[#8b6b4f]">
                          {menu.category?.name || "Uncategorized"}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-[#1f1a17]">
                        {formatMoney(menu.price)}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-[#6c5645]">
                      {menu.description || "Freshly prepared for you."}
                    </p>
                    <button
                      onClick={() => handleAddToCart(menu)}
                      className="mt-4 rounded-full bg-[#1f1a17] text-[#f8f3ee] px-4 py-2 text-xs font-semibold hover:bg-[#2b241f]"
                    >
                      Add to cart
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-3xl bg-white/90 border border-[#ead8c7] p-6 shadow-sm">
                <h2 className="text-xl font-semibold">Your cart</h2>
                <p className="text-sm text-[#6c5645] mt-1">
                  Add items from a single shop, then place your order.
                </p>
                <div className="mt-4 space-y-3">
                  {cartItems.length === 0 && (
                    <p className="text-sm text-[#6c5645]">
                      Your cart is empty.
                    </p>
                  )}
                  {cartItems.map((item) => (
                    <div
                      key={item._id}
                      className="rounded-2xl border border-[#ead8c7] bg-white px-4 py-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-xs text-[#8b6b4f]">
                            {formatMoney(item.price)} each
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQtyChange(item._id, -1)}
                            className="h-8 w-8 rounded-full border border-[#ead8c7] text-sm font-semibold"
                          >
                            -
                          </button>
                          <span className="text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQtyChange(item._id, 1)}
                            className="h-8 w-8 rounded-full border border-[#ead8c7] text-sm font-semibold"
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
                  className="mt-4 text-xs font-semibold text-[#8b6b4f] underline"
                >
                  Clear cart
                </button>
              </div>

              <div className="rounded-3xl bg-white/90 border border-[#ead8c7] p-6 shadow-sm">
                <h2 className="text-xl font-semibold">Checkout</h2>
                <p className="text-sm text-[#6c5645] mt-1">
                  Provide a delivery address to place your order.
                </p>
                <form className="mt-4 space-y-4" onSubmit={handlePlaceOrder}>
                  <textarea
                    value={deliveryAddress}
                    onChange={(event) => setDeliveryAddress(event.target.value)}
                    placeholder="Delivery address"
                    rows={3}
                    className="w-full rounded-2xl border border-[#ead8c7] bg-white px-4 py-3 text-sm outline-none focus:border-[#1f1a17]"
                  />
                  <button
                    type="submit"
                    disabled={cartItems.length === 0}
                    className="w-full rounded-full bg-[#1f1a17] text-[#f8f3ee] px-4 py-3 text-sm font-semibold hover:bg-[#2b241f] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Place order
                  </button>
                </form>
              </div>
            </div>

            <div className="rounded-3xl bg-white/90 border border-[#ead8c7] p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Order history</h2>
                {loading.orders && (
                  <span className="text-xs text-[#6c5645]">Loading...</span>
                )}
              </div>
              <div className="mt-4 space-y-3">
                {!loading.orders && sortedOrders.length === 0 && (
                  <p className="text-sm text-[#6c5645]">
                    No orders placed yet.
                  </p>
                )}
                {sortedOrders.map((order) => (
                  <div
                    key={order._id}
                    className="rounded-2xl border border-[#ead8c7] bg-white px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">
                          {order.shopId?.name || "Shop"} ·{" "}
                          {formatMoney(order.totalAmount)}
                        </p>
                        <p className="text-xs text-[#8b6b4f]">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span className="rounded-full border border-[#ead8c7] px-3 py-1 text-xs font-semibold capitalize text-[#6c5645]">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
