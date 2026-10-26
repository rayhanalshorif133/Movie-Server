"use client"
import MultiImageUploader from '@/components/common/MultiImageUploader';
import { 
  deleteFileFromGoogleDrive, 
  getGoogleDriveImageUrl, 
  getGoogleDriveFileUrl,
  googleDriveToDownload 
} from '@/utils/google/manage';
import axios from 'axios';
import React, { useEffect, useState, useMemo } from 'react';
import { RxCross2, RxCheck, RxDownload } from 'react-icons/rx';
import { FiCopy, FiExternalLink, FiTrash2, FiMaximize2 } from 'react-icons/fi';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import Swal from 'sweetalert2';

const formatImages = (images) => {
  if (!images || !Array.isArray(images)) return [];
  return images.map((item, idx) => ({
    id: item.id || String(idx + 1),
    drive_id: item.drive_id || item.poster || item.file_id || item.id,
    url: item.url || (item.drive_id ? `https://drive.google.com/uc?id=${item.drive_id}` : ''),
    created_at: item.created_at || ''
  })).filter(img => Boolean(img.drive_id));
};

export default function ImageList({ images }) {
  const [rawItems, setRawItems] = useState(() => formatImages(images));
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [selectedForDelete, setSelectedForDelete] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(36);
  const [copiedId, setCopiedId] = useState(null);

  // Sync if images prop changes
  useEffect(() => {
    setRawItems(formatImages(images));
  }, [images]);

  // Handle new uploads from MultiImageUploader
  const handleUploadSuccess = (newDriveIds) => {
    if (newDriveIds && newDriveIds.length > 0) {
      const newItems = newDriveIds.map((id, idx) => ({
        id: String(Date.now() + idx),
        drive_id: id,
        url: `https://drive.google.com/uc?id=${id}`,
        created_at: new Date().toISOString()
      }));
      setRawItems((prev) => [...newItems, ...prev]);
      Swal.fire({
        title: 'Upload Successful!',
        text: `${newDriveIds.length} image(s) uploaded and saved.`,
        icon: 'success',
        timer: 1800,
        showConfirmButton: false
      });
    }
  };

  // Filtered Items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return rawItems;
    const q = searchQuery.toLowerCase().trim();
    return rawItems.filter(item => 
      String(item.drive_id).toLowerCase().includes(q) || 
      String(item.id).toLowerCase().includes(q)
    );
  }, [rawItems, searchQuery]);

  // Pagination calculation
  const totalItems = filteredItems.length;
  const isAll = itemsPerPage === 'all';
  const perPageNum = isAll ? totalItems : Number(itemsPerPage);
  const totalPages = isAll ? 1 : Math.ceil(totalItems / perPageNum) || 1;

  const paginatedItems = useMemo(() => {
    if (isAll) return filteredItems;
    const start = (currentPage - 1) * perPageNum;
    return filteredItems.slice(start, start + perPageNum);
  }, [filteredItems, currentPage, perPageNum, isAll]);

  // Reset page when search or perPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  // Keyboard navigation for full screen slider
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedIdx === null) return;
      if (e.key === 'ArrowRight') {
        setSelectedIdx((prev) => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowLeft') {
        setSelectedIdx((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Escape') {
        setSelectedIdx(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIdx, filteredItems]);

  // Copy Drive ID to clipboard
  const handleCopyId = (driveId, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(driveId);
    setCopiedId(driveId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle selection for bulk delete
  const toggleSelect = (driveId, e) => {
    if (e) e.stopPropagation();
    setSelectedForDelete((prev) =>
      prev.includes(driveId) ? prev.filter((id) => id !== driveId) : [...prev, driveId]
    );
  };

  // Select all items currently visible on this page
  const selectAllCurrentPage = () => {
    const pageIds = paginatedItems.map(item => item.drive_id);
    const allSelected = pageIds.every(id => selectedForDelete.includes(id));
    if (allSelected) {
      setSelectedForDelete(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedForDelete(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  // Delete Single Image
  const handleDeleteSingle = async (driveId, e) => {
    if (e) e.stopPropagation();
    const result = await Swal.fire({
      title: 'Delete this image?',
      text: `Drive ID: ${driveId}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        setDeleteMessage('Deleting image...');
        await axios.delete(`/api/images?drive_id=${encodeURIComponent(driveId)}`);
        deleteFileFromGoogleDrive(driveId).catch(() => {});

        setRawItems(prev => prev.filter(item => item.drive_id !== driveId));
        setSelectedForDelete(prev => prev.filter(id => id !== driveId));
        if (selectedIdx !== null) setSelectedIdx(null);
        setDeleteMessage('');
        Swal.fire({
          title: 'Deleted!',
          text: 'The image has been removed.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (err) {
        setDeleteMessage('');
        Swal.fire('Error', 'Failed to delete image.', 'error');
      }
    }
  };

  // Delete selected batch
  const deleteSelectedImages = async () => {
    if (selectedForDelete.length === 0) return;

    const result = await Swal.fire({
      title: 'Delete Selected Images?',
      text: `You are about to delete ${selectedForDelete.length} image(s). This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: `Yes, delete ${selectedForDelete.length} images!`,
    });

    if (result.isConfirmed) {
      try {
        setDeleteMessage(`Deleting ${selectedForDelete.length} image(s)...`);
        
        const deletePromises = selectedForDelete.map(async (id) => {
          await axios.delete(`/api/images?drive_id=${encodeURIComponent(id)}`);
          return deleteFileFromGoogleDrive(id).catch(() => {});
        });

        await Promise.all(deletePromises);

        setRawItems((prev) => prev.filter((item) => !selectedForDelete.includes(item.drive_id)));
        setSelectedForDelete([]);
        setDeleteMessage('');

        Swal.fire({
          title: 'Deleted!',
          text: 'Selected images have been deleted successfully.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        setDeleteMessage('');
        Swal.fire('Error!', 'Something went wrong while deleting.', 'error');
      }
    }
  };

  // Open Slider Lightbox
  const openSlider = (item) => {
    const idx = filteredItems.findIndex(i => i.drive_id === item.drive_id);
    if (idx !== -1) setSelectedIdx(idx);
  };

  const closeSlider = () => setSelectedIdx(null);

  const nextSlide = (e) => {
    if (e) e.stopPropagation();
    setSelectedIdx((prev) => (prev + 1) % filteredItems.length);
  };

  const prevSlide = (e) => {
    if (e) e.stopPropagation();
    setSelectedIdx((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner & Uploader Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-6 bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-7 rounded-full bg-gradient-to-b from-pink-500 to-purple-600" />
            <h2 className="text-2xl font-black text-white tracking-wide">
              Google Drive Asset Gallery
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">
              {rawItems.length} Total Assets
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1 pl-5">
            Click any image to view full-res lightbox, copy Drive IDs for movie posters, or batch manage assets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <MultiImageUploader setDriveIds={handleUploadSuccess} />

          {selectedForDelete.length > 0 && (
            <button
              onClick={deleteSelectedImages}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-rose-600/30 font-semibold text-sm transition-all active:scale-95 cursor-pointer"
            >
              <RxCross2 className="text-base" />
              Delete ({selectedForDelete.length})
            </button>
          )}
        </div>
      </div>

      {/* Filter, Search & Pagination Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-800/70 border border-slate-700/60 rounded-xl">
        {/* Search Box */}
        <div className="relative w-full sm:w-80">
          <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Drive ID or #ID..."
            className="w-full pl-10 pr-9 py-2 bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <RxCross2 />
            </button>
          )}
        </div>

        {/* Selection & Page Controls */}
        <div className="flex items-center flex-wrap gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {paginatedItems.length > 0 && (
            <button
              onClick={selectAllCurrentPage}
              className="px-3 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-600/60 transition cursor-pointer"
            >
              {paginatedItems.every(i => selectedForDelete.includes(i.drive_id)) ? 'Deselect Page' : 'Select Page'}
            </button>
          )}

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-pink-500"
            >
              <option value="24">24</option>
              <option value="36">36</option>
              <option value="48">48</option>
              <option value="96">96</option>
              <option value="all">All ({totalItems})</option>
            </select>
          </div>

          <span className="text-xs font-medium text-slate-400">
            {totalItems > 0 ? (
              isAll ? `All ${totalItems}` : `${(currentPage - 1) * perPageNum + 1}-${Math.min(currentPage * perPageNum, totalItems)} of ${totalItems}`
            ) : '0 items'}
          </span>
        </div>
      </div>

      {/* Floating Loading Toast */}
      {deleteMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[70]">
          <div className="flex items-center gap-3 bg-slate-900 border border-pink-500/50 text-pink-300 px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-md animate-bounce">
            <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-semibold text-sm">{deleteMessage}</span>
          </div>
        </div>
      )}

      {/* Copied ID Banner Toast */}
      {copiedId && (
        <div className="fixed bottom-6 right-6 z-[70] animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold">
            <RxCheck className="text-base" />
            <span>Copied Drive ID: {copiedId}</span>
          </div>
        </div>
      )}

      {/* Image Grid */}
      {paginatedItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {paginatedItems.map((item, index) => {
            const isSelected = selectedForDelete.includes(item.drive_id);
            const globalIdx = (currentPage - 1) * perPageNum + index + 1;

            return (
              <div
                key={item.drive_id || index}
                className={`group relative rounded-xl overflow-hidden bg-slate-900 border transition-all duration-300 flex flex-col shadow-md hover:shadow-xl hover:-translate-y-1 ${
                  isSelected 
                    ? 'border-pink-500 ring-2 ring-pink-500/40' 
                    : 'border-slate-800 hover:border-pink-500/50'
                }`}
              >
                {/* Thumbnail Image Container */}
                <div 
                  onClick={() => openSlider(item)}
                  className="relative aspect-square w-full overflow-hidden bg-slate-950 cursor-pointer"
                >
                  <img
                    src={getGoogleDriveImageUrl(item.drive_id)}
                    alt={`Asset ${item.id}`}
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Gradient Overlay on hover */}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                    <span className="p-2 rounded-full bg-pink-600/90 text-white shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                      <FiMaximize2 className="text-sm" />
                    </span>
                  </div>

                  {/* Multi-select Checkbox (Top Left) */}
                  <div
                    onClick={(e) => toggleSelect(item.drive_id, e)}
                    className={`absolute top-2 left-2 w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer transition-all border shadow-md z-10 ${
                      isSelected
                        ? 'bg-pink-600 border-pink-500 text-white'
                        : 'bg-slate-950/70 border-white/30 text-transparent hover:text-pink-400 hover:border-pink-400'
                    }`}
                    title="Select for bulk delete"
                  >
                    <RxCheck className="text-sm font-black" />
                  </div>

                  {/* Index / ID Badge (Top Right) */}
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-slate-950/80 backdrop-blur-md border border-white/10 text-slate-300 text-[10px] font-mono pointer-events-none">
                    #{item.id || globalIdx}
                  </div>
                </div>

                {/* Bottom Card Bar (Actions & File ID) */}
                <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
                  {/* Drive ID with Copy Button */}
                  <button
                    onClick={(e) => handleCopyId(item.drive_id, e)}
                    className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 hover:text-pink-400 truncate max-w-[110px] transition-colors cursor-pointer"
                    title={`Click to copy: ${item.drive_id}`}
                  >
                    <FiCopy className="text-xs shrink-0" />
                    <span className="truncate">{item.drive_id}</span>
                  </button>

                  {/* Action Icons */}
                  <div className="flex items-center gap-1">
                    <a
                      href={getGoogleDriveFileUrl(item.drive_id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                      title="Open in Google Drive"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FiExternalLink className="text-xs" />
                    </a>

                    <button
                      onClick={(e) => handleDeleteSingle(item.drive_id, e)}
                      className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                      title="Delete Image"
                    >
                      <FiTrash2 className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/40">
          <p className="text-slate-400 text-base font-medium">No images found matching your search.</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 px-4 py-1.5 rounded-xl bg-pink-600/20 text-pink-400 hover:bg-pink-600/30 text-xs font-bold transition"
            >
              Clear Search Query
            </button>
          )}
        </div>
      )}

      {/* Pagination Bar */}
      {!isAll && totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          >
            « First
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          >
            ‹ Prev
          </button>

          {/* Page Indicators */}
          <div className="flex items-center gap-1 px-2">
            <span className="text-xs text-slate-400">
              Page <span className="font-bold text-pink-400">{currentPage}</span> of <span className="font-bold text-slate-200">{totalPages}</span>
            </span>
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          >
            Next ›
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          >
            Last »
          </button>
        </div>
      )}

      {/* Modal Lightbox Slider */}
      {selectedIdx !== null && filteredItems[selectedIdx] && (
        <div 
          onClick={closeSlider}
          className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
        >
          {/* Close Button */}
          <button 
            onClick={closeSlider} 
            className="absolute top-5 right-5 p-3 bg-white/10 hover:bg-rose-600 text-white rounded-full transition-colors z-50 cursor-pointer"
            title="Close (Esc)"
          >
            <RxCross2 className="text-xl" />
          </button>

          {/* Previous Button */}
          <button 
            onClick={prevSlide} 
            className="hidden md:flex absolute left-6 p-4 rounded-full bg-slate-900/80 hover:bg-pink-600 border border-slate-700 text-white transition-all shadow-xl z-50 cursor-pointer"
            title="Previous (Left Arrow)"
          >
            <span className="text-2xl">❮</span>
          </button>

          {/* Main Fullscreen Image Area */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full flex flex-col items-center max-h-[90vh]"
          >
            <div className="relative w-full max-h-[75vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black/60 border border-slate-800 shadow-2xl p-2">
              <img
                src={getGoogleDriveImageUrl(filteredItems[selectedIdx].drive_id)}
                alt="Full Preview"
                className="max-h-[72vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>

            {/* Bottom Modal Dock */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 bg-slate-900/90 border border-slate-800/80 px-6 py-2.5 rounded-2xl shadow-xl backdrop-blur-md">
              {/* Counter */}
              <span className="text-xs font-bold text-slate-400 font-mono pr-2 border-r border-slate-700">
                {selectedIdx + 1} / {filteredItems.length}
              </span>

              {/* Copy ID Button */}
              <button
                onClick={() => handleCopyId(filteredItems[selectedIdx].drive_id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-pink-600/30 text-slate-200 hover:text-pink-400 border border-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                <FiCopy />
                <span>Copy ID</span>
              </button>

              {/* Open in Drive */}
              <a 
                href={getGoogleDriveFileUrl(filteredItems[selectedIdx].drive_id)} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition"
              >
                <FiExternalLink />
                <span>Open in Drive</span>
              </a>

              {/* Direct Download */}
              <button
                onClick={() => googleDriveToDownload(filteredItems[selectedIdx].drive_id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <RxDownload />
                <span>Download</span>
              </button>

              {/* Delete Button */}
              <button
                onClick={() => handleDeleteSingle(filteredItems[selectedIdx].drive_id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <FiTrash2 />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Next Button */}
          <button 
            onClick={nextSlide} 
            className="hidden md:flex absolute right-6 p-4 rounded-full bg-slate-900/80 hover:bg-pink-600 border border-slate-700 text-white transition-all shadow-xl z-50 cursor-pointer"
            title="Next (Right Arrow)"
          >
            <span className="text-2xl">❯</span>
          </button>
        </div>
      )}
    </div>
  );
}
