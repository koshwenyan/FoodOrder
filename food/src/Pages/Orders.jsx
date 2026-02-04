import { useState, useEffect } from "react";

export default function OrderPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [deliveryCompanies, setDeliveryCompanies] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  
  // ================= CUSTOMER INFO =================
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const API_MENU = "http://localhost:3000/api/menu";
  const API_DELIVERY = "http://localhost:3000/api/company/";
  const API_ORDER = "http://localhost:3000/api/phoneCalledOrder/";
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
  };

  useEffect(() => {
    fetchProducts();
    fetchDeliveryCompanies();
  }, []);

  /* ================= ADD TO CART ================= */
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
  const handleSubmitOrder = async () => {
  if (!customer.name || !customer.phone || !customer.address) {
    alert("Please fill all customer info");
    return;
  }
  if (!selectedDelivery?._id) {
    alert("Please select a delivery company");
    return;
  }
  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    
    const orderData = {
      customerName: customer.name,
      phone: customer.phone,
      address: customer.address,
      deliveryCompany: selectedDelivery._id,
      totalAmount: itemsTotal + serviceFee, // must be a number
      items: cart.map((i) => ({
        menu: i._id, // your product reference
        quantity: i.qty,
        price: i.price, // price per item
      })),
    };

    const res = await fetch(`${API_ORDER}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to submit order");
    }

    const data = await res.json();
    console.log("Order submitted:", data);

    // Reset cart and customer info
    setCart([]);
    setCustomer({ name: "", phone: "", address: "" });
    setSelectedDelivery(null);

    alert("Order submitted successfully!");
  } catch (error) {
    console.error("Order submission error:", error);
    alert(`Error submitting order: ${error.message}`);
  }
};



  /* ================= TOTALS ================= */
  const itemsTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const serviceFee = selectedDelivery?.serviceFee || 0;
  const grandTotal = itemsTotal + serviceFee;

  /* ================= HANDLE CUSTOMER CHANGE ================= */
  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };


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
                className={`mt-auto py-2 rounded text-white ${
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

        {/* CART HEADER */}
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

        {/* CUSTOMER INFO */}
        <div className="p-4 border-t border-white/20 space-y-2">
          <h3 className="text-sm font-semibold text-slate-200 mb-2">
            Customer Info
          </h3>
          <input
            type="text"
            name="name"
            value={customer.name}
            onChange={handleCustomerChange}
            placeholder="Name"
            className="w-full px-2 py-1 rounded text-white border border-white"
          />
          <input
            type="text"
            name="phone"
            value={customer.phone}
            onChange={handleCustomerChange}
            placeholder="Phone"
            className="w-full px-2 py-1 rounded text-white border border-white"
          />
          <input
            type="text"
            name="address"
            value={customer.address}
            onChange={handleCustomerChange}
            placeholder="Address"
            className="w-full px-2 py-1 rounded text-white border border-white"
          />
        </div>

        {/* DELIVERY */}
        <div className="p-4 border-t border-white/20">
          <label className="text-sm mb-1 block text-slate-300">
            Delivery Company
          </label>
          <select
            value={selectedDelivery?._id || ""}
            onChange={(e) => {
              const d = deliveryCompanies.find((x) => x._id === e.target.value);
              setSelectedDelivery(d || null);
            }}
            className="w-full bg-white text-black rounded px-2 py-1"
          >
            <option value="">Select delivery</option>
            {deliveryCompanies.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} ({d.serviceFee.toLocaleString()} Ks)
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
            <span>{selectedDelivery?.serviceFee?.toLocaleString() || 0} Ks</span>
          </div>
          <div className="flex justify-between font-semibold text-lg border-t border-white/20 pt-2">
            <span>Grand Total</span>
            <span>{grandTotal.toLocaleString()} Ks</span>
          </div>

          <button
            disabled={
              cart.length === 0 ||
              !selectedDelivery ||
              !customer.name ||
              !customer.phone ||
              !customer.address
            }
            onClick={handleSubmitOrder}
            className="w-full bg-yellow-400 text-black py-2 rounded font-bold disabled:opacity-50"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
