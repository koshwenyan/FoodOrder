import { useState, useEffect } from "react";
import {
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  EyeIcon,
  TruckIcon,
  CheckBadgeIcon,
  NoSymbolIcon,
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState(null);
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
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    fetchCompanies();
    setConfirmDelete(null);
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

  const filtered = companies.filter((c) => {
    if (statusFilter === "active" && !c.isActive) return false;
    if (statusFilter === "inactive" && c.isActive) return false;
    return (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const currentCompanies = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalCompanies = companies.length;
  const activeCompanies = companies.filter((c) => c.isActive).length;
  const inactiveCompanies = totalCompanies - activeCompanies;

  return (
    <div className="min-h-screen bg-[#0f1115] text-[#f6f1e8]">
      <div className="px-6 py-6 sm:px-10 space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-[#1d222c] via-[#171a20] to-[#2a2f3a] p-6 sm:p-8 shadow-lg border border-[#2a2f3a]">
          <p className="text-sm uppercase tracking-[0.2em] text-[#c9a96a]">
            Admin Console
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold">
            Delivery Companies
          </h1>
          <p className="text-sm text-[#a8905d] mt-2">
            Manage delivery partners, fees, and staffing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`text-left rounded-2xl bg-[#1d222c] border px-4 py-4 transition ${
              statusFilter === "all"
                ? "border-[#f6f1e8] ring-1 ring-[#f6f1e8]/30"
                : "border-[#2a2f3a]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#c9a96a]">
                  Total Companies
                </p>
                <p className="text-2xl font-semibold mt-2">{totalCompanies}</p>
              </div>
              <div className="p-3 rounded-full bg-[#1d222c] border border-[#2a2f3a]">
                <TruckIcon className="w-6 h-6 text-[#c9a96a]" />
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`text-left rounded-2xl bg-[#1d222c] border px-4 py-4 transition ${
              statusFilter === "active"
                ? "border-[#f6f1e8] ring-1 ring-[#f6f1e8]/30"
                : "border-[#2a2f3a]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#c9a96a]">
                  Active
                </p>
                <p className="text-2xl font-semibold mt-2">{activeCompanies}</p>
              </div>
              <div className="p-3 rounded-full bg-[#1d222c] border border-[#2a2f3a]">
                <CheckBadgeIcon className="w-6 h-6 text-[#5b7a40]" />
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("inactive")}
            className={`text-left rounded-2xl bg-[#1d222c] border px-4 py-4 transition ${
              statusFilter === "inactive"
                ? "border-[#f6f1e8] ring-1 ring-[#f6f1e8]/30"
                : "border-[#2a2f3a]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#c9a96a]">
                  Inactive
                </p>
                <p className="text-2xl font-semibold mt-2">{inactiveCompanies}</p>
              </div>
              <div className="p-3 rounded-full bg-[#1d222c] border border-[#2a2f3a]">
                <NoSymbolIcon className="w-6 h-6 text-[#a4553a]" />
              </div>
            </div>
          </button>
        </div>

        {/* FORM */}
        <div className="rounded-3xl border border-[#2a2f3a] bg-[#171a20] shadow-sm p-6 grid md:grid-cols-3 gap-4">
          {["name", "email", "serviceFee", "staffCount"].map((f) => (
            <input
              key={f}
              type={f === "serviceFee" || f === "staffCount" ? "number" : "text"}
              placeholder={f}
              value={form[f]}
              onChange={(e) => setForm({ ...form, [f]: e.target.value })}
              className="bg-[#1d222c] border border-[#2a2f3a] rounded-2xl px-4 py-3 text-sm text-[#f6f1e8] placeholder:text-[#c9a96a] focus:outline-none focus:ring-2 focus:ring-[#f6f1e8]/15"
            />
          ))}

          <select
            value={form.isActive ? "active" : "inactive"}
            onChange={(e) => setForm({ ...form, isActive: e.target.value === "active" })}
            className="bg-[#1d222c] border border-[#2a2f3a] rounded-2xl px-4 py-3 text-sm text-[#f6f1e8] focus:outline-none focus:ring-2 focus:ring-[#f6f1e8]/15"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            onClick={handleSubmit}
            className="rounded-full bg-[#f6f1e8] text-[#171a20] py-3 text-sm font-semibold border border-[#f6f1e8] hover:bg-[#c9a96a]"
          >
            {isEditing ? "Update Company" : "Create Company"}
          </button>

          <button
            onClick={resetForm}
            className="rounded-full bg-[#171a20] border border-[#2a2f3a] py-3 text-sm font-semibold text-[#a8905d] hover:bg-[#232833]"
          >
            Cancel
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-md w-full">
            <div className="flex items-center gap-2 rounded-full bg-[#1d222c] border border-[#2a2f3a] px-4 py-2">
              <span className="text-sm text-[#c9a96a]">Search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name or email"
                className="bg-transparent text-sm outline-none placeholder:text-[#b5a397] w-full"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-full border border-[#2a2f3a] bg-[#1d222c] px-4 py-2 text-sm text-[#a8905d] focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="rounded-3xl border border-[#2a2f3a] bg-[#171a20] shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#171a20] text-[#a8905d] uppercase text-xs">
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
                <tr key={c._id} className="border-t border-[#2a2f3a] hover:bg-[#232833] text-[#f6f1e8]">
                  <td className="p-4">{(currentPage - 1) * perPage + i + 1}</td>
                  <td className="p-4 font-medium">{c.name}</td>
                  <td className="p-4 text-[#a8905d]">{c.email}</td>
                  <td className="p-4">{c.serviceFee}</td>
                  <td className="p-4">{c.staffCount}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${c.isActive ? "bg-[#1d222c] text-[#5b7a40]" : "bg-[#1d222c] text-[#a4553a]"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    <button onClick={() => handleEdit(c)} className="p-2 bg-[#1d222c] hover:bg-[#232833] rounded">
                      <PencilIcon className="w-4 h-4 text-[#a8905d]" />
                    </button>
                    <button onClick={() => setConfirmDelete(c)} className="p-2 bg-[#1d222c] hover:bg-[#2a2f3a] rounded">
                      <TrashIcon className="w-4 h-4 text-[#a4553a]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {currentCompanies.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#2a2f3a] bg-[#232833] p-10 text-center text-[#a8905d]">
            No delivery companies match your search.
          </div>
        )}

        {/* PAGINATION */}
        <div className="flex justify-center gap-4 text-[#f6f1e8]">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-4 py-2 bg-[#171a20] border border-[#2a2f3a] rounded-full disabled:opacity-40 text-sm"
          >
            Prev
          </button>
          <span className="px-4 py-2">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-4 py-2 bg-[#171a20] border border-[#2a2f3a] rounded-full disabled:opacity-40 text-sm"
          >
            Next
          </button>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl border border-[#2a2f3a] bg-[#171a20] p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[#f6f1e8]">
              Delete company?
            </h3>
            <p className="mt-2 text-sm text-[#a8905d]">
              This will permanently remove{" "}
              <span className="font-semibold">{confirmDelete.name}</span>.
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-full bg-[#171a20] border border-[#2a2f3a] px-4 py-2 text-sm font-semibold text-[#a8905d] hover:bg-[#232833]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete._id)}
                className="rounded-full bg-[#a4553a] text-white px-4 py-2 text-sm font-semibold hover:bg-[#8f4a34]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
