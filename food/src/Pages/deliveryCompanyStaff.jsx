import React, { useEffect, useState } from "react";
import { PencilIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function DeliveryCompanyStaff() {
    const [staffs, setStaffs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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




    if (loading) {
        return <div className="p-8 text-gray-200">Loading staff...</div>;
    }

    return (
        <div className="p-8 min-h-screen bg-slate-900 text-gray-200">
            <h1 className="text-3xl font-bold mb-6">
                Delivery Staff List ({staffs.length})
            </h1>

            {staffs.length === 0 ? (
                <p>No staff found for your company.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto border border-gray-700 rounded-lg overflow-hidden">
                        <thead className="bg-gray-800 text-left">
                            <tr>
                                <th className="px-4 py-2 border-b border-gray-700">#</th>
                                <th className="px-4 py-2 border-b border-gray-700">Name</th>
                                <th className="px-4 py-2 border-b border-gray-700">Email</th>
                                <th className="px-4 py-2 border-b border-gray-700">Phone</th>
                                <th className="px-4 py-2 border-b border-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffs.map((staff, index) => (
                                <tr key={staff._id} className="hover:bg-gray-700">
                                    <td className="px-4 py-2 border-b border-gray-700">{index + 1}</td>
                                    <td className="px-4 py-2 border-b border-gray-700">{staff.name}</td>
                                    <td className="px-4 py-2 border-b border-gray-700">{staff.email}</td>
                                    <td className="px-4 py-2 border-b border-gray-700">{staff.phone}</td>
                                    <td className="px-4 py-2 border-b border-gray-700 flex gap-4">
                                        <button
                                            onClick={() => handleEdit(staff)}
                                            className="hover:text-blue-400"
                                            title="Edit Staff"
                                        >
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(staff._id)}
                                            className="hover:text-red-500"
                                            title="Delete Staff"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ================= UPDATE MODAL ================= */}
            {/* ================= UPDATE MODAL ================= */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="relative bg-gray-800 p-6 rounded-lg w-full max-w-md text-gray-200 shadow-lg">
                        {/* Close button */}
                        <button
                            onClick={handleModalClose}
                            className="absolute top-3 right-3 text-gray-400 hover:text-white"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold mb-4 text-center">Update Staff</h2>

                        <div className="flex flex-col gap-4">
                            <input
                                type="text"
                                name="name"
                                placeholder="Name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="p-2 rounded bg-gray-700 text-white"
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="p-2 rounded bg-gray-700 text-white"
                            />
                            <input
                                type="text"
                                name="phone"
                                placeholder="Phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="p-2 rounded bg-gray-700 text-white"
                            />
                            <button
                                onClick={handleUpdate}
                                className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded mt-2"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
