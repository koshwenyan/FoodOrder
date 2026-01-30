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
  const [current, setCurrent] = useState(null);
  const currentId = current?._id;

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    companyId: null,
    address: "",
    role: "customer",
    shopId: null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalUser, setModalUser] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  const API_BASE = "http://localhost:3000/api/user";
  const API_SHOP = "http://localhost:3000/api/shop";

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCurrent(data.user || null);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data.users || data);
    } catch (err) {
      console.error(err);
      setUsers([]);
    }
  };

  // Fetch shops
  const fetchShops = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_SHOP, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setShops(data.data || []);
    } catch (err) {
      console.error(err);
      setShops([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchShops();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      phone: "",
      companyId: null,
      address: "",
      role: "customer",
      shopId: null,
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing && !editingId) return alert("No user selected to update!");
    const token = localStorage.getItem("token");

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password || undefined,
      phone: form.phone,
      address: form.address,
      role: form.role,
      companyId: form.companyId || null,
      shopId: form.shopId || null,
    };

    const url = isEditing
      ? `${API_BASE}/update/${editingId}`
      : `${API_BASE}/register`;

    try {
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      fetchUsers();
      resetForm();
      alert(isEditing ? "User updated!" : "User created!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const toggleActive = async (user) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/update/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Toggle failed");
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleEdit = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      phone: user.phone || "",
      companyId: user.companyId?._id || null,
      address: user.address || "",
      role: user.role,
      shopId: user.shopId?._id || null,
    });
    setIsEditing(true);
    setEditingId(user._id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const roleClasses = {
    admin: "bg-red-500/30 text-red-400",
    "shop-admin": "bg-green-500/30 text-green-400",
    "company-admin": "bg-yellow-500/30 text-yellow-400",
    "company-staff": "bg-purple-500/30 text-purple-400",
    customer: "bg-blue-500/30 text-blue-400",
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / perPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  return (
    <div className="space-y-6 p-6">

      <h1 className="text-3xl font-bold text-white">User Management</h1>

      {/* ---------------- Form ---------------- */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 grid md:grid-cols-3 gap-4">
        {["name", "email", "phone", "address"].map((f) => (
          <input
            key={f}
            placeholder={f}
            value={form[f]}
            onChange={(e) => setForm({ ...form, [f]: e.target.value })}
            className="bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-lg px-3 py-2 placeholder:text-white/50"
          />
        ))}

        <input
          type="password"
          placeholder="password"
          disabled={isEditing}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-lg px-3 py-2 placeholder:text-white/50"
        />

        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-lg px-3 py-2"
        >
          <option value="admin">Admin</option>
          <option value="shop-admin">Shop Admin</option>
          <option value="company-admin">Company Admin</option>
          <option value="company-staff">Company Staff</option>
          <option value="customer">Customer</option>
        </select>

        {form.role === "shop-admin" && (
          <select
            value={form.shopId}
            onChange={(e) => setForm({ ...form, shopId: e.target.value })}
            className="bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-lg px-3 py-2"
          >
            <option value="">Select a shop</option>
            {shops.map((shop) => (
              <option key={shop._id} value={shop._id}>
                {shop.name}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={handleSubmit}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold px-4 py-2 rounded-lg"
        >
          {isEditing ? "Update User" : "Create User"}
        </button>

        <button
          type="button"
          onClick={resetForm}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-xl"
        >
          <XMarkIcon className="w-4 h-4" /> Cancel
        </button>
      </div>

      {/* ---------------- Table ---------------- */}
      <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
  <table className="w-full table-fixed text-sm text-slate-200">

    {/* ================= HEADER ================= */}
    <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
      <tr>
        <th className="p-4 w-12 text-left">No</th>
        <th className="p-4 w-40 text-left">Name</th>
        <th className="p-4 w-56 text-left">Email</th>
        <th className="p-4 w-32 text-left">Phone</th>
        <th className="p-4 w-32 text-left">Company</th>
        <th className="p-4 w-32 text-left">Shop</th>
        <th className="p-4 w-40 text-left">Address</th>
        <th className="p-4 w-32 text-left">Role</th>
        <th className="p-4 w-28 text-left">Status</th>
        <th className="p-4 w-32 text-right">Actions</th>
      </tr>
    </thead>

    {/* ================= BODY ================= */}
    <tbody className="divide-y divide-slate-800">
      {currentUsers.map((u, index) => (
        <tr
          key={u._id}
          className="hover:bg-slate-800/60 transition"
        >
          {/* No */}
          <td className="p-4 text-slate-400">
            {(currentPage - 1) * perPage + index + 1}
          </td>

          {/* Name */}
          <td className="p-4 font-medium truncate">
            {u.name || "-"}
          </td>

          {/* Email */}
          <td className="p-4 truncate text-slate-300">
            {u.email}
          </td>

          {/* Phone */}
          <td className="p-4">
            {u.phone || "-"}
          </td>

          {/* Company */}
          <td className="p-4 truncate">
            {u.companyId?.name || "-"}
          </td>

          {/* Shop */}
          <td className="p-4 truncate">
            {u.shopId?.name || "-"}
          </td>

          {/* Address */}
          <td className="p-4 truncate text-slate-400">
            {u.address || "-"}
          </td>

          {/* Role */}
          <td className="p-4">
            <span
              className={`px-2.5 py-1 text-xs rounded-full ${
                roleClasses[u.role] ??
                "bg-gray-500/20 text-gray-400"
              }`}
            >
              {u.role}
            </span>
          </td>

          {/* Status */}
          <td className="p-4">
            <span
              className={`px-2.5 py-1 text-xs rounded-full ${
                u.isActive
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {u.isActive ? "Active" : "Inactive"}
            </span>
          </td>

          {/* Actions */}
<td className="p-4">
  <div className="flex justify-end gap-2">

    {/* VIEW */}
    <button
      onClick={() => setModalUser(u)}
      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
    >
      <EyeIcon className="w-4 h-4 text-emerald-400" />
    </button>

    {/* EDIT */}
    <button
      onClick={() => handleEdit(u)}
      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
    >
      <PencilIcon className="w-4 h-4 text-blue-400" />
    </button>

    {/* DELETE */}
    <button
      onClick={() => handleDelete(u._id)}
      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/30"
    >
      <TrashIcon className="w-4 h-4 text-red-400" />
    </button>

  </div>
</td>

        </tr>
      ))}
    </tbody>

  </table>
</div>


      {/* ---------------- Pagination ---------------- */}
      <div className="flex justify-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-40"
        >
          Prev
        </button>

        <span className="px-3 py-1">{currentPage} / {totalPages}</span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-40"
        >
          Next
        </button>
      </div>

      {/* ---------------- User Detail Modal ---------------- */}
{modalUser && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md">
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-emerald-400">
          User Detail
        </h2>
        <button onClick={() => setModalUser(null)}>
          <XMarkIcon className="w-5 h-5 text-slate-400 hover:text-red-400" />
        </button>
      </div>

      <div className="space-y-2 text-slate-200 text-sm">
        <p><b>Name:</b> {modalUser.name}</p>
        <p><b>Email:</b> {modalUser.email}</p>
        <p><b>Phone:</b> {modalUser.phone || "-"}</p>
        <p><b>Role:</b> {modalUser.role}</p>
        <p><b>Company:</b> {modalUser.companyId?.name || "-"}</p>
        <p><b>Shop:</b> {modalUser.shopId?.name || "-"}</p>
        <p><b>Address:</b> {modalUser.address || "-"}</p>
        <p>
          <b>Status:</b>{" "}
          {modalUser.isActive ? "Active" : "Inactive"}
        </p>
      </div>

      <button
        onClick={() => setModalUser(null)}
        className="mt-6 w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-semibold py-2 rounded-lg"
      >
        Close
      </button>
    </div>
  </div>
)}

    </div>
  );
}
