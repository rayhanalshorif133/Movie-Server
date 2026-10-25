"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, X, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

export default function GameType() {
    // States
    const [types, setTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [typeName, setTypeName] = useState("");
    const [editingId, setEditingId] = useState(null);

    const API_URL = "/api/games/type";

    const fetchTypes = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            if (res.ok) setTypes(data);
        } catch (error) {
            console.error("Failed to fetch types:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    const openModal = (type = null) => {
        if (type) {
            setEditingId(type.id);
            setTypeName(type.name);
        } else {
            setEditingId(null);
            setTypeName("");
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTypeName("");
        setEditingId(null);
    };

    // --- 2. Create & Update Logic ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!typeName.trim()) return;

        const method = editingId ? "PUT" : "POST";
        const body = editingId
            ? JSON.stringify({ id: editingId, name: typeName })
            : JSON.stringify({ name: typeName });

        try {
            const res = await fetch(API_URL, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: body,
            });

            if (res.ok) {
                fetchTypes();
                closeModal();
            } else {
                const err = await res.json();
                alert(err.error || "Something went wrong");
            }
        } catch (error) {
            console.error("Action failed:", error);
        }
    };

    // --- 3. Delete Logic ---
    const handleDelete = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#2563eb", 
            cancelButtonColor: "#ef4444", 
            confirmButtonText: "Yes, delete it!",
            padding: '2em',
            customClass: {
                padding: '2rem',
                confirmButton: 'px-5 py-2.5 rounded-lg font-semibold',
                cancelButton: 'px-5 py-2.5 rounded-lg font-semibold'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`${API_URL}?id=${id}`, {
                        method: "DELETE",
                    });

                    if (res.ok) {
                        setTypes(types.filter((type) => type.id !== id));
                        Swal.fire({
                            title: "Deleted!",
                            text: "Game type has been deleted.",
                            icon: "success",
                            timer: 1500,
                            showConfirmButton: false
                        });
                    } else {
                        Swal.fire("Error!", "Failed to delete the item.", "error");
                    }
                } catch (error) {
                    console.error("Delete failed:", error);
                    Swal.fire("Error!", "Something went wrong on the server.", "error");
                }
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Game Types</h3>
                    <p className="text-sm text-gray-500">
                        {isLoading ? "Loading..." : `Total ${types.length} categories found`}
                    </p>
                </div>

                <button
                    onClick={() => openModal()}
                    className="flex cursor-pointer cp items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md active:scale-95"
                >
                    <Plus size={18} />
                    Add Type
                </button>
            </div>

            {/* List Table */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Type Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {isLoading ? (
                            <tr>
                                <td colSpan="3" className="px-6 py-10 text-center">
                                    <Loader2 className="animate-spin mx-auto text-blue-600" />
                                </td>
                            </tr>
                        ) : types.length > 0 ? (
                            types.map((type, index) => (
                                <tr key={type.id} className="group hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">#{index + 1}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-700 transition">
                                            {type.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openModal(type)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(type.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="px-6 py-10 text-center text-gray-400 italic">
                                    No types found. Click "Add Type" to create one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL (Add & Edit) --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>

                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className={`h-2 w-full ${editingId ? 'bg-orange-500' : 'bg-blue-600'}`}></div>

                        <div className="flex justify-between items-center p-6 border-b">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">
                                    {editingId ? "Edit Game Type" : "Add New Type"}
                                </h3>
                            </div>
                            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Category Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50"
                                    value={typeName}
                                    onChange={(e) => setTypeName(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="flex gap-3">
                                <button type="button" onClick={closeModal} className="flex-1 px-4 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`flex-1 px-4 py-3 text-sm font-bold text-white rounded-xl shadow-lg transition active:scale-95 ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                >
                                    {editingId ? "Update Type" : "Create Type"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}