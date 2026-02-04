import { useState } from "react";

const products = [
  { id: 1, name: "PRODUCT NAME 1", price: 120000, img: "/food1.jpg" },
  { id: 2, name: "PRODUCT NAME 2", price: 120000, img: "/food2.jpg" },
  { id: 3, name: "PRODUCT NAME 3", price: 220000, img: "/food3.jpg" },
  { id: 4, name: "PRODUCT NAME 4", price: 123000, img: "/food4.jpg" },
  { id: 5, name: "PRODUCT NAME 5", price: 320000, img: "/food5.jpg" },
  { id: 6, name: "PRODUCT NAME 6", price: 120000, img: "/food6.jpg" },
];

export default function OrderPage() {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart((prev) => {
      const exist = prev.find((i) => i.id === product.id);
      if (exist) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.id === id ? { ...i, qty: i.qty + delta } : i
        )
        .filter((i) => i.qty > 0)
    );
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div className="flex h-screen bg-slate-100">
      
      {/* PRODUCTS */}
      <div className="w-3/4 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Your Shopping Cart</h1>

        <div className="grid grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl shadow p-4 flex flex-col"
            >
              <img
                src={p.img}
                alt={p.name}
                className="rounded-lg h-40 object-cover mb-3"
              />
              <h3 className="font-semibold">{p.name}</h3>
              <p className="text-sm text-slate-600 mb-3">
                {p.price.toLocaleString()} Ks
              </p>
              <button
                onClick={() => addToCart(p)}
                className="mt-auto bg-slate-900 text-white py-2 rounded hover:bg-slate-800"
              >
                Add To Cart
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CART PANEL */}
      <div className="w-1/4 bg-[#3b3430] text-white flex flex-col">
        <div className="p-4 border-b border-white/20">
          <h2 className="text-xl font-semibold">Card</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.map((i) => (
            <div key={i.id} className="flex items-center gap-3">
              <img
                src={i.img}
                alt=""
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
                  onClick={() => updateQty(i.id, -1)}
                  className="px-2 bg-white/20 rounded"
                >
                  -
                </button>
                <span>{i.qty}</span>
                <button
                  onClick={() => updateQty(i.id, 1)}
                  className="px-2 bg-white/20 rounded"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* TOTAL */}
        <div className="p-4 border-t border-white/20">
          <div className="flex justify-between font-semibold mb-3">
            <span>Total</span>
            <span>{total.toLocaleString()} Ks</span>
          </div>
          <button className="w-full bg-yellow-400 text-black py-2 rounded font-bold">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
