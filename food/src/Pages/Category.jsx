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
    <div className="min-h-screen bg-[#f6f1eb] text-[#1f1a17]">
      <div className="px-6 py-6 sm:px-10 space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-[#f9e9d7] via-[#f8f3ee] to-[#f2ddc7] p-6 sm:p-8 shadow-lg border border-[#ead8c7]">
          <p className="text-sm uppercase tracking-[0.2em] text-[#8b6b4f]">
            Admin Console
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold">
            Category Management
          </h1>
          <p className="text-sm text-[#6c5645] mt-2">
            Create, edit, and organize menu categories.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setPhotoFilter("all")}
            className={`text-left rounded-2xl bg-white/80 border px-4 py-4 transition ${
              photoFilter === "all"
                ? "border-[#1f1a17] ring-1 ring-[#1f1a17]/30"
                : "border-[#e7d5c4]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#8b6b4f]">
                  Total Categories
                </p>
                <p className="text-2xl font-semibold mt-2">
                  {categories.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-[#f9f4ef] border border-[#ead8c7]">
                <Squares2X2Icon className="w-6 h-6 text-[#8b6b4f]" />
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setPhotoFilter("with")}
            className={`text-left rounded-2xl bg-white/80 border px-4 py-4 transition ${
              photoFilter === "with"
                ? "border-[#1f1a17] ring-1 ring-[#1f1a17]/30"
                : "border-[#e7d5c4]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#8b6b4f]">
                  With Photos
                </p>
                <p className="text-2xl font-semibold mt-2">
                  {categories.filter((c) => c.photo).length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-[#e7eddc] border border-[#c9d8b7]">
                <PhotoIcon className="w-6 h-6 text-[#5b7a40]" />
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setPhotoFilter("without")}
            className={`text-left rounded-2xl bg-white/80 border px-4 py-4 transition ${
              photoFilter === "without"
                ? "border-[#1f1a17] ring-1 ring-[#1f1a17]/30"
                : "border-[#e7d5c4]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#8b6b4f]">
                  No Photo
                </p>
                <p className="text-2xl font-semibold mt-2">
                  {categories.filter((c) => !c.photo).length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-[#f3d7cf] border border-[#e8c4b9]">
                <NoSymbolIcon className="w-6 h-6 text-[#a4553a]" />
              </div>
            </div>
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 rounded-full bg-white/80 border border-[#e7d5c4] px-4 py-2">
            <span className="text-sm text-[#8b6b4f]">Search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Category name"
              className="bg-transparent text-sm outline-none placeholder:text-[#b5a397] w-60"
            />
          </div>
        </div>

        {/* FORM */}
        <div className="rounded-3xl border border-[#ead8c7] bg-white/90 shadow-sm p-6">
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
              className="bg-[#fbf7f2] border border-[#ead8c7] rounded-2xl px-4 py-3 text-sm text-[#1f1a17] placeholder:text-[#8b6b4f] focus:outline-none focus:ring-2 focus:ring-[#1f1a17]/15"
            />

            <input
              name="photo"
              value={form.photo}
              onChange={handleChange}
              placeholder="Photo URL"
              className="bg-[#fbf7f2] border border-[#ead8c7] rounded-2xl px-4 py-3 text-sm text-[#1f1a17] placeholder:text-[#8b6b4f] focus:outline-none focus:ring-2 focus:ring-[#1f1a17]/15"
            />

            <div className="flex gap-2 md:col-span-2">
              <button
                className="rounded-full bg-[#1f1a17] text-[#f8f3ee] px-5 py-3 text-sm font-semibold border border-[#1f1a17] hover:bg-[#2b241f] flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                {isEditing ? "Update Category" : "Create Category"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-full bg-white border border-[#e7d5c4] px-5 py-3 text-sm font-semibold text-[#6c5645] hover:bg-[#fbf7f2] flex items-center gap-2"
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
              className="rounded-3xl border border-[#ead8c7] bg-white/90 shadow-sm p-6 flex flex-col"
            >
              <div className="flex justify-center mb-4">
                <div className="w-36 h-36 rounded-full overflow-hidden bg-[#f9f4ef] border border-[#ead8c7] flex items-center justify-center">
                  {cat.photo ? (
                    <img
                      src={cat.photo}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[#8b6b4f] text-sm">No Image</span>
                  )}
                </div>
              </div>

              <h3 className="text-sm font-semibold text-center text-[#1f1a17]">
                {cat.name}
              </h3>

              <p className="text-xs text-center text-[#6c5645] mt-1">
                Category
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleEdit(cat)}
                  className="flex-1 rounded-full bg-[#1f1a17] text-[#f8f3ee] py-2 text-sm font-semibold border border-[#1f1a17] hover:bg-[#2b241f]"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(cat._id)}
                  className="flex-1 rounded-full bg-white border border-[#e7d5c4] text-[#6c5645] py-2 text-sm font-semibold hover:bg-[#fbf7f2]"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#d6c3b2] bg-white/70 p-10 text-center text-[#6c5645]">
            No categories match the current filter.
          </div>
        )}
      </div>
    </div>
  );
}
