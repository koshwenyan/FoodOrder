import { useState } from "react";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";

export default function Users() {
  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({
    id: null,
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "Customer", // default role
  });

  const isEditing = form.id !== null;

   const API_URL = "http://localhost:3000/api/user/all"; 

   const fetchUsers = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to fetch users");
    }

    const data = await response.json();
    setUsers(data.users || data); // depending on backend
  } catch (error) {
    console.error("Error fetching users:", error.message);
    setUsers([]); // prevent crash
  }
};


   useEffect(() => {
     fetchUsers();
   }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      id: null,
      name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      role: "Customer",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      setUsers(users.map((u) => (u.id === form.id ? form : u)));
    } else {
      setUsers([...users, { ...form, id: Date.now() }]);
    }
    resetForm();
  };

  const handleEdit = (user) => {
  setForm({
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    role: user.role,
    password: "",
  });
};


  const handleDelete = (id) => {
    if (confirm("Delete this user?")) setUsers(users.filter((u) => u.id !== id));
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100">
      {/* Header */}
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
          />

          <input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <input
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 md:col-span-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          {/* Role selection */}
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option>Admin</option>
            <option>Customer</option>
          </select>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-semibold rounded-lg px-4 py-2 transition"
          >
            <PlusIcon className="w-4 h-4" />
            {isEditing ? "Update User" : "Create User"}
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
              <th className="p-4 text-left">Address</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-slate-400">
                  No users found
                </td>
              </tr>
            ) : (
             users.map((user) => (
  <tr
    key={user._id}
    className="border-t border-slate-800 hover:bg-slate-800/50"
  >
    <td className="p-4 text-slate-200">{user.name}</td>
    <td className="p-4 text-slate-300">{user.email}</td>
    <td className="p-4 text-slate-300">{user.phone}</td>
    <td className="p-4 text-slate-300 truncate max-w-xs">
      {user.address}
    </td>
    <td className="p-4 text-slate-300">{user.role}</td>
    <td className="p-4 flex justify-end gap-2">
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
      </div>
    </div>
  );
}
