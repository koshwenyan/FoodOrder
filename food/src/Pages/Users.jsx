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
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    companyId: "",
    companyName: "",
    address: "",
    role: "customer",
  });
  const [modalUser, setModalUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(5);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const API_BASE = "http://localhost:3000/api/user";

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.users || data);
    } catch (err) {
      console.error(err);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      phone: "",
      companyName: "",
      address: "",
      role: "customer",
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...form,
        password: form.password || undefined,
        company: form.companyId,
      };
      let res;

      if (isEditing) {
        res = await fetch(`${API_BASE}/update/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_BASE}/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error("Request failed");
      await res.json();
      fetchUsers();
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      phone: user.phone,
      companyId: user.companyId?._id || "",
      companyName: user.companyId?.name || "",
      address: user.address,
      role: user.role,
    });
    setIsEditing(true);
    setEditingId(user._id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleView = (user) => setModalUser(user);

  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentUsers = users.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(users.length / perPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-emerald-400 tracking-wide">
          User Management
        </h1>
      </div>

      {/* Form Card */}
      <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl transition hover:shadow-2xl">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? "Update User" : "Create User"}
        </h2>
        <form className="grid md:grid-cols-3 gap-4" onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required={!isEditing}
            disabled={isEditing}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <input
            name="companyName"
            placeholder="Company"
            value={form.companyName}
            onChange={handleChange}
            disabled={isEditing}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <input
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <select
            name="role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none hover:text-white"
          >
            <option className="bg-slate-800 text-slate-200" value="admin">
              Admin
            </option>
            <option className="bg-slate-800 text-slate-200" value="shop-admin">
              Shop Admin
            </option>
            <option
              className="bg-slate-800 text-slate-200"
              value="company-admin"
            >
              Company Admin
            </option>
            <option
              className="bg-slate-800 text-slate-200"
              value="company-staff"
            >
              Company Staff
            </option>
            <option className="bg-slate-800 text-slate-200" value="customer">
              Customer
            </option>
          </select>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-semibold rounded-lg px-4 py-2 transition"
          >
            <PlusIcon className="w-4 h-4" />{" "}
            {isEditing ? "Update User" : "Create User"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-lg px-4 py-2 transition"
          >
            <XMarkIcon className="w-4 h-4" /> Cancel
          </button>
        </form>
      </div>

      {/* Table Card */}
      <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden shadow-xl transition hover:shadow-2xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/80 text-slate-300">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Company</th>
              <th className="p-4 text-left">Address</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-6 text-center text-slate-400">
                  No users found
                </td>
              </tr>
            ) : (
              currentUsers.map((user) => (
                <tr
                  key={user._id}
                  className="border-t border-slate-800 hover:bg-slate-800/40 transition"
                >
                  <td className="p-4 text-slate-200">{user.name}</td>
                  <td className="p-4 text-slate-300">{user.email}</td>
                  <td className="p-4 text-slate-300">{user.phone}</td>
                  <td className="p-4 text-slate-300 truncate">
                    {user.companyId?.name || "-"}
                  </td>
                  <td className="p-4 text-slate-300 truncate max-w-xs">
                    {user.address}
                  </td>
                  <td className="p-4 text-slate-300">{user.role}</td>
                  <td className="p-4 flex justify-end gap-2">
                    <button
                      onClick={() => handleView(user)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
                    >
                      <EyeIcon className="w-4 h-4 text-slate-200" />
                    </button>
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
                    >
                      <PencilIcon className="w-4 h-4 text-slate-200" />
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/30"
                    >
                      <TrashIcon className="w-4 h-4 text-red-400" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 p-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600"
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      {modalUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-3xl p-6 w-96 shadow-2xl transform transition-transform duration-300 scale-95 animate-scaleUp">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-emerald-400">
                User Details
              </h2>
              <button
                onClick={() => setModalUser(null)}
                className="p-1 rounded-full hover:bg-slate-700 transition"
              >
                <XMarkIcon className="w-5 h-5 text-slate-200" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-2 text-slate-200">
              <p>
                <span className="font-semibold text-emerald-400">Name:</span>{" "}
                {modalUser.name}
              </p>
              <p>
                <span className="font-semibold text-emerald-400">Email:</span>{" "}
                {modalUser.email}
              </p>
              <p>
                <span className="font-semibold text-emerald-400">Phone:</span>{" "}
                {modalUser.phone}
              </p>
              <p>
                <span className="font-semibold text-emerald-400">Company:</span>{" "}
                {modalUser.companyId?.name || "-"}
              </p>
              <p>
                <span className="font-semibold text-emerald-400">Address:</span>{" "}
                {modalUser.address}
              </p>
              <p>
                <span className="font-semibold text-emerald-400">Role:</span>{" "}
                {modalUser.role}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setModalUser(null)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-semibold rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
