import React, { useEffect, useState } from "react";
import { PencilIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function DeliveryCompanyStaff() {
    const [staffs, setStaffs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
    const [createForm, setCreateForm] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        password: "",
    });

    const user = JSON.parse(localStorage.getItem("user"));
    const companyId = user?.companyId;
    const API_BASE = "http://localhost:3000/api";

    const fetchStaffs = async () => {
        if (!companyId) return;

        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`${API_BASE}/company/${companyId}/staffs`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("staffData", res)
            const data = await res.json();
            setStaffs(data?.data?.staffs || []);
        } catch (err) {
            console.error("Error fetching staff:", err);
            setStaffs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaffs();
    }, [companyId]);

    // ================= ACTIONS =================
    const handleEdit = (staff) => {
        setSelectedStaff(staff);
        setFormData({ name: staff.name, email: staff.email, phone: staff.phone });
        setIsModalOpen(true);
    };

    const handleDelete = async (staffId) => {
        if (!window.confirm("Are you sure you want to delete this staff?")) return;

        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`${API_BASE}/user/${staffId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                alert("Staff deleted successfully");
                setStaffs(staffs.filter((s) => s._id !== staffId));
            } else {
                alert("Failed to delete staff");
            }
        } catch (err) {
            console.error("Error deleting staff:", err);
            alert("Error deleting staff");
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedStaff(null);
    };

    const handleCreateModalClose = () => {
        setIsCreateModalOpen(false);
        setCreateForm({
            name: "",
            email: "",
            phone: "",
            address: "",
            password: "",
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateInputChange = (e) => {
        const { name, value } = e.target;
        setCreateForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(
                `${API_BASE}/user/update/${selectedStaff._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await res.json();

            if (data.success) {
                alert("Staff updated successfully");

                setStaffs(
                    staffs.map((s) =>
                        s._id === selectedStaff._id ? data.data : s
                    )
                );

                handleModalClose();
            } else {
                alert(data.message || "Failed to update staff");
            }
        } catch (err) {
            console.error("Error updating staff:", err);
            alert("Error updating staff");
        }
    };

    const handleCreateStaff = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Authentication required to create this role");
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/user/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...createForm,
                    role: "company-staff",
                    companyId,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                alert("Staff created successfully");
                setStaffs((prev) => [data.data, ...prev]);
                handleCreateModalClose();
            } else {
                alert(data.message || "Failed to create staff");
            }
        } catch (err) {
            console.error("Error creating staff:", err);
            alert("Error creating staff");
        }
    };



    if (loading) {
        return <div className="px-6 py-6 sm:px-10 text-[#423d38]">Loading staff...</div>;
    }

    return (
        <div className="min-h-screen bg-[#0f1115] text-[#f6f1e8]">
            <div className="px-6 py-6 sm:px-10">
                <div className="rounded-3xl bg-gradient-to-br from-[#1d222c] via-[#171a20] to-[#2a2f3a] p-6 sm:p-8 shadow-lg border border-[#2a2f3a]">
                    <p className="text-sm uppercase tracking-[0.2em] text-[#c9a96a]">
                        Delivery Company Admin
                    </p>
                    <h1 className="text-3xl sm:text-4xl font-semibold">
                        Delivery Staff
                    </h1>
                    <p className="text-sm text-[#a8905d] mt-2">
                        Manage staff members and keep contact details updated.
                    </p>
                </div>

                <div className="mt-8 rounded-3xl border border-[#2a2f3a] bg-[#171a20] shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#2a2f3a] flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-lg font-semibold text-[#f6f1e8]">
                            Staff List ({staffs.length})
                        </h2>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-[#8b6b4f]">
                                Company staff directory
                            </span>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="bg-[#8b6b4f] hover:bg-[#6c5645] text-white text-sm px-4 py-2 rounded-full"
                            >
                                Add Staff
                            </button>
                        </div>
                    </div>

                    {staffs.length === 0 ? (
                        <div className="px-6 py-8 text-[#a8905d]">
                            No staff found for your company.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto">
                                <thead className="bg-[#171a20] text-left">
                                    <tr>
                                        <th className="px-4 py-3 text-sm font-semibold text-[#a8905d]">#</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-[#a8905d]">Name</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-[#a8905d]">Email</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-[#a8905d]">Phone</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-[#a8905d]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staffs.map((staff, index) => (
                                        <tr
                                            key={staff._id}
                                            className="border-t border-[#2a2f3a] hover:bg-[#232833]"
                                        >
                                            <td className="px-4 py-3 text-sm text-[#f6f1e8]">{index + 1}</td>
                                            <td className="px-4 py-3 text-sm text-[#f6f1e8]">{staff.name}</td>
                                            <td className="px-4 py-3 text-sm text-[#f6f1e8]">{staff.email}</td>
                                            <td className="px-4 py-3 text-sm text-[#f6f1e8]">{staff.phone}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => handleEdit(staff)}
                                                        className="text-[#c9a96a] hover:text-[#a8905d]"
                                                        title="Edit Staff"
                                                    >
                                                        <PencilIcon className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(staff._id)}
                                                        className="text-[#c97a5a] hover:text-[#a75f44]"
                                                        title="Delete Staff"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ================= UPDATE MODAL ================= */}
            {/* ================= UPDATE MODAL ================= */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
                    <div className="relative bg-[#171a20] p-6 rounded-3xl w-full max-w-md text-[#f6f1e8] shadow-xl border border-[#2a2f3a]">
                        {/* Close button */}
                        <button
                            onClick={handleModalClose}
                            className="absolute top-3 right-3 text-[#c9a96a] hover:text-[#a8905d]"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-semibold mb-4 text-center">Update Staff</h2>

                        <div className="flex flex-col gap-4">
                            <input
                                type="text"
                                name="name"
                                placeholder="Name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="p-3 rounded-xl bg-[#1d222c] border border-[#2a2f3a] text-[#f6f1e8] placeholder:text-[#c9a96a] focus:outline-none focus:ring-2 focus:ring-[#2a2f3a]"
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="p-3 rounded-xl bg-[#1d222c] border border-[#2a2f3a] text-[#f6f1e8] placeholder:text-[#c9a96a] focus:outline-none focus:ring-2 focus:ring-[#2a2f3a]"
                            />
                            <input
                                type="text"
                                name="phone"
                                placeholder="Phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="p-3 rounded-xl bg-[#1d222c] border border-[#2a2f3a] text-[#f6f1e8] placeholder:text-[#c9a96a] focus:outline-none focus:ring-2 focus:ring-[#2a2f3a]"
                            />
                            <button
                                onClick={handleUpdate}
                                className="bg-[#c9a96a] hover:bg-[#a8905d] text-white py-3 rounded-xl mt-2"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= CREATE MODAL ================= */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
                    <div className="relative bg-white p-6 rounded-3xl w-full max-w-md text-[#1f1a17] shadow-xl border border-[#ead8c7]">
                        <button
                            onClick={handleCreateModalClose}
                            className="absolute top-3 right-3 text-[#8b6b4f] hover:text-[#6c5645]"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-semibold mb-4 text-center">Add Staff</h2>

                        <div className="flex flex-col gap-4">
                            <input
                                type="text"
                                name="name"
                                placeholder="Name"
                                value={createForm.name}
                                onChange={handleCreateInputChange}
                                className="p-3 rounded-xl bg-[#fbf7f2] border border-[#ead8c7] text-[#1f1a17] placeholder:text-[#8b6b4f] focus:outline-none focus:ring-2 focus:ring-[#ead8c7]"
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={createForm.email}
                                onChange={handleCreateInputChange}
                                className="p-3 rounded-xl bg-[#fbf7f2] border border-[#ead8c7] text-[#1f1a17] placeholder:text-[#8b6b4f] focus:outline-none focus:ring-2 focus:ring-[#ead8c7]"
                            />
                            <input
                                type="text"
                                name="phone"
                                placeholder="Phone"
                                value={createForm.phone}
                                onChange={handleCreateInputChange}
                                className="p-3 rounded-xl bg-[#fbf7f2] border border-[#ead8c7] text-[#1f1a17] placeholder:text-[#8b6b4f] focus:outline-none focus:ring-2 focus:ring-[#ead8c7]"
                            />
                            <input
                                type="text"
                                name="address"
                                placeholder="Address"
                                value={createForm.address}
                                onChange={handleCreateInputChange}
                                className="p-3 rounded-xl bg-[#fbf7f2] border border-[#ead8c7] text-[#1f1a17] placeholder:text-[#8b6b4f] focus:outline-none focus:ring-2 focus:ring-[#ead8c7]"
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={createForm.password}
                                onChange={handleCreateInputChange}
                                className="p-3 rounded-xl bg-[#fbf7f2] border border-[#ead8c7] text-[#1f1a17] placeholder:text-[#8b6b4f] focus:outline-none focus:ring-2 focus:ring-[#ead8c7]"
                            />
                            <button
                                onClick={handleCreateStaff}
                                className="bg-[#8b6b4f] hover:bg-[#6c5645] text-white py-3 rounded-xl mt-2"
                            >
                                Create Staff
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
