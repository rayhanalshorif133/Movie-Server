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
        text: `${newDriveIds.length} image(s) uploaded and saved to gallery.`,
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

  // Select/Deselect all items on current page
  const selectAllCurrentPage = () => {
    const pageIds = paginatedItems.map(item => item.drive_id);
    const allSelected = pageIds.length > 0 && pageIds.every(id => selectedForDelete.includes(id));
    if (allSelected) {
      setSelectedForDelete(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedForDelete(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  // Select all filtered items
  const selectAllFiltered = () => {
    const allIds = filteredItems.map(item => item.drive_id);
    setSelectedForDelete(allIds);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedForDelete([]);
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

        setRawItems(prev => prev.filter(item => item.drive_id !== driveId));
        setSelectedForDelete(prev => prev.filter(id => id !== driveId));
        if (selectedIdx !== null) setSelectedIdx(null);
        setDeleteMessage('');
        Swal.fire({
          title: 'Deleted!',
          text: 'The image has been removed from database and Drive.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (err) {
        setDeleteMessage('');
        Swal.fire('Error', err?.response?.data?.error || 'Failed to delete image.', 'error');
      }
    }
  };

  // Delete selected batch
  const deleteSelectedImages = async () => {
    if (selectedForDelete.length === 0) return;

    const result = await Swal.fire({
      title: 'Delete Selected Images?',
      text: `You are about to delete ${selectedForDelete.length} image(s) from Google Drive and database.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: `Yes, delete ${selectedForDelete.length} image(s)!`,
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        setDeleteMessage(`Deleting ${selectedForDelete.length} image(s)...`);
        
        await axios.delete('/api/images', {
          data: { drive_ids: selectedForDelete }
        });

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
        Swal.fire('Error!', error?.response?.data?.error || 'Something went wrong while deleting.', 'error');
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

  const isCurrentPageAllSelected = paginatedItems.length > 0 && 
    paginatedItems.every(i => selectedForDelete.includes(i.drive_id));

  return (
    <div className="w-full space-y-6">
      {/* Top Banner & Uploader Card in Light Theme */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-6 bg-white border border-gray-100 rounded-2xl shadow-sm gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-7 rounded-full bg-gradient-to-b from-blue-600 to-indigo-600" />
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Google Drive Image Gallery
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {rawItems.length} Total Assets
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1 pl-5">
            View full-res images, copy Google Drive file IDs with 1-click, or multi-select images to delete.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <MultiImageUploader setDriveIds={handleUploadSuccess} />

          {selectedForDelete.length > 0 && (
            <button
              onClick={deleteSelectedImages}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl shadow-md font-semibold text-sm transition-all active:scale-95 cursor-pointer"
            >
              <FiTrash2 className="text-base" />
              Delete Selected ({selectedForDelete.length})
            </button>
          )}
        </div>
      </div>

      {/* Filter, Search & Pagination Toolbar in Light Theme */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
        {/* Search Box */}
        <div className="relative w-full sm:w-80">
          <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Drive ID or #ID..."
            className="w-full pl-10 pr-9 py-2 bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                isCurrentPageAllSelected
                  ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {isCurrentPageAllSelected ? '✓ Deselect Page' : 'Select All on Page'}
            </button>
          )}

          {selectedForDelete.length > 0 && (
            <button
              onClick={clearSelection}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              Clear Selection ({selectedForDelete.length})
            </button>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="24">24</option>
              <option value="36">36</option>
              <option value="48">48</option>
              <option value="96">96</option>
              <option value="all">All ({totalItems})</option>
            </select>
          </div>

          <span className="text-xs font-medium text-gray-500">
            {totalItems > 0 ? (
              isAll ? `All ${totalItems}` : `${(currentPage - 1) * perPageNum + 1}-${Math.min(currentPage * perPageNum, totalItems)} of ${totalItems}`
            ) : '0 items'}
          </span>
        </div>
      </div>

      {/* Floating Sticky Batch Action Bar when images are selected */}
      {selectedForDelete.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white border border-gray-200 shadow-2xl rounded-2xl px-6 py-3.5 flex items-center gap-4 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
              {selectedForDelete.length}
            </span>
            <span className="text-sm font-semibold text-gray-800">Selected</span>
          </div>

          <button
            onClick={selectAllFiltered}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          >
            Select All ({totalItems})
          </button>

          <button
            onClick={clearSelection}
            className="text-xs font-medium text-gray-500 hover:text-gray-800 cursor-pointer"
          >
            Clear
          </button>

          <button
            onClick={deleteSelectedImages}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer ml-2"
          >
            <FiTrash2 className="text-sm" />
            Delete Selected ({selectedForDelete.length})
          </button>
        </div>
      )}

      {/* Floating Loading Toast */}
      {deleteMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[70]">
          <div className="flex items-center gap-3 bg-white border border-blue-200 text-blue-700 px-6 py-3 rounded-2xl shadow-2xl animate-bounce">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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

      {/* Image Grid in Light Theme */}
      {paginatedItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {paginatedItems.map((item, index) => {
            const isSelected = selectedForDelete.includes(item.drive_id);
            const globalIdx = (currentPage - 1) * perPageNum + index + 1;

            return (
              <div
                key={item.drive_id || index}
                className={`group relative rounded-xl overflow-hidden bg-white border transition-all duration-300 flex flex-col shadow-sm hover:shadow-md hover:-translate-y-1 ${
                  isSelected 
                    ? 'border-blue-600 ring-2 ring-blue-500/30 bg-blue-50/20' 
                    : 'border-gray-200 hover:border-blue-400'
                }`}
              >
                {/* Thumbnail Image Container */}
                <div 
                  onClick={() => openSlider(item)}
                  className="relative aspect-square w-full overflow-hidden bg-gray-100 cursor-pointer"
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

                  {/* Gradient Overlay on hover with zoom icon */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                    <span className="p-2 rounded-full bg-white/90 text-gray-800 shadow-md transform scale-75 group-hover:scale-100 transition-transform">
                      <FiMaximize2 className="text-sm" />
                    </span>
                  </div>

                  {/* Multi-select Checkbox (Top Left) */}
                  <div
                    onClick={(e) => toggleSelect(item.drive_id, e)}
                    className={`absolute top-2 left-2 w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer transition-all border shadow-sm z-10 ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white/90 backdrop-blur-sm border-gray-300 text-transparent hover:border-blue-500 hover:bg-white'
                    }`}
                    title={isSelected ? 'Deselect image' : 'Select image for bulk delete'}
                  >
                    <RxCheck className="text-sm font-black" />
                  </div>

                  {/* Index / ID Badge (Top Right) */}
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-600 text-[10px] font-mono pointer-events-none shadow-sm">
                    #{item.id || globalIdx}
                  </div>
                </div>

                {/* Bottom Card Bar (Actions & File ID) */}
                <div className="p-2.5 bg-gray-50/90 border-t border-gray-100 flex items-center justify-between text-xs">
                  {/* Drive ID with Copy Button */}
                  <button
                    onClick={(e) => handleCopyId(item.drive_id, e)}
                    className="flex items-center gap-1.5 text-[11px] font-mono text-gray-600 hover:text-blue-600 truncate max-w-[110px] transition-colors cursor-pointer"
                    title={`Click to copy Drive ID: ${item.drive_id}`}
                  >
                    <FiCopy className="text-xs shrink-0 text-gray-400 group-hover:text-blue-500" />
                    <span className="truncate">{item.drive_id}</span>
                  </button>

                  {/* Action Icons */}
                  <div className="flex items-center gap-1">
                    <a
                      href={getGoogleDriveFileUrl(item.drive_id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-white rounded transition-colors"
                      title="Open in Google Drive"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FiExternalLink className="text-xs" />
                    </a>

                    <button
                      onClick={(e) => handleDeleteSingle(item.drive_id, e)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
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
        <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-3xl bg-white">
          <p className="text-gray-400 text-base font-medium">No images found matching your search.</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 px-4 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold transition"
            >
              Clear Search Query
            </button>
          )}
        </div>
      )}

      {/* Pagination Bar in Light Theme */}
      {!isAll && totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 text-gray-700 text-xs font-semibold border border-gray-200 shadow-sm transition cursor-pointer"
          >
            « First
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 text-gray-700 text-xs font-semibold border border-gray-200 shadow-sm transition cursor-pointer"
          >
            ‹ Prev
          </button>

          {/* Page Indicators */}
          <div className="flex items-center gap-1 px-2">
            <span className="text-xs text-gray-500">
              Page <span className="font-bold text-blue-600">{currentPage}</span> of <span className="font-bold text-gray-800">{totalPages}</span>
            </span>
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 text-gray-700 text-xs font-semibold border border-gray-200 shadow-sm transition cursor-pointer"
          >
            Next ›
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 text-gray-700 text-xs font-semibold border border-gray-200 shadow-sm transition cursor-pointer"
          >
            Last »
          </button>
        </div>
      )}

      {/* Modal Lightbox Slider */}
      {selectedIdx !== null && filteredItems[selectedIdx] && (
        <div 
          onClick={closeSlider}
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
        >
          {/* Close Button */}
          <button 
            onClick={closeSlider} 
            className="absolute top-5 right-5 p-3 bg-white/10 hover:bg-red-600 text-white rounded-full transition-colors z-50 cursor-pointer"
            title="Close (Esc)"
          >
            <RxCross2 className="text-xl" />
          </button>

          {/* Previous Button */}
          <button 
            onClick={prevSlide} 
            className="hidden md:flex absolute left-6 p-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all shadow-xl z-50 cursor-pointer"
            title="Previous (Left Arrow)"
          >
            <span className="text-2xl">❮</span>
          </button>

          {/* Main Fullscreen Image Area */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full flex flex-col items-center max-h-[90vh]"
          >
            <div className="relative w-full max-h-[75vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black/60 border border-white/10 shadow-2xl p-2">
              <img
                src={getGoogleDriveImageUrl(filteredItems[selectedIdx].drive_id)}
                alt="Full Preview"
                className="max-h-[72vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>

            {/* Bottom Modal Dock */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 bg-gray-900/90 border border-white/10 px-6 py-2.5 rounded-2xl shadow-xl backdrop-blur-md">
              {/* Counter */}
              <span className="text-xs font-bold text-gray-300 font-mono pr-2 border-r border-gray-700">
                {selectedIdx + 1} / {filteredItems.length}
              </span>

              {/* Copy ID Button */}
              <button
                onClick={() => handleCopyId(filteredItems[selectedIdx].drive_id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-blue-600/30 text-gray-200 hover:text-blue-400 border border-white/10 text-xs font-semibold transition cursor-pointer"
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
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <FiTrash2 />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Next Button */}
          <button 
            onClick={nextSlide} 
            className="hidden md:flex absolute right-6 p-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all shadow-xl z-50 cursor-pointer"
            title="Next (Right Arrow)"
          >
            <span className="text-2xl">❯</span>
          </button>
        </div>
      )}
    </div>
  );
}
