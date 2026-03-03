import { useEffect, useState } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  Squares2X2Icon,
  PhotoIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [photoFilter, setPhotoFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    photo: "",
  });

  const API_CATEGORY = "http://localhost:3000/api/category";

  /* ================= FETCH ================= */
  const fetchCategories = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_CATEGORY}/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setCategories(data.data || []);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ================= FORM ================= */
  const resetForm = () => {
    setForm({ name: "", photo: "" });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const url = isEditing
      ? `${API_CATEGORY}/${editingId}`
      : `${API_CATEGORY}/create`;

    await fetch(url, {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    fetchCategories();
    resetForm();
  };

  const handleEdit = (category) => {
    setForm({
      name: category.name,
      photo: category.photo,
    });
    setIsEditing(true);
    setEditingId(category._id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this category?")) return;
    const token = localStorage.getItem("token");
    await fetch(`${API_CATEGORY}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setCategories(categories.filter((c) => c._id !== id));
  };

  /* ================= UI ================= */
  const term = search.trim().toLowerCase();
  const filteredCategories = categories.filter((c) => {
    if (photoFilter === "with") return !!c.photo;
    if (photoFilter === "without") return !c.photo;
    if (!term) return true;
    return c.name?.toLowerCase().includes(term);
  });

  return (
    <div className="min-h-screen anim-fade-in-up bg-white text-[#0f172a]">
      <div className="px-6 py-6 sm:px-10 space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] p-6 sm:p-8 shadow-lg border border-[#cbd5e1]">
          <p className="text-sm uppercase tracking-[0.2em] text-[#475569]">
            Admin Console
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold">
            Category Management
          </h1>
          <p className="text-sm text-[#475569] mt-2">
            Create, edit, and organize menu categories.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setPhotoFilter("all")}
            className={`text-left rounded-2xl bg-[#f1f5f9] border px-4 py-4 transition ${
              photoFilter === "all"
                ? "border-[#e2e8f0] ring-1 ring-[#e2e8f0]/30"
                : "border-[#cbd5e1]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#475569]">
                  Total Categories
                </p>
                <p className="text-2xl font-semibold mt-2">
                  {categories.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-[#f1f5f9] border border-[#cbd5e1]">
                <Squares2X2Icon className="w-6 h-6 text-[#475569]" />
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setPhotoFilter("with")}
            className={`text-left rounded-2xl bg-[#f1f5f9] border px-4 py-4 transition ${
              photoFilter === "with"
                ? "border-[#e2e8f0] ring-1 ring-[#e2e8f0]/30"
                : "border-[#cbd5e1]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#475569]">
                  With Photos
                </p>
                <p className="text-2xl font-semibold mt-2">
                  {categories.filter((c) => c.photo).length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-[#f1f5f9] border border-[#cbd5e1]">
                <PhotoIcon className="w-6 h-6 text-[#16a34a]" />
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setPhotoFilter("without")}
            className={`text-left rounded-2xl bg-[#f1f5f9] border px-4 py-4 transition ${
              photoFilter === "without"
                ? "border-[#e2e8f0] ring-1 ring-[#e2e8f0]/30"
                : "border-[#cbd5e1]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#475569]">
                  No Photo
                </p>
                <p className="text-2xl font-semibold mt-2">
                  {categories.filter((c) => !c.photo).length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-[#f1f5f9] border border-[#cbd5e1]">
                <NoSymbolIcon className="w-6 h-6 text-[#dc2626]" />
              </div>
            </div>
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 rounded-full bg-[#f1f5f9] border border-[#cbd5e1] px-4 py-2">
            <span className="text-sm text-[#475569]">Search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Category name"
              className="bg-transparent text-sm outline-none placeholder:text-[#b5a397] w-60"
            />
          </div>
        </div>

        {/* FORM */}
        <div className="rounded-3xl border border-[#cbd5e1] bg-[#f8fafc] shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">
            {isEditing ? "Update Category" : "Create Category"}
          </h2>

          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Category Name"
              required
              className="bg-[#f1f5f9] border border-[#cbd5e1] rounded-2xl px-4 py-3 text-sm text-[#0f172a] placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#e2e8f0]/15"
            />

            <input
              name="photo"
              value={form.photo}
              onChange={handleChange}
              placeholder="Photo URL"
              className="bg-[#f1f5f9] border border-[#cbd5e1] rounded-2xl px-4 py-3 text-sm text-[#0f172a] placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#e2e8f0]/15"
            />

            <div className="flex gap-2 md:col-span-2">
              <button
                className="rounded-full bg-[#e2e8f0] text-[#0f172a] px-5 py-3 text-sm font-semibold border border-[#e2e8f0] hover:bg-[#0ea5e9] flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                {isEditing ? "Update Category" : "Create Category"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-full bg-[#f8fafc] border border-[#cbd5e1] px-5 py-3 text-sm font-semibold text-[#475569] hover:bg-[#e2e8f0] flex items-center gap-2"
              >
                <XMarkIcon className="w-4 h-4" /> Cancel
              </button>
            </div>
          </form>
        </div>

        {/* CATEGORY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((cat) => (
            <div
              key={cat._id}
              className="rounded-3xl border border-[#cbd5e1] bg-[#f8fafc] shadow-sm p-6 flex flex-col"
            >
              <div className="flex justify-center mb-4">
                <div className="w-36 h-36 rounded-full overflow-hidden bg-[#f1f5f9] border border-[#cbd5e1] flex items-center justify-center">
                  {cat.photo ? (
                    <img
                      src={cat.photo}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[#475569] text-sm">No Image</span>
                  )}
                </div>
              </div>

              <h3 className="text-sm font-semibold text-center text-[#0f172a]">
                {cat.name}
              </h3>

              <p className="text-xs text-center text-[#475569] mt-1">
                Category
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleEdit(cat)}
                  className="flex-1 rounded-full bg-[#e2e8f0] text-[#0f172a] py-2 text-sm font-semibold border border-[#e2e8f0] hover:bg-[#0ea5e9]"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(cat._id)}
                  className="flex-1 rounded-full bg-[#f8fafc] border border-[#cbd5e1] text-[#475569] py-2 text-sm font-semibold hover:bg-[#e2e8f0]"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-[#e2e8f0] p-10 text-center text-[#475569]">
            No categories match the current filter.
          </div>
        )}
      </div>
    </div>
  );
}
