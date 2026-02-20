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
    <div className="orders-theme min-h-screen bg-[#0f1115] text-[#f6f1e8]">
      <div className="px-6 py-6 sm:px-10">
        <div className="rounded-3xl bg-gradient-to-br from-[#1d222c] via-[#171a20] to-[#2a2f3a] p-6 sm:p-8 shadow-lg border border-[#2a2f3a]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#c9a96a]">
                Phone Orders
              </p>
              <h1 className="orders-title text-3xl sm:text-4xl font-semibold">
                Create Order
              </h1>
              <p className="text-sm text-[#a8905d] mt-2">
                Add items, capture customer info, and send to delivery.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="rounded-2xl bg-[#232833] border border-[#2a2f3a] px-4 py-3">
                <p className="text-xs text-[#c9a96a]">Items in Cart</p>
                <p className="text-xl font-semibold">{cart.length}</p>
              </div>
              <div className="rounded-2xl bg-[#232833] border border-[#2a2f3a] px-4 py-3">
                <p className="text-xs text-[#c9a96a]">Grand Total</p>
                <p className="text-xl font-semibold">
                  {grandTotal.toLocaleString()} Ks
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* ================= PRODUCTS ================= */}
          <div className="rounded-3xl bg-[#1d222c] border border-[#2a2f3a] shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="orders-title text-2xl font-semibold">Products</h2>
              <span className="text-sm text-[#a8905d]">
                {products.length} items
              </span>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p) => (
                <div
                  key={p._id}
                  className="rounded-3xl bg-[#171a20] border border-[#2a2f3a] shadow-sm p-4 flex flex-col"
                >
                  <div className="h-40 rounded-2xl bg-[#1d222c] border border-[#2a2f3a] overflow-hidden mb-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h3 className="orders-title text-lg font-semibold">
                    {p.name}
                  </h3>
                  <p className="text-sm text-[#a8905d] mb-3">
                    {p.price.toLocaleString()} Ks
                  </p>
                  <button
                    disabled={cart.some((i) => i._id === p._id)}
                    onClick={() => addToCart(p)}
                    className={`mt-auto rounded-full px-4 py-2 text-sm font-medium border transition ${
                      cart.some((i) => i._id === p._id)
                        ? "bg-[#e7d5c4] text-[#c9a96a] border-[#2a2f3a] cursor-not-allowed"
                        : "bg-[#f6f1e8] text-[#171a20] border-[#f6f1e8] hover:bg-[#c9a96a]"
                    }`}
                  >
                    {cart.some((i) => i._id === p._id) ? "Added" : "Add To Cart"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ================= CART ================= */}
          <div className="rounded-3xl bg-[#171a20] border border-[#2a2f3a] shadow-sm p-6 flex flex-col">
            <div className="flex items-center justify-between">
              <h2 className="orders-title text-2xl font-semibold">Cart</h2>
              <span className="text-xs uppercase tracking-[0.2em] text-[#c9a96a]">
                {cart.length} items
              </span>
            </div>

            <div className="mt-4 flex-1 overflow-y-auto space-y-4">
              {cart.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#d6c3b2] bg-[#232833] p-6 text-center text-sm text-[#a8905d]">
                  Cart is empty. Add products to create an order.
                </div>
              )}
              {cart.map((i) => (
                <div
                  key={i._id}
                  className="rounded-2xl border border-[#2a2f3a] bg-[#1d222c] p-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={i.image}
                      className="w-12 h-12 rounded-xl object-cover border border-[#2a2f3a]"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#f6f1e8]">
                        {i.name}
                      </p>
                      <p className="text-xs text-[#c9a96a]">
                        {i.price.toLocaleString()} Ks
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(i._id, -1)}
                        className="rounded-full border border-[#2a2f3a] bg-[#171a20] px-2 py-1 text-sm text-[#a8905d]"
                      >
                        -
                      </button>
                      <span className="text-sm font-medium">{i.qty}</span>
                      <button
                        onClick={() => updateQty(i._id, 1)}
                        className="rounded-full border border-[#2a2f3a] bg-[#171a20] px-2 py-1 text-sm text-[#a8905d]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#c9a96a]">
                  Customer Info
                </p>
                <div className="mt-2 space-y-2">
                  <input
                    type="text"
                    name="name"
                    value={customer.name}
                    onChange={handleCustomerChange}
                    placeholder="Name"
                    className="w-full rounded-2xl border border-[#2a2f3a] bg-[#171a20] px-4 py-3 text-sm text-[#f6f1e8] focus:outline-none focus:ring-2 focus:ring-[#f6f1e8]/20"
                  />
                  <input
                    type="text"
                    name="phone"
                    value={customer.phone}
                    onChange={handleCustomerChange}
                    placeholder="Phone"
                    className="w-full rounded-2xl border border-[#2a2f3a] bg-[#171a20] px-4 py-3 text-sm text-[#f6f1e8] focus:outline-none focus:ring-2 focus:ring-[#f6f1e8]/20"
                  />
                  <input
                    type="text"
                    name="address"
                    value={customer.address}
                    onChange={handleCustomerChange}
                    placeholder="Address"
                    className="w-full rounded-2xl border border-[#2a2f3a] bg-[#171a20] px-4 py-3 text-sm text-[#f6f1e8] focus:outline-none focus:ring-2 focus:ring-[#f6f1e8]/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-[#c9a96a]">
                  Delivery Company
                </label>
                <select
                  value={selectedDelivery?._id || ""}
                  onChange={(e) => {
                    const d = deliveryCompanies.find((x) => x._id === e.target.value);
                    setSelectedDelivery(d || null);
                  }}
                  className="mt-2 w-full rounded-2xl border border-[#2a2f3a] bg-[#171a20] px-4 py-3 text-sm text-[#f6f1e8] focus:outline-none focus:ring-2 focus:ring-[#f6f1e8]/20"
                >
                  <option value="">Select delivery</option>
                  {deliveryCompanies.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.serviceFee.toLocaleString()} Ks)
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl border border-[#2a2f3a] bg-[#1d222c] p-4 text-sm text-[#a8905d]">
                <div className="flex justify-between">
                  <span>Items Total</span>
                  <span>{itemsTotal.toLocaleString()} Ks</span>
                </div>
                <div className="mt-2 flex justify-between">
                  <span>Delivery Fee</span>
                  <span>
                    {selectedDelivery?.serviceFee?.toLocaleString() || 0} Ks
                  </span>
                </div>
                <div className="mt-3 flex justify-between font-semibold text-base text-[#f6f1e8] border-t border-[#2a2f3a] pt-2">
                  <span>Grand Total</span>
                  <span>{grandTotal.toLocaleString()} Ks</span>
                </div>
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
                className="w-full rounded-full bg-[#f6f1e8] text-[#171a20] py-3 text-sm font-semibold border border-[#f6f1e8] disabled:opacity-50"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
