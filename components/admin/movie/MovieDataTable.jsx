"use client";

import React, { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import MovieRow from "./MovieRow";
import { 
  HiOutlineMagnifyingGlass, 
  HiOutlineArrowPath, 
  HiOutlineChevronUpDown, 
  HiOutlineChevronUp, 
  HiOutlineChevronDown 
} from "react-icons/hi2";
import { RxCross2 } from "react-icons/rx";
import { FcFilmReel, FcFolder, FcDatabase, FcPlus } from "react-icons/fc";

export default function MovieDataTable({ initialMovies = [] }) {
  const [movies, setMovies] = useState(initialMovies);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Extract distinct types & sources with counts
  const { availableTypes, availableSources, totalStorageGB } = useMemo(() => {
    const typesMap = {};
    const sourcesMap = {};
    let totalMB = 0;

    movies.forEach((m) => {
      const type = (m.type || "other").toLowerCase().trim();
      typesMap[type] = (typesMap[type] || 0) + 1;

      const source = (m.movie_source || "unknown").toLowerCase().trim();
      sourcesMap[source] = (sourcesMap[source] || 0) + 1;

      const sizeNum = parseFloat(m.size) || 0;
      totalMB += sizeNum;
    });

    const types = Object.keys(typesMap).sort();
    const sources = Object.keys(sourcesMap).sort();
    const storageGB = (totalMB / 1024).toFixed(1);

    return { 
      availableTypes: types, 
      availableSources: sources, 
      totalStorageGB: storageGB 
    };
  }, [movies]);

  // Filtered & Sorted Movies
  const filteredMovies = useMemo(() => {
    let result = [...movies];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((m) => {
        const titleMatch = (m.title || "").toLowerCase().includes(q);
        const sourceMatch = (m.movie_source || "").toLowerCase().includes(q);
        const langMatch = (m.dubbed_lang || "").toLowerCase().includes(q);
        const partMatch = (m.part_name || "").toLowerCase().includes(q);
        const typeMatch = (m.type || "").toLowerCase().includes(q);
        return titleMatch || sourceMatch || langMatch || partMatch || typeMatch;
      });
    }

    // Type filter
    if (selectedType !== "all") {
      result = result.filter(
        (m) => (m.type || "").toLowerCase().trim() === selectedType
      );
    }

    // Source filter
    if (selectedSource !== "all") {
      result = result.filter(
        (m) => (m.movie_source || "").toLowerCase().trim() === selectedSource
      );
    }

    // Sorting
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "size") {
        valA = parseFloat(valA) || 0;
        valB = parseFloat(valB) || 0;
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }

      if (sortField === "created_at") {
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
  }, [movies, search, selectedType, selectedSource, sortField, sortDirection]);

  // Pagination calculation
  const totalItems = filteredMovies.length;
  const effectivePageSize = pageSize === "all" ? totalItems || 1 : Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(totalItems / effectivePageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedMovies = useMemo(() => {
    if (pageSize === "all") return filteredMovies;
    const from = (validCurrentPage - 1) * effectivePageSize;
    return filteredMovies.slice(from, from + effectivePageSize);
  }, [filteredMovies, validCurrentPage, effectivePageSize, pageSize]);

  // Handle in-place optimistic delete
  const handleDeleteSuccess = (deletedId) => {
    setMovies((prev) => prev.filter((m) => String(m.id) !== String(deletedId)));
  };

  // Handle column header sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "created_at" || field === "size" ? "desc" : "asc");
    }
    setCurrentPage(1);
  };

  // Refresh data from API
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/movies", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          startTransition(() => {
            setMovies(data);
          });
        }
      }
    } catch (err) {
      console.error("Failed to refresh movies:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearch("");
    setSelectedType("all");
    setSelectedSource("all");
    setCurrentPage(1);
  };

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
    <div className="space-y-6">
      {/* Dynamic KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl shadow-2xs border border-gray-100 flex items-center gap-4 border-l-4 border-l-blue-600 transition-all hover:shadow-sm">
          <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-100 shrink-0">
            <FcFilmReel className="text-3xl" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Total Movies
            </p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">
              {movies.length}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-2xs border border-gray-100 flex items-center gap-4 border-l-4 border-l-indigo-600 transition-all hover:shadow-sm">
          <div className="p-2.5 bg-indigo-50/80 rounded-xl border border-indigo-100 shrink-0">
            <FcFolder className="text-3xl" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              {search || selectedType !== "all" || selectedSource !== "all"
                ? "Filtered Matches"
                : "Active Catalog"}
            </p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">
              {totalItems} <span className="text-xs font-semibold text-gray-400">({validCurrentPage}/{totalPages} pgs)</span>
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-2xs border border-gray-100 flex items-center gap-4 border-l-4 border-l-emerald-600 transition-all hover:shadow-sm">
          <div className="p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-100 shrink-0">
            <FcDatabase className="text-3xl" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Media Pool Size
            </p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">
              {totalStorageGB} GB
            </h3>
          </div>
        </div>
      </div>

      {/* Main DataTable Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
        {/* Toolbar Header */}
        <div className="p-5 border-b border-gray-100 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-bold text-gray-900 text-lg">Movies DataTable</h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {totalItems} Available
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Instant client-side search, filtering, and multi-column sorting
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                title="Refresh from Google Sheets"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                <HiOutlineArrowPath className={`text-sm ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
                <span>{isRefreshing ? "Syncing..." : "Refresh"}</span>
              </button>

              {/* Add Movie Action Button */}
              <Link
                href="/admin/movies/manage"
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <FcPlus className="text-base" />
                <span>Add Movie</span>
              </Link>
            </div>
          </div>

          {/* Search & Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            {/* Search Box */}
            <div className="relative lg:col-span-5">
              <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
              <input
                type="text"
                placeholder="Instant search by title, source, dubbed language..."
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

            {/* Type Filter */}
            <div className="lg:col-span-3">
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer capitalize shadow-2xs"
              >
                <option value="all">All Movie Types ({movies.length})</option>
                {availableTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Storage Node Filter */}
            <div className="lg:col-span-2">
              <select
                value={selectedSource}
                onChange={(e) => {
                  setSelectedSource(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer shadow-2xs"
              >
                <option value="all">All Storage Nodes</option>
                {availableSources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>

            {/* Page Size Selector */}
            <div className="lg:col-span-2 flex items-center justify-end gap-2 text-xs text-gray-500">
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
                <option value={100}>100 / page</option>
                <option value="all">View All</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/75 border-b border-gray-100 select-none">
              <tr>
                <th className="px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Poster
                </th>
                <th 
                  onClick={() => handleSort("title")}
                  className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Title & Specs</span>
                    {sortField === "title" ? (
                      sortDirection === "asc" ? (
                        <HiOutlineChevronUp className="text-blue-600 text-xs" />
                      ) : (
                        <HiOutlineChevronDown className="text-blue-600 text-xs" />
                      )
                    ) : (
                      <HiOutlineChevronUpDown className="text-gray-300 group-hover:text-gray-500 text-xs" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("movie_source")}
                  className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Storage Node & Size</span>
                    {sortField === "movie_source" ? (
                      sortDirection === "asc" ? (
                        <HiOutlineChevronUp className="text-blue-600 text-xs" />
                      ) : (
                        <HiOutlineChevronDown className="text-blue-600 text-xs" />
                      )
                    ) : (
                      <HiOutlineChevronUpDown className="text-gray-300 group-hover:text-gray-500 text-xs" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("dubbed_lang")}
                  className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Audio / Dubbed</span>
                    {sortField === "dubbed_lang" ? (
                      sortDirection === "asc" ? (
                        <HiOutlineChevronUp className="text-blue-600 text-xs" />
                      ) : (
                        <HiOutlineChevronDown className="text-blue-600 text-xs" />
                      )
                    ) : (
                      <HiOutlineChevronUpDown className="text-gray-300 group-hover:text-gray-500 text-xs" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("created_at")}
                  className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Upload Date</span>
                    {sortField === "created_at" ? (
                      sortDirection === "asc" ? (
                        <HiOutlineChevronUp className="text-blue-600 text-xs" />
                      ) : (
                        <HiOutlineChevronDown className="text-blue-600 text-xs" />
                      )
                    ) : (
                      <HiOutlineChevronUpDown className="text-gray-300 group-hover:text-gray-500 text-xs" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {paginatedMovies.length > 0 ? (
                paginatedMovies.map((movie) => (
                  <MovieRow 
                    key={movie.id} 
                    movie={movie} 
                    onDelete={handleDeleteSuccess} 
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                    <p className="text-sm font-semibold text-gray-600">No movies found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      No titles matched your current search and filter settings.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition cursor-pointer"
                    >
                      Reset All Filters
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
              <span className="font-bold text-gray-700">{totalItems}</span> movies
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
      </div>
    </div>
  );
}

