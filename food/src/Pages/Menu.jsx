import { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";

export default function Menus() {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    image: "",
    tagsInput: "",
    allergensInput: "",
    addOnsInput: "",
    isAvailable: true,
  });

  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  const API_MENU = "http://localhost:3000/api/menu";
  const API_CATEGORY = "http://localhost:3000/api/category";

  const inputClass =
    "w-full px-4 py-3 rounded-2xl bg-[#f9f4ef] border border-[#ead8c7] text-[#1f1a17] focus:outline-none focus:ring-2 focus:ring-[#1f1a17]/20";

  /* ================= FETCH ================= */
  const fetchMenus = async () => {
    setError("");
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You are not logged in.");
      return;
    }

    const res = await fetch(`${API_MENU}/my-shop`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data?.message || "Failed to load menu.");
      return;
    }

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
    if (res.ok) {
      setCategories(data.data || []);
    }
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
      tagsInput: "",
      allergensInput: "",
      addOnsInput: "",
      isAvailable: true,
    });
    setIsEditing(false);
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    setError("");

    if (!token) {
      setError("You are not logged in.");
      return;
    }
    if (user?.role !== "shop-admin") {
      setError("Only shop-admin can create menu items.");
      return;
    }

    const url = isEditing
      ? `${API_MENU}/update/${editingId}`
      : `${API_MENU}/create`;

    const res = await fetch(url, {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        tags: form.tagsInput
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        allergens: form.allergensInput
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        addOns: form.addOnsInput
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const separator = line.includes("|")
              ? "|"
              : line.includes(":")
              ? ":"
              : ",";
            const [namePart, pricePart] = line.split(separator);
            return {
              name: namePart?.trim() || "",
              price: Number(pricePart?.trim() || 0),
            };
          })
          .filter((addOn) => addOn.name),
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.message || "Failed to save menu.");
      return;
    }

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
      tagsInput: Array.isArray(menu.tags) ? menu.tags.join(", ") : "",
      allergensInput: Array.isArray(menu.allergens)
        ? menu.allergens.join(", ")
        : "",
      addOnsInput: Array.isArray(menu.addOns)
        ? menu.addOns
            .map((addOn) => `${addOn.name}|${Number(addOn.price || 0)}`)
            .join("\n")
        : "",
      isAvailable: menu.isAvailable,
    });
    setIsEditing(true);
    setEditingId(menu._id);
    setShowForm(true);
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

  const handleToggleAvailability = async (menu) => {
    const token = localStorage.getItem("token");
    setError("");

    try {
      const res = await fetch(`${API_MENU}/update/${menu._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isAvailable: !menu.isAvailable }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Failed to update availability");
      }

      setMenus((prev) =>
        prev.map((item) =>
          item._id === menu._id ? { ...item, isAvailable: !menu.isAvailable } : item
        )
      );
    } catch (toggleError) {
      setError(toggleError.message || "Failed to update availability.");
    }
  };

  const filteredMenus = menus.filter((menu) => {
    if (availabilityFilter === "available" && !menu.isAvailable) return false;
    if (availabilityFilter === "soldout" && menu.isAvailable) return false;

    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      menu.name?.toLowerCase().includes(term) ||
      menu.category?.name?.toLowerCase().includes(term)
    );
  });

  const availableCount = menus.filter((menu) => menu.isAvailable).length;
  const soldOutCount = menus.length - availableCount;

  /* ================= UI ================= */
  return (
    <div className="orders-theme min-h-screen bg-[#f6f1eb] text-[#1f1a17]">
      <div className="px-6 py-6 sm:px-10">
        <div className="rounded-3xl bg-gradient-to-br from-[#f9e9d7] via-[#f8f3ee] to-[#f2ddc7] p-6 sm:p-8 shadow-lg border border-[#ead8c7]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#8b6b4f]">
                Menu Studio
              </p>
              <h1 className="orders-title text-3xl sm:text-4xl font-semibold">
                Menu Management
              </h1>
              <p className="text-sm text-[#6c5645] mt-2">
                Create, update, and organize your menu items.
              </p>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="bg-[#1f1a17] hover:bg-[#2b2320] text-[#f8f3ee] px-5 py-3 rounded-full flex items-center gap-2 font-semibold"
            >
              <PlusIcon className="w-5 h-5" />
              Add Menu
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-[#ead8c7] bg-white/80 px-4 py-3">
            <p className="text-xs text-[#8b6b4f]">Total</p>
            <p className="text-2xl font-semibold">{menus.length}</p>
          </div>
          <div className="rounded-2xl border border-[#cde8d6] bg-[#edf8f1] px-4 py-3">
            <p className="text-xs text-[#2f6a46]">Available</p>
            <p className="text-2xl font-semibold text-[#2f6a46]">{availableCount}</p>
          </div>
          <div className="rounded-2xl border border-[#f2d5cb] bg-[#fff0eb] px-4 py-3">
            <p className="text-xs text-[#a13a2f]">Sold Out</p>
            <p className="text-2xl font-semibold text-[#a13a2f]">{soldOutCount}</p>
          </div>
          <div className="rounded-2xl border border-[#ead8c7] bg-white/80 px-4 py-3">
            <p className="text-xs text-[#8b6b4f]">Categories</p>
            <p className="text-2xl font-semibold">{categories.length}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu by name or category"
            className="rounded-xl border border-[#ead8c7] bg-white/90 px-4 py-3 text-sm"
          />
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="rounded-xl border border-[#ead8c7] bg-white/90 px-4 py-3 text-sm"
          >
            <option value="all">All items</option>
            <option value="available">Available only</option>
            <option value="soldout">Sold out only</option>
          </select>
          <button
            onClick={() => {
              setSearch("");
              setAvailabilityFilter("all");
            }}
            className="rounded-xl border border-[#ead8c7] bg-white px-4 py-3 text-sm text-[#6c5645]"
          >
            Reset filters
          </button>
        </div>

        {/* ================= DRAWER ================= */}
        {showForm && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={resetForm}
            />

            <div className="fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-white shadow-2xl transform transition-transform duration-300">
              <div className="p-6 border-b border-[#ead8c7] flex justify-between items-center bg-[#f9f4ef]">
                <h2 className="orders-title text-lg font-semibold">
                  {isEditing ? "Update Menu" : "Create Menu"}
                </h2>
                <button onClick={resetForm}>
                  <XMarkIcon className="w-6 h-6 text-[#6c5645]" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto h-full">
                <form onSubmit={handleSubmit} className="grid gap-4">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Menu Name"
                    className={inputClass}
                    required
                  />

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className={inputClass}
                    required
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
                    className={inputClass}
                    required
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
                    className={inputClass}
                  />

                  <input
                    name="tagsInput"
                    value={form.tagsInput}
                    onChange={handleChange}
                    placeholder="Tags (comma separated)"
                    className={inputClass}
                  />

                  <input
                    name="allergensInput"
                    value={form.allergensInput}
                    onChange={handleChange}
                    placeholder="Allergens (comma separated)"
                    className={inputClass}
                  />

                  <textarea
                    name="addOnsInput"
                    value={form.addOnsInput}
                    onChange={handleChange}
                    placeholder={`Add-ons (one per line, e.g.)\nCheese|500\nExtra sauce|300`}
                    className={inputClass}
                    rows={4}
                  />

                  <label className="flex items-center gap-2 text-sm text-[#6c5645]">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={form.isAvailable}
                      onChange={handleChange}
                      className="accent-[#1f1a17]"
                    />
                    Available
                  </label>

                <button className="bg-emerald-600 text-white py-3 rounded-xl font-semibold">
                  {isEditing ? "Update Menu" : "Create Menu"}
                </button>
              </form>
            </div>
          </div>
        </>
      )}

        {/* ================= MENU LIST ================= */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
          {filteredMenus.map((menu) => (
            <div
              key={menu._id}
              className="rounded-3xl bg-white/90 border border-[#ead8c7] p-6 shadow-sm hover:shadow-lg relative group"
            >
              <div className="h-40 flex items-center justify-center mb-4 rounded-2xl bg-[#f9f4ef] border border-[#ead8c7]">
                {menu.image ? (
                  <img src={menu.image} className="h-full object-contain" />
                ) : (
                  <span className="text-[#b5a397]">No Image</span>
                )}
              </div>

            <h3 className="font-semibold">{menu.name}</h3>
            <p className="text-sm text-gray-500">{menu.category?.name}</p>
            <p className="text-sm mt-1">{menu.price} Ks</p>
            <button
              onClick={() => handleToggleAvailability(menu)}
              className={`mt-3 inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] ${
                menu.isAvailable
                  ? "border-[#cde8d6] bg-[#edf8f1] text-[#2f6a46]"
                  : "border-[#f2d5cb] bg-[#fff0eb] text-[#a13a2f]"
              }`}
            >
              {menu.isAvailable ? "Available" : "Sold Out"}
            </button>

              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => handleEdit(menu)}
                  className="p-2 bg-[#f9f4ef] text-[#1f1a17] rounded-full border border-[#ead8c7]"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(menu._id)}
                  className="p-2 bg-[#fef2f2] text-[#b53b2e] rounded-full border border-[#f5cfc9]"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        {!filteredMenus.length && (
          <div className="mt-8 rounded-2xl border border-dashed border-[#d6c3b2] bg-white/70 p-10 text-center text-[#6c5645]">
            No menu items found for current filters.
          </div>
        )}
      </div>
    </div>
  );
}
