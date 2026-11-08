"use client";

import React, { useState, useMemo, useTransition } from "react";
import { 
  Loader2, 
  Eye, 
  Search, 
  Check, 
  Copy, 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown,
  RefreshCw,
  HardDrive,
  Film
} from "lucide-react";
import axios from "axios";
import Badge from "@/components/common/Badge";
import LastLoginTime from "./_partials/LastLoginTime";
import GmailOrderByToggle from "./_partials/GmailOrderByToggle";
import AutoSyncProgressModal from "./AutoSyncProgressModal";
import Swal from "sweetalert2";
import { RxCross2 } from "react-icons/rx";
import { IoReload } from "react-icons/io5";

export default function GmailDataTable({ initialEmails = [] }) {
  const [emails, setEmails] = useState(initialEmails);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [autoUpdating, setAutoUpdating] = useState(false);
  const [orderBy, setOrderBy] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openRows, setOpenRows] = useState(new Set());
  const [copiedId, setCopiedId] = useState(null);
  const [isPending, startTransition] = useTransition();

  // Progress Countdown Modal State
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState("syncing");
  const [syncError, setSyncError] = useState("");

  // Dynamically estimate processing duration based on account count
  const estimatedSyncSeconds = useMemo(() => {
    const count = emails.length || 8;
    return Math.max(10, Math.min(22, Math.round(count * 0.7 + 6)));
  }, [emails.length]);

  // Fetch / refresh data from API
  const getData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/gmails?page=0&limit=1000", {
        cache: "no-store",
      });
      const result = await response.json();
      if (response.ok && Array.isArray(result.data)) {
        startTransition(() => {
          setEmails(result.data);
        });
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Auto Gmail Update action with live countdown & progress tracker
  const autoGmailUpdateBtn = async () => {
    setSyncStatus("syncing");
    setSyncError("");
    setSyncModalOpen(true);
    setAutoUpdating(true);

    try {
      await axios.get("/api/gmails/autoupdate");
      await getData();
      setSyncStatus("success");

      // Give user time to see 100% finished state
      setTimeout(() => {
        setSyncModalOpen(false);
        setAutoUpdating(false);
        Swal.fire({
          title: "Updated!",
          text: "Gmail storage data and movie allocations successfully synchronized.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }, 900);
    } catch (error) {
      console.error("Network error:", error);
      setSyncStatus("error");
      setSyncError(
        error.response?.data?.error || error.message || "Failed to auto-update Gmail storage."
      );
      setAutoUpdating(false);
    }
  };

  // Toggle expanded movies row
  const toggleMovies = (id) => {
    setOpenRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
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
      setSortDirection(field === "used_space" || field === "created_at" || field === "movies_count" ? "desc" : "asc");
    }
    setCurrentPage(1);
  };

  // Filter & Sort
  const filteredEmails = useMemo(() => {
    let result = [...emails];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((item) => {
        const nameMatch = (item.name || "").toLowerCase().includes(q);
        const moviesMatch = (item.movies || "").toLowerCase().includes(q);
        const spaceMatch = String(item.used_space || "").includes(q);
        return nameMatch || moviesMatch || spaceMatch;
      });
    }

    // Sorting
    result.sort((a, b) => {
      let valA = a[orderBy];
      let valB = b[orderBy];

      if (orderBy === "used_space") {
        valA = parseFloat(valA) || 0;
        valB = parseFloat(valB) || 0;
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }

      if (orderBy === "movies_count") {
        const countA = a.movies ? a.movies.split(",").length : 0;
        const countB = b.movies ? b.movies.split(",").length : 0;
        return sortDirection === "asc" ? countA - countB : countB - countA;
      }

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

      const strA = String(valA || "").toLowerCase();
      const strB = String(valB || "").toLowerCase();
      if (strA < strB) return sortDirection === "asc" ? -1 : 1;
      if (strA > strB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [emails, search, orderBy, sortDirection]);

  // Pagination calculation
  const totalItems = filteredEmails.length;
  const effectivePageSize = pageSize === "all" ? totalItems || 1 : Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(totalItems / effectivePageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedEmails = useMemo(() => {
    if (pageSize === "all") return filteredEmails;
    const from = (validCurrentPage - 1) * effectivePageSize;
    return filteredEmails.slice(from, from + effectivePageSize);
  }, [filteredEmails, validCurrentPage, effectivePageSize, pageSize]);

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

  // Storage calculation for metrics
  const totalStorageAllocatedGB = useMemo(() => {
    const total = emails.reduce((sum, item) => sum + (parseFloat(item.used_space) || 0), 0);
    return total.toFixed(1);
  }, [emails]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
      {/* Header Toolbar */}
      <div className="p-5 border-b border-gray-100 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-bold text-gray-900 text-lg">Gmail Storage Nodes</h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {emails.length} Active Nodes
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {totalStorageAllocatedGB} GB Used
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Monitor Google Drive storage capacity, last account logins, and movie allocations
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Auto Update from Drive/Movies Button */}
            <button
              onClick={autoGmailUpdateBtn}
              disabled={autoUpdating}
              title="Recalculate and sync movie allocations from Google Drive"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {autoUpdating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Syncing Storage...</span>
                </>
              ) : (
                <>
                  <IoReload className="w-3.5 h-3.5" />
                  <span>Auto Update Sync</span>
                </>
              )}
            </button>

            {/* Quick Refresh Button */}
            <button
              onClick={getData}
              disabled={loading}
              title="Refresh database records"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
              <span>Refresh</span>
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
              placeholder="Instant search email, movie title in node..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
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
              hasSpaceBtn={true} 
              orderBy={orderBy} 
              setOrderBy={(field) => {
                setOrderBy(field);
                setSortDirection(field === "used_space" || field === "created_at" ? "desc" : "asc");
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
              className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer shadow-2xs"
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
                onClick={() => handleSort("name")}
                className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Gmail Account</span>
                  {orderBy === "name" ? (
                    sortDirection === "asc" ? (
                      <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                    )
                  ) : (
                    <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500" />
                  )}
                </div>
              </th>
              <th 
                onClick={() => handleSort("movies_count")}
                className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Movies Assigned</span>
                  {orderBy === "movies_count" ? (
                    sortDirection === "asc" ? (
                      <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                    )
                  ) : (
                    <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500" />
                  )}
                </div>
              </th>
              <th 
                onClick={() => handleSort("used_space")}
                className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Used Space (15 GB Quota)</span>
                  {orderBy === "used_space" ? (
                    sortDirection === "asc" ? (
                      <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                    )
                  ) : (
                    <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500" />
                  )}
                </div>
              </th>
              <th 
                onClick={() => handleSort("last_login")}
                className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Last Account Login</span>
                  {orderBy === "last_login" ? (
                    sortDirection === "asc" ? (
                      <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
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
                <td colSpan={5} className="py-20 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                  <p className="text-xs text-gray-400 mt-2 font-medium">Loading Gmail storage nodes...</p>
                </td>
              </tr>
            ) : paginatedEmails.length > 0 ? (
              paginatedEmails.map((item, index) => {
                const movies = item.movies ? item.movies.split(",").map((m) => m.trim()).filter(Boolean) : [];
                const usedGB = parseFloat(item.used_space) || 0;
                const percentage = Math.min(100, Math.round((usedGB / 15) * 100));
                const isExpanded = openRows.has(item.id);
                const isCopied = copiedId === item.id;
                const globalIndex = (validCurrentPage - 1) * effectivePageSize + index + 1;

                // Color code storage percentage
                let barColor = "bg-emerald-500";
                let badgeBg = "bg-emerald-50 text-emerald-700 border-emerald-200";
                if (percentage >= 95) {
                  barColor = "bg-rose-500";
                  badgeBg = "bg-rose-50 text-rose-700 border-rose-200";
                } else if (percentage >= 80) {
                  barColor = "bg-amber-500";
                  badgeBg = "bg-amber-50 text-amber-700 border-amber-200";
                }

                return (
                  <React.Fragment key={item.id}>
                    <tr className={`hover:bg-blue-50/30 transition-colors ${isExpanded ? "bg-blue-50/20" : ""}`}>
                      {/* Index */}
                      <td className="px-6 py-4 text-xs font-bold text-gray-400">
                        {globalIndex}
                      </td>

                      {/* Gmail Name with Copy */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-800 lowercase">
                            {item.name}
                          </span>
                          <button
                            onClick={() => handleCopyEmail(item.id, item.name)}
                            title={isCopied ? "Copied to clipboard!" : "Copy Gmail address"}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded transition cursor-pointer"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Movies Button & Toggle */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleMovies(item.id)}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer shadow-2xs ${
                            isExpanded
                              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                              : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{movies.length} {movies.length === 1 ? "Movie" : "Movies"}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3 ml-0.5 opacity-80" />
                          ) : (
                            <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
                          )}
                        </button>
                      </td>

                      {/* Used Space & Quota Bar */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 max-w-[200px]">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-gray-800">{usedGB} GB</span>
                            <span className="text-[11px] font-semibold text-gray-400">{percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Last Login */}
                      <td className="px-6 py-4">
                        <LastLoginTime 
                          getData={getData} 
                          id={item.id} 
                          last_login={item.last_login} 
                          type="gmails" 
                        />
                      </td>
                    </tr>

                    {/* Expandable Movies Drawer */}
                    {isExpanded && (
                      <tr className="bg-gradient-to-b from-blue-50/30 to-indigo-50/20 border-b border-gray-100">
                        <td colSpan={5} className="px-8 py-5">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Film className="w-4 h-4 text-blue-600" />
                                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                  Catalog Assets in {item.name} ({movies.length})
                                </span>
                              </div>
                              <span className="text-xs text-gray-400">
                                Allocated Storage: <strong className="text-gray-700">{usedGB} GB</strong>
                              </span>
                            </div>

                            {movies.length > 0 ? (
                              <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1">
                                {movies.map((movie, idx) => (
                                  <Badge key={idx} title={movie} />
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400 italic">
                                No movies currently allocated to this storage node.
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-gray-400">
                  <p className="text-sm font-semibold text-gray-600">No storage accounts found</p>
                  <p className="text-xs text-gray-400 mt-1">
                    No accounts matched your search keyword &apos;{search}&apos;.
                  </p>
                  <button
                    onClick={() => {
                      setSearch("");
                      setCurrentPage(1);
                    }}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition cursor-pointer"
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
            <span className="font-bold text-gray-700">{totalItems}</span> storage nodes
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
                      ? "bg-blue-600 text-white shadow-xs"
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

      {/* Auto Sync Countdown & Progress Tracker Modal */}
      <AutoSyncProgressModal
        isOpen={syncModalOpen}
        status={syncStatus}
        errorMessage={syncError}
        estimatedSeconds={estimatedSyncSeconds}
        onClose={() => setSyncModalOpen(false)}
      />
    </div>
  );
}
