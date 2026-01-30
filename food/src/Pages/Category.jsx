import { useEffect, useState } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    photo: "",
  });

  const API_CATEGORY = "http://localhost:3000/api/category";

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500";

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
  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100">
      <h1 className="text-2xl font-bold text-center text-emerald-400 mb-6">
        Category Management
      </h1>

      {/* FORM */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 mb-10">
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
            className={inputClass}
          />

          <input
            name="photo"
            value={form.photo}
            onChange={handleChange}
            placeholder="Photo URL"
            className={inputClass}
          />

          <div className="flex gap-2 md:col-span-2">
            <button className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-semibold px-5 py-3 rounded-xl flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              {isEditing ? "Update Category" : "Create Category"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="bg-slate-700 hover:bg-slate-600 px-5 py-3 rounded-xl flex items-center gap-2"
            >
              <XMarkIcon className="w-4 h-4" /> Cancel
            </button>
          </div>
        </form>
      </div>

      {/* CATEGORY CARDS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
  {categories.map((cat) => (
    <div
      key={cat._id}
      className="group relative bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden
                 hover:border-emerald-500/60 hover:shadow-2xl transition-all duration-300"
    >
      {/* IMAGE */}
      <div className="relative h-72 overflow-hidden">
        {cat.photo ? (
          <img
            src={cat.photo}
            alt={cat.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm bg-slate-900">
            No Image
          </div>
        )}

        {/* GRADIENT OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {/* CONTENT */}
      <div className="p-5">
        <h3 className="text-lg font-semibold tracking-wide text-slate-100">
          {cat.name}
        </h3>

        <p className="text-xs text-slate-400 mt-1">
          Category
        </p>
      </div>

      {/* ACTION BUTTONS */}
      <div
        className="absolute bottom-4 right-4 flex gap-2 opacity-0
                   group-hover:opacity-100 transition-opacity"
      >
        <button
          onClick={() => handleEdit(cat)}
          className="p-2 rounded-lg bg-slate-900/80 backdrop-blur
                     hover:bg-blue-500/20 border border-slate-700"
        >
          <PencilIcon className="w-4 h-4 text-blue-400" />
        </button>

        <button
          onClick={() => handleDelete(cat._id)}
          className="p-2 rounded-lg bg-slate-900/80 backdrop-blur
                     hover:bg-red-500/20 border border-slate-700"
        >
          <TrashIcon className="w-4 h-4 text-red-400" />
        </button>
      </div>
    </div>
  ))}
</div>

    </div>
  );
}
