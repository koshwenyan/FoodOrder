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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState(null);

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
    const token = localStorage.getItem("token");
    await fetch(`${API_SHOP}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setShops(shops.filter((s) => s._id !== id));
    setConfirmDelete(null);
  };

  /* ================= UI ================= */
  const term = search.trim().toLowerCase();
  const filteredShops = shops.filter((shop) => {
    if (statusFilter === "active" && !shop.isActive) return false;
    if (statusFilter === "inactive" && shop.isActive) return false;
    if (!term) return true;
    return (
      shop.name?.toLowerCase().includes(term) ||
      shop.address?.toLowerCase().includes(term) ||
      shop.category?.[0]?.name?.toLowerCase().includes(term)
    );
  });
  const totalShops = shops.length;
  const activeShops = shops.filter((s) => s.isActive).length;
  const inactiveShops = totalShops - activeShops;

  return (
    <div className="min-h-screen bg-[#f6f1eb] text-[#1f1a17]">
      <div className="px-6 py-6 sm:px-10 space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-[#f9e9d7] via-[#f8f3ee] to-[#f2ddc7] p-6 sm:p-8 shadow-lg border border-[#ead8c7]">
          <p className="text-sm uppercase tracking-[0.2em] text-[#8b6b4f]">
            Admin Console
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold">
            Shop Management
          </h1>
          <p className="text-sm text-[#6c5645] mt-2">
            Create, update, and manage restaurant profiles.
          </p>
        </div>

        {/* FORM */}
        <div className="rounded-3xl border border-[#ead8c7] bg-white/90 shadow-sm p-6">
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
              className="bg-[#fbf7f2] border border-[#ead8c7] rounded-2xl px-4 py-3 text-sm text-[#1f1a17] placeholder:text-[#8b6b4f] focus:outline-none focus:ring-2 focus:ring-[#1f1a17]/15"
            />

            <input
              name="photo"
              value={form.photo}
              onChange={handleChange}
              placeholder="Photo URL"
              className="bg-[#fbf7f2] border border-[#ead8c7] rounded-2xl px-4 py-3 text-sm text-[#1f1a17] placeholder:text-[#8b6b4f] focus:outline-none focus:ring-2 focus:ring-[#1f1a17]/15"
            />

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="bg-[#fbf7f2] border border-[#ead8c7] rounded-2xl px-4 py-3 text-sm text-[#1f1a17] focus:outline-none focus:ring-2 focus:ring-[#1f1a17]/15"
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
              className="bg-[#fbf7f2] border border-[#ead8c7] rounded-2xl px-4 py-3 text-sm text-[#1f1a17] placeholder:text-[#8b6b4f] focus:outline-none focus:ring-2 focus:ring-[#1f1a17]/15"
            />

            <input
              type="time"
              name="OpenTime"
              value={form.OpenTime}
              onChange={handleChange}
              className="bg-[#fbf7f2] border border-[#ead8c7] rounded-2xl px-4 py-3 text-sm text-[#1f1a17] focus:outline-none focus:ring-2 focus:ring-[#1f1a17]/15"
            />

            <input
              type="time"
              name="CloseTime"
              value={form.CloseTime}
              onChange={handleChange}
              className="bg-[#fbf7f2] border border-[#ead8c7] rounded-2xl px-4 py-3 text-sm text-[#1f1a17] focus:outline-none focus:ring-2 focus:ring-[#1f1a17]/15"
            />

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              className="bg-[#fbf7f2] border border-[#ead8c7] rounded-2xl px-4 py-3 text-sm text-[#1f1a17] placeholder:text-[#8b6b4f] focus:outline-none focus:ring-2 focus:ring-[#1f1a17]/15 md:col-span-2"
            />

            <div className="flex gap-3 md:col-span-2">
              <button className="rounded-full bg-[#1f1a17] text-[#f8f3ee] px-5 py-3 text-sm font-semibold border border-[#1f1a17] hover:bg-[#2b241f] flex items-center gap-2">
                <PlusIcon className="w-4 h-4" />
                {isEditing ? "Update Shop" : "Create Shop"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-full bg-white border border-[#e7d5c4] px-5 py-3 text-sm font-semibold text-[#6c5645] hover:bg-[#fbf7f2] flex items-center gap-2"
              >
                <XMarkIcon className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white/80 border border-[#e7d5c4] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#8b6b4f]">
              Total Shops
            </p>
            <p className="text-2xl font-semibold mt-2">{totalShops}</p>
          </div>
          <div className="rounded-2xl bg-white/80 border border-[#e7d5c4] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#8b6b4f]">
              Active
            </p>
            <p className="text-2xl font-semibold mt-2">{activeShops}</p>
          </div>
          <div className="rounded-2xl bg-white/80 border border-[#e7d5c4] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#8b6b4f]">
              Inactive
            </p>
            <p className="text-2xl font-semibold mt-2">{inactiveShops}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 rounded-full bg-white/80 border border-[#e7d5c4] px-4 py-2">
            <span className="text-sm text-[#8b6b4f]">Search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, address, category"
              className="bg-transparent text-sm outline-none placeholder:text-[#b5a397] w-60"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-full border border-[#e7d5c4] bg-white/80 px-4 py-2 text-sm text-[#6c5645] focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* SHOP CARDS */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map((shop) => (
            <div
              key={shop._id}
              className="rounded-3xl border border-[#ead8c7] bg-white/90 shadow-sm hover:shadow-md transition p-4"
            >
              {shop.photo && (
                <img
                  src={shop.photo}
                  alt={shop.name}
                  className="w-full h-44 object-cover rounded-2xl mb-3 border border-[#ead8c7]"
                />
              )}

              <h3 className="text-lg font-semibold text-[#1f1a17]">{shop.name}</h3>

              <p className="text-sm text-[#6c5645] mt-1 line-clamp-2">
                {shop.description}
              </p>

              <div className="flex justify-between items-center mt-3 text-xs text-[#8b6b4f]">
                <span>
                  {shop.OpenTime} – {shop.CloseTime}
                </span>
                <span
                  className={`px-2 py-1 rounded-full font-medium ${
                    shop.isActive
                      ? "bg-[#e7eddc] text-[#5b7a40]"
                      : "bg-[#f3d7cf] text-[#a4553a]"
                  }`}
                >
                  {shop.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => handleEdit(shop)}
                  className="p-2 bg-[#f9f4ef] hover:bg-[#f1e6db] rounded"
                >
                  <PencilIcon className="w-4 h-4 text-[#6c5645]" />
                </button>

                <button
                  onClick={() => setConfirmDelete(shop)}
                  className="p-2 bg-[#f3d7cf] hover:bg-[#e8c4b9] rounded"
                >
                  <TrashIcon className="w-4 h-4 text-[#a4553a]" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredShops.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#d6c3b2] bg-white/70 p-10 text-center text-[#6c5645]">
            No shops match your search.
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl border border-[#ead8c7] bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[#1f1a17]">
              Delete shop?
            </h3>
            <p className="mt-2 text-sm text-[#6c5645]">
              This will permanently remove{" "}
              <span className="font-semibold">{confirmDelete.name}</span>.
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-full bg-white border border-[#e7d5c4] px-4 py-2 text-sm font-semibold text-[#6c5645] hover:bg-[#fbf7f2]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete._id)}
                className="rounded-full bg-[#a4553a] text-white px-4 py-2 text-sm font-semibold hover:bg-[#8f4a34]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
