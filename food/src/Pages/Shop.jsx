import { useState, useEffect } from "react";
import {
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

export default function Shops() {
  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    OpenTime: "",
    CloseTime: "",
    isActive: true,
    category: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  const API_BASE = "http://localhost:3000/api/shop";
  const API_CATEGORY = "http://localhost:3000/api/category/all";

  useEffect(() => {
    fetchShops();
    fetchCategories();
  }, []);

  const fetchShops = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(API_BASE, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setShops(data.data || []);
  };

  const fetchCategories = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(API_CATEGORY, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setCategories(data.data || []);
  };

  const resetForm = () => {
    setForm({ name: "", description: "", address: "", OpenTime: "", CloseTime: "", isActive: true, category: "" });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const url = isEditing ? `${API_BASE}/${editingId}` : `${API_BASE}/`;

    await fetch(url, {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
    await fetch(`${API_BASE}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    fetchShops();
  };

  const filtered = shops.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category?.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const currentShops = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="min-h-screen bg-[#ECEFF1] p-8 space-y-6">

      <h1 className="text-3xl font-bold text-[#111827]">Shop Management</h1>

      {/* ---------------- FORM ---------------- */}
      <div className="bg-white rounded-xl shadow-md p-6 grid md:grid-cols-3 gap-4 text-[#111827]">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2"
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2"
        />
        <input
          placeholder="Address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2"
        />

        <input
          placeholder="Open Time"
          value={form.OpenTime}
          onChange={(e) => setForm({ ...form, OpenTime: e.target.value })}
          className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2"
        />
        <input
          placeholder="Close Time"
          value={form.CloseTime}
          onChange={(e) => setForm({ ...form, CloseTime: e.target.value })}
          className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2"
        />

        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        <button onClick={handleSubmit} className="bg-[#1F2933] hover:bg-black text-white rounded-lg py-2">
          {isEditing ? "Update Shop" : "Create Shop"}
        </button>
        <button onClick={resetForm} className="bg-gray-200 hover:bg-gray-300 rounded-lg py-2">Cancel</button>
      </div>

      {/* ---------------- TABLE ---------------- */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="p-4 text-left">No</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Address</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentShops.map((s, i) => (
              <tr key={s._id} className="border-t hover:bg-gray-50 text-[#111827]">
                <td className="p-4">{(currentPage - 1) * perPage + i + 1}</td>
                <td className="p-4 font-medium">{s.name}</td>
                <td className="p-4">{s.address || "-"}</td>
                <td className="p-4">{s.category?.name || "-"}</td>
                <td className="p-4">{s.isActive ? "Active" : "Inactive"}</td>
                <td className="p-4 flex justify-end gap-2">
                  <button onClick={() => handleEdit(s)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded">
                    <PencilIcon className="w-4 h-4 text-blue-600" />
                  </button>
                  <button onClick={() => handleDelete(s._id)} className="p-2 bg-red-100 hover:bg-red-200 rounded">
                    <TrashIcon className="w-4 h-4 text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------------- PAGINATION ---------------- */}
      <div className="flex justify-center gap-4 text-[#111827]">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => p - 1)}
          className="px-4 py-2 bg-white border rounded disabled:opacity-40"
        >
          Prev
        </button>
        <span className="px-4 py-2">{currentPage} / {totalPages}</span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(p => p + 1)}
          className="px-4 py-2 bg-white border rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
