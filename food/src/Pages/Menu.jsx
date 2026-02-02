import { useEffect, useState } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function Menus() {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    image: "",
    isAvailable: true,
  });

  const API_MENU = "http://localhost:3000/api/menu";
  const SHOP_ID = localStorage.getItem("shopId"); // or from auth context

  const API_CATEGORY = "http://localhost:3000/api/category";

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500";

  /* ================= FETCH ================= */
  const fetchMenus = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:3000/api/menu/my-shop", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  setMenus(data.data || []);
};

  const fetchCategories = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_CATEGORY}/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setCategories(data.data || []);
  };

  useEffect(() => {
    fetchMenus();
    fetchCategories();
  }, []);

  /* ================= FORM ================= */
  const resetForm = () => {
    setForm({
      name: "",
      category: "",
      description: "",
      price: "",
      image: "",
      isAvailable: true,
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const url = isEditing
      ? `${API_MENU}/update/${editingId}`
      : `${API_MENU}/create`;

    await fetch(url, {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
      }),
    });

    fetchMenus();
    resetForm();
  };

  const handleEdit = (menu) => {
    setForm({
      name: menu.name,
      category: menu.category?._id || menu.category,
      description: menu.description,
      price: menu.price,
      image: menu.image,
      isAvailable: menu.isAvailable,
    });
    setIsEditing(true);
    setEditingId(menu._id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this menu item?")) return;
    const token = localStorage.getItem("token");
    await fetch(`${API_MENU}/delete/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setMenus(menus.filter((m) => m._id !== id));
  };

  /* ================= UI ================= */
  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100">
      <h1 className="text-2xl font-bold text-center text-emerald-400 mb-6">
        Menu Management
      </h1>

      {/* FORM */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 mb-10">
        <h2 className="text-lg font-semibold mb-4">
          {isEditing ? "Update Menu" : "Create Menu"}
        </h2>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Menu Name"
            required
            className={inputClass}
          />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className={inputClass}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            placeholder="Price"
            required
            className={inputClass}
          />

          <input
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="Image URL"
            className={inputClass}
          />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className={`${inputClass} md:col-span-2`}
          />

          <label className="flex items-center gap-2 md:col-span-2 text-sm">
            <input
              type="checkbox"
              name="isAvailable"
              checked={form.isAvailable}
              onChange={handleChange}
            />
            Available
          </label>

          <div className="flex gap-2 md:col-span-2">
            <button className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-semibold px-5 py-3 rounded-xl flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              {isEditing ? "Update Menu" : "Create Menu"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="bg-slate-700 hover:bg-slate-600 px-5 py-3 rounded-xl flex items-center gap-2"
            >
              <XMarkIcon className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* MENU CARDS */}

      {/* MENU CARDS */}
<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
  {menus.map((menu) => (
    <div
      key={menu._id}
      className="relative group bg-slate-200 rounded-xl p-6 text-center
                 shadow hover:shadow-lg transition"
    >
      {/* IMAGE */}
      <div className="relative w-full h-48 flex items-center justify-center mb-4">
        {menu.image ? (
          <img
            src={menu.image}
            alt={menu.name}
            className="h-full object-contain
                       transition-transform duration-300
                       group-hover:scale-105"
          />
        ) : (
          <div className="text-slate-500">No Image</div>
        )}

        {/* AVAILABLE BADGE */}
        <span
          className={`absolute top-2 right-2 text-xs px-2 py-1 rounded
            ${
              menu.isAvailable
                ? "bg-emerald-500 text-white"
                : "bg-red-500 text-white"
            }`}
        >
          {menu.isAvailable ? "Available" : "Unavailable"}
        </span>

        {/* ACTION ICONS – SHOW WHEN CARD HOVER */}
        <div
          className="absolute bottom-2 right-2 flex gap-2
                     opacity-0 group-hover:opacity-100 transition"
        >
          <button
            onClick={() => handleEdit(menu)}
            className="p-2 rounded-full bg-blue-500 text-white
                       hover:bg-blue-600 shadow"
          >
            <PencilIcon className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleDelete(menu._id)}
            className="p-2 rounded-full bg-red-500 text-white
                       hover:bg-red-600 shadow"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* NAME */}
      <h3 className="text-sm font-semibold text-slate-800 uppercase">
        {menu.name}
      </h3>

      {/* PRICE */}
      <p className="text-sm text-slate-700 mt-1">
        {menu.price.toLocaleString()} Ks
      </p>

      {/* BUTTON */}
      <button
        disabled={!menu.isAvailable}
        className={`mt-4 w-full py-2 text-sm rounded transition
          ${
            menu.isAvailable
              ? "bg-slate-900 text-white hover:bg-slate-800"
              : "bg-slate-400 text-slate-200 cursor-not-allowed"
          }`}
      >
        Add To Cart
      </button>
    </div>
  ))}
</div>

    </div>
  );
}
