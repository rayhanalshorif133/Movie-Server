"use client";

import React, { useState, useMemo, useTransition } from "react";
import { 
  Loader2, 
  Search, 
  Check, 
  Copy, 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown,
  RefreshCw,
  Plus,
  Mail,
  ShieldCheck,
  Clock
} from "lucide-react";
import axios from "axios";
import Badge from "@/components/common/Badge";
import LastLoginTime from "./_partials/LastLoginTime";
import GmailOrderByToggle from "./_partials/GmailOrderByToggle";
import Swal from "sweetalert2";
import { RxCross2 } from "react-icons/rx";
import { IoReload } from "react-icons/io5";

export default function GmailInventoryDataTable({ initialInventory = [] }) {
  const [inventory, setInventory] = useState(initialInventory);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [autoUpdating, setAutoUpdating] = useState(false);
  const [orderBy, setOrderBy] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [copiedId, setCopiedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGmail, setNewGmail] = useState("");
  const [addingGmail, setAddingGmail] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Fetch / refresh inventory from API
  const getData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/gmails/inventory?page=0&limit=1000", {
        cache: "no-store",
      });
      const result = await response.json();
      if (response.ok && Array.isArray(result.data)) {
        startTransition(() => {
          setInventory(result.data);
        });
      }
    } catch (error) {
      console.error("Fetch inventory error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Auto Gmail Update action
  const autoGmailUpdateBtn = async () => {
    setAutoUpdating(true);
    try {
      await axios.get("/api/gmails/autoupdate");
      await getData();
      Swal.fire({
        title: "Synchronized!",
        text: "Inventory and storage allocation nodes have been updated.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Network error:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to auto-update Gmail inventory.",
        icon: "error",
      });
    } finally {
      setAutoUpdating(false);
    }
  };

  // Add new Gmail to inventory
  const handleAddNewGmail = async (e) => {
    e?.preventDefault();
    const emailToInsert = newGmail.trim();
    if (!emailToInsert) return;

    setAddingGmail(true);
    try {
      const res = await axios.post("/api/gmails/inventory/create-new", {
        emailTitle: emailToInsert,
      });

      if (res.data?.error) {
        Swal.fire({
          title: "Error!",
          text: res.data.error,
          icon: "error",
        });
      } else {
        setNewGmail("");
        setIsModalOpen(false);
        Swal.fire({
          title: "Added!",
          text: `"${emailToInsert}" added to Gmail inventory pool.`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        await getData();
      }
    } catch (error) {
      console.error("Create gmail error:", error);
      Swal.fire({
        title: "Error!",
        text: "Could not add email to inventory.",
        icon: "error",
      });
    } finally {
      setAddingGmail(false);
    }
  };

  // Copy email to clipboard
  const handleCopyEmail = (id, email) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle column header sort
  const handleSort = (field) => {
    if (orderBy === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setOrderBy(field);
      setSortDirection(field === "last_login" || field === "created_at" ? "desc" : "asc");
    }
    setCurrentPage(1);
  };

  // Filter & Sort
  const filteredInventory = useMemo(() => {
    let result = [...inventory];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((item) => {
        const emailMatch = (item.email || item.name || "").toLowerCase().includes(q);
        const statusMatch = item.is_used ? "allocated in use".includes(q) : "free standby".includes(q);
        return emailMatch || statusMatch;
      });
    }

    // Sorting
    result.sort((a, b) => {
      let valA = a[orderBy] || (orderBy === "email" ? a.name : a[orderBy]);
      let valB = b[orderBy] || (orderBy === "email" ? b.name : b[orderBy]);

      if (orderBy === "last_login") {
        const dateA = new Date(valA || 0).getTime();
        const dateB = new Date(valB || 0).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }

      if (orderBy === "created_at") {
        const dateA = new Date(valA || 0).getTime();
        const dateB = new Date(valB || 0).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }

      if (orderBy === "status" || orderBy === "is_used") {
        const usedA = a.is_used ? 1 : 0;
        const usedB = b.is_used ? 1 : 0;
        return sortDirection === "asc" ? usedA - usedB : usedB - usedA;
      }

      const strA = String(valA || "").toLowerCase();
      const strB = String(valB || "").toLowerCase();
      if (strA < strB) return sortDirection === "asc" ? -1 : 1;
      if (strA > strB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [inventory, search, orderBy, sortDirection]);

  // Pagination calculation
  const totalItems = filteredInventory.length;
  const effectivePageSize = pageSize === "all" ? totalItems || 1 : Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(totalItems / effectivePageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedInventory = useMemo(() => {
    if (pageSize === "all") return filteredInventory;
    const from = (validCurrentPage - 1) * effectivePageSize;
    return filteredInventory.slice(from, from + effectivePageSize);
  }, [filteredInventory, validCurrentPage, effectivePageSize, pageSize]);

  // Pagination window generator
  const paginationRange = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const current = validCurrentPage;
    if (current <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (current >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", current - 1, current, current + 1, "...", totalPages];
  }, [totalPages, validCurrentPage]);

  const startRecord = totalItems === 0 ? 0 : (validCurrentPage - 1) * effectivePageSize + 1;
  const endRecord = pageSize === "all" ? totalItems : Math.min(validCurrentPage * effectivePageSize, totalItems);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
      {/* Header Toolbar */}
      <div className="p-5 border-b border-gray-100 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-bold text-gray-900 text-lg">Gmail Account Inventory</h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {inventory.length} Registered Nodes
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Manage standby Google accounts available for movie and game asset cloud storage
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Auto Update Sync Button */}
            <button
              onClick={autoGmailUpdateBtn}
              disabled={autoUpdating}
              title="Sync inventory allocations"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <IoReload className={`text-sm ${autoUpdating ? "animate-spin text-indigo-600" : ""}`} />
              <span>{autoUpdating ? "Syncing..." : "Auto Sync"}</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={getData}
              disabled={loading}
              title="Refresh inventory records"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-600" : ""}`} />
              <span>Refresh</span>
            </button>

            {/* Add New Gmail Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Gmail</span>
            </button>
          </div>
        </div>

        {/* Filter & Sort Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="relative lg:col-span-5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search email in inventory..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors shadow-2xs"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
              >
                <RxCross2 className="text-sm" />
              </button>
            )}
          </div>

          {/* Quick Sort Toggle Pill */}
          <div className="lg:col-span-4 flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 shrink-0">Sort By:</span>
            <GmailOrderByToggle 
              hasSpaceBtn={false} 
              orderBy={orderBy} 
              setOrderBy={(field) => {
                setOrderBy(field);
                setSortDirection(field === "last_login" || field === "created_at" ? "desc" : "asc");
                setCurrentPage(1);
              }} 
            />
          </div>

          {/* Page Size Selector */}
          <div className="lg:col-span-3 flex items-center justify-end gap-2 text-xs text-gray-500">
            <span className="shrink-0 font-medium">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const val = e.target.value === "all" ? "all" : Number(e.target.value);
                setPageSize(val);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer shadow-2xs"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
              <option value="all">View All</option>
            </select>
          </div>
        </div>
      </div>

      {/* DataTable */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/75 border-b border-gray-100 select-none">
            <tr>
              <th className="px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-16">
                #
              </th>
              <th 
                onClick={() => handleSort("email")}
                className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-indigo-600 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Gmail Account Address</span>
                  {orderBy === "email" ? (
                    sortDirection === "asc" ? (
                      <ChevronUp className="w-3.5 h-3.5 text-indigo-600" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />
                    )
                  ) : (
                    <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500" />
                  )}
                </div>
              </th>
              <th 
                onClick={() => handleSort("is_used")}
                className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-indigo-600 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  {orderBy === "is_used" ? (
                    sortDirection === "asc" ? (
                      <ChevronUp className="w-3.5 h-3.5 text-indigo-600" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />
                    )
                  ) : (
                    <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500" />
                  )}
                </div>
              </th>
              <th 
                onClick={() => handleSort("last_login")}
                className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-indigo-600 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Last Account Login</span>
                  {orderBy === "last_login" ? (
                    sortDirection === "asc" ? (
                      <ChevronUp className="w-3.5 h-3.5 text-indigo-600" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />
                    )
                  ) : (
                    <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500" />
                  )}
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
                  <p className="text-xs text-gray-400 mt-2 font-medium">Loading inventory nodes...</p>
                </td>
              </tr>
            ) : paginatedInventory.length > 0 ? (
              paginatedInventory.map((item, index) => {
                const emailAddress = item.email || item.name || "";
                const isCopied = copiedId === item.id;
                const globalIndex = (validCurrentPage - 1) * effectivePageSize + index + 1;
                const isUsed = Boolean(item.is_used);

                return (
                  <tr key={item.id} className="hover:bg-indigo-50/20 transition-colors">
                    {/* Index */}
                    <td className="px-6 py-4 text-xs font-bold text-gray-400">
                      {globalIndex}
                    </td>

                    {/* Email with 1-click copy */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-800 lowercase">
                          {emailAddress}
                        </span>
                        <button
                          onClick={() => handleCopyEmail(item.id, emailAddress)}
                          title={isCopied ? "Copied!" : "Copy email address"}
                          className="p-1 text-gray-400 hover:text-indigo-600 rounded transition cursor-pointer"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      {isUsed ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                          Allocated (Active Node)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          Standby (Available Pool)
                        </span>
                      )}
                    </td>

                    {/* Last Login */}
                    <td className="px-6 py-4">
                      <LastLoginTime 
                        getData={getData} 
                        id={item.id} 
                        last_login={item.last_login} 
                        type="inventory" 
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center text-gray-400">
                  <p className="text-sm font-semibold text-gray-600">No inventory accounts found</p>
                  <p className="text-xs text-gray-400 mt-1">
                    No accounts matched your search keyword &apos;{search}&apos;.
                  </p>
                  <button
                    onClick={() => {
                      setSearch("");
                      setCurrentPage(1);
                    }}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold transition cursor-pointer"
                  >
                    Clear Search
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && pageSize !== "all" && (
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-gray-400">
            Showing <span className="font-bold text-gray-700">{startRecord}</span> to{" "}
            <span className="font-bold text-gray-700">{endRecord}</span> of{" "}
            <span className="font-bold text-gray-700">{totalItems}</span> inventory accounts
          </span>

          <div className="flex items-center gap-1.5 select-none">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={validCurrentPage === 1}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 font-medium transition cursor-pointer text-gray-700"
            >
              « First
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validCurrentPage === 1}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 font-medium transition cursor-pointer text-gray-700"
            >
              ‹ Prev
            </button>

            {paginationRange.map((p, idx) => {
              if (p === "...") {
                return (
                  <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 font-bold">
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center ${
                    p === validCurrentPage
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validCurrentPage === totalPages}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 font-medium transition cursor-pointer text-gray-700"
            >
              Next ›
            </button>

            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={validCurrentPage === totalPages}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 font-medium transition cursor-pointer text-gray-700"
            >
              Last »
            </button>
          </div>
        </div>
      )}

      {/* Add New Gmail Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900">Register New Gmail</h4>
                  <p className="text-xs text-gray-400">Add account to storage inventory pool</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <RxCross2 className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleAddNewGmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Gmail Account Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. storageaccount@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors"
                  value={newGmail}
                  onChange={(e) => setNewGmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingGmail || !newGmail.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {addingGmail ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Add to Inventory</span>
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
