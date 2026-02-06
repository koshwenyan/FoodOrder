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
          {categories.map((cat) => (
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
      </div>
    </div>
  );
}
