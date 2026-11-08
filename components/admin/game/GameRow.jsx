import DBBadge from '@/components/admin/movie/badge/DBBadge';
import React, { useState } from 'react';
import { HiOutlinePencilAlt, HiOutlineTrash, HiOutlineClipboardCopy, HiOutlineCheck } from 'react-icons/hi';
import Link from 'next/link';
import VisualBadge from '@/components/common/VisualBadge';
import Swal from 'sweetalert2'
import { deleteFileFromGoogleDrive, getGoogleDriveFileUrl, getGoogleDriveImageUrl } from '@/utils/google/manage';
import UploadDateBadge from '../movie/badge/UploadDateBadge';

export default function GameRow({ game, onDelete }) {
    const [copied, setCopied] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return 'Recent';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const handleDeleteGameBtn = (gameId) => {
        Swal.fire({
            title: "Are you sure?",
            text: `Are you sure you want to delete "${game.title || 'this game'}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#7c3aed",
            cancelButtonColor: "#ef4444",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                if (game.thumbnail_image) {
                    deleteFileFromGoogleDrive(game.thumbnail_image);
                }
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
                                icon: "success",
                                timer: 1200,
                                showConfirmButton: false
                            });
                            if (onDelete) {
                                onDelete(gameId);
                            } else {
                                window.location.reload();
                            }
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
    };

    const gameDriveUrl = getGoogleDriveFileUrl(game.url) || '#';

    const handleCopyLink = () => {
        if (gameDriveUrl && gameDriveUrl !== '#') {
            navigator.clipboard.writeText(gameDriveUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <tr className="group border-b border-gray-100 hover:bg-violet-50/30 transition-all duration-200">
            <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                    <Link
                        href={getGoogleDriveFileUrl(game.thumbnail_image)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open image in Google Drive"
                        className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-100 shadow-sm group-hover:shadow-md transition-shadow block cursor-pointer bg-gray-100"
                    >
                        <img
                            src={getGoogleDriveImageUrl(game.thumbnail_image)}
                            alt={game.title || 'Game'}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                    </Link>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex flex-col gap-1.5">
                    <span className="font-bold text-gray-800 text-base leading-tight group-hover:text-violet-600 transition-colors">
                        {game.title}
                    </span>
                    <div className='flex items-center space-x-2'>
                        <Link
                            href={gameDriveUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            <VisualBadge title={'View Asset'} />
                        </Link>
                        {gameDriveUrl !== '#' && (
                            <button
                                onClick={handleCopyLink}
                                title={copied ? "Copied Drive link!" : "Copy Drive link"}
                                className="p-1 text-gray-400 hover:text-violet-600 rounded transition cursor-pointer"
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
                    <DBBadge sourceGmailName={game.gmail || 'drive01@gmail.com'} movieSize={game.size || '500'} />
                </div>
            </td>

            {/* Category */}
            <td className="px-6 py-4">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-violet-50 text-violet-700 uppercase border border-violet-100">
                    {game.type || game.game_type || 'Game'}
                </span>
            </td>

            <td className="px-6 py-4">
                <UploadDateBadge date={formatDate(game.created_at)} />
            </td>

            <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all transform sm:translate-x-2 group-hover:translate-x-0">
                    <Link 
                        href={`/admin/games/manage?id=${game.id}`}
                        title="Edit Game"
                        className="p-2 hover:bg-violet-100 text-violet-600 rounded-full transition-all active:scale-90"
                    >
                        <HiOutlinePencilAlt size={20} />
                    </Link>
                    <button
                        onClick={() => handleDeleteGameBtn(game.id)}
                        title="Delete Game"
                        className="p-2 hover:bg-red-100 text-red-500 rounded-full transition-all active:scale-90 cursor-pointer"
                    >
                        <HiOutlineTrash size={20} />
                    </button>
                </div>
            </td>
        </tr>
    );
}
