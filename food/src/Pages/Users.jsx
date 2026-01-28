import { useState, useEffect } from "react";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    companyId: "",
    address: "",
    role: "customer",
    shopId: "",
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
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data.users || data);
    } catch {
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
    } catch {
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
      companyId: "",
      address: "",
      role: "customer",
      shopId: "",
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const resetFilter = () => {
    setSearch("");
    setRoleFilter("all");
    setCurrentPage(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const payload = { ...form, password: form.password || undefined };
    const url = isEditing
      ? `${API_BASE}/update/${editingId}`
      : `${API_BASE}/register`;

    await fetch(url, {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });

    fetchUsers();
    resetForm();
  };

  const toggleActive = async (user) => {
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE}/update/${user._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    fetchUsers();
  };

  const handleEdit = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      phone: user.phone,
      companyId: user.companyId?._id || "",
      address: user.address,
      role: user.role,
      shopId: user.shopId?._id || "",
    });
    setIsEditing(true);
    setEditingId(user._id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this user?")) return;
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE}/delete/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(users.filter((u) => u._id !== id));
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / perPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold text-emerald-400">User Management</h1>

      {/* Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 grid md:grid-cols-3 gap-4">
        {["name", "email", "phone", "address"].map((f) => (
          <input
            key={f}
            name={f}
            placeholder={f}
            value={form[f]}
            onChange={(e) => setForm({ ...form, [f]: e.target.value })}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        ))}
        <input
          type="password"
          name="password"
          placeholder="password"
          disabled={isEditing}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="">Select Shop</option>
            {shops.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        )}
        <button
          onClick={handleSubmit}
          className="col-span-full flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-semibold px-4 py-2 rounded-lg"
        >
          <PlusIcon className="w-4 h-4" />
          {isEditing ? "Update User" : "Create User"}
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email..."
          className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 w-full md:w-1/3"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="shop-admin">Shop Admin</option>
          <option value="company-admin">Company Admin</option>
          <option value="company-staff">Company Staff</option>
          <option value="customer">Customer</option>
        </select>
        <button onClick={resetFilter} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600">
          Reset
        </button>
      </div>

      {/* Mobile Cards */}
      <div className="grid gap-4 md:hidden">
        {currentUsers.map((u) => (
          <div key={u._id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">{u.name}</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => toggleActive(u)}
                  className={`text-xs px-2 py-1 rounded ${u.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}
                >
                  {u.isActive ? "Active" : "Inactive"}
                </button>
                <button onClick={() => handleEdit(u)} className="p-1 rounded bg-slate-700 hover:bg-slate-600">
                  <PencilIcon className="w-4 h-4 text-blue-400" />
                </button>
                <button onClick={() => handleDelete(u._id)} className="p-1 rounded bg-red-500/10 hover:bg-red-500/30">
                  <TrashIcon className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
            <p>Email: {u.email}</p>
            <p>Phone: {u.phone || "-"}</p>
            <p>Company: {u.companyId?.name || "-"}</p>
            <p>Shop: {u.shopId?.name || "-"}</p>
            <p>Address: {u.address || "-"}</p>
            <p>Role: {u.role}</p>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm text-slate-200">
          <thead className="bg-slate-800">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Company</th>
              <th>Shop</th>
              <th>Address</th>
              <th>Role</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((u) => (
              <tr key={u._id} className="border-t border-slate-800">
                <td className="p-4">{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone || "-"}</td>
                <td>{u.companyId?.name || "-"}</td>
                <td>{u.shopId?.name || "-"}</td>
                <td>{u.address || "-"}</td>
                <td>{u.role}</td>
                <td>
                  <button
                    onClick={() => toggleActive(u)}
                    className={`px-2 py-1 rounded text-xs ${u.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}
                  >
                    {u.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="p-4 flex justify-end gap-2">
                  <button onClick={() => setModalUser(u)} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700">
                    <EyeIcon className="w-4 h-4 text-emerald-400" />
                  </button>
                  <button onClick={() => handleEdit(u)} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700">
                    <PencilIcon className="w-4 h-4 text-blue-400" />
                  </button>
                  <button onClick={() => handleDelete(u._id)} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/30">
                    <TrashIcon className="w-4 h-4 text-red-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600"
        >
          Prev
        </button>
        <span className="px-3 py-1">{currentPage} / {Math.ceil(filteredUsers.length / perPage)}</span>
        <button
          disabled={currentPage === Math.ceil(filteredUsers.length / perPage)}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600"
        >
          Next
        </button>
      </div>
    </div>
  );
}
