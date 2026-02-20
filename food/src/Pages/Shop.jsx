import { useEffect, useState } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  BuildingStorefrontIcon,
  CheckBadgeIcon,
  NoSymbolIcon,
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
    <div className="min-h-screen bg-[#0f1115] text-[#f6f1e8]">
      <div className="px-6 py-6 sm:px-10 space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-[#1d222c] via-[#171a20] to-[#2a2f3a] p-6 sm:p-8 shadow-lg border border-[#2a2f3a]">
          <p className="text-sm uppercase tracking-[0.2em] text-[#c9a96a]">
            Admin Console
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold">
            Shop Management
          </h1>
          <p className="text-sm text-[#a8905d] mt-2">
            Create, update, and manage restaurant profiles.
          </p>
        </div>

         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`text-left rounded-2xl bg-[#1d222c] border px-4 py-4 transition ${
              statusFilter === "all"
                ? "border-[#f6f1e8] ring-1 ring-[#f6f1e8]/30"
                : "border-[#2a2f3a]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#c9a96a]">
                  Total Shops
                </p>
                <p className="text-2xl font-semibold mt-2">{totalShops}</p>
              </div>
              <div className="p-3 rounded-full bg-[#1d222c] border border-[#2a2f3a]">
                <BuildingStorefrontIcon className="w-6 h-6 text-[#c9a96a]" />
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`text-left rounded-2xl bg-[#1d222c] border px-4 py-4 transition ${
              statusFilter === "active"
                ? "border-[#f6f1e8] ring-1 ring-[#f6f1e8]/30"
                : "border-[#2a2f3a]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#c9a96a]">
                  Active
                </p>
                <p className="text-2xl font-semibold mt-2">{activeShops}</p>
              </div>
              <div className="p-3 rounded-full bg-[#e7eddc] border border-[#c9d8b7]">
                <CheckBadgeIcon className="w-6 h-6 text-[#5b7a40]" />
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("inactive")}
            className={`text-left rounded-2xl bg-[#1d222c] border px-4 py-4 transition ${
              statusFilter === "inactive"
                ? "border-[#f6f1e8] ring-1 ring-[#f6f1e8]/30"
                : "border-[#2a2f3a]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#c9a96a]">
                  Inactive
                </p>
                <p className="text-2xl font-semibold mt-2">{inactiveShops}</p>
              </div>
              <div className="p-3 rounded-full bg-[#f3d7cf] border border-[#e8c4b9]">
                <NoSymbolIcon className="w-6 h-6 text-[#a4553a]" />
              </div>
            </div>
          </button>
        </div>

        {/* FORM */}
        <div className="rounded-3xl border border-[#2a2f3a] bg-[#171a20] shadow-sm p-6">
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
              className="bg-[#1d222c] border border-[#2a2f3a] rounded-2xl px-4 py-3 text-sm text-[#f6f1e8] placeholder:text-[#c9a96a] focus:outline-none focus:ring-2 focus:ring-[#f6f1e8]/15"
            />

            <input
              name="photo"
              value={form.photo}
              onChange={handleChange}
              placeholder="Photo URL"
              className="bg-[#1d222c] border border-[#2a2f3a] rounded-2xl px-4 py-3 text-sm text-[#f6f1e8] placeholder:text-[#c9a96a] focus:outline-none focus:ring-2 focus:ring-[#f6f1e8]/15"
            />

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="bg-[#1d222c] border border-[#2a2f3a] rounded-2xl px-4 py-3 text-sm text-[#f6f1e8] focus:outline-none focus:ring-2 focus:ring-[#f6f1e8]/15"
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
              className="bg-[#1d222c] border border-[#2a2f3a] rounded-2xl px-4 py-3 text-sm text-[#f6f1e8] placeholder:text-[#c9a96a] focus:outline-none focus:ring-2 focus:ring-[#f6f1e8]/15"
            />

            <input
              type="time"
              name="OpenTime"
              value={form.OpenTime}
              onChange={handleChange}
              className="bg-[#1d222c] border border-[#2a2f3a] rounded-2xl px-4 py-3 text-sm text-[#f6f1e8] focus:outline-none focus:ring-2 focus:ring-[#f6f1e8]/15"
            />

            <input
              type="time"
              name="CloseTime"
              value={form.CloseTime}
              onChange={handleChange}
              className="bg-[#1d222c] border border-[#2a2f3a] rounded-2xl px-4 py-3 text-sm text-[#f6f1e8] focus:outline-none focus:ring-2 focus:ring-[#f6f1e8]/15"
            />

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              className="bg-[#1d222c] border border-[#2a2f3a] rounded-2xl px-4 py-3 text-sm text-[#f6f1e8] placeholder:text-[#c9a96a] focus:outline-none focus:ring-2 focus:ring-[#f6f1e8]/15 md:col-span-2"
            />

            <div className="flex gap-3 md:col-span-2">
              <button className="rounded-full bg-[#f6f1e8] text-[#171a20] px-5 py-3 text-sm font-semibold border border-[#f6f1e8] hover:bg-[#c9a96a] flex items-center gap-2">
                <PlusIcon className="w-4 h-4" />
                {isEditing ? "Update Shop" : "Create Shop"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-full bg-[#171a20] border border-[#2a2f3a] px-5 py-3 text-sm font-semibold text-[#a8905d] hover:bg-[#232833] flex items-center gap-2"
              >
                <XMarkIcon className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 rounded-full bg-[#1d222c] border border-[#2a2f3a] px-4 py-2">
            <span className="text-sm text-[#c9a96a]">Search</span>
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
            className="rounded-full border border-[#2a2f3a] bg-[#1d222c] px-4 py-2 text-sm text-[#a8905d] focus:outline-none"
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
              className="rounded-3xl border border-[#2a2f3a] bg-[#171a20] shadow-sm hover:shadow-md transition p-4"
            >
              {shop.photo && (
                <img
                  src={shop.photo}
                  alt={shop.name}
                  className="w-full h-44 object-cover rounded-2xl mb-3 border border-[#2a2f3a]"
                />
              )}

              <h3 className="text-lg font-semibold text-[#f6f1e8]">{shop.name}</h3>

              <p className="text-sm text-[#a8905d] mt-1 line-clamp-2">
                {shop.description}
              </p>

              <div className="flex justify-between items-center mt-3 text-xs text-[#c9a96a]">
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
                  className="p-2 bg-[#1d222c] hover:bg-[#232833] rounded"
                >
                  <PencilIcon className="w-4 h-4 text-[#a8905d]" />
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
          <div className="rounded-2xl border border-dashed border-[#d6c3b2] bg-[#232833] p-10 text-center text-[#a8905d]">
            No shops match your search.
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl border border-[#2a2f3a] bg-[#171a20] p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[#f6f1e8]">
              Delete shop?
            </h3>
            <p className="mt-2 text-sm text-[#a8905d]">
              This will permanently remove{" "}
              <span className="font-semibold">{confirmDelete.name}</span>.
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-full bg-[#171a20] border border-[#2a2f3a] px-4 py-2 text-sm font-semibold text-[#a8905d] hover:bg-[#232833]"
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
