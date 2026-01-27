import { useState, useEffect } from "react";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

export default function Shops() {
  const [shops, setShops] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    OpenTime: "",
    CloseTime: "",
    isActive: true,
    category: "",
  });
  const [modalShop, setModalShop] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(5);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const API_BASE = "http://localhost:3000/api/shop";

  // Fetch shops
  const fetchShops = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch shops");
      const data = await res.json();
      setShops(data.shops || data);
    } catch (err) {
      console.error("Fetch shops error:", err.message);
      setShops([]);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      address: "",
      OpenTime: "",
      CloseTime: "",
      isActive: true,
      category: "",
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const payload = { ...form };

      let res;
      if (isEditing) {
        res = await fetch(`${API_BASE}/update/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_BASE}/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Request failed");
      }

      await res.json();
      fetchShops();
      resetForm();
    } catch (err) {
      console.error("Submit error:", err.message);
    }
  };

  const handleEdit = (shop) => {
    setForm({
      name: shop.name,
      description: shop.description,
      address: shop.address,
      OpenTime: shop.OpenTime,
      CloseTime: shop.CloseTime,
      isActive: shop.isActive,
      category: shop.category[0] || "",
    });
    setIsEditing(true);
    setEditingId(shop._id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this shop?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setShops(shops.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Delete error:", err.message);
    }
  };

  const handleView = (shop) => setModalShop(shop);

  // Pagination
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentShops = shops.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(shops.length / perPage);

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100">
      <h1 className="text-2xl font-bold mb-6">Shop Management</h1>

      {/* Form */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {isEditing ? "Update Shop" : "Create Shop"}
        </h2>
        <form className="grid md:grid-cols-3 gap-4" onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Shop Name"
            value={form.name}
            onChange={handleChange}
            required
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2"
          />
          <input
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2"
          />
          <input
            name="OpenTime"
            placeholder="Open Time"
            value={form.OpenTime}
            onChange={handleChange}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2"
          />
          <input
            name="CloseTime"
            placeholder="Close Time"
            value={form.CloseTime}
            onChange={handleChange}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2"
          />
          <input
            name="category"
            placeholder="Category ID"
            value={form.category}
            onChange={handleChange}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2"
          />

          <div className="flex items-center gap-2 md:col-span-3">
            <button
              type="submit"
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-semibold rounded-lg px-4 py-2"
            >
              <PlusIcon className="w-4 h-4" />
              {isEditing ? "Update Shop" : "Create Shop"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-lg px-4 py-2"
            >
              <XMarkIcon className="w-4 h-4" /> Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-slate-200">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Description</th>
              <th className="p-4 text-left">Address</th>
              <th className="p-4 text-left">Open - Close</th>
              <th className="p-4 text-left">Active</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentShops.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-6 text-center text-slate-400">
                  No shops found
                </td>
              </tr>
            ) : (
              currentShops.map((shop) => (
                <tr
                  key={shop._id}
                  className="border-t border-slate-800 hover:bg-slate-800/50"
                >
                  <td className="p-4">{shop.name}</td>
                  <td className="p-4">{shop.description}</td>
                  <td className="p-4">{shop.address}</td>
                  <td className="p-4">{shop.OpenTime} - {shop.CloseTime}</td>
                  <td className="p-4">{shop.isActive ? "Yes" : "No"}</td>
                  <td className="p-4">{shop.category.join(", ")}</td>
                  <td className="p-4 flex justify-end gap-2">
                    <button
                      onClick={() => handleView(shop)}
                      className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600"
                    >
                      <EyeIcon className="w-4 h-4 text-slate-200" />
                    </button>
                    <button
                      onClick={() => handleEdit(shop)}
                      className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600"
                    >
                      <PencilIcon className="w-4 h-4 text-slate-200" />
                    </button>
                    <button
                      onClick={() => handleDelete(shop._id)}
                      className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40"
                    >
                      <TrashIcon className="w-4 h-4 text-red-400" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 p-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600"
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      {modalShop && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-950 p-6 rounded-xl w-96">
            <h2 className="text-xl font-bold mb-4">Shop Details</h2>
            <p><strong>Name:</strong> {modalShop.name}</p>
            <p><strong>Description:</strong> {modalShop.description}</p>
            <p><strong>Address:</strong> {modalShop.address}</p>
            <p><strong>Open Time:</strong> {modalShop.OpenTime}</p>
            <p><strong>Close Time:</strong> {modalShop.CloseTime}</p>
            <p><strong>Active:</strong> {modalShop.isActive ? "Yes" : "No"}</p>
            <p><strong>Category:</strong> {modalShop.category.join(", ")}</p>
            <button
              onClick={() => setModalShop(null)}
              className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
