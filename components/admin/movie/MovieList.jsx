"use client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react" // useEffect add kora hoyeche
import MovieRow from "./MovieRow"

export default function MovieList({
  movieData,
  totalCount,
  currentPage,
  search,
  limit
}) {
  const router = useRouter()
  const [searchText, setSearchText] = useState(search || "")

  useEffect(() => {
    setSearchText(search || "");
  }, [search]);

  const totalPages = Math.ceil(totalCount / limit)

  useEffect(() => {
    if (searchText === (search || "")) return;

    const delayDebounceFn = setTimeout(() => {
      router.push(`?search=${searchText}&page=1`)
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchText, router, search])

  const goToPage = (page) => {
    router.push(`?search=${searchText}&page=${page}`)
  }



  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* Header + Search */}
      <div className="p-6 border-b border-gray-50 flex justify-between items-center">
        <h3 className="font-bold text-gray-800 text-lg">Movies List</h3>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by title..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)} // Type korlei state update hobe
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Poster</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Title</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Storage Info</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Dubbed</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Upload Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {movieData.length > 0 ? (
              movieData.map((movie) => {
                return <MovieRow key={movie.id} movie={movie} />;
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-400 italic">
                  No movies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`px-3 cursor-pointer hover:bg-black hover:text-white py-1 rounded-lg text-sm border ${page === currentPage
                ? "bg-black text-white"
                : "bg-white text-gray-600"
                }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}