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
    "w-full px-4 py-3 rounded-2xl bg-[#1d222c] border border-[#2a2f3a] text-[#f6f1e8] focus:outline-none focus:ring-2 focus:ring-[#f6f1e8]/20";

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
    <div className="orders-theme min-h-screen bg-[#0f1115] text-[#f6f1e8]">
      <div className="px-6 py-6 sm:px-10">
        <div className="rounded-3xl bg-gradient-to-br from-[#1d222c] via-[#171a20] to-[#2a2f3a] p-6 sm:p-8 shadow-lg border border-[#2a2f3a]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#c9a96a]">
                Menu Studio
              </p>
              <h1 className="orders-title text-3xl sm:text-4xl font-semibold">
                Menu Management
              </h1>
              <p className="text-sm text-[#a8905d] mt-2">
                Create, update, and organize your menu items.
              </p>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="bg-[#f6f1e8] hover:bg-[#2b2320] text-[#171a20] px-5 py-3 rounded-full flex items-center gap-2 font-semibold"
            >
              <PlusIcon className="w-5 h-5" />
              Add Menu
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-[#2a2f3a] bg-[#1d222c] px-4 py-3">
            <p className="text-xs text-[#c9a96a]">Total</p>
            <p className="text-2xl font-semibold">{menus.length}</p>
          </div>
          <div className="rounded-2xl border border-[#2a2f3a] bg-[#1d222c] px-4 py-3">
            <p className="text-xs text-[#c9a96a]">Available</p>
            <p className="text-2xl font-semibold text-[#c9a96a]">{availableCount}</p>
          </div>
          <div className="rounded-2xl border border-[#2a2f3a] bg-[#1d222c] px-4 py-3">
            <p className="text-xs text-[#e06c5f]">Sold Out</p>
            <p className="text-2xl font-semibold text-[#e06c5f]">{soldOutCount}</p>
          </div>
          <div className="rounded-2xl border border-[#2a2f3a] bg-[#1d222c] px-4 py-3">
            <p className="text-xs text-[#c9a96a]">Categories</p>
            <p className="text-2xl font-semibold">{categories.length}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu by name or category"
            className="rounded-xl border border-[#2a2f3a] bg-[#171a20] px-4 py-3 text-sm"
          />
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="rounded-xl border border-[#2a2f3a] bg-[#171a20] px-4 py-3 text-sm"
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
            className="rounded-xl border border-[#2a2f3a] bg-[#171a20] px-4 py-3 text-sm text-[#a8905d]"
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

            <div className="fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-[#171a20] shadow-2xl transform transition-transform duration-300">
              <div className="p-6 border-b border-[#2a2f3a] flex justify-between items-center bg-[#1d222c]">
                <h2 className="orders-title text-lg font-semibold">
                  {isEditing ? "Update Menu" : "Create Menu"}
                </h2>
                <button onClick={resetForm}>
                  <XMarkIcon className="w-6 h-6 text-[#a8905d]" />
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

                  <label className="flex items-center gap-2 text-sm text-[#a8905d]">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={form.isAvailable}
                      onChange={handleChange}
                      className="accent-[#f6f1e8]"
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
              className="rounded-3xl bg-[#171a20] border border-[#2a2f3a] p-6 shadow-sm hover:shadow-lg relative group"
            >
              <div className="h-40 flex items-center justify-center mb-4 rounded-2xl bg-[#1d222c] border border-[#2a2f3a]">
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
                  ? "border-[#2a2f3a] bg-[#1d222c] text-[#c9a96a]"
                  : "border-[#2a2f3a] bg-[#1d222c] text-[#e06c5f]"
              }`}
            >
              {menu.isAvailable ? "Available" : "Sold Out"}
            </button>

              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => handleEdit(menu)}
                  className="p-2 bg-[#1d222c] text-[#f6f1e8] rounded-full border border-[#2a2f3a]"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(menu._id)}
                  className="p-2 bg-[#1d222c] text-[#e06c5f] rounded-full border border-[#2a2f3a]"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        {!filteredMenus.length && (
          <div className="mt-8 rounded-2xl border border-dashed border-[#2a2f3a] bg-[#232833] p-10 text-center text-[#a8905d]">
            No menu items found for current filters.
          </div>
        )}
      </div>
    </div>
  );
}
