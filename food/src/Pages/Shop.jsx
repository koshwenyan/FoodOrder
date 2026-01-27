import { useState, useEffect } from "react";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function Shops() {
  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    OpenTime: "",
    CloseTime: "",
    isActive: true,
    category: "", // store category ID
  });
  const [modalShop, setModalShop] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(5);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const API_BASE = "http://localhost:3000/api/shop/";
  const API_CATEGORY = "http://localhost:3000/api/category/";

  // Fetch shops
  const fetchShops = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch shops");
      const data = await res.json();
      setShops(data.data || []);
    } catch (err) {
      console.error(err);
      setShops([]);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_CATEGORY}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data.data || []);
    } catch (err) {
      console.error(err);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchShops();
    fetchCategories();
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

      if (!res.ok) throw new Error("Request failed");

      await res.json();
      fetchShops();
      resetForm();
    } catch (err) {
      console.error(err.message);
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
      category: shop.category?._id || "",
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
      console.error(err.message);
    }
  };

  const handleView = (shop) => setModalShop(shop);

  // Generate 12-hour options for OpenTime and CloseTime
  const timeOptions = [];
  for (let h = 1; h <= 12; h++) {
    ["AM", "PM"].forEach((period) => {
      timeOptions.push(`${h}:00 ${period}`);
      timeOptions.push(`${h}:30 ${period}`);
    });
  }

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
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2"
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

          {/* OpenTime */}
          <select
            name="OpenTime"
            value={form.OpenTime}
            onChange={handleChange}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2"
          >
            <option value="">Select Open Time</option>
            {timeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* CloseTime */}
          <select
            name="CloseTime"
            value={form.CloseTime}
            onChange={handleChange}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2"
          >
            <option value="">Select Close Time</option>
            {timeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Category */}
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

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
                  <td className="p-4">
                    {shop.OpenTime} - {shop.CloseTime}
                  </td>
                  <td
                    className={`p-4 ${
                      shop.isActive ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {shop.isActive ? "Active" : "Inactive"}
                  </td>
                  <td className="p-4">{shop.category?.name || "-"}</td>
                  <td className="p-4 flex justify-end gap-2">
                    <button
                      onClick={() => handleView(shop)}
                      className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600"
                    >
                      <EyeIcon className="w-4 h-4 text-green-400" />
                    </button>
                    <button
                      onClick={() => handleEdit(shop)}
                      className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600"
                    >
                      <PencilIcon className="w-4 h-4 text-blue-400" />
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
      </div>

      {/* Modal */}
      {modalShop && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-950 p-6 rounded-3xl w-96 shadow-2xl transform scale-95 animate-scaleUp">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-emerald-400">
                Shop Details
              </h2>
              <button
                onClick={() => setModalShop(null)}
                className="p-1 rounded-full hover:bg-slate-700 transition"
              >
                <XMarkIcon className="w-5 h-5 text-slate-200" />
              </button>
            </div>

            <div className="space-y-2 text-slate-200">
              <p>
                <span className="font-semibold text-emerald-400">Name:</span>{" "}
                {modalShop.name}
              </p>
              <p>
                <span className="font-semibold text-emerald-400">
                  Description:
                </span>{" "}
                {modalShop.description}
              </p>
              <p>
                <span className="font-semibold text-emerald-400">Address:</span>{" "}
                {modalShop.address}
              </p>
              <p>
                <span className="font-semibold text-emerald-400">Open Time:</span>{" "}
                {modalShop.OpenTime}
              </p>
              <p>
                <span className="font-semibold text-emerald-400">Close Time:</span>{" "}
                {modalShop.CloseTime}
              </p>
              <p>
                <span className="font-semibold text-emerald-400">Active:</span>{" "}
                {modalShop.isActive ? "Active" : "Inactive"}
              </p>
              <p>
                <span className="font-semibold text-emerald-400">Category:</span>{" "}
                {modalShop.category?.name || "-"}
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setModalShop(null)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
