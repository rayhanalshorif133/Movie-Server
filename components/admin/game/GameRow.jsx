import DBBadge from '@/components/admin/movie/badge/DBBadge';
import React from 'react';
import { HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi';
import Link from 'next/link';
import VisualBadge from '@/components/common/VisualBadge';
import Swal from 'sweetalert2'
import { deleteFileFromGoogleDrive, getGoogleDriveFileUrl, getGoogleDriveImageUrl } from '@/utils/google/manage';
import UploadDateBadge from '../movie/badge/UploadDateBadge';

export default function GameRow({ game }) {

    const formatDate = (dateString) => {
        if (!dateString) return 'Recent';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const handleDeleteMovieBtn = (gameId) => {
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
                deleteFileFromGoogleDrive(game.thumbnail_image);
                fetch(`/api/games?id=${gameId}`, {
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
                                text: "The game has been deleted.",
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
                            text: "An error occurred while deleting the game.",
                            icon: "error"
                        });
                    });
            }
        });
    }

    const gameDriveUrl = getGoogleDriveFileUrl(game.url) || '#';

    return (
        <tr className="group border-b border-gray-100 hover:bg-blue-50/30 transition-all duration-200">
            <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                    <Link
                        href={getGoogleDriveFileUrl(game.thumbnail_image)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open image in Google Drive"
                        className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-100 shadow-sm group-hover:shadow-md transition-shadow block cursor-pointer"
                    >
                        <img
                            src={getGoogleDriveImageUrl(game.thumbnail_image)}
                            alt={game.title || 'Game'}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                    </Link>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex flex-col gap-1.5">
                    <span className="font-bold text-gray-800 text-base leading-tight group-hover:text-blue-600 transition-colors">
                        {game.title}
                    </span>
                    <div className='flex space-x-2'>
                        <Link
                            href={gameDriveUrl}
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
                    <DBBadge sourceGmailName={game.gmail || 'drive01@gmail.com'} movieSize={game.size || '500'} />
                </div>
            </td>

            {/* Category */}
            <td className="px-6 py-4">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-violet-50 text-violet-700 uppercase">
                    {game.type || game.game_type || 'Game'}
                </span>
            </td>

            <td className="px-6 py-4">
                <UploadDateBadge date={formatDate(game.created_at)} />
            </td>

            <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <Link href={`/admin/games/manage?id=${game.id}`}
                        title="Edit Game"
                        className="p-2 hover:bg-blue-100 text-blue-600 rounded-full transition-all active:scale-90"
                    >
                        <HiOutlinePencilAlt size={20} />
                    </Link>
                    <button
                        onClick={() => handleDeleteMovieBtn(game.id)}
                        title="Delete Game"
                        className="p-2 hover:bg-red-100 text-red-500 rounded-full transition-all active:scale-90"
                    >
                        <HiOutlineTrash size={20} />
                    </button>
                </div>
            </td>
        </tr>
    );
}
