import Badge from '@/components/common/Badge';
import DBBadge from '@/components/admin/movie/badge/DBBadge';
import React from 'react';
import { HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi';
import TypeBadge from './badge/TypeBadge';
import UploadDateBadge from './badge/UploadDateBadge';
import Link from 'next/link';
import VisualBadge from '@/components/common/VisualBadge';
import Swal from 'sweetalert2'
import { deleteFileFromGoogleDrive, getGoogleDriveFileUrl, getGoogleDriveImageUrl } from '@/utils/google/manage';
import { FaGoogleDrive } from "react-icons/fa";
import Image from 'next/image';



export default function MovieRow({ movie }) {

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };


    const handleDeleteMovieBtn = (movieId) => {

        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                deleteFileFromGoogleDrive(movie.poster);
                fetch(`/api/movies?id=${movieId}`, {
                    method: 'DELETE',
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        if (data.error) {
                            Swal.fire({
                                title: "Error!",
                                text: data.error,
                                icon: "error"
                            });
                        }
                        else {
                            Swal.fire({
                                title: "Deleted!",
                                text: "The movie has been deleted.",
                                icon: "success"
                            }).then(() => {
                                window.location.reload();
                            });

                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        Swal.fire({
                            title: "Error!",
                            text: "An error occurred while deleting the movie.",
                            icon: "error"
                        });
                    });
            }
        });
    }

    return (
        <tr className="group border-b border-gray-100 hover:bg-blue-50/30 transition-all duration-200">
            <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
                        <img
                            src={getGoogleDriveImageUrl(movie.poster)}
                            alt={movie.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex flex-col gap-1.5">
                    <span className="font-bold text-gray-800 text-base leading-tight group-hover:text-blue-600 transition-colors">
                        {movie.title}  <TypeBadge type={movie.type} />
                    </span>
                    <div className='flex space-x-2'>
                        <Badge title={movie.part_name} />
                        <Link
                            href={getGoogleDriveFileUrl(movie.url)}
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            <VisualBadge title={'View'} />
                        </Link>

                    </div>

                </div>
            </td>

            {/* Technical Specs */}
            <td className="px-6 py-4">
                <div className="flex flex-col gap-2">
                    <DBBadge sourceGmailName={movie.movie_source} movieSize={movie.size} />
                </div>
            </td>

            <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-700">{movie.dubbed_lang}</span>
                </div>
            </td>

            <td className="px-6 py-4">
                <UploadDateBadge date={formatDate(movie.created_at)} />
            </td>

            <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <Link href={`/admin/movies/manage?id=${movie.id}`}
                        title="Edit Movie"
                        className="p-2 hover:bg-blue-100 text-blue-600 rounded-full transition-all active:scale-90"
                    >
                        <HiOutlinePencilAlt size={20} />
                    </Link>
                    <button
                        onClick={() => handleDeleteMovieBtn(movie.id)}
                        title="Delete Movie"
                        className="p-2 hover:bg-red-100 text-red-500 rounded-full transition-all active:scale-90"
                    >
                        <HiOutlineTrash size={20} />
                    </button>
                </div>
            </td>
        </tr>
    );
}