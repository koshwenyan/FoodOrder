import { useState, useEffect } from "react";
import { PencilIcon, TrashIcon, XMarkIcon, EyeIcon } from "@heroicons/react/24/outline";

export default function DeliveryCompanies() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    serviceFee: "",
    staffCount: "",
    isActive: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  const API_BASE = "http://localhost:3000/api/company";

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(API_BASE, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setCompanies(data.data || []);
  };

  const resetForm = () => {
    setForm({ name: "", email: "", serviceFee: "", staffCount: "", isActive: true });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const url = isEditing ? `${API_BASE}/${editingId}` : `${API_BASE}/create`;

    await fetch(url, {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...form,
        serviceFee: Number(form.serviceFee),
        staffCount: Number(form.staffCount),
      }),
    });

    fetchCompanies();
    resetForm();
  };

  const handleEdit = (company) => {
    setForm({
      name: company.name,
      email: company.email,
      serviceFee: company.serviceFee,
      staffCount: company.staffCount,
      isActive: company.isActive,
    });
    setIsEditing(true);
    setEditingId(company._id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this company?")) return;
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    fetchCompanies();
  };

  const toggleActive = async (company) => {
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE}/${company._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isActive: !company.isActive }),
    });
    fetchCompanies();
  };

  const filtered = companies.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const currentCompanies = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="min-h-screen bg-[#ECEFF1] p-8 space-y-6">

      <h1 className="text-3xl font-bold text-[#111827] text-center">Delivery Companies Management</h1>

      {/* FORM */}
      <div className="bg-white rounded-xl shadow-md p-6 grid md:grid-cols-3 gap-4 text-[#111827]">

        {["name", "email", "serviceFee", "staffCount"].map((f) => (
          <input
            key={f}
            type={f === "serviceFee" || f === "staffCount" ? "number" : "text"}
            placeholder={f}
            value={form[f]}
            onChange={(e) => setForm({ ...form, [f]: e.target.value })}
            className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2"
          />
        ))}

        <select
          value={form.isActive ? "active" : "inactive"}
          onChange={(e) => setForm({ ...form, isActive: e.target.value === "active" })}
          className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button onClick={handleSubmit} className="bg-[#1F2933] hover:bg-black text-white rounded-lg py-2">
          {isEditing ? "Update Company" : "Create Company"}
        </button>

        <button onClick={resetForm} className="bg-gray-200 hover:bg-gray-300 rounded-lg py-2">Cancel</button>
      </div>

      {/* SEARCH */}
      <div className="max-w-md mx-auto">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-[#F5F6F7]"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="p-4 text-left">No</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Service Fee</th>
              <th className="p-4 text-left">Staff Count</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentCompanies.map((c, i) => (
              <tr key={c._id} className="border-t hover:bg-gray-50 text-[#111827]">
                <td className="p-4">{(currentPage - 1) * perPage + i + 1}</td>
                <td className="p-4 font-medium">{c.name}</td>
                <td className="p-4 text-gray-500">{c.email}</td>
                <td className="p-4">{c.serviceFee}</td>
                <td className="p-4">{c.staffCount}</td>
                <td className="p-4">{c.isActive ? "Active" : "Inactive"}</td>
                <td className="p-4 flex justify-end gap-2">
                  <button onClick={() => handleEdit(c)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded">
                    <PencilIcon className="w-4 h-4 text-blue-600" />
                  </button>
                  <button onClick={() => handleDelete(c._id)} className="p-2 bg-red-100 hover:bg-red-200 rounded">
                    <TrashIcon className="w-4 h-4 text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center gap-4 text-[#111827]">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
          className="px-4 py-2 bg-white border rounded disabled:opacity-40">Prev</button>
        <span className="px-4 py-2">{currentPage} / {totalPages}</span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
          className="px-4 py-2 bg-white border rounded disabled:opacity-40">Next</button>
      </div>
    </div>
  );
}
