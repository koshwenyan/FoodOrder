import { useEffect, useState } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function Shops() {
  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    photo: "",
    category: "",
    description: "",
    address: "",
    OpenTime: "",
    CloseTime: "",
    isActive: true,
  });

  const API_SHOP = "http://localhost:3000/api/shop";
  const API_CATEGORY = "http://localhost:3000/api/category/all";

  /* ================= FETCH ================= */
  const fetchShops = async () => {
    const res = await fetch(API_SHOP);
    const data = await res.json();
    setShops(data.data || []);
  };

  const fetchCategories = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(API_CATEGORY, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setCategories(data.data || []);
  };

  useEffect(() => {
    fetchShops();
    fetchCategories();
  }, []);

  /* ================= FORM ================= */
  const resetForm = () => {
    setForm({
      name: "",
      photo: "",
      category: "",
      description: "",
      address: "",
      OpenTime: "",
      CloseTime: "",
      isActive: true,
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const url = isEditing
      ? `${API_SHOP}/${editingId}`
      : `${API_SHOP}`;

    await fetch(url, {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...form,
        category: [form.category],
      }),
    });

    fetchShops();
    resetForm();
  };

  const handleEdit = (shop) => {
    setForm({
      name: shop.name,
      photo: shop.photo || "",
      category: shop.category?.[0]?._id || "",
      description: shop.description,
      address: shop.address,
      OpenTime: shop.OpenTime,
      CloseTime: shop.CloseTime,
      isActive: shop.isActive,
    });
    setIsEditing(true);
    setEditingId(shop._id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this shop?")) return;
    const token = localStorage.getItem("token");
    await fetch(`${API_SHOP}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setShops(shops.filter((s) => s._id !== id));
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-[#ECEFF1] p-8 space-y-6 text-[#111827]">
      <h1 className="text-3xl font-bold">Shop Management</h1>

      {/* FORM */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">
          {isEditing ? "Update Shop" : "Create Shop"}
        </h2>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Shop Name"
            required
            className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2"
          />

          <input
            name="photo"
            value={form.photo}
            onChange={handleChange}
            placeholder="Photo URL"
            className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2"
          />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address"
            className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2"
          />

          <input
            type="time"
            name="OpenTime"
            value={form.OpenTime}
            onChange={handleChange}
            className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2"
          />

          <input
            type="time"
            name="CloseTime"
            value={form.CloseTime}
            onChange={handleChange}
            className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2"
          />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2 md:col-span-2"
          />

          <div className="flex gap-3 md:col-span-2">
            <button className="bg-[#1F2933] hover:bg-black text-white rounded-lg px-5 py-2 flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              {isEditing ? "Update Shop" : "Create Shop"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-200 hover:bg-gray-300 rounded-lg px-5 py-2 flex items-center gap-2"
            >
              <XMarkIcon className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* SHOP CARDS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {shops.map((shop) => (
          <div
            key={shop._id}
            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-4"
          >
            {shop.photo && (
              <img
                src={shop.photo}
                alt={shop.name}
                className="w-full h-44 object-cover rounded-lg border mb-3"
              />
            )}

            <h3 className="text-lg font-semibold">{shop.name}</h3>

            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {shop.description}
            </p>

            <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
              <span>
                {shop.OpenTime} – {shop.CloseTime}
              </span>
              <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                Active
              </span>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => handleEdit(shop)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded"
              >
                <PencilIcon className="w-4 h-4 text-blue-600" />
              </button>

              <button
                onClick={() => handleDelete(shop._id)}
                className="p-2 bg-red-100 hover:bg-red-200 rounded"
              >
                <TrashIcon className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
