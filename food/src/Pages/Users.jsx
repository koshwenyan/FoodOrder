import { useState, useEffect } from "react";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  UsersIcon,
  ShieldCheckIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  UserGroupIcon,
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
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
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
    setFormError("");
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    const token = localStorage.getItem("token");

    const url = isEditing
      ? `${API_BASE}/update/${editingId}`
      : `${API_BASE}/register`;

    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedPhone = form.phone.trim();
    const trimmedAddress = form.address.trim();
    const trimmedPassword = form.password.trim();

    if (!trimmedName || !trimmedEmail) {
      setFormError("Name and email are required.");
      return;
    }
    if (!isEditing && !trimmedPassword) {
      setFormError("Password is required for new users.");
      return;
    }
    if (form.role === "shop-admin" && !form.shopId) {
      setFormError("Please select a shop for Shop Admin.");
      return;
    }

    const payload = {
      ...form,
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      address: trimmedAddress,
    };

    if (isEditing && !trimmedPassword) {
      delete payload.password;
    } else if (!isEditing) {
      payload.password = trimmedPassword;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setFormError(err.message || "Failed to save user.");
        return;
      }

      await fetchUsers();
      resetForm();
    } catch (err) {
      setFormError(err.message || "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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

  const matchesRole = (u) => {
    if (roleFilter === "all") return true;
    if (roleFilter === "company") return u.role?.startsWith("company-");
    return u.role === roleFilter;
  };

  const filtered = users.filter(
    (u) =>
      matchesRole(u) &&
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const currentUsers = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const shopAdminCount = users.filter((u) => u.role === "shop-admin").length;
  const companyCount = users.filter((u) => u.role?.startsWith("company-")).length;
  const customerCount = users.filter((u) => u.role === "customer").length;

  /* ---------------- ROLE COLORS ---------------- */

  const roleClasses = {
    admin: "bg-[#f8d7cd] text-[#a4553a]",
    "shop-admin": "bg-[#e7eddc] text-[#5b7a40]",
    "company-admin": "bg-[#f5e6c8] text-[#a07a2f]",
    "company-staff": "bg-[#ead8c7] text-[#8b6b4f]",
    customer: "bg-[#e6f0f5] text-[#3f6c87]",
  };

  return (
    <div className="min-h-screen bg-[#f6f1eb] text-[#1f1a17]">
      <div className="px-6 py-6 sm:px-10 space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-[#f9e9d7] via-[#f8f3ee] to-[#f2ddc7] p-6 sm:p-8 shadow-lg border border-[#ead8c7]">
          <p className="text-sm uppercase tracking-[0.2em] text-[#8b6b4f]">
            Admin Console
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold">
            User Management
          </h1>
          <p className="text-sm text-[#6c5645] mt-2">
            Create, update, and manage platform users.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <button
            type="button"
            onClick={() => setRoleFilter("all")}
            className={`text-left rounded-2xl bg-white/80 border px-4 py-4 transition ${
              roleFilter === "all"
                ? "border-[#1f1a17] ring-1 ring-[#1f1a17]/30"
                : "border-[#e7d5c4]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#8b6b4f]">
                  Total Users
                </p>
                <p className="text-2xl font-semibold mt-2">{totalUsers}</p>
              </div>
              <div className="p-3 rounded-full bg-[#f9f4ef] border border-[#ead8c7]">
                <UsersIcon className="w-6 h-6 text-[#8b6b4f]" />
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("admin")}
            className={`text-left rounded-2xl bg-white/80 border px-4 py-4 transition ${
              roleFilter === "admin"
                ? "border-[#1f1a17] ring-1 ring-[#1f1a17]/30"
                : "border-[#e7d5c4]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#8b6b4f]">
                  Admins
                </p>
                <p className="text-2xl font-semibold mt-2">{adminCount}</p>
              </div>
              <div className="p-3 rounded-full bg-[#f3d7cf] border border-[#e8c4b9]">
                <ShieldCheckIcon className="w-6 h-6 text-[#a4553a]" />
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("shop-admin")}
            className={`text-left rounded-2xl bg-white/80 border px-4 py-4 transition ${
              roleFilter === "shop-admin"
                ? "border-[#1f1a17] ring-1 ring-[#1f1a17]/30"
                : "border-[#e7d5c4]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#8b6b4f]">
                  Shop Admins
                </p>
                <p className="text-2xl font-semibold mt-2">{shopAdminCount}</p>
              </div>
              <div className="p-3 rounded-full bg-[#e7eddc] border border-[#c9d8b7]">
                <BuildingStorefrontIcon className="w-6 h-6 text-[#5b7a40]" />
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("company")}
            className={`text-left rounded-2xl bg-white/80 border px-4 py-4 transition ${
              roleFilter === "company"
                ? "border-[#1f1a17] ring-1 ring-[#1f1a17]/30"
                : "border-[#e7d5c4]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#8b6b4f]">
                  Company Users
                </p>
                <p className="text-2xl font-semibold mt-2">{companyCount}</p>
              </div>
              <div className="p-3 rounded-full bg-[#f9f4ef] border border-[#ead8c7]">
                <TruckIcon className="w-6 h-6 text-[#8b6b4f]" />
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("customer")}
            className={`text-left rounded-2xl bg-white/80 border px-4 py-4 transition ${
              roleFilter === "customer"
                ? "border-[#1f1a17] ring-1 ring-[#1f1a17]/30"
                : "border-[#e7d5c4]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#8b6b4f]">
                  Customers
                </p>
                <p className="text-2xl font-semibold mt-2">{customerCount}</p>
              </div>
              <div className="p-3 rounded-full bg-[#e6f0f5] border border-[#cfe0ea]">
                <UserGroupIcon className="w-6 h-6 text-[#3f6c87]" />
              </div>
            </div>
          </button>
        </div>

        {/* ---------------- FORM ---------------- */}
        <div className="rounded-3xl border border-[#ead8c7] bg-white/90 shadow-sm p-6 grid md:grid-cols-3 gap-4">
        {formError && (
          <div className="md:col-span-3 rounded-2xl border border-[#f3d7cf] bg-[#f9f4ef] px-4 py-3 text-sm text-[#a4553a]">
            {formError}
          </div>
        )}

        {["name", "email", "phone", "address"].map((f) => (
          <input
            key={f}
            placeholder={f}
            value={form[f]}
            onChange={(e) => setForm({ ...form, [f]: e.target.value })}
            className="bg-[#fbf7f2] border border-[#ead8c7] rounded-2xl px-4 py-3 text-sm text-[#1f1a17] placeholder:text-[#8b6b4f] focus:outline-none focus:ring-2 focus:ring-[#1f1a17]/15"
          />
        ))}

        <input
          type="password"
          placeholder="password"
          disabled={isEditing}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="bg-[#fbf7f2] border border-[#ead8c7] rounded-2xl px-4 py-3 text-sm text-[#1f1a17] placeholder:text-[#8b6b4f] focus:outline-none focus:ring-2 focus:ring-[#1f1a17]/15"
        />

        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="bg-[#fbf7f2] border border-[#ead8c7] rounded-2xl px-4 py-3 text-sm text-[#1f1a17] focus:outline-none focus:ring-2 focus:ring-[#1f1a17]/15"
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
            className="bg-[#fbf7f2] border border-[#ead8c7] rounded-2xl px-4 py-3 text-sm text-[#1f1a17] focus:outline-none focus:ring-2 focus:ring-[#1f1a17]/15"
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
          disabled={isSubmitting}
          className="rounded-full bg-[#1f1a17] text-[#f8f3ee] py-3 text-sm font-semibold border border-[#1f1a17] hover:bg-[#2b241f] disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : isEditing ? "Update User" : "Create User"}
        </button>

        <button
          onClick={resetForm}
          className="rounded-full bg-white border border-[#e7d5c4] py-3 text-sm font-semibold text-[#6c5645] hover:bg-[#fbf7f2]"
        >
          Cancel
        </button>
      </div>

      {/* ---------------- TABLE ---------------- */}
      <div className="rounded-3xl border border-[#ead8c7] bg-white/90 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#f8f3ee] text-[#6c5645] uppercase text-xs">
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
              <tr key={u._id} className="border-t border-[#ead8c7] hover:bg-[#fbf7f2] text-[#1f1a17]">
                <td className="p-4">{(currentPage - 1) * perPage + i + 1}</td>
                <td className="p-4 font-medium">{u.name}</td>
                <td className="p-4 text-[#6c5645]">{u.email}</td>
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
                    className="p-2 bg-[#f9f4ef] hover:bg-[#f1e6db] rounded"
                  >
                    <EyeIcon className="w-4 h-4 text-[#8b6b4f]" />
                  </button>
                  <button
                    onClick={() => handleEdit(u)}
                    className="p-2 bg-[#f9f4ef] hover:bg-[#f1e6db] rounded"
                  >
                    <PencilIcon className="w-4 h-4 text-[#6c5645]" />
                  </button>
                  <button
                    onClick={() => handleDelete(u._id)}
                    className="p-2 bg-[#f3d7cf] hover:bg-[#e8c4b9] rounded"
                  >
                    <TrashIcon className="w-4 h-4 text-[#a4553a]" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------------- PAGINATION ---------------- */}
      <div className="flex justify-center gap-4 text-[#1f1a17]">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => p - 1)}
          className="px-4 py-2 bg-white border border-[#e7d5c4] rounded-full disabled:opacity-40 text-sm"
        >
          Prev
        </button>
        <span className="px-4 py-2">
          {currentPage} / {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(p => p + 1)}
          className="px-4 py-2 bg-white border border-[#e7d5c4] rounded-full disabled:opacity-40 text-sm"
        >
          Next
        </button>
      </div>
      </div>
    </div>
  );
}
