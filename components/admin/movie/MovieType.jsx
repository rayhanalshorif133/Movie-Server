"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Edit2, X, Loader2, Search, Film, CheckCircle2 } from "lucide-react";
import Swal from "sweetalert2";

export default function MovieType() {
    // States
    const [types, setTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [typeName, setTypeName] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const API_URL = "/api/movies/type";

    const fetchTypes = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setTypes(data);
            }
        } catch (error) {
            console.error("Failed to fetch movie types:", error);
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
        setIsSubmitting(false);
    };

    // Format category name for nice display (e.g. kolkata-bangla -> Kolkata Bangla)
    const formatLabel = (name) => {
        if (!name) return "";
        return String(name)
            .replace(/[-_]/g, " ")
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
    };

    // Filter types by search query
    const filteredTypes = useMemo(() => {
        if (!searchQuery.trim()) return types;
        const q = searchQuery.toLowerCase().trim();
        return types.filter((t) => {
            const name = typeof t === "object" ? t.name : t;
            return String(name).toLowerCase().includes(q);
        });
    }, [types, searchQuery]);

    // --- 1. Create & Update Logic ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = typeName.trim();
        if (!trimmed) return;

        setIsSubmitting(true);
        const method = editingId ? "PUT" : "POST";
        const body = editingId
            ? JSON.stringify({ id: editingId, name: trimmed })
            : JSON.stringify({ name: trimmed });

        try {
            const res = await fetch(API_URL, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: body,
            });

            const result = await res.json();

            if (res.ok) {
                await fetchTypes();
                closeModal();
                Swal.fire({
                    title: editingId ? "Updated!" : "Created!",
                    text: editingId ? "Movie type has been updated." : "New movie type added successfully.",
                    icon: "success",
                    timer: 1600,
                    showConfirmButton: false,
                });
            } else {
                Swal.fire({
                    title: "Error!",
                    text: result.error || "Something went wrong.",
                    icon: "error",
                });
            }
        } catch (error) {
            console.error("Action failed:", error);
            Swal.fire({
                title: "Error!",
                text: "Failed to connect to the server.",
                icon: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- 2. Delete Logic ---
    const handleDelete = async (id, name) => {
        Swal.fire({
            title: "Are you sure?",
            text: `Do you want to delete "${formatLabel(name)}"? Movies assigned to this type may need to be updated.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#2563eb",
            cancelButtonColor: "#ef4444",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
            customClass: {
                confirmButton: "px-5 py-2.5 rounded-lg font-semibold",
                cancelButton: "px-5 py-2.5 rounded-lg font-semibold",
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`${API_URL}?id=${id}`, {
                        method: "DELETE",
                    });

                    if (res.ok) {
                        setTypes((prev) => prev.filter((item) => item.id !== id));
                        Swal.fire({
                            title: "Deleted!",
                            text: "Movie type has been deleted successfully.",
                            icon: "success",
                            timer: 1500,
                            showConfirmButton: false,
                        });
                    } else {
                        const err = await res.json();
                        Swal.fire("Error!", err.error || "Failed to delete the item.", "error");
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
            {/* Header Card */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600">
                        <Film size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Movie Types</h3>
                        <p className="text-sm text-gray-500">
                            {isLoading ? "Loading categories..." : `Total ${types.length} movie types available`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Search Bar */}
                    <div className="relative flex-1 sm:w-60">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search types..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => openModal()}
                        className="flex cursor-pointer items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md active:scale-95 whitespace-nowrap"
                    >
                        <Plus size={18} />
                        Add Type
                    </button>
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-16">#</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Type / Category</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Slug / Value</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Created Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {isLoading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center">
                                    <Loader2 className="animate-spin mx-auto text-amber-500 mb-2" size={28} />
                                    <span className="text-sm text-gray-400">Loading movie types...</span>
                                </td>
                            </tr>
                        ) : filteredTypes.length > 0 ? (
                            filteredTypes.map((type, index) => {
                                const id = type.id || String(index + 1);
                                const name = typeof type === "object" ? type.name : type;
                                const createdAt = type.created_at
                                    ? new Date(type.created_at).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                      })
                                    : "Default";

                                return (
                                    <tr key={id} className="group hover:bg-amber-50/30 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-400 font-mono">#{index + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-800">
                                                    {formatLabel(name)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md border border-gray-200">
                                                {name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500 hidden md:table-cell">
                                            {createdAt}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1.5">
                                                <button
                                                    onClick={() => openModal(type)}
                                                    className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                                                    title="Edit Movie Type"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(id, name)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete Movie Type"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                                    {searchQuery
                                        ? `No movie types matching "${searchQuery}"`
                                        : 'No movie types found. Click "Add Type" to create one.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL (Add & Edit) --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
                        onClick={closeModal}
                    ></div>

                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className={`h-2 w-full ${editingId ? "bg-amber-500" : "bg-gradient-to-r from-amber-500 to-yellow-500"}`}></div>

                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">
                                    {editingId ? "Edit Movie Type" : "Add New Movie Type"}
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {editingId ? "Update existing category details" : "Create a new category for movies"}
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Movie Type Name / Slug
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. anime, korean-drama, web-series"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800"
                                    value={typeName}
                                    onChange={(e) => setTypeName(e.target.value)}
                                    autoFocus
                                    required
                                />
                                <p className="text-xs text-gray-400 mt-2">
                                    Format: lowercase letters, numbers or hyphens (e.g. <code>korean-drama</code>)
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white rounded-xl shadow-lg transition active:scale-95 cursor-pointer ${
                                        editingId
                                            ? "bg-amber-600 hover:bg-amber-700"
                                            : "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : editingId ? (
                                        "Update Type"
                                    ) : (
                                        "Create Type"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
