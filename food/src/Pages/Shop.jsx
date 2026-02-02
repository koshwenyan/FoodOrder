
import { useEffect, useState } from "react";
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";

export default function Shops() {
    const [shops, setShops] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        name: "",
        photo: "",
        category: "",
        description: "",
        address: "",
        OpenTime: "",
        CloseTime: "",
        isActive: true,
    });

    const API_SHOP = "http://localhost:3000/api/shop";
    const API_CATEGORY = "http://localhost:3000/api/category/all";

    const inputClass =
        "w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500";

    /* ================= FETCH ================= */
    const fetchShops = async () => {
        const res = await fetch(API_SHOP);
        const data = await res.json();
        setShops(data.data || []);
        console.log("shopdata", data)
    };

    // const fetchCategories = async () => {
    //     const res = await fetch(API_CATEGORY);
    //     const data = await res.json();
    //     setCategories(data.data || []);
    //     console.log("categorydata", data)
    // };
    const fetchCategories = async () => {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:3000/api/category/all", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();
        console.log("categorydata", data);
        setCategories(data.data || []);
    };

    useEffect(() => {
        fetchShops();
        fetchCategories();
    }, []);

    /* ================= FORM ================= */
    const resetForm = () => {
        setForm({
            name: "",
            photo: "",
            category: "",
            description: "",
            address: "",
            OpenTime: "",
            CloseTime: "",
            isActive: true,
        });
        setIsEditing(false);
        setEditingId(null);
    };

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const url = isEditing
            ? `${API_SHOP}/${editingId}`
            : `${API_SHOP}`;

        const res = await fetch(url, {
            method: isEditing ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                ...form,
                category: [form.category], // REQUIRED
            }),
        });

        const data = await res.json();
        console.log("shop response:", data);

        fetchShops();
        resetForm();
    };


    const handleEdit = (shop) => {
        setForm({
            name: shop.name,
            photo: shop.photo || "",
            category: shop.category?.[0]?._id || "",
            description: shop.description,
            address: shop.address,
            OpenTime: shop.OpenTime,
            CloseTime: shop.CloseTime,
            isActive: shop.isActive,
        });
        setIsEditing(true);
        setEditingId(shop._id);
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this shop?")) return;
        const token = localStorage.getItem("token");
        await fetch(`${API_SHOP}/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        setShops(shops.filter((s) => s._id !== id));
    };

    /* ================= UI ================= */
    return (
        <div className="p-6 bg-slate-900 min-h-screen text-slate-100">
            <h1 className="text-2xl font-bold text-center text-emerald-400 mb-6">
                Shop Management
            </h1>

            {/* FORM */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-semibold mb-4">
                    {isEditing ? "Update Shop" : "Create Shop"}
                </h2>

                <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Shop Name" required className={inputClass} />
                    <input name="photo" value={form.photo} onChange={handleChange} placeholder="Photo URL" className={inputClass} />

                    <select name="category" value={form.category} onChange={handleChange} required className={inputClass}>
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                    </select>

                    <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className={inputClass} />

                    <input
                        type="time"
                        name="OpenTime"
                        value={form.OpenTime}
                        onChange={handleChange}
                        className={inputClass}
                    />

                    <input
                        type="time"
                        name="CloseTime"
                        value={form.CloseTime}
                        onChange={handleChange}
                        className={inputClass}
                    />


                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Description"
                        className={`${inputClass} md:col-span-2`}
                    />

                    <div className="flex gap-2 md:col-span-2">
                        <button className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-semibold px-5 py-3 rounded-xl flex items-center gap-2">
                            <PlusIcon className="w-4 h-4" />
                            {isEditing ? "Update Shop" : "Create Shop"}
                        </button>

                        <button type="button" onClick={resetForm} className="bg-slate-700 hover:bg-slate-600 px-5 py-3 rounded-xl flex items-center gap-2">
                            <XMarkIcon className="w-4 h-4" /> Cancel
                        </button>
                    </div>
                </form>
            </div>

            {/* SHOP CARDS */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {shops.map((shop) => (
                    <div key={shop._id} className="rounded-2xl bg-slate-800 border border-slate-700 p-4">
                        {shop.photo && (
                            <img src={shop.photo} alt={shop.name} className="w-full h-48 object-cover rounded-xl mb-3" />
                        )}
                        <h3 className="text-lg font-semibold">{shop.name}</h3>
                        <p className="text-sm text-slate-400">{shop.description}</p>
                        <p className="text-xs text-slate-500 mt-1">
                            {shop.OpenTime} - {shop.CloseTime}
                        </p>

                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => handleEdit(shop)} className="p-2 bg-slate-700 rounded">
                                <PencilIcon className="w-4 h-4 text-sky-400" />
                            </button>
                            <button onClick={() => handleDelete(shop._id)} className="p-2 bg-slate-700 rounded">
                                <TrashIcon className="w-4 h-4 text-rose-400" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
