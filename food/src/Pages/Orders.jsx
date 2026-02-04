import { useState, useEffect } from "react";

export default function OrderPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [deliveryCompanies, setDeliveryCompanies] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  const API_MENU = "http://localhost:3000/api/menu";
  const API_DELIVERY = "http://localhost:3000/api/company/";

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_MENU}/my-shop`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setProducts(data.data || []);
  };

  /* ================= FETCH DELIVERY ================= */
  const fetchDeliveryCompanies = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(API_DELIVERY, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setDeliveryCompanies(data.data || []);
    console.log("Delivery data:", data);
  };

  useEffect(() => {
    fetchProducts();
    fetchDeliveryCompanies();
  }, []);

  /* ================= ADD TO CART (ONE LINE PER PRODUCT) ================= */
  const addToCart = (product) => {
    setCart((prev) => {
      if (prev.some((i) => i._id === product._id)) return prev;
      return [...prev, { ...product, qty: 1 }];
    });
  };

  /* ================= UPDATE QTY ================= */
  const updateQty = (_id, delta) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i._id === _id ? { ...i, qty: i.qty + delta } : i
        )
        .filter((i) => i.qty > 0)
    );
  };

  /* ================= TOTALS ================= */
  const itemsTotal = cart.reduce(
    (sum, i) => sum + i.price * i.qty,
    0
  );

  const deliveryFee = selectedDelivery?.fee || 0;
  const grandTotal = itemsTotal + deliveryFee;

  return (
    <div className="flex h-screen bg-slate-100">

      {/* ================= PRODUCTS ================= */}
      <div className="w-3/4 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Products</h1>

        <div className="grid grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded-xl shadow p-4 flex flex-col"
            >
              <img
                src={p.image}
                alt={p.name}
                className="rounded-lg h-40 object-cover mb-3"
              />

              <h3 className="font-semibold">{p.name}</h3>
              <p className="text-sm text-slate-600 mb-3">
                {p.price.toLocaleString()} Ks
              </p>

              <button
                disabled={cart.some((i) => i._id === p._id)}
                onClick={() => addToCart(p)}
                className={`mt-auto py-2 rounded text-white
                  ${
                    cart.some((i) => i._id === p._id)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-slate-900 hover:bg-slate-800"
                  }`}
              >
                {cart.some((i) => i._id === p._id) ? "Added" : "Add To Cart"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ================= CART ================= */}
      <div className="w-1/4 bg-[#3b3430] text-white flex flex-col">

        <div className="p-4 border-b border-white/20">
          <h2 className="text-xl font-semibold">Cart</h2>
        </div>

        {/* CART ITEMS */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.map((i) => (
            <div key={i._id} className="flex items-center gap-3">
              <img
                src={i.image}
                className="w-12 h-12 rounded-full object-cover"
              />

              <div className="flex-1">
                <p className="text-sm font-medium">{i.name}</p>
                <p className="text-xs text-slate-300">
                  {i.price.toLocaleString()} Ks
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQty(i._id, -1)}
                  className="px-2 bg-white/20 rounded"
                >
                  -
                </button>
                <span>{i.qty}</span>
                <button
                  onClick={() => updateQty(i._id, 1)}
                  className="px-2 bg-white/20 rounded"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* DELIVERY */}
        <div className="p-4 border-t border-white/20">
          <label className="text-sm mb-1 block text-slate-300">
            Delivery Company
          </label>
          <select
            value={selectedDelivery?._id || ""}
            onChange={(e) => {
              const d = deliveryCompanies.find(
                (x) => x._id === e.target.value
              );
              setSelectedDelivery(d || null);
            }}
            className="w-full bg-white text-black rounded px-2 py-1"
          >
            <option value="">Select delivery</option>
            {deliveryCompanies.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} ({d.fee.toLocaleString()} Ks)
              </option>
            ))}
          </select>
        </div>

        {/* TOTAL */}
        <div className="p-4 border-t border-white/20 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Items Total</span>
            <span>{itemsTotal.toLocaleString()} Ks</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Delivery Fee</span>
            <span>{deliveryFee.toLocaleString()} Ks</span>
          </div>

          <div className="flex justify-between font-semibold text-lg border-t border-white/20 pt-2">
            <span>Grand Total</span>
            <span>{grandTotal.toLocaleString()} Ks</span>
          </div>

          <button
            disabled={cart.length === 0 || !selectedDelivery}
            className="w-full bg-yellow-400 text-black py-2 rounded font-bold disabled:opacity-50"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
