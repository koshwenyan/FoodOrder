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
    admin: "bg-[#fee2e2] text-[#dc2626]",
    "shop-admin": "bg-[#f1f5f9] text-[#16a34a]",
    "company-admin": "bg-[#f5e6c8] text-[#a07a2f]",
    "company-staff": "bg-[#cbd5e1] text-[#475569]",
    customer: "bg-[#e6f0f5] text-[#3f6c87]",
  };

  return (
    <div className="min-h-screen anim-fade-in-up bg-white text-[#0f172a]">
      <div className="px-6 py-6 sm:px-10 space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] p-6 sm:p-8 shadow-lg border border-[#cbd5e1]">
          <p className="text-sm uppercase tracking-[0.2em] text-[#475569]">
            Admin Console
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold">
            User Management
          </h1>
          <p className="text-sm text-[#475569] mt-2">
            Create, update, and manage platform users.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <button
            type="button"
            onClick={() => setRoleFilter("all")}
            className={`text-left rounded-2xl bg-[#f1f5f9] border px-4 py-4 transition ${
              roleFilter === "all"
                ? "border-[#e2e8f0] ring-1 ring-[#e2e8f0]/30"
                : "border-[#cbd5e1]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#475569]">
                  Total Users
                </p>
                <p className="text-2xl font-semibold mt-2">{totalUsers}</p>
              </div>
              <div className="p-3 rounded-full bg-[#f1f5f9] border border-[#cbd5e1]">
                <UsersIcon className="w-6 h-6 text-[#475569]" />
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("admin")}
            className={`text-left rounded-2xl bg-[#f1f5f9] border px-4 py-4 transition ${
              roleFilter === "admin"
                ? "border-[#e2e8f0] ring-1 ring-[#e2e8f0]/30"
                : "border-[#cbd5e1]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#475569]">
                  Admins
                </p>
                <p className="text-2xl font-semibold mt-2">{adminCount}</p>
              </div>
              <div className="p-3 rounded-full bg-[#f1f5f9] border border-[#cbd5e1]">
                <ShieldCheckIcon className="w-6 h-6 text-[#dc2626]" />
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("shop-admin")}
            className={`text-left rounded-2xl bg-[#f1f5f9] border px-4 py-4 transition ${
              roleFilter === "shop-admin"
                ? "border-[#e2e8f0] ring-1 ring-[#e2e8f0]/30"
                : "border-[#cbd5e1]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#475569]">
                  Shop Admins
                </p>
                <p className="text-2xl font-semibold mt-2">{shopAdminCount}</p>
              </div>
              <div className="p-3 rounded-full bg-[#f1f5f9] border border-[#cbd5e1]">
                <BuildingStorefrontIcon className="w-6 h-6 text-[#16a34a]" />
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("company")}
            className={`text-left rounded-2xl bg-[#f1f5f9] border px-4 py-4 transition ${
              roleFilter === "company"
                ? "border-[#e2e8f0] ring-1 ring-[#e2e8f0]/30"
                : "border-[#cbd5e1]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#475569]">
                  Company Users
                </p>
                <p className="text-2xl font-semibold mt-2">{companyCount}</p>
              </div>
              <div className="p-3 rounded-full bg-[#f1f5f9] border border-[#cbd5e1]">
                <TruckIcon className="w-6 h-6 text-[#475569]" />
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("customer")}
            className={`text-left rounded-2xl bg-[#f1f5f9] border px-4 py-4 transition ${
              roleFilter === "customer"
                ? "border-[#e2e8f0] ring-1 ring-[#e2e8f0]/30"
                : "border-[#cbd5e1]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#475569]">
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
        <div className="rounded-3xl border border-[#cbd5e1] bg-[#f8fafc] shadow-sm p-6 grid md:grid-cols-3 gap-4">
        {formError && (
          <div className="md:col-span-3 rounded-2xl border border-[#e2e8f0] bg-[#f1f5f9] px-4 py-3 text-sm text-[#dc2626]">
            {formError}
          </div>
        )}

        {["name", "email", "phone", "address"].map((f) => (
          <input
            key={f}
            placeholder={f}
            value={form[f]}
            onChange={(e) => setForm({ ...form, [f]: e.target.value })}
            className="bg-[#f1f5f9] border border-[#cbd5e1] rounded-2xl px-4 py-3 text-sm text-[#0f172a] placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#e2e8f0]/15"
          />
        ))}

        <input
          type="password"
          placeholder="password"
          disabled={isEditing}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="bg-[#f1f5f9] border border-[#cbd5e1] rounded-2xl px-4 py-3 text-sm text-[#0f172a] placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#e2e8f0]/15"
        />

        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="bg-[#f1f5f9] border border-[#cbd5e1] rounded-2xl px-4 py-3 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#e2e8f0]/15"
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
            className="bg-[#f1f5f9] border border-[#cbd5e1] rounded-2xl px-4 py-3 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#e2e8f0]/15"
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
          className="rounded-full bg-[#e2e8f0] text-[#0f172a] py-3 text-sm font-semibold border border-[#e2e8f0] hover:bg-[#0ea5e9] disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : isEditing ? "Update User" : "Create User"}
        </button>

        <button
          onClick={resetForm}
          className="rounded-full bg-[#f8fafc] border border-[#cbd5e1] py-3 text-sm font-semibold text-[#475569] hover:bg-[#e2e8f0]"
        >
          Cancel
        </button>
      </div>

      {/* ---------------- TABLE ---------------- */}
      <div className="rounded-3xl border border-[#cbd5e1] bg-[#f8fafc] shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#f8fafc] text-[#475569] uppercase text-xs">
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
              <tr key={u._id} className="border-t border-[#cbd5e1] hover:bg-[#e2e8f0] text-[#0f172a]">
                <td className="p-4">{(currentPage - 1) * perPage + i + 1}</td>
                <td className="p-4 font-medium">{u.name}</td>
                <td className="p-4 text-[#475569]">{u.email}</td>
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
                    className="p-2 bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded"
                  >
                    <EyeIcon className="w-4 h-4 text-[#475569]" />
                  </button>
                  <button
                    onClick={() => handleEdit(u)}
                    className="p-2 bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded"
                  >
                    <PencilIcon className="w-4 h-4 text-[#475569]" />
                  </button>
                  <button
                    onClick={() => handleDelete(u._id)}
                    className="p-2 bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded"
                  >
                    <TrashIcon className="w-4 h-4 text-[#dc2626]" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------------- PAGINATION ---------------- */}
      <div className="flex justify-center gap-4 text-[#0f172a]">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => p - 1)}
          className="px-4 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-full disabled:opacity-40 text-sm"
        >
          Prev
        </button>
        <span className="px-4 py-2">
          {currentPage} / {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(p => p + 1)}
          className="px-4 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-full disabled:opacity-40 text-sm"
        >
          Next
        </button>
      </div>
      </div>
    </div>
  );
}
