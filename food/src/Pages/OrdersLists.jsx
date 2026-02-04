import React, { useState, useEffect } from "react";

export default function OrdersLists() {
  const [phoneOrders, setPhoneOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const shopId = user?.shopId;
  const API_PHONE = `http://localhost:3000/api/phoneCalledOrder/shop/${shopId}`;

  // ================= FETCH ORDERS =================
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const phoneRes = await fetch(API_PHONE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const phoneData = await phoneRes.json();
      setPhoneOrders(phoneData.data || []);
      console.log("Phone Orders Data:", phoneData.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div className="p-4">Loading orders...</div>;

  // ================= COLLAPSIBLE ITEMS CARD =================
  const OrderCard = ({ order }) => {
    const [showAllItems, setShowAllItems] = useState(false);
    const itemsToShow = showAllItems ? order.items : order.items.slice(0, 2);

    return (
      <div className="bg-white shadow-lg rounded-xl border border-gray-200 p-5 hover:shadow-2xl transition-shadow duration-300">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Customer: {order.customerName}
          </h3>
          <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
            Phone Order
          </span>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-gray-600">
          <p>
            <span className="font-medium">Phone:</span> {order.phone}
          </p>
          <p>
            <span className="font-medium">Address:</span> {order.address}
          </p>
          <p>
            <span className="font-medium">Delivery:</span>{" "}
            {order.deliveryCompany?.name || "N/A"}
          </p>
          <p>
            <span className="font-medium text-lg text-purple-700">Grand Total:</span>{" "}
            <span className="text-green-600 font-bold">{order.totalAmount?.toLocaleString()} Ks</span>
          </p>
        </div>

        {/* Items */}
        <div>
          <p className="font-medium text-gray-700 mb-2">Items:</p>
          <div className="divide-y divide-gray-200 border rounded">
            {itemsToShow.map((item) => (
              <div key={item._id} className="flex justify-between px-3 py-2">
                <span className="font-medium">{item.menu?.name || "Product"}</span>
                <div className="flex gap-4">
                  <span className="text-blue-600 font-semibold">
                    {item.price.toLocaleString()} Ks
                  </span>
                  <span className="text-orange-600 font-semibold">{item.quantity}</span>
                  <span className="text-green-600 font-bold">
                    {(item.price * item.quantity).toLocaleString()} Ks
                  </span>
                </div>
              </div>
            ))}
          </div>

          {order.items.length > 2 && (
            <button
              onClick={() => setShowAllItems(!showAllItems)}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              {showAllItems ? "Show Less" : `Show ${order.items.length - 2} More`}
            </button>
          )}
        </div>

        {/* Footer / Action Buttons (optional) */}
        {/* <div className="mt-4 flex justify-end space-x-2">
          <button className="px-4 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
            Mark as Delivered
          </button>
          <button className="px-4 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
            Cancel
          </button>
        </div> */}
      </div>
    );
  };

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Orders List</h1>

      {/* ================= PHONE CALLED ORDERS ================= */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Phone Called Orders
        </h2>

        {phoneOrders.length === 0 ? (
          <p className="text-gray-500">No phone orders yet.</p>
        ) : (
          <div className="space-y-4">
            {phoneOrders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
