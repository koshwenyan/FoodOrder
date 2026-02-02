import { useState, useEffect } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

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
    image: null,
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
    console.log("ShopData",data);
  };

  const fetchCategories = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(API_CATEGORY, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setCategories(data.data || []);
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      address: "",
      OpenTime: "",
      CloseTime: "",
      isActive: true,
      category: "",
      image: null,
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("address", form.address);
    formData.append("OpenTime", form.OpenTime);
    formData.append("CloseTime", form.CloseTime);
    formData.append("isActive", form.isActive);
    formData.append("category", form.category);
    if (form.image) formData.append("image", form.image);

    const url = isEditing ? `${API_BASE}/${editingId}` : `${API_BASE}/`;

    await fetch(url, {
      method: isEditing ? "PUT" : "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
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
      image: null,
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

  // convert "HH:MM" to 12-hour format
  const formatTime = (timeStr) => {
    if (!timeStr) return "-";
    const [hour, minute] = timeStr.split(":");
    const h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${minute} ${ampm}`;
  };

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

        {/* Open / Close Time */}
        <div>
          <label className="text-xs text-gray-500">Open Time</label>
          <input
            type="time"
            value={form.OpenTime}
            onChange={(e) => setForm({ ...form, OpenTime: e.target.value })}
            className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Close Time</label>
          <input
            type="time"
            value={form.CloseTime}
            onChange={(e) => setForm({ ...form, CloseTime: e.target.value })}
            className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2 w-full"
          />
        </div>

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

        {/* Image Input */}
        <input
          type="file"
          onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
          className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2"
        />

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
              <th className="p-4 text-left">Open - Close</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Image</th>
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
                <td className="p-4">
                  {formatTime(s.OpenTime)} - {formatTime(s.CloseTime)}
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full font-semibold text-white ${s.isActive ? "bg-green-500" : "bg-red-500"}`}>
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4">
                  {s.photo ? <img src={s.photo} alt={s.name} className="w-12 h-12 object-cover rounded" /> : "-"}
                </td>
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
