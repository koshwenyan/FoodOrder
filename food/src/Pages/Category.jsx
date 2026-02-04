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
    <div className="min-h-screen bg-[#ECEFF1] p-8 space-y-6">

      {/* TITLE */}
      <h1 className="text-3xl font-bold text-[#111827]">
        Category Management
      </h1>

      {/* FORM */}
      <div className="bg-white rounded-xl shadow-md p-6 text-[#111827]">
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
            className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2"
          />

          <input
            name="photo"
            value={form.photo}
            onChange={handleChange}
            placeholder="Photo URL"
            className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2"
          />

          <div className="flex gap-2 md:col-span-2">
            <button
              className="bg-[#1F2933] hover:bg-black text-white rounded-lg px-5 py-2 flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              {isEditing ? "Update Category" : "Create Category"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-200 hover:bg-gray-300 rounded-lg px-5 py-2 flex items-center gap-2"
            >
              <XMarkIcon className="w-4 h-4" /> Cancel
            </button>
          </div>
        </form>
      </div>

     
      {/* CATEGORY CARDS */}
{/* CATEGORY CARDS */}
<div className="flex flex-wrap gap-24">
  {categories.map((cat) => (
    <div
      key={cat._id}
      className="w-[260px] bg-[#E5E7E7] rounded-md shadow-md p-4"
    >
      {/* IMAGE */}
     {/* IMAGE */}
<div className="flex justify-center mb-4">
  <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
    {cat.photo ? (
      <img
        src={cat.photo}
        alt={cat.name}
        className="w-full h-full object-cover"
      />
    ) : (
      <span className="text-gray-500 text-sm">No Image</span>
    )}
  </div>
</div>


      {/* NAME */}
      <h3 className="text-sm font-semibold text-center text-[#111827]">
        {cat.name}
      </h3>

      <p className="text-xs text-center text-gray-500 mt-1">
        Category
      </p>

      {/* ACTION BAR */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => handleEdit(cat)}
          className="flex-1 bg-[#1F2933] hover:bg-black text-white py-2 text-sm rounded"
        >
          Edit
        </button>

        <button
          onClick={() => handleDelete(cat._id)}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-[#111827] py-2 text-sm rounded"
        >
          Delete
        </button>
      </div>
    </div>
  ))}
</div>



    </div>
  );
}
