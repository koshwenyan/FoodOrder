import { useState, useEffect } from "react";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  XMarkIcon
  
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

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to fetch users");
      }
      const data = await res.json();
      setUsers(data.users || data);
    } catch (err) {
      console.error("Fetch users error:", err.message);
      setUsers([]);
    }
  };

  console.log("users",users)

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
      if (!token) throw new Error("No token found");

      const payload = {
        ...form,
        name: form.name,
        email: form.email,
        password: form.password || undefined,
        phone: form.phone,
        company: form.companyId, // send ID
        address: form.address,
        role: form.role,
      };

      let res, data;

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

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Server error:", errData);
        throw new Error(errData.message || "Request failed");
      }

      data = await res.json();
      fetchUsers(); // reload users from backend
      resetForm();
    } catch (err) {
      console.error("Submit error:", err.message);
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

  const handleCancel = () => {
    resetForm();
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Delete failed");
      }
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Delete error:", err.message);
    }
  };

  const handleView = (user) => setModalUser(user);

  // Pagination logic
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentUsers = users.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(users.length / perPage);

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      {/* Form */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {isEditing ? "Update User" : "Create User"}
        </h2>
        <form className="grid md:grid-cols-3 gap-4" onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required={!isEditing}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            disabled={isEditing}
            
          />
          <input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
           <input
            name="companyName"
            type="text"
            placeholder="Company"
            value={form.companyName}
            onChange={handleChange}
            required={!isEditing}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            disabled={isEditing}
            
          />
          <input
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <select
            name="role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="admin">Admin</option>
            <option value="shop-admin">Shop Admin</option>
            <option value="company-admin">Company Admin</option>
            <option value="company-staff">Company Staff</option>
            <option value="customer">Customer</option>
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
            onClick={handleCancel}
            className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-lg px-4 py-2 transition">
            
          
            <XMarkIcon className="w-4 h-4" /> Cancel
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-slate-200">
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
                <td colSpan="6" className="p-6 text-center text-slate-400">
                  No users found
                </td>
              </tr>
            ) : (
              currentUsers.map((user) => (
                <tr
                  key={user._id}
                  className="border-t border-slate-800 hover:bg-slate-800/50"
                >
                  <td className="p-4 text-slate-200">{user.name}</td>
                  <td className="p-4 text-slate-300">{user.email}</td>
                  <td className="p-4 text-slate-300">{user.phone}</td>
                  <td className="p-4 text-slate-300">{user.companyId?.name || "-"}</td>
                  <td className="p-4 text-slate-300 truncate max-w-xs">
                    {user.address}
                  </td>
                  <td className="p-4 text-slate-300">{user.role}</td>
                  <td className="p-4 flex justify-end gap-2">
                    <button
                      onClick={() => handleView(user)}
                      className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600"
                    >
                      <EyeIcon className="w-4 h-4 text-slate-200" />
                    </button>
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600"
                    >
                      <PencilIcon className="w-4 h-4 text-slate-200" />
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-950 p-6 rounded-xl w-96">
            <h2 className="text-xl font-bold mb-4">User Details</h2>
            <p>
              <strong>Name:</strong> {modalUser.name}
            </p>
            <p>
              <strong>Email:</strong> {modalUser.email}
            </p>
            <p>
              <strong>Phone:</strong> {modalUser.phone}
            </p>
            <p>
              <strong>Company:</strong> {modalUser.companyId?.name}
            </p>
            <p>
              <strong>Address:</strong> {modalUser.address}
            </p>
            <p>
              <strong>Role:</strong> {modalUser.role}
            </p>
            <button
              onClick={() => setModalUser(null)}
              className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
