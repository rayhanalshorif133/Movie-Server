"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import GameRow from "./GameRow";
import Link from "next/link";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { RxCross2 } from "react-icons/rx";
import { FcPlus } from "react-icons/fc";

export default function GameList({
  gameData,
  totalCount,
  currentPage,
  search,
  limit
}) {
  const router = useRouter();
  const [searchText, setSearchText] = useState(search || "");

  useEffect(() => {
    setSearchText(search || "");
  }, [search]);

  const totalPages = Math.ceil(totalCount / limit) || 1;

  useEffect(() => {
    if (searchText === (search || "")) return;

    const delayDebounceFn = setTimeout(() => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent('admin-nav-start'));
      }
      router.push(`?search=${encodeURIComponent(searchText)}&page=1`);
    }, 450);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText, router, search]);

  const goToPage = (page) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent('admin-nav-start'));
    }
    router.push(`?search=${encodeURIComponent(searchText)}&page=${page}`);
  };

  const startCount = (currentPage - 1) * limit + 1;
  const endCount = Math.min(currentPage * limit, totalCount);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
      {/* Header Toolbar */}
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="font-bold text-gray-900 text-lg">Games & Assets</h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
              {totalCount} Total
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {totalCount > 0 ? `Showing ${startCount}-${endCount} of ${totalCount} items` : 'No games'}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
            <input
              type="text"
              placeholder="Search by game title..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-violet-500 transition-colors"
            />
            {searchText && (
              <button
                onClick={() => setSearchText("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <RxCross2 className="text-sm" />
              </button>
            )}
          </div>

          {/* Add Game Button */}
          <Link
            href="/admin/games/manage"
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
          >
            <FcPlus className="text-base" />
            <span>Add Game</span>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/75 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Poster / Preview</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Title & Specs</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Source Node</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {gameData.length > 0 ? (
              gameData.map((game) => <GameRow key={game.id} game={game} />)
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                  <p className="text-sm font-medium">No games or assets found matching your search.</p>
                  {searchText && (
                    <button
                      onClick={() => setSearchText("")}
                      className="mt-2 text-xs text-violet-600 hover:underline font-semibold cursor-pointer"
                    >
                      Clear search
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modern Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-gray-400">
            Page <span className="font-bold text-gray-700">{currentPage}</span> of <span className="font-bold text-gray-700">{totalPages}</span>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 font-medium transition cursor-pointer text-gray-700"
            >
              « First
            </button>
            <button
              onClick={() => goToPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 font-medium transition cursor-pointer text-gray-700"
            >
              ‹ Prev
            </button>

            {/* Page number buttons */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`w-8 h-8 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center ${
                    pageNum === currentPage
                      ? "bg-violet-600 text-white shadow-xs"
                      : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 font-medium transition cursor-pointer text-gray-700"
            >
              Next ›
            </button>
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 font-medium transition cursor-pointer text-gray-700"
            >
              Last »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
