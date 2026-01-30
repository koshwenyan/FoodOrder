import { useState, useEffect } from "react";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

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

  /* ---------- STYLES ---------- */
  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500";

  /* ---------- HELPERS ---------- */
  const getInitial = (name) => name?.charAt(0).toUpperCase();

  /* ---------- FETCH ---------- */
  const fetchCompanies = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(API_BASE, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setCompanies(data.data || []);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  /* ---------- FORM ---------- */
  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      serviceFee: "",
      staffCount: "",
      isActive: true,
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const url = isEditing
      ? `${API_BASE}/${editingId}`
      : `${API_BASE}/create`;

    await fetch(url, {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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
    await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setCompanies(companies.filter((c) => c._id !== id));
  };

  const toggleActive = async (company) => {
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE}/${company._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isActive: !company.isActive }),
    });
    fetchCompanies();
  };

  /* ---------- SEARCH ---------- */
  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  /* ---------- PAGINATION ---------- */
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentCompanies = filteredCompanies.slice(
    indexOfFirst,
    indexOfLast
  );
  const totalPages = Math.ceil(filteredCompanies.length / perPage);

  /* ================= UI ================= */
  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100">
      <h1 className="text-2xl font-bold mb-6 text-center text-emerald-400">
        Delivery Companies Management
      </h1>

      {/* SEARCH */}
      <div className="mb-6 relative max-w-md mx-auto">
        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className={`${inputClass} pl-10`}
        />
      </div>

      {/* FORM */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 mb-10">
        <h2 className="text-lg font-semibold mb-4">
          {isEditing ? "Update Company" : "Create Company"}
        </h2>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Company Name"
            required
            className={inputClass}
          />

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className={inputClass}
          />

          <input
            type="number"
            name="serviceFee"
            value={form.serviceFee}
            onChange={handleChange}
            placeholder="Service Fee"
            className={inputClass}
          />

          <input
            type="number"
            name="staffCount"
            value={form.staffCount}
            onChange={handleChange}
            placeholder="Staff Count"
            className={inputClass}
          />

          <div className="flex gap-2 md:col-span-3">
            <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-semibold px-5 py-3 rounded-xl">
              <PlusIcon className="w-4 h-4" />
              {isEditing ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-5 py-3 rounded-xl"
            >
              <XMarkIcon className="w-4 h-4" /> Cancel
            </button>
          </div>
        </form>
      </div>

      {/* CARDS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentCompanies.map((company) => (
          <div
            key={company._id}
            className="bg-slate-950 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/50 hover:shadow-xl transition"
          >
            {/* HEADER */}
            <div className="flex items-center gap-4 mb-3">
              {/* ICON */}
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
                {getInitial(company.name)}
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-bold leading-tight">
                  {company.name}
                </h3>
                <p className="text-xs text-slate-400">
                  {company.email}
                </p>
              </div>

              {/* ACTIVE */}
              <button
                onClick={() => toggleActive(company)}
                className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  company.isActive
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {company.isActive ? "Active" : "Inactive"}
              </button>
            </div>

            {/* BODY */}
            <div className="space-y-1 text-sm">
              <p>💰 <span className="text-slate-400">Service Fee:</span> {company.serviceFee} Ks</p>
              <p>👥 <span className="text-slate-400">Staff:</span> {company.staffCount}</p>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => handleEdit(company)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
              >
                <PencilIcon className="w-4 h-4 text-blue-400" />
              </button>
              <button
                onClick={() => handleDelete(company._id)}
                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40"
              >
                <TrashIcon className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 rounded-lg font-semibold ${
                currentPage === i + 1
                  ? "bg-emerald-500 text-slate-900"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
