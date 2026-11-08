import Badge from '@/components/common/Badge';
import DBBadge from '@/components/admin/movie/badge/DBBadge';
import React, { useState } from 'react';
import { HiOutlinePencilAlt, HiOutlineTrash, HiOutlineClipboardCopy, HiOutlineCheck } from 'react-icons/hi';
import TypeBadge from './badge/TypeBadge';
import UploadDateBadge from './badge/UploadDateBadge';
import Link from 'next/link';
import VisualBadge from '@/components/common/VisualBadge';
import Swal from 'sweetalert2'
import { deleteFileFromGoogleDrive, getGoogleDriveFileUrl, getGoogleDriveImageUrl } from '@/utils/google/manage';

export default function MovieRow({ movie, onDelete }) {
    const [copied, setCopied] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return 'Recent';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const handleDeleteMovieBtn = (movieId) => {
        Swal.fire({
            title: "Are you sure?",
            text: `Are you sure you want to delete "${movie.title || 'this movie'}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#2563eb",
            cancelButtonColor: "#ef4444",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                if (movie.poster) {
                    deleteFileFromGoogleDrive(movie.poster);
                }
                fetch(`/api/movies?id=${movieId}`, {
                    method: 'DELETE',
                })
                    .then(response => response.json())
                    .then(data => {
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
                                icon: "success",
                                timer: 1200,
                                showConfirmButton: false
                            });
                            if (onDelete) {
                                onDelete(movieId);
                            } else {
                                window.location.reload();
                            }
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
    };

    const driveUrl = getGoogleDriveFileUrl(movie.url || movie.file_id) || '#';

    const handleCopyLink = () => {
        if (driveUrl && driveUrl !== '#') {
            navigator.clipboard.writeText(driveUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <tr className="group border-b border-gray-100 hover:bg-blue-50/40 transition-all duration-200">
            <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                    <Link
                        href={getGoogleDriveFileUrl(movie.poster)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open poster in Google Drive"
                        className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-100 shadow-sm group-hover:shadow-md transition-shadow block cursor-pointer bg-gray-100"
                    >
                        <img
                            src={getGoogleDriveImageUrl(movie.poster)}
                            alt={movie.title || 'Movie'}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                    </Link>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex flex-col gap-1.5">
                    <span className="font-bold text-gray-800 text-base leading-tight group-hover:text-blue-600 transition-colors">
                        {movie.title} <TypeBadge type={movie.type} />
                    </span>
                    <div className='flex items-center space-x-2'>
                        <Badge title={movie.part_name || 'Full Movie'} />
                        <Link
                            href={driveUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            <VisualBadge title={'View'} />
                        </Link>
                        {driveUrl !== '#' && (
                            <button
                                onClick={handleCopyLink}
                                title={copied ? "Copied Drive link!" : "Copy Drive link"}
                                className="p-1 text-gray-400 hover:text-blue-600 rounded transition cursor-pointer"
                            >
                                {copied ? (
                                    <HiOutlineCheck className="text-emerald-600 text-xs" />
                                ) : (
                                    <HiOutlineClipboardCopy className="text-xs" />
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </td>

            {/* Technical Specs */}
            <td className="px-6 py-4">
                <div className="flex flex-col gap-2">
                    <DBBadge sourceGmailName={movie.movie_source || 'drive01@gmail.com'} movieSize={movie.size || '1500'} />
                </div>
            </td>

            <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-700">{movie.dubbed_lang || 'N/A'}</span>
                </div>
            </td>

            <td className="px-6 py-4">
                <UploadDateBadge date={formatDate(movie.created_at)} />
            </td>

            <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all transform sm:translate-x-2 group-hover:translate-x-0">
                    <Link 
                        href={`/admin/movies/manage?id=${movie.id}`}
                        title="Edit Movie"
                        className="p-2 hover:bg-blue-100 text-blue-600 rounded-full transition-all active:scale-90"
                    >
                        <HiOutlinePencilAlt size={20} />
                    </Link>
                    <button
                        onClick={() => handleDeleteMovieBtn(movie.id)}
                        title="Delete Movie"
                        className="p-2 hover:bg-red-100 text-red-500 rounded-full transition-all active:scale-90 cursor-pointer"
                    >
                        <HiOutlineTrash size={20} />
                    </button>
                </div>
            </td>
        </tr>
    );
}
