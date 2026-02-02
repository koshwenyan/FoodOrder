// import { useState, useEffect } from "react";
// import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

// export default function Shops() {
//     const [shops, setShops] = useState([]);
//     const [categories, setCategories] = useState([]);
//     const user = JSON.parse(localStorage.getItem("user"));
//     const shopId = user?.shopId;
//     const [search, setSearch] = useState("");
//     const [form, setForm] = useState({
//         name: "",
//         description: "",
//         address: "",
//         OpenTime: "",
//         CloseTime: "",
//         isActive: true,
//         category: "",

//     });
//     const [isEditing, setIsEditing] = useState(false);
//     const [editingId, setEditingId] = useState(null);
//     const [currentPage, setCurrentPage] = useState(1);
//     const perPage = 6;

//     const API_BASE = "http://localhost:3000/api/shop";
//     const API_CATEGORY = "http://localhost:3000/api/category/all";

//     useEffect(() => {
//         fetchShops();
//         fetchCategories();
//     }, []);

//     const fetchShops = async () => {
//         const token = localStorage.getItem("token");
//         const res = await fetch(API_BASE, { headers: { Authorization: `Bearer ${token}` } });
//         const data = await res.json();
//         setShops(data.data || []);
//     };

//     const fetchCategories = async () => {
//         const token = localStorage.getItem("token");
//         const res = await fetch(API_CATEGORY, { headers: { Authorization: `Bearer ${token}` } });
//         const data = await res.json();
//         setCategories(data.data || []);
//     };

//     const resetForm = () => {
//         setForm({
//             name: "",
//             description: "",
//             address: "",
//             OpenTime: "",
//             CloseTime: "",
//             isActive: true,
//             category: "",

//         });
//         setIsEditing(false);
//         setEditingId(null);
//     };
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const token = localStorage.getItem("token");

//         try {
//             const formData = new FormData();
//             formData.append("name", form.name);
//             formData.append("description", form.description);
//             formData.append("address", form.address);
//             formData.append("OpenTime", form.OpenTime);
//             formData.append("CloseTime", form.CloseTime);
//             formData.append("isActive", form.isActive ? "true" : "false");
//             formData.append("category", form.category);


//             // const url = isEditing ? `${API_BASE}/${editingId}` : `${API_BASE}/`;

//             // const res = await fetch(url, {
//             //     method: isEditing ? "PUT" : "POST",
//             //     headers: { Authorization: `Bearer ${token}` }, // no Content-Type
//             //     body: formData,
//             // });

//             const data = await res.json();

//             if (!data.success) {
//                 alert(data.message || "Something went wrong!");
//                 return;
//             }

//             fetchShops();
//             resetForm();
//         } catch (err) {
//             console.error("Shop submit error:", err);
//             alert("Internal error. Check console.");
//         }
//     };


//     // Convert "09:00 AM" or "08:00 PM" to "HH:mm"
//     const to24Hour = (time) => {
//         if (!time) return "";
//         if (!time.includes("AM") && !time.includes("PM")) return time;

//         const [t, modifier] = time.split(" ");
//         let [hours, minutes] = t.split(":");
//         hours = parseInt(hours, 10);

//         if (modifier === "PM" && hours !== 12) hours += 12;
//         if (modifier === "AM" && hours === 12) hours = 0;

//         return `${String(hours).padStart(2, "0")}:${minutes}`;
//     };


//     const handleEdit = (shop) => {
//         setForm({
//             name: shop.name || "",
//             description: shop.description || "",
//             address: shop.address || "",
//             OpenTime: to24Hour(shop.OpenTime),
//             CloseTime: to24Hour(shop.CloseTime),
//             isActive: shop.isActive ?? true,
//             category: shop.category?._id || "",

//         });
//         setIsEditing(true);
//         setEditingId(shop._id);
//     };




//     const handleDelete = async (id) => {
//         if (!confirm("Delete this shop?")) return;
//         const token = localStorage.getItem("token");
//         await fetch(`${API_BASE}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
//         fetchShops();
//     };

//     const filtered = shops.filter(
//         (s) =>
//             s.name.toLowerCase().includes(search.toLowerCase()) ||
//             s.category?.name.toLowerCase().includes(search.toLowerCase())
//     );

//     const totalPages = Math.ceil(filtered.length / perPage);
//     const currentShops = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

//     const formatTime = (timeStr) => {
//         if (!timeStr) return "-";
//         const [hour, minute] = timeStr.split(":");
//         const h = parseInt(hour);
//         const ampm = h >= 12 ? "PM" : "AM";
//         const hour12 = h % 12 === 0 ? 12 : h % 12;
//         return `${hour12}:${minute} ${ampm}`;
//     };

//     return (
//         <div className="min-h-screen bg-[#ECEFF1] p-8 space-y-6">
//             <h1 className="text-3xl font-bold text-[#111827]">Shop Management</h1>

//             {/* ---------------- FORM ---------------- */}
//             <div className="bg-white rounded-xl shadow-md p-6 grid md:grid-cols-3 gap-4 text-[#111827]">
//                 <input
//                     placeholder="Name"
//                     value={form.name}
//                     onChange={(e) => setForm({ ...form, name: e.target.value })}
//                     className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2"
//                 />
//                 <input
//                     placeholder="Description"
//                     value={form.description}
//                     onChange={(e) => setForm({ ...form, description: e.target.value })}
//                     className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2"
//                 />
//                 <input
//                     placeholder="Address"
//                     value={form.address}
//                     onChange={(e) => setForm({ ...form, address: e.target.value })}
//                     className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2"
//                 />

//                 {/* Open / Close Time */}
//                 <div>
//                     <label className="text-xs text-gray-500">Open Time</label>
//                     <input
//                         type="time"
//                         value={form.OpenTime}
//                         onChange={(e) => setForm({ ...form, OpenTime: e.target.value })}
//                         className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2 w-full"
//                     />
//                 </div>
//                 <div>
//                     <label className="text-xs text-gray-500">Close Time</label>
//                     <input
//                         type="time"
//                         value={form.CloseTime}
//                         onChange={(e) => setForm({ ...form, CloseTime: e.target.value })}
//                         className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2 w-full"
//                     />
//                 </div>

//                 <select
//                     value={form.category}
//                     onChange={(e) => setForm({ ...form, category: e.target.value })}
//                     className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2"
//                 >
//                     <option value="">Select Category</option>
//                     {categories.map((c) => (
//                         <option key={c._id} value={c._id}>{c.name}</option>
//                     ))}
//                 </select>

//                 {/* <input
//                     type="file"
//                     onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
//                     className="bg-[#F5F6F7] border border-gray-300 rounded-lg px-3 py-2"
//                 /> */}

//                 <button onClick={handleSubmit} className="bg-[#1F2933] hover:bg-black text-white rounded-lg py-2">
//                     {isEditing ? "Update Shop" : "Create Shop"}
//                 </button>
//                 <button onClick={resetForm} className="bg-gray-200 hover:bg-gray-300 rounded-lg py-2">Cancel</button>
//             </div>

//             {/* ---------------- CARDS ---------------- */}
//             <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {currentShops.map((shop) => (
//                     <div key={shop._id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow hover:shadow-lg transition">
//                         {shop.photo && (
//                             <img src={shop.photo} alt={shop.name} className="w-full h-40 object-cover rounded-xl mb-3" />
//                         )}
//                         <h3 className="text-lg font-bold">{shop.name}</h3>
//                         <p className="text-gray-500 text-sm mb-2">{shop.description}</p>
//                         <p className="text-gray-600 text-sm">📍 {shop.address || "-"}</p>
//                         <p className="text-gray-600 text-sm">⏰ {formatTime(shop.OpenTime)} - {formatTime(shop.CloseTime)}</p>
//                         <p>
//                             <span className={`px-3 py-1 rounded-full text-white font-semibold mt-2 inline-block ${shop.isActive ? "bg-green-500" : "bg-red-500"}`}>
//                                 {shop.isActive ? "Active" : "Inactive"}
//                             </span>
//                         </p>

//                         <div className="flex justify-end gap-2 mt-4">
//                             <button onClick={() => handleEdit(shop)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded">
//                                 <PencilIcon className="w-4 h-4 text-blue-600" />
//                             </button>
//                             <button onClick={() => handleDelete(shop._id)} className="p-2 bg-red-100 hover:bg-red-200 rounded">
//                                 <TrashIcon className="w-4 h-4 text-red-600" />
//                             </button>
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             {/* ---------------- PAGINATION ---------------- */}
//             <div className="flex justify-center gap-4 text-[#111827] mt-6">
//                 <button
//                     disabled={currentPage === 1}
//                     onClick={() => setCurrentPage(p => p - 1)}
//                     className="px-4 py-2 bg-white border rounded disabled:opacity-40"
//                 >
//                     Prev
//                 </button>
//                 <span className="px-4 py-2">{currentPage} / {totalPages}</span>
//                 <button
//                     disabled={currentPage === totalPages}
//                     onClick={() => setCurrentPage(p => p + 1)}
//                     className="px-4 py-2 bg-white border rounded disabled:opacity-40"
//                 >
//                     Next
//                 </button>
//             </div>
//         </div>
//     );
// }
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
