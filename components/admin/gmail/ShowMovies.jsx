import React from 'react'
import Badge from '@/components/common/Badge'

export default function ShowMovies({ items }) {

  const movies = items.movies ? items.movies.split(',') : [];

  return (
    <tr>
      <td colSpan={5} className="px-6 py-4 bg-gray-50">
        <div className="flex flex-wrap gap-2 justify-center">
          {movies.map((movie, index) => (
            <Badge key={index} title={movie.trim()} />
          ))}
        </div>

      </td>
    </tr>
  )
}