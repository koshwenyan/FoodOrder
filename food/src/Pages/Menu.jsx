import { useState, useEffect } from "react";
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
  const API_CATEGORY = "http://localhost:3000/api/category";

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500";

  /* ================= FETCH ================= */
  const fetchMenus = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_MENU}/my-shop`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    console.log("Menu data:", data);
    // normalize isAvailable
    const normalizedMenus = (data.data || []).map((m) => ({
      ...m,
      isAvailable: m.isAvailable === true || m.isAvailable === "true",
    }));

    setMenus(normalizedMenus);
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
    <div className="p-6 bg-[#ECEFF1] min-h-screen text-gray-900">
      <h1 className="text-2xl font-bold text-center text-slate-900 mb-6">
        Menu Management
      </h1>

      {/* FORM */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-10 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">
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

          <label className="flex items-center gap-2 md:col-span-2 text-sm text-gray-900">
            <input
              type="checkbox"
              name="isAvailable"
              checked={form.isAvailable}
              onChange={handleChange}
              className="accent-emerald-500"
            />
            Available
          </label>

          <div className="flex gap-2 md:col-span-2">
            <button className="bg-gray-900 hover:bg-black text-white font-semibold px-5 py-3 rounded-lg flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              {isEditing ? "Update Menu" : "Create Menu"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-200 hover:bg-gray-300 px-5 py-3 rounded-lg flex items-center gap-2"
            >
              <XMarkIcon className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* MENU CARDS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {menus.map((menu) => (
          <div
            key={menu._id}
            className="relative group bg-white rounded-xl p-6 text-center shadow hover:shadow-lg"
          >
            {/* IMAGE */}
            <div className="relative w-full h-48 flex items-center justify-center mb-4">
              {menu.image ? (
                <img
                  src={menu.image}
                  alt={menu.name}
                  className="h-full object-contain transition-transform duration-300 group-hover:scale-105 rounded-xl"
                />
              ) : (
                <div className="text-gray-400">No Image</div>
              )}

              {/* AVAILABLE BADGE */}
              <span
                className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full ${
                  menu.isAvailable
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {menu.isAvailable ? "Available" : "Unavailable"}
              </span>

              {/* ACTION ICONS */}
              <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => handleEdit(menu)}
                  className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 shadow"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(menu._id)}
                  className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 shadow"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* NAME */}
            <h3 className="text-sm font-semibold text-gray-900 uppercase">
              {menu.name}
            </h3>
             <h4 className="text-sm font-medium text-gray-400 uppercase">
              {menu.category.name}
            </h4>
             <h5 className="text-sm font-semibold text-gray-900 uppercase">
              {menu.description}
            </h5>

            {/* PRICE */}
            <p className="text-sm text-gray-500 mt-1">
              {menu.price.toLocaleString()} Ks
            </p>

            {/* BUTTON */}
            <button
              disabled={!menu.isAvailable}
              className={`mt-4 w-full py-2 text-sm rounded transition font-semibold ${
                menu.isAvailable
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
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
