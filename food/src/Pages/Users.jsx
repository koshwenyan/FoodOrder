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
      <div className="hidden md:block bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm text-white">
          <thead className="bg-white/20">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Company</th>
              <th>Shop</th>
              <th>Address</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((u) => (
              <tr key={u._id} className="border-t border-white/20">
                <td className="p-4">{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone || "-"}</td>
                <td>{u.companyId?.name || "-"}</td>
                <td>{u.shopId?.name || "-"}</td>
                <td>{u.address || "-"}</td>

                <td>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      roleClasses[u.role] ?? "bg-white/20 text-white"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>

                <td>
                  <button
                    onClick={() => toggleActive(u)}
                    className={`px-2 py-1 rounded text-xs ${
                      u.isActive
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {u.isActive ? "Active" : "Inactive"}
                  </button>
                </td>

                <td className="p-4 flex justify-center gap-2">
                  <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20">
                    <EyeIcon className="w-4 h-4 text-emerald-400" />
                  </button>
                  <button
                    onClick={() => handleEdit(u)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
                  >
                    <PencilIcon className="w-4 h-4 text-blue-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(u._id)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/30"
                  >
                    <TrashIcon className="w-4 h-4 text-red-400" />
                  </button>
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
    </div>
  );
}
