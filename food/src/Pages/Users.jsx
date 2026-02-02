import { useState, useEffect } from "react";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [modalUser, setModalUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "customer",
    shopId: null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  const API_BASE = "http://localhost:3000/api/user";
  const API_SHOP = "http://localhost:3000/api/shop";

  /* ---------------- FETCH ---------------- */

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUsers(data.users || []);
  };

  const fetchShops = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(API_SHOP, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setShops(data.data || []);
  };

  useEffect(() => {
    fetchUsers();
    fetchShops();
  }, []);

  /* ---------------- HANDLERS ---------------- */

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      role: "customer",
      shopId: null,
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const url = isEditing
      ? `${API_BASE}/update/${editingId}`
      : `${API_BASE}/register`;

    await fetch(url, {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    fetchUsers();
    resetForm();
  };

  const handleEdit = (u) => {
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      phone: u.phone || "",
      address: u.address || "",
      role: u.role,
      shopId: u.shopId?._id || null,
    });
    setIsEditing(true);
    setEditingId(u._id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this user?")) return;
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchUsers();
  };

  /* ---------------- FILTER + PAGINATION ---------------- */

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const currentUsers = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  /* ---------------- ROLE COLORS ---------------- */

  const roleClasses = {
    admin: "bg-red-100 text-red-600",
    "shop-admin": "bg-green-100 text-green-600",
    "company-admin": "bg-yellow-100 text-yellow-700",
    "company-staff": "bg-purple-100 text-purple-600",
    customer: "bg-blue-100 text-blue-600",
  };

  return (
    <div className="min-h-screen bg-[#ECEFF1] p-8 space-y-6">

      <h1 className="text-3xl font-bold text-[#111827]">
        User Management
      </h1>

      {/* ---------------- FORM ---------------- */}
      <div className="bg-white rounded-xl shadow-md p-6 grid md:grid-cols-3 gap-4 text-[#111827]">

        {["name", "email", "phone", "address"].map((f) => (
          <input
            key={f}
            placeholder={f}
            value={form[f]}
            onChange={(e) => setForm({ ...form, [f]: e.target.value })}
            className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2"
          />
        ))}

        <input
          type="password"
          placeholder="password"
          disabled={isEditing}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2"
        />

        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="admin">Admin</option>
          <option value="shop-admin">Shop Admin</option>
          <option value="company-admin">Company Admin</option>
          <option value="company-staff">Company Staff</option>
          <option value="customer">Customer</option>
        </select>

        {form.role === "shop-admin" && (
          <select
            value={form.shopId || ""}
            onChange={(e) => setForm({ ...form, shopId: e.target.value })}
            className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Select Shop</option>
            {shops.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={handleSubmit}
          className="bg-[#1F2933] hover:bg-black text-white rounded-lg py-2"
        >
          {isEditing ? "Update User" : "Create User"}
        </button>

        <button
          onClick={resetForm}
          className="bg-gray-200 hover:bg-gray-300 rounded-lg py-2"
        >
          Cancel
        </button>
      </div>

      {/* ---------------- TABLE ---------------- */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="p-4 text-left">No</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Shop</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentUsers.map((u, i) => (
              <tr key={u._id} className="border-t hover:bg-gray-50 text-[#111827]">
                <td className="p-4">{(currentPage - 1) * perPage + i + 1}</td>
                <td className="p-4 font-medium">{u.name}</td>
                <td className="p-4 text-gray-500">{u.email}</td>
                <td className="p-4">{u.phone || "-"}</td>
                <td className="p-4">{u.shopId?.name || "-"}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${roleClasses[u.role]}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4 flex justify-end gap-2">
                  <button
                    onClick={() => setModalUser(u)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    <EyeIcon className="w-4 h-4 text-green-600" />
                  </button>
                  <button
                    onClick={() => handleEdit(u)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    <PencilIcon className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(u._id)}
                    className="p-2 bg-red-100 hover:bg-red-200 rounded"
                  >
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
        <span className="px-4 py-2">
          {currentPage} / {totalPages}
        </span>
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
