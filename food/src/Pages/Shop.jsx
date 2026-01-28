import { useState, useEffect } from "react";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function Shops() {
  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
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
  const [perPage] = useState(6);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const API_BASE = "http://localhost:3000/api/shop";
  const API_CATEGORY = "http://localhost:3000/api/category/all";

  /* ---------- STYLES ---------- */
  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition";

  /* ---------- FETCH ---------- */
  const fetchShops = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(API_BASE, {
      headers: { Authorization: `Bearer ${token}` },
    });
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

  /* ---------- FORM ---------- */
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
    const token = localStorage.getItem("token");
    const url = isEditing
      ? `${API_BASE}/${editingId}`
      : `${API_BASE}/`;

    await fetch(url, {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    fetchShops();
    resetForm();
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
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setShops(shops.filter((s) => s._id !== id));
  };

  const toggleActive = async (shop) => {
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE}/${shop._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isActive: !shop.isActive }),
    });
    fetchShops();
  };

  /* ---------- TIME OPTIONS ---------- */
  const timeOptions = [];
  for (let h = 1; h <= 12; h++) {
    ["AM", "PM"].forEach((p) => {
      timeOptions.push(`${h}:00 ${p}`);
      timeOptions.push(`${h}:30 ${p}`);
    });
  }

  /* ---------- SEARCH + FILTER ---------- */
  const filteredShops = shops.filter((s) => {
    const matchName = s.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory
      ? s.category?._id === filterCategory
      : true;
    return matchName && matchCategory;
  });

  /* ---------- PAGINATION ---------- */
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentShops = filteredShops.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredShops.length / perPage);

  /* ================= UI ================= */
  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100">
      <h1 className="text-2xl font-bold mb-6">Shop Management</h1>

      {/* SEARCH + FILTER */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shop..."
            className={`${inputClass} pl-10`}
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={inputClass}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* FORM */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 mb-10">
        <h2 className="text-lg font-semibold mb-4">
          {isEditing ? "Update Shop" : "Create Shop"}
        </h2>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Shop Name" required className={inputClass} />
          <input name="description" value={form.description} onChange={handleChange} placeholder="Description" className={inputClass} />
          <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className={inputClass} />

          <select name="OpenTime" value={form.OpenTime} onChange={handleChange} className={inputClass}>
            <option value="">Open Time</option>
            {timeOptions.map((t) => <option key={t}>{t}</option>)}
          </select>

          <select name="CloseTime" value={form.CloseTime} onChange={handleChange} className={inputClass}>
            <option value="">Close Time</option>
            {timeOptions.map((t) => <option key={t}>{t}</option>)}
          </select>

          <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
            <option value="">Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          <div className="flex gap-2 md:col-span-3">
            <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-semibold px-5 py-3 rounded-xl">
              <PlusIcon className="w-4 h-4" />
              {isEditing ? "Update Shop" : "Create Shop"}
            </button>
            <button type="button" onClick={resetForm} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-5 py-3 rounded-xl">
              <XMarkIcon className="w-4 h-4" /> Cancel
            </button>
          </div>
        </form>
      </div>

      {/* CARDS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentShops.map((shop) => (
          <div
            key={shop._id}
            className="relative bg-slate-950 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/50 hover:shadow-xl hover:-translate-y-1 transition"
          >
            <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500 rounded-l-2xl" />

            <div className="flex justify-between mb-3">
              <h3 className="text-lg font-bold">{shop.name}</h3>
              <button
                onClick={() => toggleActive(shop)}
                className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  shop.isActive
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {shop.isActive ? "Active" : "Inactive"}
              </button>
            </div>

            <p className="text-sm text-slate-300 line-clamp-2">
              {shop.description || "-"}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              🕒 {shop.OpenTime} – {shop.CloseTime}
            </p>
            <p className="text-sm text-emerald-400 font-medium mt-1">
              {shop.category?.name || "-"}
            </p>

            <div className="flex justify-end gap-2 mt-4">
              {/* <button onClick={() => setModalShop(shop)} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700">
                <EyeIcon className="w-4 h-4 text-emerald-400" />
              </button> */}
              <button onClick={() => handleEdit(shop)} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700">
                <PencilIcon className="w-4 h-4 text-blue-400" />
              </button>
              <button onClick={() => handleDelete(shop._id)} className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40">
                <TrashIcon className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 rounded-lg font-semibold ${
                currentPage === i + 1
                  ? "bg-emerald-500 text-slate-900"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
